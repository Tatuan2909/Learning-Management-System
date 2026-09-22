using System;
using System.Collections.Generic;

namespace Lms.Application.DTOs;

public record LoginRequest(string Email, string Password);

public record AuthResponse(
    string Token,
    string RefreshToken,
    Guid UserId,
    string Email,
    string FullName,
    string Role
);

public record RefreshTokenRequest(string Token, string RefreshToken);

public class UpcomingDeadlineDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public string Type { get; set; } = "ASSIGNMENT"; // ASSIGNMENT or QUIZ
    public DateTime DueDate { get; set; }
    public double RemainingSeconds { get; set; }
    public string Urgency { get; set; } = "GREEN"; // RED (<24h), YELLOW (1-3d), GREEN (>3d)
    public double MaxScore { get; set; }
    public string TargetUrl { get; set; } = string.Empty;
}

public class QuizDetailDto
{
    public Guid QuizId { get; set; }
    public Guid LessonId { get; set; }
    public string Title { get; set; } = string.Empty;
    public double PassingScore { get; set; }
    public int TimeLimitMinutes { get; set; }
    public List<QuizQuestionDto> Questions { get; set; } = new();
}

public class QuizQuestionDto
{
    public Guid QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = "SINGLE_CHOICE";
    public double Points { get; set; }
    public List<QuizOptionDto> Options { get; set; } = new();
}

public class QuizOptionDto
{
    public Guid OptionId { get; set; }
    public string OptionText { get; set; } = string.Empty;
}

public class SubmitQuizRequest
{
    public Guid QuizId { get; set; }
    public Guid StudentId { get; set; }
    public List<QuestionAnswerDto> Answers { get; set; } = new();
}

public class QuestionAnswerDto
{
    public Guid QuestionId { get; set; }
    public List<Guid> SelectedOptionIds { get; set; } = new();
}

public class SubmitQuizResponse
{
    public Guid QuizAttemptId { get; set; }
    public double Score { get; set; }
    public double PassingScore { get; set; }
    public bool IsPassed { get; set; }
    public bool LessonProgressUpdated { get; set; }
    public string Message { get; set; } = string.Empty;
}
