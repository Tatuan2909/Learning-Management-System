using System;
using System.Collections.Generic;

namespace Lms.Application.DTOs;

public class QuestionAnswerDto
{
    public Guid QuestionId { get; set; }
    public List<Guid> SelectedOptionIds { get; set; } = new();
}
