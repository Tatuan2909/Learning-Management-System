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
public class TeacherController : ControllerBase
{
    private readonly LmsDbContext _db;

    public TeacherController(LmsDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Lấy danh sách khóa học mà giảng viên đang phụ trách
    /// </summary>
    [HttpGet("courses")]
    public async Task<IActionResult> GetTeacherCourses([FromQuery] Guid? teacherId)
    {
        var targetTeacherId = teacherId ?? Guid.Parse("22222222-2222-2222-2222-222222222222");

        var courses = await _db.Courses
            .Include(c => c.Enrollments)
            .Include(c => c.Lessons)
            .Where(c => c.TeacherId == targetTeacherId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var result = courses.Select(c => new
        {
            id = c.Id.ToString(),
            courseCode = c.CourseCode,
            title = c.Title,
            department = "Khoa Công nghệ Thông tin",
            enrolledStudents = c.Enrollments.Count,
            lessonsCount = c.Lessons.Count,
            weightAttendance = c.WeightAttendance,
            weightAssignments = c.WeightAssignments,
            weightFinalExam = c.WeightFinalExam
        });

        return Ok(result);
    }

    /// <summary>
    /// Tạo mới một khóa học do giảng viên phụ trách
    /// </summary>
    [HttpPost("courses")]
    public async Task<IActionResult> CreateCourse([FromBody] CreateTeacherCourseDto request, [FromQuery] Guid? teacherId)
    {
        var targetTeacherId = teacherId ?? Guid.Parse("22222222-2222-2222-2222-222222222222");

        var course = new Course
        {
            Id = Guid.NewGuid(),
            CourseCode = request.CourseCode.Trim(),
            Title = request.Title.Trim(),
            TeacherId = targetTeacherId,
            Description = request.Description ?? "Học phần LMS trực tuyến",
            IsPublished = true,
            WeightAttendance = request.WeightAttendance > 0 ? request.WeightAttendance : 10,
            WeightAssignments = request.WeightAssignments > 0 ? request.WeightAssignments : 30,
            WeightFinalExam = request.WeightFinalExam > 0 ? request.WeightFinalExam : 60,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Tạo sẵn section tuần 1 mặc định
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
            department = "Khoa Công nghệ Thông tin",
            enrolledStudents = 0,
            lessonsCount = 0,
            weightAttendance = course.WeightAttendance,
            weightAssignments = course.WeightAssignments,
            weightFinalExam = course.WeightFinalExam
        });
    }

    /// <summary>
    /// Lấy danh sách bài học / hoạt động của khóa học
    /// </summary>
    [HttpGet("courses/{courseId}/lessons")]
    public async Task<IActionResult> GetCourseLessons(Guid courseId)
    {
        var lessons = await _db.Lessons
            .Include(l => l.Section)
            .Where(l => l.CourseId == courseId)
            .OrderBy(l => l.Section != null ? l.Section.OrderIndex : 1)
            .ThenBy(l => l.OrderIndex)
            .ToListAsync();

        var result = lessons.Select(l => new
        {
            id = l.Id.ToString(),
            courseId = l.CourseId.ToString(),
            weekNumber = l.Section?.OrderIndex ?? 1,
            activityType = l.ContentType.ToString(),
            lessonNumber = l.OrderIndex,
            title = l.Title,
            durationMinutes = 45,
            isUnlocked = !l.IsLocked,
            description = l.BodyMarkdown,
            resourceUrl = l.ContentUrl
        });

        return Ok(result);
    }

    /// <summary>
    /// Giảng viên thêm bài học / hoạt động mới vào khóa học
    /// </summary>
    [HttpPost("courses/{courseId}/lessons")]
    public async Task<IActionResult> AddLesson(Guid courseId, [FromBody] CreateTeacherLessonDto request)
    {
        var course = await _db.Courses.FindAsync(courseId);
        if (course == null) return NotFound("Khóa học không tồn tại.");

        // Tìm hoặc tạo section cho tuần này
        var section = await _db.CourseSections
            .FirstOrDefaultAsync(s => s.CourseId == courseId && s.OrderIndex == request.WeekNumber);

        if (section == null)
        {
            section = new CourseSection
            {
                Id = Guid.NewGuid(),
                CourseId = courseId,
                Title = $"Week {request.WeekNumber}: Kế hoạch học tập tuần {request.WeekNumber}",
                OrderIndex = request.WeekNumber,
                IsExpanded = true,
                IsLocked = false
            };
            _db.CourseSections.Add(section);
            await _db.SaveChangesAsync();
        }

        if (!Enum.TryParse<LessonContentType>(request.ActivityType, true, out var contentType))
        {
            contentType = LessonContentType.VIDEO;
        }

        var maxOrder = await _db.Lessons
            .Where(l => l.CourseId == courseId && l.SectionId == section.Id)
            .Select(l => (int?)l.OrderIndex)
            .MaxAsync() ?? 0;

        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            SectionId = section.Id,
            Title = request.Title,
            OrderIndex = maxOrder + 1,
            ContentType = contentType,
            ContentUrl = request.ResourceUrl,
            BodyMarkdown = request.Description,
            IsLocked = false,
            CreatedAt = DateTime.UtcNow
        };

        _db.Lessons.Add(lesson);

        // Nếu là kiểu PRACTICE, tạo luôn Assignment liên kết
        if (contentType == LessonContentType.PRACTICE)
        {
            var assignment = new Assignment
            {
                Id = Guid.NewGuid(),
                CourseId = courseId,
                LessonId = lesson.Id,
                Title = request.Title,
                Instructions = request.Description ?? "Vui lòng hoàn thành yêu cầu thực hành và nộp bài đúng hạn.",
                DueDate = DateTime.UtcNow.AddDays(7),
                MaxScore = 10.00m,
                AllowGitRepo = true
            };
            _db.Assignments.Add(assignment);
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = lesson.Id.ToString(),
            courseId = lesson.CourseId.ToString(),
            weekNumber = request.WeekNumber,
            activityType = lesson.ContentType.ToString(),
            lessonNumber = lesson.OrderIndex,
            title = lesson.Title,
            durationMinutes = request.DurationMinutes > 0 ? request.DurationMinutes : 45,
            isUnlocked = !lesson.IsLocked,
            description = lesson.BodyMarkdown,
            resourceUrl = lesson.ContentUrl
        });
    }

    /// <summary>
    /// Khóa / Mở khóa một bài học
    /// </summary>
    [HttpPost("lessons/{lessonId}/toggle-lock")]
    public async Task<IActionResult> ToggleLessonLock(Guid lessonId)
    {
        var lesson = await _db.Lessons.FindAsync(lessonId);
        if (lesson == null) return NotFound("Không tìm thấy bài học.");

        lesson.IsLocked = !lesson.IsLocked;
        await _db.SaveChangesAsync();

        return Ok(new { lessonId = lesson.Id, isLocked = lesson.IsLocked });
    }

    /// <summary>
    /// Xóa một bài học
    /// </summary>
    [HttpDelete("lessons/{lessonId}")]
    public async Task<IActionResult> DeleteLesson(Guid lessonId)
    {
        var lesson = await _db.Lessons.FindAsync(lessonId);
        if (lesson == null) return NotFound("Không tìm thấy bài học.");

        _db.Lessons.Remove(lesson);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa bài học thành công." });
    }

    /// <summary>
    /// Lấy danh sách sinh viên ghi danh trong khóa học
    /// </summary>
    [HttpGet("courses/{courseId}/students")]
    public async Task<IActionResult> GetCourseStudents(Guid courseId)
    {
        var enrollments = await _db.Enrollments
            .Include(e => e.Student)
                .ThenInclude(s => s.StudentProfile)
            .Where(e => e.CourseId == courseId)
            .OrderBy(e => e.Student.FullName)
            .ToListAsync();

        var result = enrollments.Select(e => new
        {
            id = e.StudentId.ToString(),
            courseId = e.CourseId.ToString(),
            studentCode = e.Student.StudentProfile?.StudentCode ?? "SV2024" + e.StudentId.ToString().Substring(0, 4),
            fullName = e.Student.FullName,
            email = e.Student.Email,
            className = e.Student.StudentProfile?.AdministrativeClass ?? "CNTT-K65",
            enrolledAt = e.EnrolledAt.ToString("yyyy-MM-dd"),
            progressPercentage = (double)e.ProgressPercentage,
            status = e.Status
        });

        return Ok(result);
    }

    /// <summary>
    /// Giảng viên thêm sinh viên vào khóa học
    /// </summary>
    [HttpPost("courses/{courseId}/students")]
    public async Task<IActionResult> AddStudentToCourse(Guid courseId, [FromBody] AddStudentToCourseDto request)
    {
        var course = await _db.Courses.FindAsync(courseId);
        if (course == null) return NotFound("Khóa học không tồn tại.");

        // Tìm user theo email hoặc tạo mới nếu chưa có
        var student = await _db.Users
            .Include(u => u.StudentProfile)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());

        if (student == null)
        {
            student = new User
            {
                Id = Guid.NewGuid(),
                FullName = request.FullName.Trim(),
                Email = request.Email.Trim(),
                PasswordHash = "student123",
                Role = UserRole.STUDENT,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var studentProfile = new StudentProfile
            {
                UserId = student.Id,
                StudentCode = !string.IsNullOrWhiteSpace(request.StudentCode) ? request.StudentCode.Trim() : "SV" + new Random().Next(1000000, 9999999),
                AdministrativeClass = !string.IsNullOrWhiteSpace(request.ClassName) ? request.ClassName.Trim() : "CNTT-K65",
                Major = "Công nghệ Thông tin",
                EnrollmentYear = DateTime.UtcNow.Year
            };

            student.StudentProfile = studentProfile;
            _db.Users.Add(student);
        }

        var isAlreadyEnrolled = await _db.Enrollments
            .AnyAsync(e => e.CourseId == courseId && e.StudentId == student.Id);

        if (isAlreadyEnrolled)
        {
            return BadRequest("Sinh viên này đã ghi danh vào khóa học rồi.");
        }

        var enrollment = new Enrollment
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            StudentId = student.Id,
            EnrolledAt = DateTime.UtcNow,
            ProgressPercentage = 0,
            Status = "ACTIVE"
        };

        _db.Enrollments.Add(enrollment);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = student.Id.ToString(),
            courseId = courseId.ToString(),
            studentCode = student.StudentProfile?.StudentCode ?? request.StudentCode,
            fullName = student.FullName,
            email = student.Email,
            className = student.StudentProfile?.AdministrativeClass ?? request.ClassName,
            enrolledAt = enrollment.EnrolledAt.ToString("yyyy-MM-dd"),
            progressPercentage = 0,
            status = "ACTIVE"
        });
    }

    /// <summary>
    /// Thay đổi trạng thái học tập của sinh viên trong lớp (ACTIVE / SUSPENDED)
    /// </summary>
    [HttpPost("courses/{courseId}/students/{studentId}/toggle-status")]
    public async Task<IActionResult> ToggleStudentStatus(Guid courseId, Guid studentId)
    {
        var enrollment = await _db.Enrollments
            .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentId == studentId);

        if (enrollment == null) return NotFound("Không tìm thấy ghi danh của sinh viên này.");

        enrollment.Status = enrollment.Status == "ACTIVE" ? "SUSPENDED" : "ACTIVE";
        await _db.SaveChangesAsync();

        return Ok(new { status = enrollment.Status });
    }

    /// <summary>
    /// Lấy danh sách bài nộp thực hành của sinh viên trong khóa học
    /// </summary>
    [HttpGet("courses/{courseId}/submissions")]
    public async Task<IActionResult> GetCourseSubmissions(Guid courseId)
    {
        var submissions = await _db.Submissions
            .Include(s => s.Assignment)
                .ThenInclude(a => a.Course)
            .Include(s => s.Student)
                .ThenInclude(st => st.StudentProfile)
            .Where(s => s.Assignment.CourseId == courseId)
            .OrderByDescending(s => s.SubmittedAt)
            .ToListAsync();

        var result = submissions.Select(s => new
        {
            id = s.Id.ToString(),
            courseId = s.Assignment.CourseId.ToString(),
            courseCode = s.Assignment.Course.CourseCode,
            assignmentTitle = s.Assignment.Title,
            studentName = s.Student.FullName,
            studentCode = s.Student.StudentProfile?.StudentCode ?? "SV2024",
            submittedAt = s.SubmittedAt.ToString("yyyy-MM-dd HH:mm"),
            fileUrl = s.FileUrl ?? s.GitRepoUrl ?? "",
            submissionText = s.SubmissionText ?? "",
            grade = s.Grade.HasValue ? (double?)s.Grade.Value : null,
            feedback = s.Feedback,
            status = s.Status.ToString()
        });

        return Ok(result);
    }

    /// <summary>
    /// Giảng viên chấm điểm và nhập nhận xét cho bài nộp của sinh viên
    /// </summary>
    [HttpPost("submissions/{submissionId}/grade")]
    public async Task<IActionResult> GradeSubmission(Guid submissionId, [FromBody] GradeSubmissionRequestDto request, [FromQuery] Guid? teacherId)
    {
        var submission = await _db.Submissions.FindAsync(submissionId);
        if (submission == null) return NotFound("Không tìm thấy bài nộp.");

        submission.Grade = request.Grade;
        submission.Feedback = request.Feedback;
        submission.Status = SubmissionStatus.GRADED;
        submission.GradedBy = teacherId ?? Guid.Parse("22222222-2222-2222-2222-222222222222");
        submission.GradedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = submission.Id.ToString(),
            grade = submission.Grade,
            feedback = submission.Feedback,
            status = submission.Status.ToString(),
            message = "Chấm điểm bài nộp thành công!"
        });
    }

    /// <summary>
    /// Bảng điểm tổng kết học phần của các sinh viên
    /// </summary>
    [HttpGet("courses/{courseId}/gradebook")]
    public async Task<IActionResult> GetCourseGradebook(Guid courseId)
    {
        var enrollments = await _db.Enrollments
            .Include(e => e.Student)
                .ThenInclude(s => s.StudentProfile)
            .Include(e => e.FinalGrade)
            .Where(e => e.CourseId == courseId)
            .OrderBy(e => e.Student.FullName)
            .ToListAsync();

        var result = enrollments.Select(e =>
        {
            var fg = e.FinalGrade;
            decimal att = fg?.AttendanceScore ?? 9.5m;
            decimal ass = fg?.AssignmentsScore ?? 8.5m;
            decimal exam = fg?.FinalExamScore ?? 8.0m;
            decimal total = fg?.TotalScore ?? (att * 0.1m + ass * 0.3m + exam * 0.6m);

            string letter = fg?.LetterGrade ?? (total >= 8.5m ? "A" : total >= 7.0m ? "B" : total >= 5.5m ? "C" : total >= 4.0m ? "D" : "F");

            return new
            {
                studentId = e.StudentId.ToString(),
                courseId = e.CourseId.ToString(),
                studentCode = e.Student.StudentProfile?.StudentCode ?? "SV2024",
                fullName = e.Student.FullName,
                className = e.Student.StudentProfile?.AdministrativeClass ?? "CNTT-K65",
                attendanceScore = (double)att,
                assignmentScore = (double)ass,
                examScore = (double)exam,
                totalScore = (double)Math.Round(total, 2),
                letterGrade = letter,
                progressPercentage = (double)e.ProgressPercentage
            };
        });

        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách thông báo của khóa học
    /// </summary>
    [HttpGet("courses/{courseId}/announcements")]
    public async Task<IActionResult> GetAnnouncements(Guid courseId)
    {
        var announcements = await _db.Announcements
            .Include(a => a.Course)
            .Where(a => a.CourseId == courseId)
            .OrderByDescending(a => a.IsPinned)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync();

        var result = announcements.Select(a => new
        {
            id = a.Id.ToString(),
            courseId = a.CourseId.ToString(),
            courseCode = a.Course.CourseCode,
            title = a.Title,
            content = a.Content,
            isPinned = a.IsPinned,
            createdAt = a.CreatedAt.ToString("yyyy-MM-dd HH:mm")
        });

        return Ok(result);
    }

    /// <summary>
    /// Giảng viên đăng thông báo mới trong khóa học
    /// </summary>
    [HttpPost("courses/{courseId}/announcements")]
    public async Task<IActionResult> CreateAnnouncement(Guid courseId, [FromBody] CreateAnnouncementDto request, [FromQuery] Guid? teacherId)
    {
        var targetTeacherId = teacherId ?? Guid.Parse("22222222-2222-2222-2222-222222222222");
        var course = await _db.Courses.FindAsync(courseId);
        if (course == null) return NotFound("Khóa học không tồn tại.");

        var announcement = new Announcement
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            TeacherId = targetTeacherId,
            Title = request.Title,
            Content = request.Content,
            IsPinned = request.IsPinned,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Announcements.Add(announcement);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = announcement.Id.ToString(),
            courseId = announcement.CourseId.ToString(),
            courseCode = course.CourseCode,
            title = announcement.Title,
            content = announcement.Content,
            isPinned = announcement.IsPinned,
            createdAt = announcement.CreatedAt.ToString("yyyy-MM-dd HH:mm")
        });
    }

    /// <summary>
    /// Lấy tổng quan số liệu giảng dạy của giảng viên
    /// </summary>
    [HttpGet("overview")]
    public async Task<IActionResult> GetTeacherOverview([FromQuery] Guid? teacherId)
    {
        var targetTeacherId = teacherId ?? Guid.Parse("22222222-2222-2222-2222-222222222222");

        var courses = await _db.Courses
            .Include(c => c.Enrollments)
            .Include(c => c.Assignments)
                .ThenInclude(a => a.Submissions)
            .Where(c => c.TeacherId == targetTeacherId)
            .ToListAsync();

        int totalCourses = courses.Count;
        int totalStudents = courses.Sum(c => c.Enrollments.Count);
        int pendingSubmissions = courses.Sum(c => c.Assignments.Sum(a => a.Submissions.Count(s => s.Status == SubmissionStatus.SUBMITTED)));

        return Ok(new
        {
            totalCourses,
            totalStudents,
            pendingSubmissions
        });
    }
}

public record CreateTeacherCourseDto(string CourseCode, string Title, string? Description, decimal WeightAttendance = 10, decimal WeightAssignments = 30, decimal WeightFinalExam = 60);
public record CreateTeacherLessonDto(int WeekNumber, string ActivityType, string Title, int DurationMinutes = 45, string? ResourceUrl = null, string? Description = null, string? Password = null);
public record AddStudentToCourseDto(string StudentCode, string FullName, string Email, string ClassName);
public record GradeSubmissionRequestDto(decimal Grade, string? Feedback);
public record CreateAnnouncementDto(string Title, string Content, bool IsPinned = false);
