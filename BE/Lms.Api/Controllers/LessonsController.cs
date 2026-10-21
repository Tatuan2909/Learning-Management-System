using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Lms.Domain.Entities;
using Lms.Infrastructure.Data;
using Lms.Api.Extensions;

namespace Lms.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LessonsController : ControllerBase
{
    private readonly LmsDbContext _db;

    public LessonsController(LmsDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Lấy chi tiết hoạt động/bài học theo ID (Yêu cầu xác thực và ghi danh hợp lệ)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetLessonDetail(Guid id, [FromQuery] Guid? studentId)
    {
        var lesson = await _db.Lessons
            .Include(l => l.Course)
            .Include(l => l.Section)
            .Include(l => l.Quiz)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lesson == null)
            return NotFound(new { message = "Không tìm thấy bài học." });

        var currentUserId = User.GetUserId();
        bool isPrivileged = User.IsAdmin() || (currentUserId.HasValue && lesson.Course.TeacherId == currentUserId.Value);

        var targetStudentId = User.IsAdmin() && studentId.HasValue ? studentId.Value : currentUserId;

        Enrollment? enrollment = null;
        bool isCompleted = false;
        bool quizPassed = false;

        if (targetStudentId.HasValue)
        {
            enrollment = await _db.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == lesson.CourseId && e.StudentId == targetStudentId.Value);

            if (enrollment != null)
            {
                var progress = await _db.LessonProgresses
                    .FirstOrDefaultAsync(lp => lp.EnrollmentId == enrollment.Id && lp.LessonId == id);

                if (progress != null)
                {
                    isCompleted = progress.IsCompleted;
                    quizPassed = progress.QuizPassed;
                }
            }
        }

        // Kiểm tra quyền hạn của sinh viên: Phải có ghi danh ACTIVE
        if (!isPrivileged)
        {
            if (enrollment == null)
            {
                return StatusCode(403, new { message = "Bạn chưa ghi danh vào khóa học này để truy cập nội dung bài học." });
            }

            if (enrollment.Status == "SUSPENDED")
            {
                return StatusCode(403, new { message = "Tài khoản của bạn trong khóa học này đang bị tạm ngưng." });
            }

            if (lesson.IsLocked || (lesson.Section != null && lesson.Section.IsLocked))
            {
                return StatusCode(403, new { message = "Bài học hoặc chương mục này đang bị khóa bởi Giảng viên." });
            }
        }

        // Check if there is an assignment linked to this lesson
        var assignment = await _db.Assignments
            .FirstOrDefaultAsync(a => a.LessonId == id);

        return Ok(new
        {
            id = lesson.Id,
            courseId = lesson.CourseId,
            courseTitle = lesson.Course.Title,
            courseCode = lesson.Course.CourseCode,
            sectionId = lesson.SectionId,
            sectionTitle = lesson.Section?.Title,
            title = lesson.Title,
            orderIndex = lesson.OrderIndex,
            contentType = lesson.ContentType.ToString(),
            subtitle = lesson.Subtitle,
            contentUrl = lesson.ContentUrl,
            bodyMarkdown = lesson.BodyMarkdown,
            isLocked = lesson.IsLocked,
            isCompleted = isCompleted,
            quizPassed = quizPassed,
            quizId = lesson.Quiz?.Id,
            assignmentId = assignment?.Id
        });
    }

    /// <summary>
    /// Đánh dấu đã hoàn thành bài học và cập nhật % tiến độ khóa học (Chỉ áp dụng khi sinh viên đã ghi danh ACTIVE)
    /// </summary>
    [HttpPost("{id}/complete")]
    public async Task<IActionResult> MarkCompleted(Guid id, [FromBody] StudentIdRequest request)
    {
        var lesson = await _db.Lessons.FindAsync(id);
        if (lesson == null) return NotFound(new { message = "Không tìm thấy bài học." });

        if (lesson.IsLocked)
        {
            return BadRequest(new { message = "Không thể đánh dấu hoàn thành bài học đang bị khóa." });
        }

        var currentUserId = User.GetUserId();
        var targetStudentId = User.IsAdmin() && request.StudentId != Guid.Empty
            ? request.StudentId
            : (currentUserId ?? request.StudentId);

        if (targetStudentId == Guid.Empty)
        {
            return Unauthorized(new { message = "Không xác thực được danh tính người dùng." });
        }

        var enrollment = await _db.Enrollments
            .Include(e => e.Course)
                .ThenInclude(c => c.Lessons)
            .FirstOrDefaultAsync(e => e.CourseId == lesson.CourseId && e.StudentId == targetStudentId);

        // Bỏ việc tự tạo ghi danh: Bắt buộc sinh viên phải ghi danh chính thức trước
        if (enrollment == null)
        {
            return BadRequest(new { message = "Bạn chưa ghi danh khóa học này. Vui lòng ghi danh trước khi học bài." });
        }

        if (enrollment.Status == "SUSPENDED")
        {
            return StatusCode(403, new { message = "Tài khoản của bạn trong khóa học này đang bị tạm ngưng." });
        }

        var progress = await _db.LessonProgresses
            .FirstOrDefaultAsync(lp => lp.EnrollmentId == enrollment.Id && lp.LessonId == id);

        if (progress == null)
        {
            progress = new LessonProgress
            {
                EnrollmentId = enrollment.Id,
                LessonId = id,
                IsCompleted = true,
                CompletedAt = DateTime.UtcNow
            };
            _db.LessonProgresses.Add(progress);
        }
        else
        {
            progress.IsCompleted = true;
            progress.CompletedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        // Recalculate course progress percentage
        int totalLessons = await _db.Lessons.CountAsync(l => l.CourseId == lesson.CourseId);
        if (totalLessons > 0)
        {
            int completedLessons = await _db.LessonProgresses
                .CountAsync(lp => lp.EnrollmentId == enrollment.Id && lp.IsCompleted);

            decimal percentage = Math.Round(((decimal)completedLessons / totalLessons) * 100m, 2);
            enrollment.ProgressPercentage = percentage;
            if (percentage >= 100m)
            {
                enrollment.IsCompleted = true;
                enrollment.CompletedAt = DateTime.UtcNow;
            }
            await _db.SaveChangesAsync();
        }

        return Ok(new
        {
            message = "Đã cập nhật tiến độ học tập thành công!",
            isCompleted = true,
            courseProgress = enrollment.ProgressPercentage
        });
    }
}
