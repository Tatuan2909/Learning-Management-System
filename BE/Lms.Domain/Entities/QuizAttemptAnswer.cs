using System;

namespace Lms.Domain.Entities;

public class QuizAttemptAnswer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AttemptId { get; set; }
    public QuizAttempt Attempt { get; set; } = null!;
    public Guid QuestionId { get; set; }
    public QuizQuestion Question { get; set; } = null!;
    public Guid? SelectedOptionId { get; set; }
    public QuizOption? SelectedOption { get; set; }
    public bool IsCorrect { get; set; } = false;
    public decimal PointsEarned { get; set; } = 0.00m;
}
