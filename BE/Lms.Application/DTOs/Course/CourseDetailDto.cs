using System;
using System.Collections.Generic;

namespace Lms.Application.DTOs;

public class CourseDetailDto
{
    public Guid Id { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public decimal ProgressPercentage { get; set; }
    public bool IsEnrolled { get; set; }
    public List<CourseSectionDto> Sections { get; set; } = new();
}

public class CourseSectionDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public bool IsLocked { get; set; }
    public bool IsExpanded { get; set; }
    public List<LessonSummaryDto> Items { get; set; } = new();
}

public class LessonSummaryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? ContentUrl { get; set; }
    public string? BodyMarkdown { get; set; }
    public bool IsLocked { get; set; }
    public bool IsCompleted { get; set; }
    public bool QuizPassed { get; set; }
    public Guid? QuizId { get; set; }
    public Guid? AssignmentId { get; set; }
}
