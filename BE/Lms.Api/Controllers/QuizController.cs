using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Lms.Application.DTOs;
using Lms.Application.Interfaces;

namespace Lms.Api.Controllers;

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
    /// Module 3: Tự động chấm điểm trắc nghiệm & kích hoạt cập nhật LessonProgress nếu đạt score >= passing_score
    /// </summary>
    [HttpPost("submit")]
    public async Task<IActionResult> SubmitQuiz([FromBody] SubmitQuizRequest request)
    {
        if (request.StudentId == Guid.Empty)
        {
            // Default demo student ID
            request.StudentId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        }

        try
        {
            var response = await _quizService.SubmitQuizAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
