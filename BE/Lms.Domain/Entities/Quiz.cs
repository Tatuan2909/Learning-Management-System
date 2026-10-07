using System;
using System.Collections.Generic;

namespace Lms.Domain.Entities;

public class Quiz
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LessonId { get; set; }
    public Lesson Lesson { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Password { get; set; }
    public decimal PassingScore { get; set; } = 7.00m;
    public decimal MaxScore { get; set; } = 10.00m;
    public int? TimeLimitMinutes { get; set; }
    public int? MaxAttempts { get; set; } = 3;
    public bool ShuffleQuestions { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<QuizQuestion> Questions { get; set; } = new List<QuizQuestion>();
    public ICollection<QuizAttempt> Attempts { get; set; } = new List<QuizAttempt>();
}
