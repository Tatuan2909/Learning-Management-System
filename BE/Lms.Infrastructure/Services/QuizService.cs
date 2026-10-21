using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Lms.Application.DTOs;
using Lms.Application.Interfaces;
using Lms.Domain.Entities;
using Lms.Infrastructure.Data;

namespace Lms.Infrastructure.Services;

public class QuizService : IQuizService
{
    private readonly LmsDbContext _db;

    public QuizService(LmsDbContext db)
    {
        _db = db;
    }

    public async Task<QuizDetailDto?> GetQuizDetailAsync(Guid quizId)
    {
        var quiz = await _db.Quizzes
            .Include(q => q.Questions)
                .ThenInclude(qq => qq.Options)
            .FirstOrDefaultAsync(q => q.Id == quizId || q.LessonId == quizId);

        if (quiz == null) return null;

        var questionsQuery = quiz.ShuffleQuestions
            ? quiz.Questions.OrderBy(_ => Guid.NewGuid())
            : quiz.Questions.OrderBy(q => q.OrderIndex);

        return new QuizDetailDto
        {
            QuizId = quiz.Id,
            LessonId = quiz.LessonId,
            Title = quiz.Title,
            PassingScore = (double)quiz.PassingScore,
            TimeLimitMinutes = quiz.TimeLimitMinutes ?? 0,
            Questions = questionsQuery.Select(q => new QuizQuestionDto
            {
                QuestionId = q.Id,
                QuestionText = q.QuestionText,
                QuestionType = q.QuestionType.ToString(),
                Points = (double)q.Points,
                Explanation = q.Explanation,
                Options = q.Options
                    .OrderBy(_ => Guid.NewGuid())
                    .Select(o => new QuizOptionDto
                    {
                        OptionId = o.Id,
                        OptionText = o.OptionText
                    }).ToList()
            }).ToList()
        };
    }

    public async Task<SubmitQuizResponse> SubmitQuizAsync(SubmitQuizRequest request)
    {
        var quiz = await _db.Quizzes
            .Include(q => q.Lesson)
            .Include(q => q.Questions)
                .ThenInclude(qq => qq.Options)
            .FirstOrDefaultAsync(q => q.Id == request.QuizId || q.LessonId == request.QuizId);

        if (quiz == null)
            throw new KeyNotFoundException("Quiz không tồn tại.");

        decimal totalMaxPoints = quiz.Questions.Sum(q => q.Points);
        if (totalMaxPoints <= 0) totalMaxPoints = 10.00m;

        // Count previous attempts for attempt_number
        int attemptCount = await _db.QuizAttempts
            .CountAsync(qa => qa.QuizId == quiz.Id && qa.StudentId == request.StudentId);

        var attempt = new QuizAttempt
        {
            QuizId = quiz.Id,
            StudentId = request.StudentId,
            AttemptNumber = attemptCount + 1,
            StartedAt = DateTime.UtcNow.AddMinutes(-5),
            SubmittedAt = DateTime.UtcNow
        };

        decimal earnedPoints = 0.00m;

        foreach (var question in quiz.Questions)
        {
            var studentAns = request.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
            var selectedOptionIds = studentAns?.SelectedOptionIds ?? new List<Guid>();
            var correctOptionIds = question.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();
            var studentOptionIds = selectedOptionIds.ToHashSet();

            bool isQuestionCorrect = studentOptionIds.Any() && correctOptionIds.SetEquals(studentOptionIds);
            decimal earnedQPoints = isQuestionCorrect ? question.Points : 0.00m;

            if (isQuestionCorrect)
            {
                earnedPoints += question.Points;
            }

            attempt.Answers.Add(new QuizAttemptAnswer
            {
                Id = Guid.NewGuid(),
                AttemptId = attempt.Id,
                QuestionId = question.Id,
                SelectedOptionId = selectedOptionIds.FirstOrDefault(),
                IsCorrect = isQuestionCorrect,
                PointsEarned = earnedQPoints
            });
        }

        // Score percentage / calculated out of max_score
        decimal percentageScore = Math.Round((earnedPoints / totalMaxPoints) * quiz.MaxScore, 2);
        bool isPassed = percentageScore >= quiz.PassingScore;

        attempt.ScoreAchieved = percentageScore;
        attempt.IsPassed = isPassed;
        _db.QuizAttempts.Add(attempt);

        bool lessonProgressUpdated = false;

        if (isPassed)
        {
            // Find student's enrollment for the course
            var enrollment = await _db.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == quiz.Lesson.CourseId && e.StudentId == request.StudentId);

            if (enrollment != null)
            {
                var progress = await _db.LessonProgresses
                    .FirstOrDefaultAsync(lp => lp.EnrollmentId == enrollment.Id && lp.LessonId == quiz.LessonId);

                if (progress == null)
                {
                    progress = new LessonProgress
                    {
                        EnrollmentId = enrollment.Id,
                        LessonId = quiz.LessonId,
                        IsCompleted = true,
                        QuizPassed = true,
                        CompletedAt = DateTime.UtcNow
                    };
                    _db.LessonProgresses.Add(progress);
                }
                else
                {
                    progress.IsCompleted = true;
                    progress.QuizPassed = true;
                    progress.CompletedAt = DateTime.UtcNow;
                }

                lessonProgressUpdated = true;
            }
        }

