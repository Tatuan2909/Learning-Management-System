using System;
using System.Collections.Generic;

namespace Lms.Application.DTOs;

public class SubmitQuizRequest
{
    public Guid QuizId { get; set; }
    public Guid StudentId { get; set; }
    public List<QuestionAnswerDto> Answers { get; set; } = new();
}
