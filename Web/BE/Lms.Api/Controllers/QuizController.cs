using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Lms.Infrastructure.Data;
using Lms.Application.DTOs;
using Lms.Application.Interfaces;
using Lms.Api.Extensions;

namespace Lms.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/quiz")]
public class QuizController : ControllerBase
{
    private readonly IQuizService _quizService;
    private readonly LmsDbContext _db;

    public QuizController(IQuizService quizService, LmsDbContext db)
    {
        _quizService = quizService;
        _db = db;
    }

    /// <summary>
    /// Lấy chi tiết bài kiểm tra trắc nghiệm theo QuizId
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetQuizDetail(Guid id)
    {
        var currentUserId = User.GetUserId();
        if (currentUserId == null) return Unauthorized(new { message = "Không xác thực được token." });

        var quiz = await _db.Quizzes
            .Include(q => q.Lesson)
                .ThenInclude(l => l.Section)
            .Include(q => q.Lesson)
                .ThenInclude(l => l.Course)
            .FirstOrDefaultAsync(q => q.Id == id || q.LessonId == id);

        if (quiz == null) return NotFound(new { message = "Không tìm thấy bài trắc nghiệm." });

        if (!User.IsAdmin())
        {
            if (User.IsTeacher())
            {
                if (quiz.Lesson?.Course != null && quiz.Lesson.Course.TeacherId != currentUserId.Value)
                {
                    return StatusCode(403, new { message = "Bạn không có quyền xem bài trắc nghiệm của khóa học do giảng viên khác phụ trách." });
                }
            }
            else
            {
                // Học viên: Phải có ghi danh ACTIVE và bài học/section không bị khóa
                if (quiz.Lesson != null)
                {
                    var enrollment = await _db.Enrollments
                        .FirstOrDefaultAsync(e => e.CourseId == quiz.Lesson.CourseId && e.StudentId == currentUserId.Value);

                    if (enrollment == null || enrollment.Status != "ACTIVE")
                    {
                        return StatusCode(403, new { message = "Bạn cần có ghi danh ACTIVE trong khóa học này để truy cập bài trắc nghiệm." });
                    }

                    if (quiz.Lesson.IsLocked || (quiz.Lesson.Section != null && quiz.Lesson.Section.IsLocked))
                    {
                        return StatusCode(403, new { message = "Bài học hoặc chương mục chứa bài trắc nghiệm đang bị khóa." });
                    }
                }
            }
        }

        var result = await _quizService.GetQuizDetailAsync(id);
        if (result == null) return NotFound(new { message = "Không tìm thấy bài trắc nghiệm." });
        return Ok(result);
    }

    /// <summary>
    /// Xác thực mật khẩu bài trắc nghiệm phía server (Bảo mật: Tránh kiểm tra ở client)
    /// </summary>
    [HttpPost("{id}/verify-password")]
    public async Task<IActionResult> VerifyPassword(Guid id, [FromBody] QuizPasswordRequest request)
    {
        var isValid = await _quizService.VerifyQuizPasswordAsync(id, request?.Password);
        if (!isValid)
        {
            return BadRequest(new { message = "Mật khẩu bài trắc nghiệm không chính xác." });
        }
        return Ok(new { success = true, message = "Xác thực mật khẩu bài thi thành công!" });
    }

    /// <summary>
    /// Module 3: Tự động chấm điểm trắc nghiệm & kích hoạt cập nhật LessonProgress nếu đạt score >= passing_score
    /// </summary>
    [HttpPost("submit")]
    public async Task<IActionResult> SubmitQuiz([FromBody] SubmitQuizRequest request)
    {
        var currentUserId = User.GetUserId();
        if (currentUserId == null) return Unauthorized(new { message = "Không xác thực được token." });

        // Học viên chỉ được nộp bài cho chính mình
        var targetStudentId = User.IsAdmin() && request.StudentId != Guid.Empty
            ? request.StudentId
            : currentUserId.Value;

        request.StudentId = targetStudentId;

        try
        {
            var response = await _quizService.SubmitQuizAsync(request);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Lấy chi tiết xem lại bài làm trắc nghiệm đã nộp (Review câu hỏi, đáp án đã chọn, đáp án đúng và giải thích)
    /// </summary>
    [HttpGet("attempts/{attemptId}/review")]
    public async Task<IActionResult> GetQuizReview(Guid attemptId)
    {
        var currentUserId = User.GetUserId();
        if (currentUserId == null) return Unauthorized(new { message = "Không xác thực được token." });

        var attempt = await _db.QuizAttempts
            .Include(qa => qa.Quiz)
                .ThenInclude(q => q.Lesson)
                    .ThenInclude(l => l.Course)
            .FirstOrDefaultAsync(qa => qa.Id == attemptId);

        if (attempt == null) return NotFound(new { message = "Không tìm thấy kết quả làm bài trắc nghiệm." });

        if (!User.IsAdmin())
        {
            if (User.IsTeacher())
            {
                if (attempt.Quiz?.Lesson?.Course != null && attempt.Quiz.Lesson.Course.TeacherId != currentUserId.Value)
                {
                    return StatusCode(403, new { message = "Bạn không có quyền xem bài làm của khóa học do giảng viên khác phụ trách." });
                }
            }
            else
            {
                // Học viên chỉ được xem bài review của chính mình!
                if (attempt.StudentId != currentUserId.Value)
                {
                    return StatusCode(403, new { message = "Bạn không có quyền xem kết quả làm bài của sinh viên khác." });
                }
            }
        }

        var result = await _quizService.GetQuizReviewAsync(attemptId);
        if (result == null) return NotFound(new { message = "Không tìm thấy kết quả làm bài trắc nghiệm." });
        return Ok(result);
    }

    /// <summary>
    /// Lấy lượt làm bài trắc nghiệm gần nhất của sinh viên cho Quiz này
    /// </summary>
    [HttpGet("{quizId}/latest-attempt")]
    public async Task<IActionResult> GetLatestAttempt(Guid quizId, [FromQuery] Guid? studentId)
    {
        var currentUserId = User.GetUserId();
        if (currentUserId == null) return Unauthorized(new { message = "Không xác thực được token." });

        // Học viên thông thường chỉ xem lượt làm của chính mình
        var targetStudentId = (User.IsAdmin() || User.IsTeacher()) && studentId.HasValue 
            ? studentId.Value 
            : currentUserId.Value;

        var result = await _quizService.GetLatestAttemptAsync(quizId, targetStudentId);
        if (result == null) return NotFound(new { message = "Chưa có lượt làm bài nào." });
        return Ok(result);
    }
}

public class QuizPasswordRequest
{
    public string? Password { get; set; }
}
