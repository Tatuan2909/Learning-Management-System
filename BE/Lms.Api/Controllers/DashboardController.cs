using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Lms.Application.Interfaces;
using Lms.Domain.Entities;
using Lms.Infrastructure.Data;

namespace Lms.Api.Controllers;

[ApiController]
[Route("api/student")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly LmsDbContext _db;

    public DashboardController(IDashboardService dashboardService, LmsDbContext db)
    {
        _dashboardService = dashboardService;
        _db = db;
    }

    /// <summary>
    /// Module 8: Widget Đếm ngược Deadline (Upcoming Deadlines Widget)
    /// Lọc các bài tập/bài thi chưa nộp, DueDate > Current_Time, sắp xếp tăng dần theo thời gian còn lại.
    /// </summary>
    [HttpGet("upcoming-deadlines")]
    public async Task<IActionResult> GetUpcomingDeadlines([FromQuery] Guid? studentId)
    {
        var targetStudentId = studentId ?? Guid.Parse("33333333-3333-3333-3333-333333333333");
        var result = await _dashboardService.GetUpcomingDeadlinesAsync(targetStudentId);
        return Ok(result);
    }

    /// <summary>
    /// Bảng điểm chi tiết toàn bộ học phần của sinh viên (Student Academic Transcript) - 100% CSDL
    /// </summary>
    [HttpGet("transcript")]
    public async Task<IActionResult> GetStudentTranscript([FromQuery] Guid? studentId)
    {
        var targetStudentId = studentId ?? Guid.Parse("33333333-3333-3333-3333-333333333333");

        var student = await _db.Users
            .Include(u => u.StudentProfile)
            .FirstOrDefaultAsync(u => u.Id == targetStudentId);

        if (student == null)
            return NotFound(new { message = "Không tìm thấy sinh viên." });

        var enrollments = await _db.Enrollments
            .Include(e => e.Course)
                .ThenInclude(c => c.Teacher)
            .Include(e => e.Course)
                .ThenInclude(c => c.Assignments)
            .Include(e => e.FinalGrade)
            .Where(e => e.StudentId == targetStudentId)
            .OrderByDescending(e => e.EnrolledAt)
            .ToListAsync();

        var allSubmissions = await _db.Submissions
            .Include(s => s.Files)
            .Where(s => s.StudentId == targetStudentId)
            .ToListAsync();

        var courseItems = new List<object>();

        foreach (var e in enrollments)
        {
            var course = e.Course;
            var fg = e.FinalGrade;

            var wAtt = course.WeightAttendance > 0 ? course.WeightAttendance : 10m;
            var wAss = course.WeightAssignments > 0 ? course.WeightAssignments : 30m;
            var wExam = course.WeightFinalExam > 0 ? course.WeightFinalExam : 60m;
            var totalWeight = wAtt + wAss + wExam;
            if (totalWeight <= 0) totalWeight = 100m;

            var courseAssignments = course.Assignments.OrderBy(a => a.DueDate).ToList();
            var assignmentDetails = new List<object>();
            var gradedAssignmentScores = new List<decimal>();

            foreach (var a in courseAssignments)
            {
                var sub = allSubmissions.FirstOrDefault(s => s.AssignmentId == a.Id);
                if (sub != null && sub.Grade.HasValue)
                {
                    gradedAssignmentScores.Add(sub.Grade.Value);
                }

                assignmentDetails.Add(new
                {
                    id = a.Id.ToString(),
                    title = a.Title,
                    dueDate = a.DueDate.ToString("yyyy-MM-dd HH:mm"),
                    maxScore = (double)a.MaxScore,
                    isSubmitted = sub != null,
                    submittedAt = sub?.SubmittedAt.ToString("yyyy-MM-dd HH:mm"),
                    grade = sub?.Grade.HasValue == true ? (double?)sub.Grade.Value : null,
                    feedback = sub?.Feedback,
                    status = sub != null ? sub.Status.ToString() : (a.DueDate < DateTime.UtcNow ? "OVERDUE" : "NOT_SUBMITTED"),
                    submissionText = sub?.SubmissionText,
                    gitRepoUrl = sub?.GitRepoUrl,
                    files = sub != null ? sub.Files.Select(f => new
                    {
                        id = f.Id.ToString(),
                        fileName = f.FileName,
                        fileUrl = f.FileUrl,
                        fileSize = f.FileSize,
                        fileType = f.FileType
                    }).ToList() : new()
                });
            }

            decimal att;
            decimal ass;
            decimal exam;
            decimal total;
            string letter;
            decimal gpa4;
            bool isPassed;

            if (fg != null)
            {
                att = fg.AttendanceScore;
                ass = fg.AssignmentsScore;
                exam = fg.FinalExamScore;
                total = fg.TotalScore;
                var gradeCalc = CalculateGradeLetterAndGpa4(total);
                letter = fg.LetterGrade ?? gradeCalc.letter;
                gpa4 = gradeCalc.gpa4;
                isPassed = fg.IsPassed;
            }
            else
            {
                att = Math.Round(e.ProgressPercentage / 10m, 2);
                ass = gradedAssignmentScores.Any() ? Math.Round(gradedAssignmentScores.Average(), 2) : 0.0m;
                exam = 0.0m;
                total = Math.Round((att * wAtt + ass * wAss + exam * wExam) / totalWeight, 2);
                var gradeCalc = CalculateGradeLetterAndGpa4(total);
                letter = gradeCalc.letter;
                gpa4 = gradeCalc.gpa4;
                isPassed = total >= 4.0m;
            }

            courseItems.Add(new
            {
                courseId = course.Id.ToString(),
                courseCode = course.CourseCode,
                courseTitle = course.Title,
                teacherName = course.Teacher?.FullName ?? "Giảng viên",
                credits = 3,
                weightAttendance = (double)wAtt,
                weightAssignments = (double)wAss,
                weightFinalExam = (double)wExam,
                attendanceScore = (double)att,
                assignmentScore = (double)ass,
                examScore = (double)exam,
                totalScore = (double)total,
                letterGrade = letter,
                gpa4 = (double)gpa4,
                isPassed = isPassed,
                progressPercentage = (double)e.ProgressPercentage,
                isFinalized = fg != null,
                finalizedAt = fg?.FinalizedAt?.ToString("yyyy-MM-dd HH:mm"),
                status = fg != null ? (isPassed ? "PASSED" : "FAILED") : "IN_PROGRESS",
                assignments = assignmentDetails
            });
        }

        int totalCourses = courseItems.Count;
        int passedCourses = courseItems.Count(c => (bool)((dynamic)c).isPassed);
        int inProgressCourses = courseItems.Count(c => (string)((dynamic)c).status == "IN_PROGRESS");
        int failedCourses = courseItems.Count(c => (string)((dynamic)c).status == "FAILED");

        double avgGpa10 = totalCourses > 0 
            ? Math.Round(courseItems.Average(c => (double)((dynamic)c).totalScore), 2) 
            : 0;

        double avgGpa4 = totalCourses > 0 
            ? Math.Round(courseItems.Average(c => (double)((dynamic)c).gpa4), 2) 
            : 0;

        int totalCredits = totalCourses * 3;
        int earnedCredits = passedCourses * 3;

        return Ok(new
        {
            student = new
            {
                id = student.Id.ToString(),
                fullName = student.FullName,
                email = student.Email,
                studentCode = student.StudentProfile?.StudentCode ?? "SV2024",
                className = student.StudentProfile?.AdministrativeClass ?? "CNTT-K65",
                major = student.StudentProfile?.Major ?? "Công nghệ Thông tin"
            },
            summary = new
            {
                totalCourses,
                passedCourses,
                inProgressCourses,
                failedCourses,
                totalCredits,
                earnedCredits,
                averageGpa10 = avgGpa10,
                averageGpa4 = avgGpa4,
                overallGrade = CalculateGradeLetterAndGpa4((decimal)avgGpa10).letter
            },
            courses = courseItems
        });
    }

    /// <summary>
    /// Xem bảng điểm chi tiết của sinh viên cho 1 học phần cụ thể
    /// </summary>
    [HttpGet("courses/{courseId}/grades")]
    public async Task<IActionResult> GetCourseStudentGrades(Guid courseId, [FromQuery] Guid? studentId)
    {
        var targetStudentId = studentId ?? Guid.Parse("33333333-3333-3333-3333-333333333333");

        var enrollment = await _db.Enrollments
            .Include(e => e.Course)
                .ThenInclude(c => c.Teacher)
            .Include(e => e.Course)
                .ThenInclude(c => c.Assignments)
            .Include(e => e.FinalGrade)
            .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentId == targetStudentId);

        if (enrollment == null)
            return NotFound(new { message = "Không tìm thấy ghi danh của sinh viên cho khóa học này." });

        var course = enrollment.Course;
        var fg = enrollment.FinalGrade;

        var submissions = await _db.Submissions
            .Include(s => s.Files)
            .Where(s => s.StudentId == targetStudentId && s.Assignment.CourseId == courseId)
            .ToListAsync();

        var wAtt = course.WeightAttendance > 0 ? course.WeightAttendance : 10m;
        var wAss = course.WeightAssignments > 0 ? course.WeightAssignments : 30m;
        var wExam = course.WeightFinalExam > 0 ? course.WeightFinalExam : 60m;
        var totalWeight = wAtt + wAss + wExam;
        if (totalWeight <= 0) totalWeight = 100m;

        var assignmentDetails = new List<object>();
        var gradedScores = new List<decimal>();

        foreach (var a in course.Assignments.OrderBy(a => a.DueDate))
        {
            var sub = submissions.FirstOrDefault(s => s.AssignmentId == a.Id);
            if (sub?.Grade.HasValue == true)
            {
                gradedScores.Add(sub.Grade.Value);
            }

            assignmentDetails.Add(new
            {
                id = a.Id.ToString(),
                title = a.Title,
                dueDate = a.DueDate.ToString("yyyy-MM-dd HH:mm"),
                maxScore = (double)a.MaxScore,
                isSubmitted = sub != null,
                submittedAt = sub?.SubmittedAt.ToString("yyyy-MM-dd HH:mm"),
                grade = sub?.Grade.HasValue == true ? (double?)sub.Grade.Value : null,
                feedback = sub?.Feedback,
                status = sub != null ? sub.Status.ToString() : (a.DueDate < DateTime.UtcNow ? "OVERDUE" : "NOT_SUBMITTED"),
                files = sub != null ? sub.Files.Select(f => new
                {
                    id = f.Id.ToString(),
                    fileName = f.FileName,
                    fileUrl = f.FileUrl,
                    fileSize = f.FileSize,
                    fileType = f.FileType
                }).ToList() : new()
            });
        }

        decimal att = fg != null ? fg.AttendanceScore : Math.Round(enrollment.ProgressPercentage / 10m, 2);
        decimal ass = fg != null ? fg.AssignmentsScore : (gradedScores.Any() ? Math.Round(gradedScores.Average(), 2) : 0.0m);
        decimal exam = fg != null ? fg.FinalExamScore : 0.0m;
        decimal total = fg != null ? fg.TotalScore : Math.Round((att * wAtt + ass * wAss + exam * wExam) / totalWeight, 2);
        var gradeCalc = CalculateGradeLetterAndGpa4(total);
        string letter = fg?.LetterGrade ?? gradeCalc.letter;
        decimal gpa4 = gradeCalc.gpa4;
        bool isPassed = fg != null ? fg.IsPassed : total >= 4.0m;

        return Ok(new
        {
            courseId = course.Id.ToString(),
            courseCode = course.CourseCode,
            courseTitle = course.Title,
            teacherName = course.Teacher?.FullName ?? "Giảng viên",
            credits = 3,
            weightAttendance = (double)wAtt,
            weightAssignments = (double)wAss,
            weightFinalExam = (double)wExam,
            attendanceScore = (double)att,
            assignmentScore = (double)ass,
            examScore = (double)exam,
            totalScore = (double)total,
            letterGrade = letter,
            gpa4 = (double)gpa4,
            isPassed = isPassed,
            progressPercentage = (double)enrollment.ProgressPercentage,
            isFinalized = fg != null,
            status = fg != null ? (isPassed ? "PASSED" : "FAILED") : "IN_PROGRESS",
            assignments = assignmentDetails
        });
    }

    private static (string letter, decimal gpa4) CalculateGradeLetterAndGpa4(decimal totalScore)
    {
        if (totalScore >= 9.0m) return ("A+", 4.0m);
        if (totalScore >= 8.5m) return ("A", 3.8m);
        if (totalScore >= 8.0m) return ("B+", 3.5m);
        if (totalScore >= 7.0m) return ("B", 3.0m);
        if (totalScore >= 6.5m) return ("C+", 2.5m);
        if (totalScore >= 5.5m) return ("C", 2.0m);
        if (totalScore >= 5.0m) return ("D+", 1.5m);
        if (totalScore >= 4.0m) return ("D", 1.0m);
        return ("F", 0.0m);
    }
}
