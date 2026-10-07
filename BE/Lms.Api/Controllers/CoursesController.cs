using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Lms.Application.DTOs;
using Lms.Domain.Entities;
using Lms.Infrastructure.Data;

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
    /// Lấy danh sách toàn bộ các khóa học có trong hệ thống
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllCourses([FromQuery] Guid? studentId)
    {
        var courses = await _db.Courses
            .Include(c => c.Teacher)
            .Include(c => c.Lessons)
            .Include(c => c.Enrollments)
            .ToListAsync();

        var result = courses.Select(c =>
        {
            var enrollment = studentId.HasValue 
                ? c.Enrollments.FirstOrDefault(e => e.StudentId == studentId.Value) 
                : null;

            return new CourseListDto
            {
                Id = c.Id,
                CourseCode = c.CourseCode,
                Title = c.Title,
                Description = c.Description,
                ThumbnailUrl = c.ThumbnailUrl,
                TeacherName = c.Teacher != null ? c.Teacher.FullName : "Giảng viên",
                IsEnrolled = enrollment != null,
                ProgressPercentage = enrollment?.ProgressPercentage ?? 0m,
                LessonsCount = c.Lessons.Count,
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
    [HttpGet("my-courses")]
    public async Task<IActionResult> GetMyCourses([FromQuery] Guid? studentId)
    {
        var targetStudentId = studentId ?? Guid.Parse("33333333-3333-3333-3333-333333333333");

        var enrollments = await _db.Enrollments
            .Include(e => e.Course)
                .ThenInclude(c => c.Teacher)
            .Include(e => e.Course)
                .ThenInclude(c => c.Lessons)
            .Where(e => e.StudentId == targetStudentId)
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
            WeightAttendance = e.Course.WeightAttendance,
            WeightAssignments = e.Course.WeightAssignments,
            WeightFinalExam = e.Course.WeightFinalExam
        }).ToList();

        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết khóa học, gồm các chương mục (sections) và danh mục bài học (lessons)
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

        Enrollment? enrollment = null;
        List<LessonProgress> progresses = new();

        if (studentId.HasValue)
        {
            enrollment = await _db.Enrollments
                .Include(e => e.LessonProgresses)
                .FirstOrDefaultAsync(e => e.CourseId == id && e.StudentId == studentId.Value);

            if (enrollment != null)
            {
                progresses = enrollment.LessonProgresses.ToList();
            }
        }

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
            IsEnrolled = enrollment != null,
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

                    return new LessonSummaryDto
                    {
                        Id = l.Id,
                        Title = l.Title,
                        OrderIndex = l.OrderIndex,
                        ContentType = l.ContentType.ToString(),
                        Subtitle = l.Subtitle,
                        ContentUrl = l.ContentUrl,
                        BodyMarkdown = l.BodyMarkdown,
                        IsLocked = l.IsLocked,
                        IsCompleted = prog?.IsCompleted ?? false,
                        QuizPassed = prog?.QuizPassed ?? false,
                        QuizId = l.Quiz?.Id,
                        AssignmentId = matchingAssignment?.Id
                    };
                }).ToList()
            }).ToList()
        };

        return Ok(result);
    }

    /// <summary>
    /// Ghi danh vào một khóa học
    /// </summary>
    [HttpPost("{id}/enroll")]
    public async Task<IActionResult> Enroll(Guid id, [FromBody] StudentIdRequest request)
    {
        var course = await _db.Courses.FindAsync(id);
        if (course == null) return NotFound(new { message = "Khóa học không tồn tại." });

        var existing = await _db.Enrollments
            .FirstOrDefaultAsync(e => e.CourseId == id && e.StudentId == request.StudentId);

        if (existing != null)
            return Ok(new { message = "Sinh viên đã ghi danh khóa học này từ trước.", enrollmentId = existing.Id });

        var newEnrollment = new Enrollment
        {
            CourseId = id,
            StudentId = request.StudentId,
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

public record StudentIdRequest(Guid StudentId);
