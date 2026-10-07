using System;
using System.Collections.Generic;

namespace Lms.Application.DTOs;

public class QuizDetailDto
{
    public Guid QuizId { get; set; }
    public Guid LessonId { get; set; }
    public string Title { get; set; } = string.Empty;
    public double PassingScore { get; set; }
    public int TimeLimitMinutes { get; set; }
    public List<QuizQuestionDto> Questions { get; set; } = new();
}