        await _db.SaveChangesAsync();

        return new SubmitQuizResponse
        {
            QuizAttemptId = attempt.Id,
            Score = (double)percentageScore,
            PassingScore = (double)quiz.PassingScore,
            IsPassed = isPassed,
            LessonProgressUpdated = lessonProgressUpdated,
            Message = isPassed
                ? $"Chúc mừng! Bạn đã ĐẠT bài trắc nghiệm với điểm số {percentageScore}/{quiz.MaxScore} (Yêu cầu >= {quiz.PassingScore}). Bài học đã được hoàn thành!"
                : $"Rất tiếc! Bạn đạt {percentageScore}/{quiz.MaxScore}, chưa đủ điểm đạt (Yêu cầu >= {quiz.PassingScore}). Hãy thử lại!"
        };
    }

    public async Task<QuizReviewDto?> GetQuizReviewAsync(Guid attemptId)
    {
        var attempt = await _db.QuizAttempts
            .Include(qa => qa.Quiz)
                .ThenInclude(q => q.Questions)
                    .ThenInclude(qq => qq.Options)
            .Include(qa => qa.Answers)
            .FirstOrDefaultAsync(qa => qa.Id == attemptId);

        if (attempt == null) return null;

        var quiz = attempt.Quiz;

        return new QuizReviewDto
        {
            AttemptId = attempt.Id,
            QuizId = quiz.Id,
            Title = quiz.Title,
            AttemptNumber = attempt.AttemptNumber,
            ScoreAchieved = (double)attempt.ScoreAchieved,
            PassingScore = (double)quiz.PassingScore,
            MaxScore = (double)quiz.MaxScore,
            IsPassed = attempt.IsPassed,
            SubmittedAt = attempt.SubmittedAt,
            Questions = quiz.Questions.OrderBy(q => q.OrderIndex).Select(q =>
            {
                var ans = attempt.Answers.FirstOrDefault(a => a.QuestionId == q.Id);
                var selectedIds = ans?.SelectedOptionId.HasValue == true
                    ? new List<Guid> { ans.SelectedOptionId.Value }
                    : new List<Guid>();

                return new QuizReviewQuestionDto
                {
                    QuestionId = q.Id,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType.ToString(),
                    Points = (double)q.Points,
                    PointsEarned = ans != null ? (double)ans.PointsEarned : 0.0,
                    IsCorrect = ans?.IsCorrect ?? false,
                    Explanation = q.Explanation,
                    SelectedOptionIds = selectedIds,
                    Options = q.Options.Select(o => new QuizReviewOptionDto
                    {
                        OptionId = o.Id,
                        OptionText = o.OptionText,
                        IsCorrect = o.IsCorrect,
                        Explanation = o.Explanation
                    }).ToList()
                };
            }).ToList()
        };
    }

    public async Task<QuizAttemptSummaryDto?> GetLatestAttemptAsync(Guid quizId, Guid studentId)
    {
        var attempt = await _db.QuizAttempts
            .Include(qa => qa.Quiz)
            .Where(qa => (qa.QuizId == quizId || qa.Quiz.LessonId == quizId) && qa.StudentId == studentId)
            .OrderByDescending(qa => qa.SubmittedAt ?? qa.StartedAt)
            .FirstOrDefaultAsync();

        if (attempt == null) return null;

        return new QuizAttemptSummaryDto
        {
            AttemptId = attempt.Id,
            QuizId = attempt.QuizId,
            AttemptNumber = attempt.AttemptNumber,
            ScoreAchieved = (double)attempt.ScoreAchieved,
            PassingScore = (double)attempt.Quiz.PassingScore,
            MaxScore = (double)attempt.Quiz.MaxScore,
            IsPassed = attempt.IsPassed,
            SubmittedAt = attempt.SubmittedAt
        };
    }
}
