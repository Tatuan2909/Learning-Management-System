using System;
using System.Collections.Generic;
using Lms.Domain.Enums;

namespace Lms.Domain.Entities;

public class QuizQuestion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;
    public string QuestionText { get; set; } = string.Empty;
    public QuestionType QuestionType { get; set; } = QuestionType.SINGLE_CHOICE;
    public decimal Points { get; set; } = 1.00m;
    public int OrderIndex { get; set; } = 1;
    public string? Explanation { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<QuizOption> Options { get; set; } = new List<QuizOption>();
}
