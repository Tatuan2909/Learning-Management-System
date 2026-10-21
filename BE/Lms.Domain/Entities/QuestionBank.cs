using System;
using System.Collections.Generic;
using Lms.Domain.Enums;

namespace Lms.Domain.Entities;

public class QuestionBank
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? CourseId { get; set; }
    public Course? Course { get; set; }
    public string? CourseCode { get; set; }
    public int WeekNumber { get; set; } = 1;
    public string? Topic { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public QuestionType QuestionType { get; set; } = QuestionType.SINGLE_CHOICE;
    public decimal Points { get; set; } = 2.00m;
    public string? Explanation { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<QuestionBankOption> Options { get; set; } = new List<QuestionBankOption>();
}
