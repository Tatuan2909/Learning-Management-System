using System;

namespace Lms.Application.DTOs;

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
