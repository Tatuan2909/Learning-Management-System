using System;

namespace Lms.Domain.Entities;

public class LessonProgress
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EnrollmentId { get; set; }
    public Enrollment Enrollment { get; set; } = null!;
    public Guid LessonId { get; set; }
    public Lesson Lesson { get; set; } = null!;
    public bool IsCompleted { get; set; } = false;
    public bool QuizPassed { get; set; } = false;
    public DateTime? CompletedAt { get; set; }
    public DateTime? LastAccessedAt { get; set; }
}
