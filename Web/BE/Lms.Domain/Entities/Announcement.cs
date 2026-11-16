using System;
using System.Collections.Generic;

namespace Lms.Domain.Entities;

public class Announcement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public Guid TeacherId { get; set; }
    public User Teacher { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsPinned { get; set; } = false;
    public string? AttachmentUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AnnouncementComment> Comments { get; set; } = new List<AnnouncementComment>();
}
