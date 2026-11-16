using System;

namespace Lms.Domain.Entities;

public class SubmissionFile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SubmissionId { get; set; }
    public Submission Submission { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSize { get; set; } = 0;
    public string? FileType { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
