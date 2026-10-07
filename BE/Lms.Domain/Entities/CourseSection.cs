using System;
using System.Collections.Generic;

namespace Lms.Domain.Entities;

public class CourseSection
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; } = 1;
    public bool IsLocked { get; set; } = false;
    public bool IsExpanded { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}
