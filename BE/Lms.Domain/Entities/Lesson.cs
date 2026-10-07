using System;
using System.Collections.Generic;
using Lms.Domain.Enums;

namespace Lms.Domain.Entities;

public class Lesson
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public Guid? SectionId { get; set; }
    public CourseSection? Section { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; } = 1;
    public LessonContentType ContentType { get; set; } = LessonContentType.VIDEO;
    public string? Subtitle { get; set; }
    public string? ContentUrl { get; set; }
    public string? BodyMarkdown { get; set; }
    public bool IsLocked { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Quiz? Quiz { get; set; }
    public ICollection<LessonProgress> Progresses { get; set; } = new List<LessonProgress>();
}
