using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Lms.Infrastructure.Data;
using Lms.Domain.Entities;
using Lms.Domain.Enums;

namespace Lms.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly LmsDbContext _db;

    public AdminController(LmsDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Thống kê tổng quan hệ thống cho Admin
    /// </summary>
    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
    {
        var totalUsers = await _db.Users.CountAsync();
        var totalCourses = await _db.Courses.CountAsync();
        var totalEnrollments = await _db.Enrollments.CountAsync();
        var totalSubmissions = await _db.Submissions.CountAsync();

        return Ok(new
        {
            totalUsers,
            totalCourses,
            totalEnrollments,
            totalSubmissions
        });
    }

    /// <summary>
    /// Danh sách người dùng hệ thống
    /// </summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _db.Users
            .Include(u => u.StudentProfile)
            .Include(u => u.TeacherProfile)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        var result = users.Select(u => new
        {
            id = u.Id.ToString(),
            fullName = u.FullName,
            email = u.Email,
            role = u.Role.ToString(),
            code = u.StudentProfile?.StudentCode ?? u.TeacherProfile?.TeacherCode ?? "ADM" + u.Id.ToString().Substring(0, 4),
            departmentOrClass = u.StudentProfile?.AdministrativeClass ?? u.TeacherProfile?.Department ?? "Phòng Quản trị",
            status = u.IsActive ? "ACTIVE" : "LOCKED",
            createdAt = u.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
        });

        return Ok(result);
    }

    /// <summary>
    /// Tạo người dùng mới trong hệ thống
    /// </summary>
    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateAdminUserDto request)
    {
        var existing = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());
        if (existing != null)
        {
            return BadRequest("Email đã được sử dụng bởi một tài khoản khác.");
        }

        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
        {
            role = UserRole.STUDENT;
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.Trim(),
            FullName = request.FullName.Trim(),
            PasswordHash = "password123",
            Role = role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (role == UserRole.STUDENT)
        {
            user.StudentProfile = new StudentProfile
            {
                UserId = user.Id,
                StudentCode = !string.IsNullOrWhiteSpace(request.Code) ? request.Code.Trim() : "SV" + new Random().Next(1000000, 9999999),
                AdministrativeClass = !string.IsNullOrWhiteSpace(request.DepartmentOrClass) ? request.DepartmentOrClass.Trim() : "CNTT-K65",
                Major = "Công nghệ Thông tin",
                EnrollmentYear = DateTime.UtcNow.Year
            };
        }
        else if (role == UserRole.TEACHER)
        {
            user.TeacherProfile = new TeacherProfile
            {
                UserId = user.Id,
                TeacherCode = !string.IsNullOrWhiteSpace(request.Code) ? request.Code.Trim() : "GV" + new Random().Next(100, 999),
                Department = !string.IsNullOrWhiteSpace(request.DepartmentOrClass) ? request.DepartmentOrClass.Trim() : "Khoa Công nghệ Thông tin",
                AcademicTitle = "Tiến sĩ"
            };
        }

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = user.Id.ToString(),
            fullName = user.FullName,
            email = user.Email,
            role = user.Role.ToString(),
            code = user.StudentProfile?.StudentCode ?? user.TeacherProfile?.TeacherCode ?? "ADM001",
            departmentOrClass = user.StudentProfile?.AdministrativeClass ?? user.TeacherProfile?.Department ?? "Phòng Quản trị",
            status = "ACTIVE",
            createdAt = user.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
        });
    }

    /// <summary>
    /// Khóa / Mở khóa tài khoản người dùng
    /// </summary>
    [HttpPost("users/{userId}/toggle-status")]
    public async Task<IActionResult> ToggleUserStatus(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound("Người dùng không tồn tại.");

        user.IsActive = !user.IsActive;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = user.Id.ToString(),
            status = user.IsActive ? "ACTIVE" : "LOCKED"
        });
    }

    /// <summary>
    /// Danh sách tất cả các khóa học trong hệ thống
    /// </summary>
    [HttpGet("courses")]
    public async Task<IActionResult> GetCourses()
    {
        var courses = await _db.Courses
            .Include(c => c.Teacher)
            .Include(c => c.Enrollments)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var result = courses.Select(c => new
        {
            id = c.Id.ToString(),
            courseCode = c.CourseCode,
            title = c.Title,
            department = "Khoa Công nghệ Thông tin",
            teacherName = c.Teacher.FullName,
            studentsCount = c.Enrollments.Count,
            status = c.IsPublished ? "ACTIVE" : "ARCHIVED"
        });

        return Ok(result);
    }

    /// <summary>
    /// Tạo khóa học mới cho hệ thống
    /// </summary>
    [HttpPost("courses")]
    public async Task<IActionResult> CreateCourse([FromBody] CreateAdminCourseDto request)
    {
        // Gán cho giảng viên đầu tiên tìm thấy hoặc giảng viên mẫu
        var teacher = await _db.Users.FirstOrDefaultAsync(u => u.Role == UserRole.TEACHER)
            ?? await _db.Users.FirstOrDefaultAsync();

        if (teacher == null) return BadRequest("Chưa có giảng viên trong hệ thống để phân công khóa học.");

        var course = new Course
        {
            Id = Guid.NewGuid(),
            CourseCode = request.CourseCode.Trim(),
            Title = request.Title.Trim(),
            TeacherId = teacher.Id,
            Description = "Khóa học mở bởi Quản trị viên hệ thống",
            IsPublished = true,
            WeightAttendance = 10,
            WeightAssignments = 30,
            WeightFinalExam = 60,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var defaultSection = new CourseSection
        {
            Id = Guid.NewGuid(),
            CourseId = course.Id,
            Title = "Week 1: Bắt đầu học phần",
            OrderIndex = 1,
            IsExpanded = true,
            IsLocked = false
        };

        _db.Courses.Add(course);
        _db.CourseSections.Add(defaultSection);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = course.Id.ToString(),
            courseCode = course.CourseCode,
            title = course.Title,
            department = request.Department ?? "Khoa Công nghệ Thông tin",
            teacherName = teacher.FullName,
            studentsCount = 0,
            status = "ACTIVE"
        });
    }

    /// <summary>
    /// Lấy nhật ký hệ thống (Audit Logs) từ các thông báo và sự kiện gần đây
    /// </summary>
    [HttpGet("logs")]
    public async Task<IActionResult> GetAuditLogs()
    {
        var notifications = await _db.Notifications
            .Include(n => n.User)
            .OrderByDescending(n => n.CreatedAt)
            .Take(15)
            .ToListAsync();

        var result = notifications.Select(n => new
        {
            id = n.Id.ToString(),
            timestamp = n.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
            actor = n.User.Email,
            role = n.User.Role.ToString(),
            action = n.Title,
            details = n.Message,
            ipAddress = "127.0.0.1",
            severity = n.Type == "DEADLINE" ? "WARNING" : "INFO"
        });

        return Ok(result);
    }
}

public record CreateAdminUserDto(string FullName, string Email, string Role, string Code, string DepartmentOrClass);
public record CreateAdminCourseDto(string CourseCode, string Title, string? Department, string? TeacherName);
