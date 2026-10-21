using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Lms.Application.DTOs;
using Lms.Application.Interfaces;
using Lms.Infrastructure.Data;

using Lms.Domain.Enums;
using Lms.Api.Extensions;
using Microsoft.AspNetCore.Authorization;

namespace Lms.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly LmsDbContext _db;
    private readonly IJwtService _jwtService;
    private readonly ISystemSettingsService _systemSettings;
    private readonly IPasswordHasher _passwordHasher;

    public AuthController(
        LmsDbContext db, 
        IJwtService jwtService, 
        ISystemSettingsService systemSettings,
        IPasswordHasher passwordHasher)
    {
        _db = db;
        _jwtService = jwtService;
        _systemSettings = systemSettings;
        _passwordHasher = passwordHasher;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var identifier = (request.Email ?? "").Trim();
        var prefix = identifier.Contains('@') ? identifier.Split('@')[0] : identifier;

        var user = await _db.Users
            .Include(u => u.StudentProfile)
            .Include(u => u.TeacherProfile)
            .FirstOrDefaultAsync(u => 
                u.Email == identifier ||
                u.Email == prefix ||
                (u.StudentProfile != null && (u.StudentProfile.StudentCode == identifier || u.StudentProfile.StudentCode == prefix)) ||
                (u.TeacherProfile != null && (u.TeacherProfile.TeacherCode == identifier || u.TeacherProfile.TeacherCode == prefix)));

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Tên đăng nhập / Mã định danh hoặc mật khẩu không chính xác." });
        }

        // Automatic security upgrade: If stored password was plain-text seed, re-hash with BCrypt immediately
        if (!user.PasswordHash.StartsWith("$2"))
        {
            user.PasswordHash = _passwordHasher.HashPassword(request.Password);
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
        var identifier = (request.Email ?? "").Trim();
        var prefix = identifier.Contains('@') ? identifier.Split('@')[0] : identifier;

        var user = await _db.Users
            .Include(u => u.StudentProfile)
            .Include(u => u.TeacherProfile)
            .FirstOrDefaultAsync(u => 
                u.Role == UserRole.ADMIN && (u.Email == identifier || u.Email == prefix));

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu Quản trị viên không chính xác." });
        }

        // Automatic security upgrade: If stored password was plain-text seed, re-hash with BCrypt immediately
        if (!user.PasswordHash.StartsWith("$2"))
        {
            user.PasswordHash = _passwordHasher.HashPassword(request.Password);
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
    /// Đổi mật khẩu tài khoản trong CSDL (Yêu cầu xác thực JWT)
    /// </summary>
    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var authenticatedUserId = User.GetUserId();
        if (authenticatedUserId == null)
        {
            return Unauthorized(new { message = "Không xác thực được người dùng từ token." });
        }

        // Ngăn chặn giả mạo: Người dùng thông thường chỉ được phép đổi mật khẩu của chính mình
        var targetUserId = User.IsAdmin() && request.UserId != Guid.Empty
            ? request.UserId
            : authenticatedUserId.Value;

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == targetUserId);
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng trong CSDL." });
        }

        if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Mật khẩu hiện tại không chính xác." });
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 6 ký tự." });
        }

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đổi mật khẩu thành công và đã được mã hóa an toàn trong cơ sở dữ liệu." });
    }

    /// <summary>
    /// Lấy thông tin tài khoản và hồ sơ chi tiết (Student/Teacher Profile)
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile([FromQuery] Guid? userId)
    {
        var authenticatedUserId = User.GetUserId();
        if (authenticatedUserId == null)
        {
            return Unauthorized(new { message = "Không xác thực được người dùng từ token." });
        }

        // Người dùng chỉ xem được thông tin của mình trừ khi là Quản trị viên
        var targetId = User.IsAdmin() && userId.HasValue
            ? userId.Value
            : authenticatedUserId.Value;

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

