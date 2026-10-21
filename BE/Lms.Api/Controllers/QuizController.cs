using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
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

    public QuizController(IQuizService quizService)
    {
        _quizService = quizService;
    }

    /// <summary>
    /// Lấy chi tiết bài kiểm tra trắc nghiệm theo QuizId
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetQuizDetail(Guid id)
    {
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
        var targetStudentId = User.IsAdmin() && request.StudentId != Guid.Empty
            ? request.StudentId
            : (currentUserId ?? request.StudentId);

        if (targetStudentId == Guid.Empty)
        {
            return Unauthorized(new { message = "Không xác định được danh tính sinh viên." });
        }

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
        var targetStudentId = User.IsAdmin() && studentId.HasValue 
            ? studentId.Value 
            : (currentUserId ?? studentId ?? Guid.Parse("33333333-3333-3333-3333-333333333333"));

        var result = await _quizService.GetLatestAttemptAsync(quizId, targetStudentId);
        if (result == null) return NotFound(new { message = "Chưa có lượt làm bài nào." });
        return Ok(result);
    }
}

public class QuizPasswordRequest
{
    public string? Password { get; set; }
}
