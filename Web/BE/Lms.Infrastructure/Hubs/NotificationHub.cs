using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Lms.Infrastructure.Hubs;

public class NotificationHub : Hub
{
    public async Task JoinUserGroup(string userId)
    {
        if (!string.IsNullOrWhiteSpace(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId.Trim().ToLower()}");
        }
    }

    public async Task LeaveUserGroup(string userId)
    {
        if (!string.IsNullOrWhiteSpace(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId.Trim().ToLower()}");
        }
    }

    public async Task JoinCourseGroup(string courseId)
    {
        if (!string.IsNullOrWhiteSpace(courseId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"course_{courseId.Trim().ToLower()}");
        }
    }

    public async Task LeaveCourseGroup(string courseId)
    {
        if (!string.IsNullOrWhiteSpace(courseId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"course_{courseId.Trim().ToLower()}");
        }
    }
}
