using System;

namespace Lms.Application.DTOs;

public record AuthResponse(
    string Token,
    string RefreshToken,
    Guid UserId,
    string Email,
    string FullName,
    string Role,
    string? StudentCode = null,
    string? TeacherCode = null
);
