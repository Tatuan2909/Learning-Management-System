using System;

namespace Lms.Domain.Entities;

public class Major
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DepartmentId { get; set; }
    public Department? Department { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DegreeLevel { get; set; } = "Đại học Chính quy";
    public int TotalCredits { get; set; } = 135;
    public double DurationYears { get; set; } = 4.0;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
