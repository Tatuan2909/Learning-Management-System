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

    public async Task<bool> VerifyQuizPasswordAsync(Guid quizId, string? password)
    {
        var quiz = await _db.Quizzes
            .FirstOrDefaultAsync(q => q.Id == quizId || q.LessonId == quizId);
        if (quiz == null) return false;

        if (string.IsNullOrEmpty(quiz.Password)) return true;
        return string.Equals(quiz.Password.Trim(), password?.Trim(), StringComparison.Ordinal);
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

        // 1. Kiểm tra ghi danh khóa học của sinh viên
        var enrollment = await _db.Enrollments
            .FirstOrDefaultAsync(e => e.CourseId == quiz.Lesson.CourseId && e.StudentId == request.StudentId);

        if (enrollment == null)
        {
            throw new InvalidOperationException("Sinh viên chưa ghi danh khóa học này để làm bài trắc nghiệm.");
        }

        if (enrollment.Status == "SUSPENDED")
        {
            throw new InvalidOperationException("Tài khoản ghi danh của bạn trong khóa học này đang bị tạm ngưng.");
        }

        // 2. Kiểm tra mật khẩu bài thi nếu có cấu hình
        if (!string.IsNullOrEmpty(quiz.Password))
        {
            if (string.IsNullOrEmpty(request.Password) || !string.Equals(quiz.Password.Trim(), request.Password.Trim(), StringComparison.Ordinal))
            {
                throw new UnauthorizedAccessException("Mật khẩu bài trắc nghiệm không chính xác.");
            }
        }

        // 3. Kiểm tra số lần làm bài tối đa (MaxAttempts)
        int attemptCount = await _db.QuizAttempts
            .CountAsync(qa => qa.QuizId == quiz.Id && qa.StudentId == request.StudentId);

        if (quiz.MaxAttempts.HasValue && quiz.MaxAttempts.Value > 0 && attemptCount >= quiz.MaxAttempts.Value)
        {
            throw new InvalidOperationException($"Bạn đã vượt quá số lần làm bài tối đa cho phép ({quiz.MaxAttempts.Value} lần).");
        }

        // 4. Kiểm tra thời gian làm bài (TimeLimitMinutes)
        var startedAt = request.StartedAt ?? DateTime.UtcNow.AddMinutes(-1);
        var submittedAt = DateTime.UtcNow;

        if (quiz.TimeLimitMinutes.HasValue && quiz.TimeLimitMinutes.Value > 0)
        {
            // Cho phép độ trễ mạng tối đa 2 phút
            var allowedDuration = TimeSpan.FromMinutes(quiz.TimeLimitMinutes.Value + 2);
            if (submittedAt - startedAt > allowedDuration)
            {
                throw new InvalidOperationException("Thời gian làm bài đã vượt quá giới hạn quy định của bài thi.");
            }
        }

        decimal totalMaxPoints = quiz.Questions.Sum(q => q.Points);
        if (totalMaxPoints <= 0) totalMaxPoints = 10.00m;

        var attempt = new QuizAttempt
        {
            QuizId = quiz.Id,
            StudentId = request.StudentId,
            AttemptNumber = attemptCount + 1,
            StartedAt = startedAt,
            SubmittedAt = submittedAt
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

            if (selectedOptionIds.Any())
            {
                // Lưu từng phương án đã chọn để phản ánh chính xác cả câu hỏi chọn nhiều đáp án
                foreach (var optId in selectedOptionIds)
                {
                    attempt.Answers.Add(new QuizAttemptAnswer
                    {
                        Id = Guid.NewGuid(),
                        AttemptId = attempt.Id,
                        QuestionId = question.Id,
                        SelectedOptionId = optId,
                        IsCorrect = isQuestionCorrect,
                        PointsEarned = earnedQPoints
                    });
                }
            }
            else
            {
                attempt.Answers.Add(new QuizAttemptAnswer
                {
                    Id = Guid.NewGuid(),
                    AttemptId = attempt.Id,
                    QuestionId = question.Id,
                    SelectedOptionId = null,
                    IsCorrect = false,
                    PointsEarned = 0m
                });
            }
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
                var qAnswers = attempt.Answers.Where(a => a.QuestionId == q.Id).ToList();
                var selectedIds = qAnswers
                    .Where(a => a.SelectedOptionId.HasValue)
                    .Select(a => a.SelectedOptionId!.Value)
                    .Distinct()
                    .ToList();
                var firstAns = qAnswers.FirstOrDefault();

                return new QuizReviewQuestionDto
                {
                    QuestionId = q.Id,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType.ToString(),
                    Points = (double)q.Points,
                    PointsEarned = firstAns != null ? (double)firstAns.PointsEarned : 0.0,
                    IsCorrect = qAnswers.Any(a => a.IsCorrect),
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
