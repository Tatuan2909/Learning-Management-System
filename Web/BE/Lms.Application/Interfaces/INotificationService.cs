using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lms.Domain.Entities;

namespace Lms.Application.Interfaces;

public interface INotificationService
{
    Task<Notification> SendNotificationAsync(Guid userId, string title, string message, string type = "SYSTEM", string? linkUrl = null);
    Task<int> SendNotificationToCourseStudentsAsync(Guid courseId, string title, string message, string type = "ANNOUNCEMENT", string? linkUrl = null);
}
