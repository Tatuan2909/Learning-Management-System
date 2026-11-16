using System;

namespace Lms.Domain.Entities;

public class QuestionBankOption
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid QuestionId { get; set; }
    public QuestionBank Question { get; set; } = null!;
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; } = false;
    public string? Explanation { get; set; }
    public int OrderIndex { get; set; } = 1;
}
