using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Lms.Application.Interfaces;
using Lms.Domain.Entities;
using Lms.Infrastructure.Data;
using Lms.Infrastructure.Hubs;

namespace Lms.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly LmsDbContext _db;
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(LmsDbContext db, IHubContext<NotificationHub> hubContext)
    {
        _db = db;
        _hubContext = hubContext;
    }

    public async Task<Notification> SendNotificationAsync(Guid userId, string title, string message, string type = "SYSTEM", string? linkUrl = null)
    {
        var notif = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            IsRead = false,
            LinkUrl = linkUrl,
            CreatedAt = DateTime.UtcNow
        };

        _db.Notifications.Add(notif);
        await _db.SaveChangesAsync();

        var payload = new
        {
            id = notif.Id.ToString(),
            userId = notif.UserId.ToString(),
            title = notif.Title,
            message = notif.Message,
            type = notif.Type,
            isRead = notif.IsRead,
            linkUrl = notif.LinkUrl,
            createdAt = notif.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
        };

        // Realtime push to user group
        await _hubContext.Clients.Group($"user_{userId.ToString().ToLower()}").SendAsync("ReceiveNotification", payload);

        return notif;
    }

    public async Task<int> SendNotificationToCourseStudentsAsync(Guid courseId, string title, string message, string type = "ANNOUNCEMENT", string? linkUrl = null)
    {
        var enrolledStudents = await _db.Enrollments
            .Where(e => e.CourseId == courseId)
            .Select(e => e.StudentId)
            .Distinct()
            .ToListAsync();

        if (!enrolledStudents.Any())
            return 0;

        var notifications = enrolledStudents.Select(studentId => new Notification
        {
            Id = Guid.NewGuid(),
            UserId = studentId,
            Title = title,
            Message = message,
            Type = type,
            IsRead = false,
            LinkUrl = linkUrl,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        _db.Notifications.AddRange(notifications);
        await _db.SaveChangesAsync();

        // Broadcast to course group
        var broadcastPayload = new
        {
            courseId = courseId.ToString(),
            title,
            message,
            type,
            linkUrl,
            createdAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
        };

        await _hubContext.Clients.Group($"course_{courseId.ToString().ToLower()}").SendAsync("ReceiveCourseAnnouncement", broadcastPayload);

        // Also push to individual user groups so their private badges update
        foreach (var notif in notifications)
        {
            var payload = new
            {
                id = notif.Id.ToString(),
                userId = notif.UserId.ToString(),
                title = notif.Title,
                message = notif.Message,
                type = notif.Type,
                isRead = notif.IsRead,
                linkUrl = notif.LinkUrl,
                createdAt = notif.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
            };
            await _hubContext.Clients.Group($"user_{notif.UserId.ToString().ToLower()}").SendAsync("ReceiveNotification", payload);
        }

        return notifications.Count;
    }
}
