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

public class DashboardService : IDashboardService
{
    private readonly LmsDbContext _db;

    public DashboardService(LmsDbContext db)
    {
        _db = db;
    }

    public async Task<List<UpcomingDeadlineDto>> GetUpcomingDeadlinesAsync(Guid studentId)
    {
        var now = DateTime.UtcNow;

        // 1. Get courses student is actively enrolled in
        var activeEnrolledCourseIds = await _db.Enrollments
            .Where(e => e.StudentId == studentId && e.Status == "ACTIVE")
            .Select(e => e.CourseId)
            .ToListAsync();

        if (!activeEnrolledCourseIds.Any())
        {
            return new List<UpcomingDeadlineDto>();
        }

        // 2. Query assignments in enrolled courses where student HAS NOT submitted and DueDate > now
        var submittedAssignmentIds = await _db.Submissions
            .Where(s => s.StudentId == studentId)
            .Select(s => s.AssignmentId)
            .ToListAsync();

        // Also get completed lesson IDs for this student
        var completedLessonIds = await _db.LessonProgresses
            .Where(lp => lp.Enrollment.StudentId == studentId && lp.IsCompleted)
            .Select(lp => lp.LessonId)
            .ToListAsync();

        // Also get lessons where student has submitted quiz attempts
        var submittedQuizLessonIds = await _db.QuizAttempts
            .Where(qa => qa.StudentId == studentId && qa.SubmittedAt != null)
            .Select(qa => qa.Quiz.LessonId)
            .ToListAsync();

        var excludedLessonIds = completedLessonIds.Union(submittedQuizLessonIds).ToHashSet();

        var upcomingAssignments = await _db.Assignments
            .Include(a => a.Course)
            .Include(a => a.Lesson)
            .Where(a => activeEnrolledCourseIds.Contains(a.CourseId) 
                        && !submittedAssignmentIds.Contains(a.Id) 
                        && a.DueDate > now
                        && a.LessonId != null
                        && a.Lesson != null
                        && (!a.LessonId.HasValue || !excludedLessonIds.Contains(a.LessonId.Value)))
            .Select(a => new UpcomingDeadlineDto
            {
                Id = a.Id,
                Title = a.Title,
                CourseCode = a.Course.CourseCode,
                CourseTitle = a.Course.Title,
                Type = "ASSIGNMENT",
                DueDate = a.DueDate,
                MaxScore = (double)a.MaxScore,
                TargetUrl = $"/assignments/{a.Id}"
            })
            .ToListAsync();

        // 3. Process remaining time and urgency color badge
        foreach (var item in upcomingAssignments)
        {
            var remainingSec = (item.DueDate - now).TotalSeconds;
            item.RemainingSeconds = Math.Max(0, remainingSec);

            if (remainingSec < 24 * 3600) // Less than 24 hours
            {
                item.Urgency = "RED";
            }
            else if (remainingSec <= 72 * 3600) // 1 to 3 days
            {
                item.Urgency = "YELLOW";
            }
            else // > 3 days
            {
                item.Urgency = "GREEN";
            }
        }

        // Sort ascending by remaining time (most urgent first)
        return upcomingAssignments.OrderBy(x => x.RemainingSeconds).ToList();
    }
}
