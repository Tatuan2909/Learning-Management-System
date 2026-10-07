using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Lms.Application.DTOs;
using Lms.Application.Interfaces;
using Lms.Infrastructure.Data;

namespace Lms.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly LmsDbContext _db;
    private readonly IJwtService _jwtService;

    public AuthController(LmsDbContext db, IJwtService jwtService)
    {
        _db = db;
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || user.PasswordHash != request.Password) // Simple check for demo
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác." });
        }

        var token = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _db.SaveChangesAsync();

        return Ok(new AuthResponse(
            token,
            refreshToken,
            user.Id,
            user.Email,
            user.FullName,
            user.Role.ToString()
        ));
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken);

        if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return BadRequest(new { message = "Refresh token không hợp lệ hoặc đã hết hạn." });
        }

        var newToken = _jwtService.GenerateAccessToken(user);
        var newRefreshToken = _jwtService.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _db.SaveChangesAsync();

        return Ok(new AuthResponse(
            newToken,
            newRefreshToken,
            user.Id,
            user.Email,
            user.FullName,
            user.Role.ToString()
        ));
    }

    /// <summary>
    /// Lấy thông tin tài khoản và hồ sơ chi tiết (Student/Teacher Profile)
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile([FromQuery] Guid? userId)
    {
        var targetId = userId ?? Guid.Parse("33333333-3333-3333-3333-333333333333");

        var user = await _db.Users
            .Include(u => u.StudentProfile)
            .Include(u => u.TeacherProfile)
            .FirstOrDefaultAsync(u => u.Id == targetId);

        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        return Ok(new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Phone = user.Phone,
            AvatarUrl = user.AvatarUrl,
            Role = user.Role.ToString(),
            Code = user.StudentProfile?.StudentCode ?? user.TeacherProfile?.TeacherCode,
            DepartmentOrClass = user.StudentProfile?.AdministrativeClass ?? user.TeacherProfile?.Department,
            AcademicTitleOrMajor = user.StudentProfile?.Major ?? user.TeacherProfile?.AcademicTitle
        });
    }
}

