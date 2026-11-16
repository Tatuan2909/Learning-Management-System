using System;
using System.Collections.Generic;

namespace Lms.Domain.Entities;

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
    public string? EnrollmentPassword { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CourseSection> Sections { get; set; } = new List<CourseSection>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    public ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();
}
