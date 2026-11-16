using System;
using System.Collections.Generic;

namespace Lms.Domain.Entities;

public class Department
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? DeanName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? OfficeLocation { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Major> Majors { get; set; } = new List<Major>();
}
