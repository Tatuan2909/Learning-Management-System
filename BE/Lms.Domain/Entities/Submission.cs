using System;
using System.Collections.Generic;
using Lms.Domain.Enums;

namespace Lms.Domain.Entities;

public class Submission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AssignmentId { get; set; }
    public Assignment Assignment { get; set; } = null!;
    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;
    public string? SubmissionText { get; set; }
    public string? FileUrl { get; set; }
    public string? GitRepoUrl { get; set; }
    public SubmissionStatus Status { get; set; } = SubmissionStatus.SUBMITTED;
    public decimal? Grade { get; set; }
    public string? Feedback { get; set; }
    public Guid? GradedBy { get; set; }
    public User? GradedByUser { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? GradedAt { get; set; }

    public ICollection<SubmissionFile> Files { get; set; } = new List<SubmissionFile>();
}
