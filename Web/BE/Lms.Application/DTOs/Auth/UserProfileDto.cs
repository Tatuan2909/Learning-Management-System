using System;

namespace Lms.Application.DTOs;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public string Role { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? DepartmentOrClass { get; set; }
    public string? AcademicTitleOrMajor { get; set; }
}
