using System;
using System.Collections.Generic;

namespace Lms.Domain.Entities;

public class Assignment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public Guid? LessonId { get; set; }
    public Lesson? Lesson { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
    public DateTime DueDate { get; set; }
    public decimal MaxScore { get; set; } = 10.00m;
    public bool AllowGitRepo { get; set; } = true;
    public string? AllowedExtensions { get; set; } = ".zip,.rar,.7z,.pdf,.docx";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}
