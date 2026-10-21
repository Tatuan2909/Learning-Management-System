using System;
using System.Collections.Generic;

namespace Lms.Application.DTOs;

public class QuizReviewDto
{
    public Guid AttemptId { get; set; }
    public Guid QuizId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int AttemptNumber { get; set; }
    public double ScoreAchieved { get; set; }
    public double PassingScore { get; set; }
    public double MaxScore { get; set; }
    public bool IsPassed { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public List<QuizReviewQuestionDto> Questions { get; set; } = new();
}

public class QuizReviewQuestionDto
{
    public Guid QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public double Points { get; set; }
    public double PointsEarned { get; set; }
    public bool IsCorrect { get; set; }
    public string? Explanation { get; set; }
    public List<Guid> SelectedOptionIds { get; set; } = new();
    public List<QuizReviewOptionDto> Options { get; set; } = new();
}

public class QuizReviewOptionDto
{
    public Guid OptionId { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string? Explanation { get; set; }
}

public class QuizAttemptSummaryDto
{
    public Guid AttemptId { get; set; }
    public Guid QuizId { get; set; }
    public int AttemptNumber { get; set; }
    public double ScoreAchieved { get; set; }
    public double PassingScore { get; set; }
    public double MaxScore { get; set; }
    public bool IsPassed { get; set; }
    public DateTime? SubmittedAt { get; set; }
}
