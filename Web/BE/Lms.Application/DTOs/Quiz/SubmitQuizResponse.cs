using System;

namespace Lms.Application.DTOs;

public class SubmitQuizResponse
{
    public Guid QuizAttemptId { get; set; }
    public double Score { get; set; }
    public double PassingScore { get; set; }
    public bool IsPassed { get; set; }
    public bool LessonProgressUpdated { get; set; }
    public string Message { get; set; } = string.Empty;
}
