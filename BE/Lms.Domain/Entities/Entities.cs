using System;
using System.Collections.Generic;
using Lms.Domain.Enums;

namespace Lms.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; } = UserRole.STUDENT;
    public bool IsActive { get; set; } = true;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public StudentProfile? StudentProfile { get; set; }
    public TeacherProfile? TeacherProfile { get; set; }
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();
    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}

public class StudentProfile
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string StudentCode { get; set; } = string.Empty; // MSSV
    public string? AdministrativeClass { get; set; } // Lớp sinh hoạt (vd: K65-CNTT)
    public int? EnrollmentYear { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class TeacherProfile
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string TeacherCode { get; set; } = string.Empty; // Mã cán bộ giảng viên
    public string? Department { get; set; } // Khoa/Bộ môn
    public string? AcademicTitle { get; set; } // ThS, TS, PGS, GS
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Course
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CourseCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ThumbnailUrl { get; set; }
    public Guid TeacherId { get; set; }
    public User Teacher { get; set; } = null!;
    public bool IsPublished { get; set; } = false;
    public decimal WeightAttendance { get; set; } = 10.00m;
    public decimal WeightAssignments { get; set; } = 30.00m;
    public decimal WeightFinalExam { get; set; } = 60.00m;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    public ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();
}

public class Enrollment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public decimal ProgressPercentage { get; set; } = 0.00m;
    public bool IsCompleted { get; set; } = false;
    public DateTime? CompletedAt { get; set; }

    public ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();
    public FinalGrade? FinalGrade { get; set; }
}

public class Lesson
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; } = 1;
    public LessonContentType ContentType { get; set; } = LessonContentType.VIDEO;
    public string? ContentUrl { get; set; }
    public string? BodyMarkdown { get; set; }
    public bool IsLocked { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Quiz? Quiz { get; set; }
    public ICollection<LessonProgress> Progresses { get; set; } = new List<LessonProgress>();
}

public class LessonProgress
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EnrollmentId { get; set; }
    public Enrollment Enrollment { get; set; } = null!;
    public Guid LessonId { get; set; }
    public Lesson Lesson { get; set; } = null!;
    public bool IsCompleted { get; set; } = false;
    public bool QuizPassed { get; set; } = false;
    public DateTime? CompletedAt { get; set; }
}

public class Quiz
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LessonId { get; set; }
    public Lesson Lesson { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public decimal PassingScore { get; set; } = 7.00m;
    public decimal MaxScore { get; set; } = 10.00m;
    public int? TimeLimitMinutes { get; set; }
    public int? MaxAttempts { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<QuizQuestion> Questions { get; set; } = new List<QuizQuestion>();
    public ICollection<QuizAttempt> Attempts { get; set; } = new List<QuizAttempt>();
}

public class QuizQuestion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;
    public string QuestionText { get; set; } = string.Empty;
    public QuestionType QuestionType { get; set; } = QuestionType.SINGLE_CHOICE;
    public decimal Points { get; set; } = 1.00m;
    public int OrderIndex { get; set; } = 1;

    public ICollection<QuizOption> Options { get; set; } = new List<QuizOption>();
}

public class QuizOption
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid QuestionId { get; set; }
    public QuizQuestion Question { get; set; } = null!;
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; } = false;
    public string? Explanation { get; set; }
}

public class QuizAttempt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;
    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;
    public int AttemptNumber { get; set; } = 1;
    public decimal ScoreAchieved { get; set; } = 0.00m;
    public bool IsPassed { get; set; } = false;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAt { get; set; }
}

public class Assignment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
    public DateTime DueDate { get; set; }
    public decimal MaxScore { get; set; } = 10.00m;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}

public class Submission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AssignmentId { get; set; }
    public Assignment Assignment { get; set; } = null!;
    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;
    public string? SubmissionText { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public SubmissionStatus Status { get; set; } = SubmissionStatus.SUBMITTED;
    public decimal? Grade { get; set; }
    public string? Feedback { get; set; }
    public Guid? GradedBy { get; set; }
    public User? GradedByUser { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? GradedAt { get; set; }
}

public class Announcement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public Guid TeacherId { get; set; }
    public User Teacher { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsPinned { get; set; } = false;
    public string? AttachmentUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class FinalGrade
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EnrollmentId { get; set; }
    public Enrollment Enrollment { get; set; } = null!;
    public decimal AttendanceScore { get; set; } = 0.00m;
    public decimal AssignmentsScore { get; set; } = 0.00m;
    public decimal FinalExamScore { get; set; } = 0.00m;
    public decimal TotalScore { get; set; } = 0.00m;
    public GradeLetter? LetterGrade { get; set; }
    public bool IsPassed { get; set; } = false;
    public DateTime? FinalizedAt { get; set; }
}
