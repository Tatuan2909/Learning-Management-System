using System;
using System.Linq;
using Lms.Domain.Entities;
using Lms.Domain.Enums;

namespace Lms.Infrastructure.Data;

public static class DbInitializer
{
    public static void Seed(LmsDbContext db)
    {
        db.Database.EnsureCreated();

        if (db.Users.Any()) return; // Database already seeded

        // Passwords & Users
        var admin = new User
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Email = "admin@lms.edu.vn",
            PasswordHash = "admin123",
            FullName = "Hệ thống Quản trị viên",
            Role = UserRole.ADMIN
        };

        var teacher = new User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Email = "teacher@lms.edu.vn",
            PasswordHash = "teacher123",
            FullName = "TS. Nguyễn Văn A",
            Role = UserRole.TEACHER,
            TeacherProfile = new TeacherProfile
            {
                TeacherCode = "GV001",
                Department = "Khoa Công nghệ Thông tin",
                AcademicTitle = "Phó Giáo Sư"
            }
        };

        var student = new User
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Email = "student@lms.edu.vn",
            PasswordHash = "student123",
            FullName = "Trần Thị B",
            Role = UserRole.STUDENT,
            StudentProfile = new StudentProfile
            {
                StudentCode = "SV2024001",
                AdministrativeClass = "CNTT-K65",
                EnrollmentYear = 2024
            }
        };

        db.Users.AddRange(admin, teacher, student);

        // Course
        var course = new Course
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            CourseCode = "INT3306",
            Title = "Lập trình Web C# .NET 8 & ReactJS",
            Description = "Khóa học kiến trúc Fullstack Client-Server hiện đại.",
            TeacherId = teacher.Id,
            IsPublished = true,
            WeightAttendance = 10.00m,
            WeightAssignments = 30.00m,
            WeightFinalExam = 60.00m
        };
        db.Courses.Add(course);

        // Enrollment
        var enrollment = new Enrollment
        {
            Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            CourseId = course.Id,
            StudentId = student.Id,
            ProgressPercentage = 0.00m,
            IsCompleted = false
        };
        db.Enrollments.Add(enrollment);

        // Lesson 1 & Quiz
        var lesson1 = new Lesson
        {
            Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
            CourseId = course.Id,
            Title = "Bài 1: Giới thiệu Clean Architecture & RESTful API",
            OrderIndex = 1,
            ContentType = LessonContentType.VIDEO,
            ContentUrl = "https://www.youtube.com/embed/d95475151"
        };

        var quiz1 = new Quiz
        {
            Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
            LessonId = lesson1.Id,
            Title = "Bài kiểm tra trắc nghiệm Bài 1",
            PassingScore = 7.00m,
            MaxScore = 10.00m,
            TimeLimitMinutes = 10
        };

        var q1 = new QuizQuestion
        {
            Id = Guid.Parse("77777777-7777-7777-7777-777777777777"),
            QuizId = quiz1.Id,
            QuestionText = "Thành phần nào thuộc tầng Domain trong Clean Architecture?",
            QuestionType = QuestionType.SINGLE_CHOICE,
            Points = 5.00m,
            OrderIndex = 1
        };

        var q1Opt1 = new QuizOption { Id = Guid.NewGuid(), QuestionId = q1.Id, OptionText = "Entities và Enums", IsCorrect = true };
        var q1Opt2 = new QuizOption { Id = Guid.NewGuid(), QuestionId = q1.Id, OptionText = "DbContext và Migrations", IsCorrect = false };
        var q1Opt3 = new QuizOption { Id = Guid.NewGuid(), QuestionId = q1.Id, OptionText = "Controllers và Swagger", IsCorrect = false };

        var q2 = new QuizQuestion
        {
            Id = Guid.Parse("88888888-8888-8888-8888-888888888888"),
            QuizId = quiz1.Id,
            QuestionText = "HTTP Method nào dùng cho việc tạo mới dữ liệu?",
            QuestionType = QuestionType.SINGLE_CHOICE,
            Points = 5.00m,
            OrderIndex = 2
        };

        var q2Opt1 = new QuizOption { Id = Guid.NewGuid(), QuestionId = q2.Id, OptionText = "POST", IsCorrect = true };
        var q2Opt2 = new QuizOption { Id = Guid.NewGuid(), QuestionId = q2.Id, OptionText = "GET", IsCorrect = false };
        var q2Opt3 = new QuizOption { Id = Guid.NewGuid(), QuestionId = q2.Id, OptionText = "DELETE", IsCorrect = false };

        q1.Options.Add(q1Opt1);
        q1.Options.Add(q1Opt2);
        q1.Options.Add(q1Opt3);
        q2.Options.Add(q2Opt1);
        q2.Options.Add(q2Opt2);
        q2.Options.Add(q2Opt3);

        quiz1.Questions.Add(q1);
        quiz1.Questions.Add(q2);
        lesson1.Quiz = quiz1;

        db.Lessons.Add(lesson1);

        // Lesson 2
        var lesson2 = new Lesson
        {
            Id = Guid.Parse("99999999-9999-9999-9999-999999999999"),
            CourseId = course.Id,
            Title = "Bài 2: Tích hợp JWT Auth & Role Authorization",
            OrderIndex = 2,
            ContentType = LessonContentType.PDF,
            ContentUrl = "https://example.com/slides/jwt-guide.pdf"
        };
        db.Lessons.Add(lesson2);

        // Assignments (1 urgent < 24h, 1 warning 1-3d, 1 normal >3d)
        var now = DateTime.UtcNow;

        var assignUrgent = new Assignment
        {
            Id = Guid.NewGuid(),
            CourseId = course.Id,
            Title = "Bài tập 1: Lập trình API Đăng nhập JWT (Gấp)",
            Instructions = "Cấu trúc endpoint AuthController và đính kèm Bearer Token.",
            DueDate = now.AddHours(12),
            MaxScore = 10.00m
        };

        var assignWarning = new Assignment
        {
            Id = Guid.NewGuid(),
            CourseId = course.Id,
            Title = "Bài tập 2: Thiết kế Database Schema EF Core",
            Instructions = "Viết các Entity class và cấu hình DbContext Fluent API.",
            DueDate = now.AddDays(2),
            MaxScore = 10.00m
        };

        var assignNormal = new Assignment
        {
            Id = Guid.NewGuid(),
            CourseId = course.Id,
            Title = "Bài tập 3: Xây dựng UI Widget Deadlines với React & Tailwind",
            Instructions = "Xây dựng giao diện hiển thị danh sách hạn nộp sắp tới.",
            DueDate = now.AddDays(5),
            MaxScore = 10.00m
        };

        db.Assignments.AddRange(assignUrgent, assignWarning, assignNormal);

        // Announcement
        var ann1 = new Announcement
        {
            CourseId = course.Id,
            TeacherId = teacher.Id,
            Title = "📌 THÔNG BÁO: Lịch nộp Bài tập lớn học kỳ I",
            Content = "Các em sinh viên chú ý hoàn thành các bài tập đúng hạn để tính điểm chuyên cần.",
            IsPinned = true,
            CreatedAt = now.AddHours(-5)
        };
        db.Announcements.Add(ann1);

        db.SaveChanges();
    }
}
