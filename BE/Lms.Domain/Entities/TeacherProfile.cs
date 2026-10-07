using System;

namespace Lms.Domain.Entities;

public class TeacherProfile
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string TeacherCode { get; set; } = string.Empty; // Mã cán bộ giảng viên
    public string? Department { get; set; } // Khoa/Bộ môn
    public string? AcademicTitle { get; set; } // ThS, TS, PGS, GS
    public string? Bio { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
