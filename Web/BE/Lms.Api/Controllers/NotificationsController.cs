using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Lms.Api.Extensions;
using Lms.Application.DTOs;
using Lms.Infrastructure.Data;

namespace Lms.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly LmsDbContext _db;

    public NotificationsController(LmsDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Lấy danh sách thông báo của người dùng hiện tại (hỗ trợ phân trang)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var currentUserId = User.GetUserId();
        if (!currentUserId.HasValue) return Unauthorized();

        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 50) pageSize = 50;

        var query = _db.Notifications
            .Where(n => n.UserId == currentUserId.Value)
            .OrderByDescending(n => n.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new
            {
                id = n.Id.ToString(),
                title = n.Title,
                message = n.Message,
                type = n.Type,
                isRead = n.IsRead,
                linkUrl = n.LinkUrl,
                createdAt = n.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
            })
            .ToListAsync();

        return Ok(new PagedResult<object>(items.Cast<object>().ToList(), totalCount, pageNumber, pageSize));
    }

    /// <summary>
    /// Đếm số lượng thông báo chưa đọc
    /// </summary>
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var currentUserId = User.GetUserId();
        if (!currentUserId.HasValue) return Unauthorized();

        var count = await _db.Notifications
            .CountAsync(n => n.UserId == currentUserId.Value && !n.IsRead);

        return Ok(new { unreadCount = count });
    }

    /// <summary>
    /// Đánh dấu một thông báo là đã đọc
    /// </summary>
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var currentUserId = User.GetUserId();
        if (!currentUserId.HasValue) return Unauthorized();

        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == currentUserId.Value);

        if (notification == null) return NotFound("Thông báo không tồn tại.");

        notification.IsRead = true;
        await _db.SaveChangesAsync();

        return Ok(new { success = true, id = id.ToString() });
    }

    /// <summary>
    /// Đánh dấu tất cả thông báo của người dùng là đã đọc
    /// </summary>
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var currentUserId = User.GetUserId();
        if (!currentUserId.HasValue) return Unauthorized();

        var unreadNotifications = await _db.Notifications
            .Where(n => n.UserId == currentUserId.Value && !n.IsRead)
            .ToListAsync();

        foreach (var item in unreadNotifications)
        {
            item.IsRead = true;
        }

        await _db.SaveChangesAsync();

        return Ok(new { success = true, markedCount = unreadNotifications.Count });
    }
}
