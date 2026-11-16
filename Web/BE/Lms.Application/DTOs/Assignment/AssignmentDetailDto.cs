using System;
using System.Collections.Generic;

namespace Lms.Application.DTOs;

public class AssignmentDetailDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public Guid? LessonId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
    public DateTime DueDate { get; set; }
    public decimal MaxScore { get; set; }
    public bool AllowGitRepo { get; set; }
    public string? AllowedExtensions { get; set; }
    public SubmissionDto? MySubmission { get; set; }
}

public class SubmissionDto
{
    public Guid Id { get; set; }
    public string? SubmissionText { get; set; }
    public string? GitRepoUrl { get; set; }
    public string? FileUrl { get; set; }
    public string Status { get; set; } = "SUBMITTED";
    public decimal? Grade { get; set; }
    public string? Feedback { get; set; }
    public DateTime SubmittedAt { get; set; }
    public List<SubmissionFileDto> Files { get; set; } = new();
}

public class SubmissionFileDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? FileType { get; set; }
}

public class SubmitAssignmentRequest
{
    public Guid StudentId { get; set; }
    public string? SubmissionText { get; set; }
    public string? GitRepoUrl { get; set; }
    public string? FileName { get; set; }
    public string? FileUrl { get; set; }
    public long? FileSize { get; set; }
}
