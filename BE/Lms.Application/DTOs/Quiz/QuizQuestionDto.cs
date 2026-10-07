using System;
using System.Collections.Generic;

namespace Lms.Application.DTOs;

public class QuizQuestionDto
{
    public Guid QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = "SINGLE_CHOICE";
    public double Points { get; set; }
    public string? Explanation { get; set; }
    public List<QuizOptionDto> Options { get; set; } = new();
}
