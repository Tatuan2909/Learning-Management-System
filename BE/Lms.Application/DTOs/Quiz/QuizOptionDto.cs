using System;

namespace Lms.Application.DTOs;

public class QuizOptionDto
{
    public Guid OptionId { get; set; }
    public string OptionText { get; set; } = string.Empty;
}
