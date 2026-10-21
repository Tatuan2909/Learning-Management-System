using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Lms.Application.DTOs;
using Lms.Application.Interfaces;
using Lms.Infrastructure.Data;

using Lms.Domain.Enums;

namespace Lms.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly LmsDbContext _db;
    private readonly IJwtService _jwtService;
    private readonly ISystemSettingsService _systemSettings;

    public AuthController(LmsDbContext db, IJwtService jwtService, ISystemSettingsService systemSettings)
    {
        _db = db;
        _jwtService = jwtService;
        _systemSettings = systemSettings;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _db.Users
            .Include(u => u.StudentProfile)
            .Include(u => u.TeacherProfile)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || user.PasswordHash != request.Password) // Simple check for demo
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác." });
        }

        if (!user.IsActive)
        {
            return Unauthorized(new { message = "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên." });
        }

        // Chế độ bảo trì: Chỉ cho phép Quản trị viên (ADMIN) đăng nhập
        if (user.Role != UserRole.ADMIN && _systemSettings.IsMaintenanceMode)
        {
            return StatusCode(503, new
            {
                message = _systemSettings.MaintenanceMessage ?? "Hệ thống đang trong chế độ bảo trì để nâng cấp cơ sở dữ liệu. Sinh viên và Giảng viên tạm thời không thể đăng nhập. Vui lòng quay lại sau.",
                isMaintenance = true
            });
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
            user.Role.ToString(),
            user.StudentProfile?.StudentCode,
            user.TeacherProfile?.TeacherCode
        ));
    }

    /// <summary>
    /// Cổng đăng nhập độc lập dành riêng cho Quản trị viên (Admin Portal)
    /// Luôn luôn đăng nhập được ngay cả khi hệ thống đang BẬT chế độ bảo trì
    /// </summary>
    [HttpPost("admin-login")]
    public async Task<IActionResult> AdminLogin([FromBody] LoginRequest request)
    {
        var user = await _db.Users
            .Include(u => u.StudentProfile)
            .Include(u => u.TeacherProfile)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || user.PasswordHash != request.Password)
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu Quản trị viên không chính xác." });
        }

        if (user.Role != UserRole.ADMIN)
        {
            return StatusCode(403, new { message = "Tài khoản này không có quyền Quản trị viên (ADMIN). Vui lòng sử dụng Cổng đăng nhập Giảng viên / Sinh viên thông thường." });
        }

        if (!user.IsActive)
        {
            return Unauthorized(new { message = "Tài khoản Quản trị viên đã bị khóa." });
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
            user.Role.ToString(),
            user.StudentProfile?.StudentCode,
            user.TeacherProfile?.TeacherCode
        ));
    }

    /// <summary>
    /// Kiểm tra trạng thái hệ thống và chế độ bảo trì (public endpoint)
    /// </summary>
    [HttpGet("system-status")]
    public IActionResult GetSystemStatus()
    {
        return Ok(new
        {
            isMaintenance = _systemSettings.IsMaintenanceMode,
            message = _systemSettings.MaintenanceMessage
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var user = await _db.Users
            .Include(u => u.StudentProfile)
            .Include(u => u.TeacherProfile)
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
            user.Role.ToString(),
            user.StudentProfile?.StudentCode,
            user.TeacherProfile?.TeacherCode
        ));
    }

    /// <summary>
    /// Đổi mật khẩu tài khoản trong CSDL
    /// </summary>
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (request.UserId == Guid.Empty)
        {
            return BadRequest(new { message = "UserId không hợp lệ." });
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.UserId);
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng trong CSDL." });
        }

        if (user.PasswordHash != request.CurrentPassword)
        {
            return BadRequest(new { message = "Mật khẩu hiện tại không chính xác." });
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 6 ký tự." });
        }

        user.PasswordHash = request.NewPassword;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đổi mật khẩu thành công trong cơ sở dữ liệu." });
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

