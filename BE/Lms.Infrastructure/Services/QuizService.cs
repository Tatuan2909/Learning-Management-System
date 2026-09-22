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
            .FirstOrDefaultAsync(q => q.Id == quizId);

        if (quiz == null) return null;

        return new QuizDetailDto
        {
            QuizId = quiz.Id,
            LessonId = quiz.LessonId,
            Title = quiz.Title,
            PassingScore = (double)quiz.PassingScore,
            TimeLimitMinutes = quiz.TimeLimitMinutes ?? 0,
            Questions = quiz.Questions.OrderBy(q => q.OrderIndex).Select(q => new QuizQuestionDto
            {
                QuestionId = q.Id,
                QuestionText = q.QuestionText,
                QuestionType = q.QuestionType.ToString(),
                Points = (double)q.Points,
                Options = q.Options.Select(o => new QuizOptionDto
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
            .FirstOrDefaultAsync(q => q.Id == request.QuizId);

        if (quiz == null)
            throw new KeyNotFoundException("Quiz không tồn tại.");

        decimal totalMaxPoints = quiz.Questions.Sum(q => q.Points);
        if (totalMaxPoints <= 0) totalMaxPoints = 10.00m;

        decimal earnedPoints = 0.00m;

        foreach (var question in quiz.Questions)
        {
            var studentAns = request.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
            if (studentAns == null || !studentAns.SelectedOptionIds.Any())
                continue;

            var correctOptionIds = question.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();
            var studentOptionIds = studentAns.SelectedOptionIds.ToHashSet();

            if (correctOptionIds.SetEquals(studentOptionIds))
            {
                earnedPoints += question.Points;
            }
        }

        // Score percentage / calculated out of max_score
        decimal percentageScore = Math.Round((earnedPoints / totalMaxPoints) * quiz.MaxScore, 2);
        bool isPassed = percentageScore >= quiz.PassingScore;

        // Count previous attempts for attempt_number
        int attemptCount = await _db.QuizAttempts
            .CountAsync(qa => qa.QuizId == quiz.Id && qa.StudentId == request.StudentId);

        var attempt = new QuizAttempt
        {
            QuizId = quiz.Id,
            StudentId = request.StudentId,
            AttemptNumber = attemptCount + 1,
            ScoreAchieved = percentageScore,
            IsPassed = isPassed,
            StartedAt = DateTime.UtcNow.AddMinutes(-5),
            SubmittedAt = DateTime.UtcNow
        };
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
}
