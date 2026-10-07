using System.Text.RegularExpressions;
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
    public DbSet<CourseSection> CourseSections => Set<CourseSection>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<LessonProgress> LessonProgresses => Set<LessonProgress>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
    public DbSet<QuizOption> QuizOptions => Set<QuizOption>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<QuizAttemptAnswer> QuizAttemptAnswers => Set<QuizAttemptAnswer>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<Submission> Submissions => Set<Submission>();
    public DbSet<SubmissionFile> SubmissionFiles => Set<SubmissionFile>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<AnnouncementComment> AnnouncementComments => Set<AnnouncementComment>();
    public DbSet<FinalGrade> FinalGrades => Set<FinalGrade>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Table Mapping (snake_case database names matching schema.sql)
        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<StudentProfile>().ToTable("student_profiles");
        modelBuilder.Entity<TeacherProfile>().ToTable("teacher_profiles");
        modelBuilder.Entity<Course>().ToTable("courses");
        modelBuilder.Entity<CourseSection>().ToTable("course_sections");
        modelBuilder.Entity<Enrollment>().ToTable("enrollments");
        modelBuilder.Entity<Lesson>().ToTable("lessons");
        modelBuilder.Entity<LessonProgress>().ToTable("lesson_progress");
        modelBuilder.Entity<Quiz>().ToTable("quizzes");
        modelBuilder.Entity<QuizQuestion>().ToTable("quiz_questions");
        modelBuilder.Entity<QuizOption>().ToTable("quiz_options");
        modelBuilder.Entity<QuizAttempt>().ToTable("quiz_attempts");
        modelBuilder.Entity<QuizAttemptAnswer>().ToTable("quiz_attempt_answers");
        modelBuilder.Entity<Assignment>().ToTable("assignments");
        modelBuilder.Entity<Submission>().ToTable("submissions");
        modelBuilder.Entity<SubmissionFile>().ToTable("submission_files");
        modelBuilder.Entity<Announcement>().ToTable("announcements");
        modelBuilder.Entity<AnnouncementComment>().ToTable("announcement_comments");
        modelBuilder.Entity<FinalGrade>().ToTable("final_grades");
        modelBuilder.Entity<Notification>().ToTable("notifications");

        // 2. Primary Keys & One-to-One Relationships
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

        // 3. Enums stored as strings
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

        // 4. Relationships & Foreign Keys
        modelBuilder.Entity<Course>()
            .HasOne(c => c.Teacher)
            .WithMany()
            .HasForeignKey(c => c.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CourseSection>()
            .HasOne(cs => cs.Course)
            .WithMany(c => c.Sections)
            .HasForeignKey(cs => cs.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

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

        modelBuilder.Entity<Lesson>()
            .HasOne(l => l.Section)
            .WithMany(cs => cs.Lessons)
            .HasForeignKey(l => l.SectionId)
            .OnDelete(DeleteBehavior.SetNull);

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

        modelBuilder.Entity<QuizAttemptAnswer>()
            .HasOne(qaa => qaa.Attempt)
            .WithMany(qa => qa.Answers)
            .HasForeignKey(qaa => qaa.AttemptId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<QuizAttemptAnswer>()
            .HasOne(qaa => qaa.Question)
            .WithMany()
            .HasForeignKey(qaa => qaa.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<QuizAttemptAnswer>()
            .HasOne(qaa => qaa.SelectedOption)
            .WithMany()
            .HasForeignKey(qaa => qaa.SelectedOptionId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Assignment>()
            .HasOne(a => a.Course)
            .WithMany(c => c.Assignments)
            .HasForeignKey(a => a.CourseId);

        modelBuilder.Entity<Assignment>()
            .HasOne(a => a.Lesson)
            .WithMany()
            .HasForeignKey(a => a.LessonId)
            .OnDelete(DeleteBehavior.SetNull);

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

        modelBuilder.Entity<SubmissionFile>()
            .HasOne(sf => sf.Submission)
            .WithMany(s => s.Files)
            .HasForeignKey(sf => sf.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Announcement>()
            .HasOne(an => an.Course)
            .WithMany(c => c.Announcements)
            .HasForeignKey(an => an.CourseId);

        modelBuilder.Entity<Announcement>()
            .HasOne(an => an.Teacher)
            .WithMany()
            .HasForeignKey(an => an.TeacherId);

        modelBuilder.Entity<AnnouncementComment>()
            .HasOne(ac => ac.Announcement)
            .WithMany(a => a.Comments)
            .HasForeignKey(ac => ac.AnnouncementId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AnnouncementComment>()
            .HasOne(ac => ac.User)
            .WithMany()
            .HasForeignKey(ac => ac.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FinalGrade>()
            .HasOne(fg => fg.Enrollment)
            .WithOne(e => e.FinalGrade)
            .HasForeignKey<FinalGrade>(fg => fg.EnrollmentId);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // 5. Automatic snake_case column mapping
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(ToSnakeCase(property.Name));
            }
        }
    }

    private static string ToSnakeCase(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        return Regex.Replace(input, @"([a-z0-9])([A-Z])", "$1_$2").ToLowerInvariant();
    }
}
