using System;
using System.Collections.Generic;

namespace Lms.Domain.Entities;

public class Enrollment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public decimal ProgressPercentage { get; set; } = 0.00m;
    public bool IsCompleted { get; set; } = false;
    public DateTime? CompletedAt { get; set; }
    public string Status { get; set; } = "ACTIVE";

    public ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();
    public FinalGrade? FinalGrade { get; set; }
}
