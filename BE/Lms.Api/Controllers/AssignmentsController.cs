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

    private static string GetSubmissionUploadsFolder()
    {
        return Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "submissions");
    }

    private static void DeleteStoredSubmissionFile(SubmissionFile file)
    {
        if (string.IsNullOrWhiteSpace(file.FileUrl))
        {
            return;
        }

        var normalizedUrl = file.FileUrl.Replace('\\', '/');
        if (!normalizedUrl.StartsWith("/uploads/submissions/", StringComparison.OrdinalIgnoreCase)
            && !normalizedUrl.StartsWith("uploads/submissions/", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        var storedFileName = Path.GetFileName(normalizedUrl);
        if (string.IsNullOrWhiteSpace(storedFileName))
        {
            return;
        }

        var filePath = Path.Combine(GetSubmissionUploadsFolder(), storedFileName);
        if (System.IO.File.Exists(filePath))
        {
            System.IO.File.Delete(filePath);
        }
    }

    private async Task SaveUploadedFilesAsync(Submission submission, List<IFormFile>? files)
    {
        if (files == null || files.Count == 0)
        {
            return;
        }

        var uploadsFolder = GetSubmissionUploadsFolder();
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        foreach (var file in files)
        {
            if (file.Length <= 0)
            {
                continue;
            }

            var originalFileName = Path.GetFileName(file.FileName);
            var extension = Path.GetExtension(originalFileName);
            var safeFileName = $"{Guid.NewGuid():N}{extension}";
            var filePath = Path.Combine(uploadsFolder, safeFileName);

            await using (var stream = new FileStream(filePath, FileMode.Create))
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

    private async Task SetLinkedLessonProgressAsync(Assignment assignment, Guid studentId, bool isCompleted)
    {
        if (!assignment.LessonId.HasValue)
        {
            return;
        }

        var enrollment = await _db.Enrollments
            .FirstOrDefaultAsync(e => e.CourseId == assignment.CourseId && e.StudentId == studentId);

        if (enrollment == null)
        {
            return;
        }

        var progress = await _db.LessonProgresses
            .FirstOrDefaultAsync(lp => lp.EnrollmentId == enrollment.Id && lp.LessonId == assignment.LessonId.Value);

        if (progress == null && isCompleted)
        {
            progress = new LessonProgress
            {
                EnrollmentId = enrollment.Id,
                LessonId = assignment.LessonId.Value,
                IsCompleted = true,
                CompletedAt = DateTime.UtcNow
            };
            _db.LessonProgresses.Add(progress);
            return;
        }

        if (progress != null)
        {
            progress.IsCompleted = isCompleted;
            progress.CompletedAt = isCompleted ? DateTime.UtcNow : null;
        }
    }

    private object ToSubmissionResponse(Submission submission, string message)
    {
        return new
        {
            message,
            submissionId = submission.Id,
            status = submission.Status.ToString(),
            submittedAt = submission.SubmittedAt,
            fileUrl = submission.FileUrl,
            gitRepoUrl = submission.GitRepoUrl,
            files = submission.Files.Select(f => new
            {
                id = f.Id,
                fileName = f.FileName,
                fileUrl = f.FileUrl,
                fileSize = f.FileSize,
                fileType = f.FileType
            }).ToList()
        };
    }

    private static bool IsSubmissionLocked(Submission submission)
    {
        return submission.Status == SubmissionStatus.GRADED || submission.Grade.HasValue;
    }

    private async Task<IActionResult> UpdateSubmissionCore(
        Submission submission,
        Guid studentId,
        string? submissionText,
        string? gitRepoUrl,
        List<IFormFile>? files,
        bool replaceFiles)
    {
        if (studentId == Guid.Empty)
            return BadRequest(new { message = "Thieu studentId." });

        if (submission.StudentId != studentId)
            return Forbid();

        if (IsSubmissionLocked(submission))
            return BadRequest(new { message = "Bai nop da duoc cham diem, khong the chinh sua." });

        var assignment = submission.Assignment ?? await _db.Assignments.FindAsync(submission.AssignmentId);
        if (assignment == null)
            return NotFound(new { message = "Khong tim thay bai tap." });

        if (replaceFiles)
        {
            var existingFiles = submission.Files.ToList();
            foreach (var file in existingFiles)
            {
                DeleteStoredSubmissionFile(file);
            }

            _db.SubmissionFiles.RemoveRange(existingFiles);
            submission.Files.Clear();
            submission.FileUrl = null;
        }

        if (submissionText != null)
            submission.SubmissionText = string.IsNullOrWhiteSpace(submissionText) ? null : submissionText.Trim();

        if (gitRepoUrl != null)
            submission.GitRepoUrl = string.IsNullOrWhiteSpace(gitRepoUrl) ? null : gitRepoUrl.Trim();

        var hasIncomingFiles = files != null && files.Any(file => file.Length > 0);
        var hasKeptFiles = submission.Files.Any();
        if (!hasIncomingFiles
            && !hasKeptFiles
            && string.IsNullOrWhiteSpace(submission.GitRepoUrl)
            && string.IsNullOrWhiteSpace(submission.SubmissionText))
        {
            return BadRequest(new { message = "Bai nop phai co file, ghi chu hoac link Git." });
        }

        submission.Status = DateTime.UtcNow > assignment.DueDate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED;
        submission.SubmittedAt = DateTime.UtcNow;

        await SaveUploadedFilesAsync(submission, files);
        await SetLinkedLessonProgressAsync(assignment, studentId, true);
        await _db.SaveChangesAsync();

        _db.Entry(submission).Collection(s => s.Files).IsLoaded = false;
        await _db.Entry(submission).Collection(s => s.Files).LoadAsync();

        return Ok(ToSubmissionResponse(submission, "Da cap nhat bai nop thanh cong."));
    }

    private async Task<IActionResult> DeleteSubmissionCore(Submission submission, Guid studentId)
    {
        if (studentId == Guid.Empty)
            return BadRequest(new { message = "Thieu studentId." });

        if (submission.StudentId != studentId)
            return Forbid();

        if (IsSubmissionLocked(submission))
            return BadRequest(new { message = "Bai nop da duoc cham diem, khong the xoa." });

        var assignment = submission.Assignment ?? await _db.Assignments.FindAsync(submission.AssignmentId);
        var submissionId = submission.Id;
        var existingFiles = submission.Files.ToList();

        foreach (var file in existingFiles)
        {
            DeleteStoredSubmissionFile(file);
        }

        _db.SubmissionFiles.RemoveRange(existingFiles);
        _db.Submissions.Remove(submission);

        if (assignment != null)
        {
            await SetLinkedLessonProgressAsync(assignment, studentId, false);
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Da xoa bai nop thanh cong.",
            submissionId
        });
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
        await _db.Entry(submission).Collection(s => s.Files).LoadAsync();

        return Ok(new
        {
            message = isLate ? "Đã nộp bài tập (Nộp muộn) thành công!" : "Đã nộp bài tập thành công!",
            submissionId = submission.Id,
            status = submission.Status.ToString(),
            submittedAt = submission.SubmittedAt,
            fileUrl = submission.FileUrl,
            gitRepoUrl = submission.GitRepoUrl,
            files = submission.Files.Select(f => new
            {
                id = f.Id,
                fileName = f.FileName,
                fileUrl = f.FileUrl,
                fileSize = f.FileSize,
                fileType = f.FileType
            }).ToList()
        });
    }

    /// <summary>
    /// Nộp bài tập thực hành theo Lesson ID (multipart/form-data)
    /// </summary>
    [HttpPut("submissions/{submissionId}/submit-files")]
    public async Task<IActionResult> UpdateSubmissionFiles(
        Guid submissionId,
        [FromForm] Guid studentId,
        [FromForm] string? submissionText,
        [FromForm] string? gitRepoUrl,
        [FromForm] List<IFormFile>? files,
        [FromForm] bool replaceFiles = false)
    {
        var submission = await _db.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Files)
            .FirstOrDefaultAsync(s => s.Id == submissionId);

        if (submission == null)
            return NotFound(new { message = "Khong tim thay bai nop." });

        return await UpdateSubmissionCore(submission, studentId, submissionText, gitRepoUrl, files, replaceFiles);
    }

    [HttpPut("by-lesson/{lessonId}/submit-files")]
    public async Task<IActionResult> UpdateSubmissionByLessonFiles(
        Guid lessonId,
        [FromForm] Guid studentId,
        [FromForm] string? submissionText,
        [FromForm] string? gitRepoUrl,
        [FromForm] List<IFormFile>? files,
        [FromForm] bool replaceFiles = false)
    {
        var assignment = await _db.Assignments
            .FirstOrDefaultAsync(a => a.LessonId == lessonId);

        if (assignment == null)
            return NotFound(new { message = "Khong tim thay bai tap cua bai hoc." });

        var submission = await _db.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Files)
            .FirstOrDefaultAsync(s => s.AssignmentId == assignment.Id && s.StudentId == studentId);

        if (submission == null)
            return NotFound(new { message = "Sinh vien chua nop bai." });

        return await UpdateSubmissionCore(submission, studentId, submissionText, gitRepoUrl, files, replaceFiles);
    }

    [HttpDelete("submissions/{submissionId}")]
    public async Task<IActionResult> DeleteSubmission(Guid submissionId, [FromQuery] Guid studentId)
    {
        var submission = await _db.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Files)
            .FirstOrDefaultAsync(s => s.Id == submissionId);

        if (submission == null)
            return NotFound(new { message = "Khong tim thay bai nop." });

        return await DeleteSubmissionCore(submission, studentId);
    }

    [HttpDelete("by-lesson/{lessonId}/submission")]
    public async Task<IActionResult> DeleteSubmissionByLesson(Guid lessonId, [FromQuery] Guid studentId)
    {
        var assignment = await _db.Assignments
            .FirstOrDefaultAsync(a => a.LessonId == lessonId);

        if (assignment == null)
            return NotFound(new { message = "Khong tim thay bai tap cua bai hoc." });

        var submission = await _db.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Files)
            .FirstOrDefaultAsync(s => s.AssignmentId == assignment.Id && s.StudentId == studentId);

        if (submission == null)
            return NotFound(new { message = "Sinh vien chua nop bai." });

        return await DeleteSubmissionCore(submission, studentId);
    }

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
