using System;

namespace Lms.Domain.Entities;

public class StudentProfile
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string StudentCode { get; set; } = string.Empty; // MSSV
    public string? AdministrativeClass { get; set; } // Lớp sinh hoạt (vd: K65-CNTT)
    public int? EnrollmentYear { get; set; }
    public string? Major { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
