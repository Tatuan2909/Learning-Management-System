using System;
using System.Collections.Generic;

namespace Lms.Domain.Entities;

public class QuizAttempt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;
    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;
    public int AttemptNumber { get; set; } = 1;
    public decimal ScoreAchieved { get; set; } = 0.00m;
    public bool IsPassed { get; set; } = false;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAt { get; set; }

    public ICollection<QuizAttemptAnswer> Answers { get; set; } = new List<QuizAttemptAnswer>();
}
