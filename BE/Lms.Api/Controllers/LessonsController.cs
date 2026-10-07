using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Lms.Domain.Entities;
using Lms.Infrastructure.Data;

namespace Lms.Api.Controllers;

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
    /// Lấy chi tiết hoạt động/bài học theo ID
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

        bool isCompleted = false;
        bool quizPassed = false;

        if (studentId.HasValue)
        {
            var enrollment = await _db.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == lesson.CourseId && e.StudentId == studentId.Value);

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
    /// Đánh dấu đã hoàn thành bài học (cho video, pdf, scorm...) và cập nhật tổng % tiến độ khóa học
    /// </summary>
    [HttpPost("{id}/complete")]
    public async Task<IActionResult> MarkCompleted(Guid id, [FromBody] StudentIdRequest request)
    {
        var lesson = await _db.Lessons.FindAsync(id);
        if (lesson == null) return NotFound(new { message = "Không tìm thấy bài học." });

        var enrollment = await _db.Enrollments
            .Include(e => e.Course)
                .ThenInclude(c => c.Lessons)
            .FirstOrDefaultAsync(e => e.CourseId == lesson.CourseId && e.StudentId == request.StudentId);

        if (enrollment == null)
        {
            // Auto enroll if not enrolled
            enrollment = new Enrollment
            {
                CourseId = lesson.CourseId,
                StudentId = request.StudentId,
                Status = "ACTIVE",
                ProgressPercentage = 0m
            };
            _db.Enrollments.Add(enrollment);
            await _db.SaveChangesAsync();
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
