using Microsoft.EntityFrameworkCore;
using Lms.Domain.Entities;
using Lms.Domain.Enums;

namespace Lms.Infrastructure.Data;

public class LmsDbContext : DbContext
{
    public LmsDbContext(DbContextOptions<LmsDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<TeacherProfile> TeacherProfiles => Set<TeacherProfile>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<LessonProgress> LessonProgresses => Set<LessonProgress>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
    public DbSet<QuizOption> QuizOptions => Set<QuizOption>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<Submission> Submissions => Set<Submission>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<FinalGrade> FinalGrades => Set<FinalGrade>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Table Mapping (snake_case database names matching schema.sql)
        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<StudentProfile>().ToTable("student_profiles");
        modelBuilder.Entity<TeacherProfile>().ToTable("teacher_profiles");
        modelBuilder.Entity<Course>().ToTable("courses");
        modelBuilder.Entity<Enrollment>().ToTable("enrollments");
        modelBuilder.Entity<Lesson>().ToTable("lessons");
        modelBuilder.Entity<LessonProgress>().ToTable("lesson_progress");
        modelBuilder.Entity<Quiz>().ToTable("quizzes");
        modelBuilder.Entity<QuizQuestion>().ToTable("quiz_questions");
        modelBuilder.Entity<QuizOption>().ToTable("quiz_options");
        modelBuilder.Entity<QuizAttempt>().ToTable("quiz_attempts");
        modelBuilder.Entity<Assignment>().ToTable("assignments");
        modelBuilder.Entity<Submission>().ToTable("submissions");
        modelBuilder.Entity<Announcement>().ToTable("announcements");
        modelBuilder.Entity<FinalGrade>().ToTable("final_grades");

        // Primary Keys & One-to-One Relationships
        modelBuilder.Entity<StudentProfile>()
            .HasKey(sp => sp.UserId);

        modelBuilder.Entity<StudentProfile>()
            .HasOne(sp => sp.User)
            .WithOne(u => u.StudentProfile)
            .HasForeignKey<StudentProfile>(sp => sp.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TeacherProfile>()
            .HasKey(tp => tp.UserId);

        modelBuilder.Entity<TeacherProfile>()
            .HasOne(tp => tp.User)
            .WithOne(u => u.TeacherProfile)
            .HasForeignKey<TeacherProfile>(tp => tp.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Enums stored as strings
        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<Lesson>()
            .Property(l => l.ContentType)
            .HasConversion<string>();

        modelBuilder.Entity<QuizQuestion>()
            .Property(q => q.QuestionType)
            .HasConversion<string>();

        modelBuilder.Entity<Submission>()
            .Property(s => s.Status)
            .HasConversion<string>();

        modelBuilder.Entity<FinalGrade>()
            .Property(fg => fg.LetterGrade)
            .HasConversion<string>();

        // Relationships & Foreign Keys
        modelBuilder.Entity<Course>()
            .HasOne(c => c.Teacher)
            .WithMany()
            .HasForeignKey(c => c.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.Course)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(e => e.CourseId);

        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.Student)
            .WithMany(u => u.Enrollments)
            .HasForeignKey(e => e.StudentId);

        modelBuilder.Entity<Lesson>()
            .HasOne(l => l.Course)
            .WithMany(c => c.Lessons)
            .HasForeignKey(l => l.CourseId);

        modelBuilder.Entity<LessonProgress>()
            .HasOne(lp => lp.Enrollment)
            .WithMany(e => e.LessonProgresses)
            .HasForeignKey(lp => lp.EnrollmentId);

        modelBuilder.Entity<LessonProgress>()
            .HasOne(lp => lp.Lesson)
            .WithMany(l => l.Progresses)
            .HasForeignKey(lp => lp.LessonId);

        modelBuilder.Entity<Quiz>()
            .HasOne(q => q.Lesson)
            .WithOne(l => l.Quiz)
            .HasForeignKey<Quiz>(q => q.LessonId);

        modelBuilder.Entity<QuizQuestion>()
            .HasOne(qq => qq.Quiz)
            .WithMany(q => q.Questions)
            .HasForeignKey(qq => qq.QuizId);

        modelBuilder.Entity<QuizOption>()
            .HasOne(qo => qo.Question)
            .WithMany(qq => qq.Options)
            .HasForeignKey(qo => qo.QuestionId);

        modelBuilder.Entity<QuizAttempt>()
            .HasOne(qa => qa.Quiz)
            .WithMany(q => q.Attempts)
            .HasForeignKey(qa => qa.QuizId);

        modelBuilder.Entity<QuizAttempt>()
            .HasOne(qa => qa.Student)
            .WithMany(u => u.QuizAttempts)
            .HasForeignKey(qa => qa.StudentId);

        modelBuilder.Entity<Assignment>()
            .HasOne(a => a.Course)
            .WithMany(c => c.Assignments)
            .HasForeignKey(a => a.CourseId);

        modelBuilder.Entity<Submission>()
            .HasOne(sub => sub.Assignment)
            .WithMany(a => a.Submissions)
            .HasForeignKey(sub => sub.AssignmentId);

        modelBuilder.Entity<Submission>()
            .HasOne(sub => sub.Student)
            .WithMany(u => u.Submissions)
            .HasForeignKey(sub => sub.StudentId);

        modelBuilder.Entity<Submission>()
            .HasOne(sub => sub.GradedByUser)
            .WithMany()
            .HasForeignKey(sub => sub.GradedBy)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Announcement>()
            .HasOne(an => an.Course)
            .WithMany(c => c.Announcements)
            .HasForeignKey(an => an.CourseId);

        modelBuilder.Entity<Announcement>()
            .HasOne(an => an.Teacher)
            .WithMany()
            .HasForeignKey(an => an.TeacherId);

        modelBuilder.Entity<FinalGrade>()
            .HasOne(fg => fg.Enrollment)
            .WithOne(e => e.FinalGrade)
            .HasForeignKey<FinalGrade>(fg => fg.EnrollmentId);
    }
}
