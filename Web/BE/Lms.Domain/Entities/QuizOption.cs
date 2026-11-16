using System;

namespace Lms.Domain.Entities;

public class QuizOption
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid QuestionId { get; set; }
    public QuizQuestion Question { get; set; } = null!;
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; } = false;
    public string? Explanation { get; set; }
}
