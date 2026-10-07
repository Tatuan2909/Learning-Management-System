using System;

namespace Lms.Application.DTOs;

public class CourseListDto
{
    public Guid Id { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public bool IsEnrolled { get; set; }
    public decimal ProgressPercentage { get; set; }
    public int LessonsCount { get; set; }
    public decimal WeightAttendance { get; set; }
    public decimal WeightAssignments { get; set; }
    public decimal WeightFinalExam { get; set; }
}
