using System.Security.Claims;

namespace Lms.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid? GetUserId(this ClaimsPrincipal user)
    {
        var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idClaim, out var id) ? id : null;
    }

    public static string? GetUserRole(this ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Role)?.Value;
    }

    public static bool IsAdmin(this ClaimsPrincipal user)
    {
        return string.Equals(user.GetUserRole(), "ADMIN", StringComparison.OrdinalIgnoreCase);
    }

    public static bool IsTeacher(this ClaimsPrincipal user)
    {
        return string.Equals(user.GetUserRole(), "TEACHER", StringComparison.OrdinalIgnoreCase);
    }

    public static bool IsStudent(this ClaimsPrincipal user)
    {
        return string.Equals(user.GetUserRole(), "STUDENT", StringComparison.OrdinalIgnoreCase);
    }
}
