using System;

namespace Lms.Domain.Entities;

public class FinalGrade
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EnrollmentId { get; set; }
    public Enrollment Enrollment { get; set; } = null!;
    public decimal AttendanceScore { get; set; } = 0.00m;
    public decimal AssignmentsScore { get; set; } = 0.00m;
    public decimal FinalExamScore { get; set; } = 0.00m;
    public decimal TotalScore { get; set; } = 0.00m;
    public string? LetterGrade { get; set; } // "A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"
    public bool IsPassed { get; set; } = false;
    public DateTime? FinalizedAt { get; set; }
}
