using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Lms.Application.DTOs;
using Lms.Domain.Entities;
using Lms.Domain.Enums;
using Lms.Infrastructure.Data;

namespace Lms.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssignmentsController : ControllerBase
{
    private readonly LmsDbContext _db;

    public AssignmentsController(LmsDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Lấy thông tin bài tập theo ID và bài nộp hiện tại của sinh viên
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAssignment(Guid id, [FromQuery] Guid? studentId)
    {
        var assignment = await _db.Assignments
            .Include(a => a.Course)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (assignment == null)
            return NotFound(new { message = "Không tìm thấy bài tập." });

        SubmissionDto? mySubmission = null;

        if (studentId.HasValue)
        {
            var sub = await _db.Submissions
                .Include(s => s.Files)
                .FirstOrDefaultAsync(s => s.AssignmentId == id && s.StudentId == studentId.Value);

            if (sub != null)
            {
                mySubmission = new SubmissionDto
                {
                    Id = sub.Id,
                    SubmissionText = sub.SubmissionText,
                    GitRepoUrl = sub.GitRepoUrl,
                    FileUrl = sub.FileUrl,
                    Status = sub.Status.ToString(),
                    Grade = sub.Grade,
                    Feedback = sub.Feedback,
                    SubmittedAt = sub.SubmittedAt,
                    Files = sub.Files.Select(f => new SubmissionFileDto
                    {
                        Id = f.Id,
                        FileName = f.FileName,
                        FileUrl = f.FileUrl,
                        FileSize = f.FileSize,
                        FileType = f.FileType
                    }).ToList()
                };
            }
        }

        var result = new AssignmentDetailDto
        {
            Id = assignment.Id,
            CourseId = assignment.CourseId,
            LessonId = assignment.LessonId,
            Title = assignment.Title,
            Instructions = assignment.Instructions,
            AttachmentUrl = assignment.AttachmentUrl,
            DueDate = assignment.DueDate,
            MaxScore = assignment.MaxScore,
            AllowGitRepo = assignment.AllowGitRepo,
            AllowedExtensions = assignment.AllowedExtensions,
            MySubmission = mySubmission
        };

        return Ok(result);
    }

    /// <summary>
    /// Lấy thông tin bài tập gắn với một bài học cụ thể
    /// </summary>
    [HttpGet("by-lesson/{lessonId}")]
    public async Task<IActionResult> GetAssignmentByLesson(Guid lessonId, [FromQuery] Guid? studentId)
    {
        var assignment = await _db.Assignments
            .FirstOrDefaultAsync(a => a.LessonId == lessonId);

        if (assignment == null)
            return NotFound(new { message = "Bài học này không có bài tập thực hành." });

        return await GetAssignment(assignment.Id, studentId);
    }

    /// <summary>
    /// Nộp bài tập thực hành (kèm lời nhắn, đường dẫn Git repository hoặc tệp đính kèm)
    /// </summary>
    [HttpPost("{id}/submit")]
    public async Task<IActionResult> SubmitAssignment(Guid id, [FromBody] SubmitAssignmentRequest request)
    {
        var assignment = await _db.Assignments.FindAsync(id);
        if (assignment == null)
            return NotFound(new { message = "Không tìm thấy bài tập." });

        var submission = await _db.Submissions
            .Include(s => s.Files)
            .FirstOrDefaultAsync(s => s.AssignmentId == id && s.StudentId == request.StudentId);

        var isLate = DateTime.UtcNow > assignment.DueDate;

        if (submission == null)
        {
            submission = new Submission
            {
                AssignmentId = id,
                StudentId = request.StudentId,
                SubmissionText = request.SubmissionText,
                GitRepoUrl = request.GitRepoUrl,
                FileUrl = request.FileUrl,
                Status = isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
                SubmittedAt = DateTime.UtcNow
            };
            _db.Submissions.Add(submission);
        }
        else
        {
            submission.SubmissionText = request.SubmissionText;
            submission.GitRepoUrl = request.GitRepoUrl;
            submission.FileUrl = request.FileUrl ?? submission.FileUrl;
            submission.Status = isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED;
            submission.SubmittedAt = DateTime.UtcNow;
        }

        if (!string.IsNullOrEmpty(request.FileName) && !string.IsNullOrEmpty(request.FileUrl))
        {
            var subFile = new SubmissionFile
            {
                Submission = submission,
                FileName = request.FileName,
                FileUrl = request.FileUrl,
                FileSize = request.FileSize ?? 1024,
                FileType = "attachment"
            };
            _db.SubmissionFiles.Add(subFile);
        }

        // Also mark linked lesson as completed if applicable
        if (assignment.LessonId.HasValue)
        {
            var enrollment = await _db.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == assignment.CourseId && e.StudentId == request.StudentId);

            if (enrollment != null)
            {
                var progress = await _db.LessonProgresses
                    .FirstOrDefaultAsync(lp => lp.EnrollmentId == enrollment.Id && lp.LessonId == assignment.LessonId.Value);

                if (progress == null)
                {
                    progress = new LessonProgress
                    {
                        EnrollmentId = enrollment.Id,
                        LessonId = assignment.LessonId.Value,
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
            }
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = isLate ? "Đã nộp bài tập (Nộp muộn) thành công!" : "Đã nộp bài tập thành công!",
            submissionId = submission.Id,
            status = submission.Status.ToString(),
            submittedAt = submission.SubmittedAt
        });
    }
}
