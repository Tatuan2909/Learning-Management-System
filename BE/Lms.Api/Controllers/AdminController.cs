using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Lms.Infrastructure.Data;
using Lms.Domain.Entities;
using Lms.Domain.Enums;

using Lms.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Lms.Api.Controllers;

[Authorize(Roles = "ADMIN")]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly LmsDbContext _db;
    private readonly ISystemSettingsService _systemSettings;
    private readonly IPasswordHasher _passwordHasher;

    public AdminController(
        LmsDbContext db, 
        ISystemSettingsService systemSettings,
        IPasswordHasher passwordHasher)
    {
        _db = db;
        _systemSettings = systemSettings;
        _passwordHasher = passwordHasher;
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
        var totalDepartments = await _db.Departments.CountAsync();
        var totalMajors = await _db.Majors.CountAsync();

        return Ok(new
        {
            totalUsers,
            totalCourses,
            totalEnrollments,
            totalSubmissions,
            totalDepartments,
            totalMajors
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

        string defaultPassword;
        StudentProfile? studentProfile = null;
        TeacherProfile? teacherProfile = null;

        if (role == UserRole.STUDENT)
        {
            var studentCode = !string.IsNullOrWhiteSpace(request.Code) ? request.Code.Trim() : "SV" + new Random().Next(1000000, 9999999);
            defaultPassword = studentCode;
            studentProfile = new StudentProfile
            {
                StudentCode = studentCode,
                AdministrativeClass = !string.IsNullOrWhiteSpace(request.DepartmentOrClass) ? request.DepartmentOrClass.Trim() : "CNTT-K65",
                Major = "Công nghệ Thông tin",
                EnrollmentYear = DateTime.UtcNow.Year
            };
        }
        else if (role == UserRole.TEACHER)
        {
            var teacherCode = !string.IsNullOrWhiteSpace(request.Code) ? request.Code.Trim() : "GV" + new Random().Next(100, 999);
            defaultPassword = teacherCode;
            teacherProfile = new TeacherProfile
            {
                TeacherCode = teacherCode,
                Department = !string.IsNullOrWhiteSpace(request.DepartmentOrClass) ? request.DepartmentOrClass.Trim() : "Khoa Công nghệ Thông tin",
                AcademicTitle = "Tiến sĩ"
            };
        }
        else
        {
            defaultPassword = "admin";
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.Trim(),
            FullName = request.FullName.Trim(),
            PasswordHash = _passwordHasher.HashPassword(defaultPassword),
            Role = role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (studentProfile != null)
        {
            studentProfile.UserId = user.Id;
            user.StudentProfile = studentProfile;
        }

        if (teacherProfile != null)
        {
            teacherProfile.UserId = user.Id;
            user.TeacherProfile = teacherProfile;
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
    /// Cập nhật thông tin tài khoản người dùng
    /// </summary>
    [HttpPut("users/{userId}")]
    public async Task<IActionResult> UpdateUser(Guid userId, [FromBody] UpdateAdminUserDto request)
    {
        var user = await _db.Users
            .Include(u => u.StudentProfile)
            .Include(u => u.TeacherProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound(new { message = "Người dùng không tồn tại." });

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var cleanEmail = request.Email.Trim().ToLower();
            var duplicate = await _db.Users.AnyAsync(u => u.Id != userId && u.Email.ToLower() == cleanEmail);
            if (duplicate) return BadRequest(new { message = "Email đã được sử dụng bởi người dùng khác." });
            user.Email = cleanEmail;
        }

        if (!string.IsNullOrWhiteSpace(request.FullName))
        {
            user.FullName = request.FullName.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.Role) && Enum.TryParse<UserRole>(request.Role, true, out var newRole))
        {
            user.Role = newRole;
        }

        if (user.Role == UserRole.STUDENT)
        {
            if (user.StudentProfile == null)
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
            else
            {
                if (!string.IsNullOrWhiteSpace(request.Code)) user.StudentProfile.StudentCode = request.Code.Trim();
                if (!string.IsNullOrWhiteSpace(request.DepartmentOrClass)) user.StudentProfile.AdministrativeClass = request.DepartmentOrClass.Trim();
            }
        }
        else if (user.Role == UserRole.TEACHER)
        {
            if (user.TeacherProfile == null)
            {
                user.TeacherProfile = new TeacherProfile
                {
                    UserId = user.Id,
                    TeacherCode = !string.IsNullOrWhiteSpace(request.Code) ? request.Code.Trim() : "GV" + new Random().Next(100, 999),
                    Department = !string.IsNullOrWhiteSpace(request.DepartmentOrClass) ? request.DepartmentOrClass.Trim() : "Khoa Công nghệ Thông tin",
                    AcademicTitle = "Tiến sĩ"
                };
            }
            else
            {
                if (!string.IsNullOrWhiteSpace(request.Code)) user.TeacherProfile.TeacherCode = request.Code.Trim();
                if (!string.IsNullOrWhiteSpace(request.DepartmentOrClass)) user.TeacherProfile.Department = request.DepartmentOrClass.Trim();
            }
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = user.Id.ToString(),
            fullName = user.FullName,
            email = user.Email,
            role = user.Role.ToString(),
            code = user.StudentProfile?.StudentCode ?? user.TeacherProfile?.TeacherCode ?? "ADM001",
            departmentOrClass = user.StudentProfile?.AdministrativeClass ?? user.TeacherProfile?.Department ?? "Phòng Quản trị",
            status = user.IsActive ? "ACTIVE" : "LOCKED",
            message = "Cập nhật thông tin người dùng thành công!"
        });
    }

    /// <summary>
    /// Đặt lại mật khẩu cho tài khoản người dùng
    /// </summary>
    [HttpPost("users/{userId}/reset-password")]
    public async Task<IActionResult> ResetPassword(Guid userId, [FromBody] ResetPasswordAdminDto? request)
    {
        var user = await _db.Users
            .Include(u => u.StudentProfile)
            .Include(u => u.TeacherProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound(new { message = "Người dùng không tồn tại." });

        var defaultPassword = user.Role == UserRole.TEACHER
            ? (user.TeacherProfile?.TeacherCode ?? "GV001")
            : user.Role == UserRole.ADMIN
                ? "admin"
                : (user.StudentProfile?.StudentCode ?? "SV2024001");

        var newPassword = !string.IsNullOrWhiteSpace(request?.NewPassword)
            ? request.NewPassword.Trim()
            : defaultPassword;

        user.PasswordHash = _passwordHasher.HashPassword(newPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = user.Id.ToString(),
            newPassword = newPassword,
            message = $"Đã đặt lại mật khẩu cho tài khoản {user.Email} thành: {newPassword}"
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
    /// Cập nhật thông tin khóa học
    /// </summary>
    [HttpPut("courses/{courseId}")]
    public async Task<IActionResult> UpdateCourse(Guid courseId, [FromBody] UpdateAdminCourseDto request)
    {
        var course = await _db.Courses.FindAsync(courseId);
        if (course == null) return NotFound(new { message = "Khóa học không tồn tại." });

        if (!string.IsNullOrWhiteSpace(request.CourseCode)) course.CourseCode = request.CourseCode.Trim().ToUpperInvariant();
        if (!string.IsNullOrWhiteSpace(request.Title)) course.Title = request.Title.Trim();
        if (request.IsPublished.HasValue) course.IsPublished = request.IsPublished.Value;

        course.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = course.Id.ToString(),
            courseCode = course.CourseCode,
            title = course.Title,
            status = course.IsPublished ? "ACTIVE" : "ARCHIVED",
            message = "Cập nhật khóa học thành công!"
        });
    }

    /// <summary>
    /// Xóa hoặc lưu trữ khóa học
    /// </summary>
    [HttpDelete("courses/{courseId}")]
    public async Task<IActionResult> DeleteCourse(Guid courseId)
    {
        var course = await _db.Courses.FindAsync(courseId);
        if (course == null) return NotFound(new { message = "Khóa học không tồn tại." });

        var hasEnrollments = await _db.Enrollments.AnyAsync(e => e.CourseId == courseId);
        if (hasEnrollments)
        {
            course.IsPublished = false;
            await _db.SaveChangesAsync();
            return Ok(new { message = "Khóa học đã có sinh viên ghi danh nên được chuyển sang trạng thái lưu trữ (ARCHIVED)." });
        }

        _db.Courses.Remove(course);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Đã xóa khóa học thành công!" });
    }

    // ==========================================
    // QUẢN LÝ KHOA / ĐƠN VỊ (DEPARTMENTS)
    // ==========================================

    /// <summary>
    /// Danh sách tất cả các Khoa/Viện trong trường
    /// </summary>
    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartments()
    {
        var departments = await _db.Departments
            .Include(d => d.Majors)
            .OrderBy(d => d.Code)
            .ToListAsync();

        var teachers = await _db.TeacherProfiles.ToListAsync();
        var students = await _db.StudentProfiles.ToListAsync();

        var result = departments.Select(d => new
        {
            id = d.Id.ToString(),
            code = d.Code,
            name = d.Name,
            deanName = d.DeanName ?? "Chưa chỉ định",
            email = d.Email ?? "",
            phone = d.Phone ?? "",
            officeLocation = d.OfficeLocation ?? "",
            description = d.Description ?? "",
            majorsCount = d.Majors.Count,
            majors = d.Majors.Select(m => new { id = m.Id.ToString(), code = m.Code, name = m.Name }),
            teachersCount = teachers.Count(t => t.Department != null && (t.Department.Contains(d.Name) || t.Department.Contains(d.Code))),
            studentsCount = students.Count(s => d.Majors.Any(m => s.Major != null && (s.Major.Contains(m.Name) || s.Major.Contains(m.Code)))),
            createdAt = d.CreatedAt.ToString("yyyy-MM-dd")
        });

        return Ok(result);
    }

    /// <summary>
    /// Tạo Khoa mới
    /// </summary>
    [HttpPost("departments")]
    public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Code) || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Mã Khoa và Tên Khoa không được để trống." });
        }

        var cleanCode = request.Code.Trim().ToUpperInvariant();
        var exists = await _db.Departments.AnyAsync(d => d.Code == cleanCode);
        if (exists)
        {
            return BadRequest(new { message = $"Mã Khoa '{cleanCode}' đã tồn tại trong hệ thống." });
        }

        var dept = new Department
        {
            Id = Guid.NewGuid(),
            Code = cleanCode,
            Name = request.Name.Trim(),
            DeanName = request.DeanName?.Trim(),
            Email = request.Email?.Trim(),
            Phone = request.Phone?.Trim(),
            OfficeLocation = request.OfficeLocation?.Trim(),
            Description = request.Description?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.Departments.Add(dept);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = dept.Id.ToString(),
            code = dept.Code,
            name = dept.Name,
            deanName = dept.DeanName ?? "Chưa chỉ định",
            email = dept.Email ?? "",
            phone = dept.Phone ?? "",
            officeLocation = dept.OfficeLocation ?? "",
            description = dept.Description ?? "",
            majorsCount = 0,
            teachersCount = 0,
            studentsCount = 0,
            createdAt = dept.CreatedAt.ToString("yyyy-MM-dd"),
            message = "Tạo Khoa mới thành công!"
        });
    }

    /// <summary>
    /// Cập nhật thông tin Khoa
    /// </summary>
    [HttpPut("departments/{id}")]
    public async Task<IActionResult> UpdateDepartment(Guid id, [FromBody] UpdateDepartmentDto request)
    {
        var dept = await _db.Departments.Include(d => d.Majors).FirstOrDefaultAsync(d => d.Id == id);
        if (dept == null) return NotFound(new { message = "Khoa không tồn tại." });

        if (!string.IsNullOrWhiteSpace(request.Code))
        {
            var cleanCode = request.Code.Trim().ToUpperInvariant();
            if (cleanCode != dept.Code)
            {
                var duplicate = await _db.Departments.AnyAsync(d => d.Code == cleanCode && d.Id != id);
                if (duplicate) return BadRequest(new { message = $"Mã Khoa '{cleanCode}' đã được sử dụng." });
                dept.Code = cleanCode;
            }
        }

        if (!string.IsNullOrWhiteSpace(request.Name)) dept.Name = request.Name.Trim();
        if (request.DeanName != null) dept.DeanName = request.DeanName.Trim();
        if (request.Email != null) dept.Email = request.Email.Trim();
        if (request.Phone != null) dept.Phone = request.Phone.Trim();
        if (request.OfficeLocation != null) dept.OfficeLocation = request.OfficeLocation.Trim();
        if (request.Description != null) dept.Description = request.Description.Trim();

        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = dept.Id.ToString(),
            code = dept.Code,
            name = dept.Name,
            deanName = dept.DeanName ?? "Chưa chỉ định",
            email = dept.Email ?? "",
            phone = dept.Phone ?? "",
            officeLocation = dept.OfficeLocation ?? "",
            description = dept.Description ?? "",
            majorsCount = dept.Majors.Count,
            message = "Cập nhật Khoa thành công!"
        });
    }

    /// <summary>
    /// Xóa Khoa
    /// </summary>
    [HttpDelete("departments/{id}")]
    public async Task<IActionResult> DeleteDepartment(Guid id)
    {
        var dept = await _db.Departments.Include(d => d.Majors).FirstOrDefaultAsync(d => d.Id == id);
        if (dept == null) return NotFound(new { message = "Khoa không tồn tại." });

        if (dept.Majors.Any())
        {
            return BadRequest(new { message = $"Khoa '{dept.Name}' đang có {dept.Majors.Count} chuyên ngành trực thuộc. Vui lòng chuyển hoặc xóa các chuyên ngành trước." });
        }

        _db.Departments.Remove(dept);
        await _db.SaveChangesAsync();

        return Ok(new { message = $"Đã xóa Khoa {dept.Name} thành công!" });
    }

    // ==========================================
    // QUẢN LÝ CHUYÊN NGÀNH (MAJORS)
    // ==========================================

    /// <summary>
    /// Danh sách tất cả các Chuyên ngành đào tạo
    /// </summary>
    [HttpGet("majors")]
    public async Task<IActionResult> GetMajors([FromQuery] Guid? departmentId)
    {
        var query = _db.Majors.Include(m => m.Department).AsQueryable();
        if (departmentId.HasValue)
        {
            query = query.Where(m => m.DepartmentId == departmentId.Value);
        }

        var majors = await query.OrderBy(m => m.Code).ToListAsync();
        var students = await _db.StudentProfiles.ToListAsync();

        var result = majors.Select(m => new
        {
            id = m.Id.ToString(),
            departmentId = m.DepartmentId.ToString(),
            departmentCode = m.Department?.Code ?? "",
            departmentName = m.Department?.Name ?? "Chưa phân khoa",
            code = m.Code,
            name = m.Name,
            degreeLevel = m.DegreeLevel,
            totalCredits = m.TotalCredits,
            durationYears = m.DurationYears,
            description = m.Description ?? "",
            studentsCount = students.Count(s => s.Major != null && (s.Major.Contains(m.Name) || s.Major.Contains(m.Code))),
            createdAt = m.CreatedAt.ToString("yyyy-MM-dd")
        });

        return Ok(result);
    }

    /// <summary>
    /// Tạo Chuyên ngành mới
    /// </summary>
    [HttpPost("majors")]
    public async Task<IActionResult> CreateMajor([FromBody] CreateMajorDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Code) || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Mã ngành và Tên chuyên ngành không được để trống." });
        }

        var dept = await _db.Departments.FindAsync(request.DepartmentId);
        if (dept == null)
        {
            return BadRequest(new { message = "Khoa trực thuộc được chỉ định không tồn tại." });
        }

        var cleanCode = request.Code.Trim().ToUpperInvariant();
        var exists = await _db.Majors.AnyAsync(m => m.Code == cleanCode);
        if (exists)
        {
            return BadRequest(new { message = $"Mã ngành '{cleanCode}' đã tồn tại trong hệ thống." });
        }

        var major = new Major
        {
            Id = Guid.NewGuid(),
            DepartmentId = dept.Id,
            Code = cleanCode,
            Name = request.Name.Trim(),
            DegreeLevel = !string.IsNullOrWhiteSpace(request.DegreeLevel) ? request.DegreeLevel.Trim() : "Đại học Chính quy",
            TotalCredits = request.TotalCredits.GetValueOrDefault(135),
            DurationYears = request.DurationYears.GetValueOrDefault(4.0),
            Description = request.Description?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.Majors.Add(major);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = major.Id.ToString(),
            departmentId = dept.Id.ToString(),
            departmentCode = dept.Code,
            departmentName = dept.Name,
            code = major.Code,
            name = major.Name,
            degreeLevel = major.DegreeLevel,
            totalCredits = major.TotalCredits,
            durationYears = major.DurationYears,
            description = major.Description ?? "",
            studentsCount = 0,
            createdAt = major.CreatedAt.ToString("yyyy-MM-dd"),
            message = "Tạo Chuyên ngành mới thành công!"
        });
    }

    /// <summary>
    /// Cập nhật thông tin Chuyên ngành
    /// </summary>
    [HttpPut("majors/{id}")]
    public async Task<IActionResult> UpdateMajor(Guid id, [FromBody] UpdateMajorDto request)
    {
        var major = await _db.Majors.Include(m => m.Department).FirstOrDefaultAsync(m => m.Id == id);
        if (major == null) return NotFound(new { message = "Chuyên ngành không tồn tại." });

        if (request.DepartmentId.HasValue && request.DepartmentId.Value != major.DepartmentId)
        {
            var dept = await _db.Departments.FindAsync(request.DepartmentId.Value);
            if (dept == null) return BadRequest(new { message = "Khoa trực thuộc mới không tồn tại." });
            major.DepartmentId = dept.Id;
        }

        if (!string.IsNullOrWhiteSpace(request.Code))
        {
            var cleanCode = request.Code.Trim().ToUpperInvariant();
            if (cleanCode != major.Code)
            {
                var duplicate = await _db.Majors.AnyAsync(m => m.Code == cleanCode && m.Id != id);
                if (duplicate) return BadRequest(new { message = $"Mã ngành '{cleanCode}' đã được sử dụng." });
                major.Code = cleanCode;
            }
        }

        if (!string.IsNullOrWhiteSpace(request.Name)) major.Name = request.Name.Trim();
        if (!string.IsNullOrWhiteSpace(request.DegreeLevel)) major.DegreeLevel = request.DegreeLevel.Trim();
        if (request.TotalCredits.HasValue) major.TotalCredits = request.TotalCredits.Value;
        if (request.DurationYears.HasValue) major.DurationYears = request.DurationYears.Value;
        if (request.Description != null) major.Description = request.Description.Trim();

        await _db.SaveChangesAsync();

        var updatedDept = await _db.Departments.FindAsync(major.DepartmentId);

        return Ok(new
        {
            id = major.Id.ToString(),
            departmentId = major.DepartmentId.ToString(),
            departmentCode = updatedDept?.Code ?? "",
            departmentName = updatedDept?.Name ?? "",
            code = major.Code,
            name = major.Name,
            degreeLevel = major.DegreeLevel,
            totalCredits = major.TotalCredits,
            durationYears = major.DurationYears,
            description = major.Description ?? "",
            message = "Cập nhật Chuyên ngành thành công!"
        });
    }

    /// <summary>
    /// Xóa Chuyên ngành
    /// </summary>
    [HttpDelete("majors/{id}")]
    public async Task<IActionResult> DeleteMajor(Guid id)
    {
        var major = await _db.Majors.FindAsync(id);
        if (major == null) return NotFound(new { message = "Chuyên ngành không tồn tại." });

        var hasStudents = await _db.StudentProfiles.AnyAsync(s => s.Major != null && (s.Major.Contains(major.Name) || s.Major.Contains(major.Code)));
        if (hasStudents)
        {
            return BadRequest(new { message = $"Chuyên ngành '{major.Name}' hiện đang có sinh viên theo học nên không thể xóa trực tiếp." });
        }

        _db.Majors.Remove(major);
        await _db.SaveChangesAsync();

        return Ok(new { message = $"Đã xóa Chuyên ngành '{major.Name}' thành công!" });
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

    /// <summary>
    /// Lấy trạng thái chế độ bảo trì hệ thống
    /// </summary>
    [HttpGet("maintenance")]
    public IActionResult GetMaintenanceStatus()
    {
        return Ok(new
        {
            isMaintenance = _systemSettings.IsMaintenanceMode,
            message = _systemSettings.MaintenanceMessage
        });
    }

    /// <summary>
    /// Bật/Tắt chế độ bảo trì hệ thống
    /// </summary>
    [HttpPost("maintenance")]
    public IActionResult ToggleMaintenance([FromBody] UpdateMaintenanceDto request)
    {
        _systemSettings.IsMaintenanceMode = request.IsMaintenance;
        if (!string.IsNullOrWhiteSpace(request.Message))
        {
            _systemSettings.MaintenanceMessage = request.Message.Trim();
        }

        return Ok(new
        {
            isMaintenance = _systemSettings.IsMaintenanceMode,
            message = _systemSettings.MaintenanceMessage
        });
    }
}

public record CreateAdminUserDto(string FullName, string Email, string Role, string Code, string DepartmentOrClass);
public record UpdateAdminUserDto(string? FullName, string? Email, string? Role, string? Code, string? DepartmentOrClass);
public record ResetPasswordAdminDto(string? NewPassword);
public record CreateAdminCourseDto(string CourseCode, string Title, string? Department, string? TeacherName);
public record UpdateAdminCourseDto(string? CourseCode, string? Title, string? Department, string? TeacherName, bool? IsPublished);
public record CreateDepartmentDto(string Code, string Name, string? DeanName, string? Email, string? Phone, string? OfficeLocation, string? Description);
public record UpdateDepartmentDto(string? Code, string? Name, string? DeanName, string? Email, string? Phone, string? OfficeLocation, string? Description);
public record CreateMajorDto(Guid DepartmentId, string Code, string Name, string? DegreeLevel, int? TotalCredits, double? DurationYears, string? Description);
public record UpdateMajorDto(Guid? DepartmentId, string? Code, string? Name, string? DegreeLevel, int? TotalCredits, double? DurationYears, string? Description);
public record UpdateMaintenanceDto(bool IsMaintenance, string? Message = null);

