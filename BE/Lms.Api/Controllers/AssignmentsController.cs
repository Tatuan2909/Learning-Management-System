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

    /// <summary>
    /// Nộp bài tập thực hành kèm tệp tin đính kèm thực tế (multipart/form-data)
    /// </summary>
    [HttpPost("{id}/submit-files")]
    public async Task<IActionResult> SubmitAssignmentFiles(
        Guid id,
        [FromForm] Guid studentId,
        [FromForm] string? submissionText,
        [FromForm] string? gitRepoUrl,
        [FromForm] List<IFormFile>? files)
    {
        var assignment = await _db.Assignments.FindAsync(id);
        if (assignment == null)
            return NotFound(new { message = "Không tìm thấy bài tập." });

        var submission = await _db.Submissions
            .Include(s => s.Files)
            .FirstOrDefaultAsync(s => s.AssignmentId == id && s.StudentId == studentId);

        var isLate = DateTime.UtcNow > assignment.DueDate;

        if (submission == null)
        {
            submission = new Submission
            {
                AssignmentId = id,
                StudentId = studentId,
                SubmissionText = submissionText,
                GitRepoUrl = gitRepoUrl,
                Status = isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
                SubmittedAt = DateTime.UtcNow
            };
            _db.Submissions.Add(submission);
        }
        else
        {
            submission.SubmissionText = submissionText;
            submission.GitRepoUrl = gitRepoUrl;
            submission.Status = isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED;
            submission.SubmittedAt = DateTime.UtcNow;
        }

        // Process uploaded physical files
        if (files != null && files.Count > 0)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "submissions");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    var originalFileName = Path.GetFileName(file.FileName);
                    var extension = Path.GetExtension(originalFileName);
                    var safeFileName = $"{Guid.NewGuid():N}{extension}";
                    var filePath = Path.Combine(uploadsFolder, safeFileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    var relativeUrl = $"/uploads/submissions/{safeFileName}";
                    submission.FileUrl = relativeUrl;

                    var subFile = new SubmissionFile
                    {
                        Submission = submission,
                        FileName = originalFileName,
                        FileUrl = relativeUrl,
                        FileSize = file.Length,
                        FileType = file.ContentType ?? "application/octet-stream",
                        UploadedAt = DateTime.UtcNow
                    };
                    _db.SubmissionFiles.Add(subFile);
                }
            }
        }

        // Also mark linked lesson as completed if applicable
        if (assignment.LessonId.HasValue)
        {
            var enrollment = await _db.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == assignment.CourseId && e.StudentId == studentId);

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
            submittedAt = submission.SubmittedAt,
            fileUrl = submission.FileUrl,
            gitRepoUrl = submission.GitRepoUrl
        });
    }

    /// <summary>
    /// Nộp bài tập thực hành theo Lesson ID (multipart/form-data)
    /// </summary>
    [HttpPost("by-lesson/{lessonId}/submit-files")]
    public async Task<IActionResult> SubmitAssignmentByLessonFiles(
        Guid lessonId,
        [FromForm] Guid studentId,
        [FromForm] string? submissionText,
        [FromForm] string? gitRepoUrl,
        [FromForm] List<IFormFile>? files)
    {
        var assignment = await _db.Assignments
            .FirstOrDefaultAsync(a => a.LessonId == lessonId);

        if (assignment == null)
        {
            var lesson = await _db.Lessons.FindAsync(lessonId);
            if (lesson == null) return NotFound(new { message = "Không tìm thấy bài học." });

            assignment = new Assignment
            {
                CourseId = lesson.CourseId,
                LessonId = lesson.Id,
                Title = lesson.Title,
                Instructions = "Nộp bài tập thực hành theo yêu cầu của bài học.",
                DueDate = DateTime.UtcNow.AddDays(7),
                MaxScore = 10,
                AllowGitRepo = true
            };
            _db.Assignments.Add(assignment);
            await _db.SaveChangesAsync();
        }

        return await SubmitAssignmentFiles(assignment.Id, studentId, submissionText, gitRepoUrl, files);
    }

    /// <summary>
    /// Nộp bài tập thực hành theo Lesson ID (JSON)
    /// </summary>
    [HttpPost("by-lesson/{lessonId}/submit")]
    public async Task<IActionResult> SubmitAssignmentByLesson(Guid lessonId, [FromBody] SubmitAssignmentRequest request)
    {
        var assignment = await _db.Assignments
            .FirstOrDefaultAsync(a => a.LessonId == lessonId);

        if (assignment == null)
        {
            var lesson = await _db.Lessons.FindAsync(lessonId);
            if (lesson == null) return NotFound(new { message = "Không tìm thấy bài học." });

            assignment = new Assignment
            {
                CourseId = lesson.CourseId,
                LessonId = lesson.Id,
                Title = lesson.Title,
                Instructions = "Nộp bài tập thực hành theo yêu cầu của bài học.",
                DueDate = DateTime.UtcNow.AddDays(7),
                MaxScore = 10,
                AllowGitRepo = true
            };
            _db.Assignments.Add(assignment);
            await _db.SaveChangesAsync();
        }

        return await SubmitAssignment(assignment.Id, request);
    }
}
