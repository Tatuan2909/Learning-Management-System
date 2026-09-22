using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Lms.Application.Interfaces;

namespace Lms.Api.Controllers;

[ApiController]
[Route("api/student")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>
    /// Module 8: Widget Đếm ngược Deadline (Upcoming Deadlines Widget)
    /// Lọc các bài tập/bài thi chưa nộp, DueDate > Current_Time, sắp xếp tăng dần theo thời gian còn lại.
    /// </summary>
    [HttpGet("upcoming-deadlines")]
    public async Task<IActionResult> GetUpcomingDeadlines([FromQuery] Guid? studentId)
    {
        // Default to demo student ID if not provided in claims/query
        var targetStudentId = studentId ?? Guid.Parse("33333333-3333-3333-3333-333333333333");
        var result = await _dashboardService.GetUpcomingDeadlinesAsync(targetStudentId);
        return Ok(result);
    }
}
