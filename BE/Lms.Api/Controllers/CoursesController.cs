using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Lms.Application.DTOs;
using Lms.Domain.Entities;
using Lms.Infrastructure.Data;
using Lms.Api.Extensions;

namespace Lms.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly LmsDbContext _db;

    public CoursesController(LmsDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Lấy danh sách toàn bộ các khóa học có trong hệ thống (chỉ hiển thị khóa ACTIVE cho sinh viên/khách)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllCourses([FromQuery] Guid? studentId)
    {
        var currentUserId = User.GetUserId();
        var isPrivileged = User.IsAdmin() || User.IsTeacher();

        var query = _db.Courses
            .Include(c => c.Teacher)
            .Include(c => c.Lessons)
            .Include(c => c.Enrollments)
            .AsQueryable();

        // Chỉ hiển thị khóa đã công khai đối với học viên và khách vãng lai
        if (!isPrivileged)
        {
            query = query.Where(c => c.IsPublished);
        }

        var courses = await query.ToListAsync();
        var targetStudentId = currentUserId ?? studentId;

        var result = courses.Select(c =>
        {
            var enrollment = targetStudentId.HasValue 
                ? c.Enrollments.FirstOrDefault(e => e.StudentId == targetStudentId.Value) 
                : null;

            return new CourseListDto
            {
                Id = c.Id,
                CourseCode = c.CourseCode,
                Title = c.Title,
                Description = c.Description,
                ThumbnailUrl = c.ThumbnailUrl,
                TeacherName = c.Teacher != null ? c.Teacher.FullName : "Giảng viên",
                IsEnrolled = enrollment != null && enrollment.Status == "ACTIVE",
                ProgressPercentage = enrollment?.ProgressPercentage ?? 0m,
                LessonsCount = c.Lessons.Count,
                HasPassword = !string.IsNullOrEmpty(c.EnrollmentPassword),
                AccessPassword = null, // Bảo mật: Không bao giờ trả mật khẩu khóa học về client!
                WeightAttendance = c.WeightAttendance,
                WeightAssignments = c.WeightAssignments,
                WeightFinalExam = c.WeightFinalExam
            };
        }).ToList();

        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách khóa học mà sinh viên đã ghi danh
    /// </summary>
    [Authorize]
    [HttpGet("my-courses")]
    public async Task<IActionResult> GetMyCourses([FromQuery] Guid? studentId)
    {
        var currentUserId = User.GetUserId();
        if (currentUserId == null) return Unauthorized(new { message = "Không xác thực được token." });

        var targetStudentId = User.IsAdmin() && studentId.HasValue ? studentId.Value : currentUserId.Value;

        var enrollments = await _db.Enrollments
            .Include(e => e.Course)
                .ThenInclude(c => c.Teacher)
            .Include(e => e.Course)
                .ThenInclude(c => c.Lessons)
            .Where(e => e.StudentId == targetStudentId && e.Status != "DROPPED")
            .ToListAsync();

        var result = enrollments.Select(e => new CourseListDto
        {
            Id = e.Course.Id,
            CourseCode = e.Course.CourseCode,
            Title = e.Course.Title,
            Description = e.Course.Description,
            ThumbnailUrl = e.Course.ThumbnailUrl,
            TeacherName = e.Course.Teacher != null ? e.Course.Teacher.FullName : "Giảng viên",
            IsEnrolled = true,
            ProgressPercentage = e.ProgressPercentage,
            LessonsCount = e.Course.Lessons.Count,
            HasPassword = !string.IsNullOrEmpty(e.Course.EnrollmentPassword),
            AccessPassword = null, // Bảo mật: Không bao giờ trả mật khẩu khóa học về client!
            WeightAttendance = e.Course.WeightAttendance,
            WeightAssignments = e.Course.WeightAssignments,
            WeightFinalExam = e.Course.WeightFinalExam
        }).ToList();

        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết khóa học, kiểm soát quyền truy cập nội dung bài học theo trạng thái ghi danh
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCourseDetail(Guid id, [FromQuery] Guid? studentId)
    {
        var course = await _db.Courses
            .Include(c => c.Teacher)
            .Include(c => c.Sections.OrderBy(s => s.OrderIndex))
                .ThenInclude(s => s.Lessons.OrderBy(l => l.OrderIndex))
                    .ThenInclude(l => l.Quiz)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null)
            return NotFound(new { message = "Không tìm thấy khóa học." });

        var currentUserId = User.GetUserId();
        bool isPrivileged = User.IsAdmin() || (currentUserId.HasValue && course.TeacherId == currentUserId.Value);

        // Khóa học chưa công khai chỉ cho phép Giảng viên phụ trách hoặc Admin xem
        if (!course.IsPublished && !isPrivileged)
        {
            return NotFound(new { message = "Khóa học hiện đang tạm đóng hoặc chưa được công khai." });
        }

        var targetStudentId = User.IsAdmin() && studentId.HasValue ? studentId.Value : currentUserId;

        Enrollment? enrollment = null;
        List<LessonProgress> progresses = new();

        if (targetStudentId.HasValue)
        {
            enrollment = await _db.Enrollments
                .Include(e => e.LessonProgresses)
                .FirstOrDefaultAsync(e => e.CourseId == id && e.StudentId == targetStudentId.Value);

            if (enrollment != null)
            {
                progresses = enrollment.LessonProgresses.ToList();
            }
        }

        bool hasActiveEnrollment = enrollment != null && enrollment.Status == "ACTIVE";
        bool canViewContent = isPrivileged || hasActiveEnrollment;

        // Also fetch all assignments in this course to map to lessons
        var assignments = await _db.Assignments
            .Where(a => a.CourseId == id)
            .ToListAsync();

        var result = new CourseDetailDto
        {
            Id = course.Id,
            CourseCode = course.CourseCode,
            Title = course.Title,
            Description = course.Description,
            ThumbnailUrl = course.ThumbnailUrl,
            TeacherName = course.Teacher != null ? course.Teacher.FullName : "Giảng viên",
            ProgressPercentage = enrollment?.ProgressPercentage ?? 0m,
            IsEnrolled = hasActiveEnrollment,
            Sections = course.Sections.Select(s => new CourseSectionDto
            {
                Id = s.Id,
                Title = s.Title,
                OrderIndex = s.OrderIndex,
                IsLocked = s.IsLocked,
                IsExpanded = s.IsExpanded,
                Items = s.Lessons.Select(l =>
                {
                    var prog = progresses.FirstOrDefault(p => p.LessonId == l.Id);
                    var matchingAssignment = assignments.FirstOrDefault(a => a.LessonId == l.Id);

                    // Chỉ mở nội dung khi người dùng đã ghi danh và bài/section không bị khóa
                    bool itemAccessible = canViewContent && (!s.IsLocked || isPrivileged) && (!l.IsLocked || isPrivileged);

                    return new LessonSummaryDto
                    {
                        Id = l.Id,
                        Title = l.Title,
                        OrderIndex = l.OrderIndex,
                        ContentType = l.ContentType.ToString(),
                        Subtitle = l.Subtitle,
                        ContentUrl = itemAccessible ? l.ContentUrl : null,
                        BodyMarkdown = itemAccessible ? l.BodyMarkdown : null,
                        IsLocked = l.IsLocked || s.IsLocked,
                        IsCompleted = prog?.IsCompleted ?? false,
                        QuizPassed = prog?.QuizPassed ?? false,
                        QuizId = itemAccessible ? l.Quiz?.Id : null,
                        AssignmentId = itemAccessible ? matchingAssignment?.Id : null,
                        HasPassword = !string.IsNullOrEmpty(l.Quiz?.Password),
                        Password = null // Bảo mật: Không gửi mật khẩu quiz về client!
                    };
                }).ToList()
            }).ToList()
        };

        return Ok(result);
    }

    /// <summary>
    /// Ghi danh vào một khóa học (Yêu cầu đăng nhập và kiểm tra mật khẩu ghi danh phía server)
    /// </summary>
    [Authorize]
    [HttpPost("{id}/enroll")]
    public async Task<IActionResult> Enroll(Guid id, [FromBody] StudentIdRequest request)
    {
        var course = await _db.Courses.FindAsync(id);
        if (course == null) return NotFound(new { message = "Khóa học không tồn tại." });

        if (!course.IsPublished)
        {
            return BadRequest(new { message = "Khóa học hiện đang tạm đóng hoặc đã lưu trữ, không thể ghi danh." });
        }

        var currentUserId = User.GetUserId();
        var targetStudentId = User.IsAdmin() && request.StudentId != Guid.Empty 
            ? request.StudentId 
            : (currentUserId ?? request.StudentId);

        if (targetStudentId == Guid.Empty)
        {
            return Unauthorized(new { message = "Vui lòng đăng nhập để ghi danh khóa học." });
        }

        if (!string.IsNullOrEmpty(course.EnrollmentPassword))
        {
            if (string.IsNullOrEmpty(request.Password) || request.Password.Trim() != course.EnrollmentPassword.Trim())
            {
                return BadRequest(new { message = "Mật khẩu ghi danh khóa học không chính xác." });
            }
        }

        var existing = await _db.Enrollments
            .FirstOrDefaultAsync(e => e.CourseId == id && e.StudentId == targetStudentId);

        if (existing != null)
        {
            if (existing.Status == "SUSPENDED")
            {
                return BadRequest(new { message = "Tài khoản của bạn trong khóa học này đang bị tạm ngưng. Vui lòng liên hệ Giảng viên." });
            }
            return Ok(new { message = "Sinh viên đã ghi danh khóa học này từ trước.", enrollmentId = existing.Id });
        }

        var newEnrollment = new Enrollment
        {
            CourseId = id,
            StudentId = targetStudentId,
            ProgressPercentage = 0m,
            IsCompleted = false,
            Status = "ACTIVE",
            EnrolledAt = DateTime.UtcNow
        };

        _db.Enrollments.Add(newEnrollment);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Ghi danh thành công!", enrollmentId = newEnrollment.Id });
    }

    /// <summary>
    /// Lấy danh sách thông báo của khóa học dành cho học viên
    /// </summary>
    [HttpGet("{id}/announcements")]
    public async Task<IActionResult> GetCourseAnnouncements(Guid id)
    {
        var announcements = await _db.Announcements
            .Include(a => a.Teacher)
            .Where(a => a.CourseId == id)
            .OrderByDescending(a => a.IsPinned)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync();

        var result = announcements.Select(a => new
        {
            id = a.Id.ToString(),
            title = a.Title,
            content = a.Content,
            isPinned = a.IsPinned,
            teacherName = a.Teacher.FullName,
            createdAt = a.CreatedAt.ToString("dd/MM/yyyy HH:mm")
        });

        return Ok(result);
    }
}

public record StudentIdRequest(Guid StudentId, string? Password = null);
