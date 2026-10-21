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
            accessPassword = c.EnrollmentPassword,
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

    private static string MapContentTypeToCategory(LessonContentType contentType)
    {
        return contentType switch
        {
            LessonContentType.VIDEO => "LECTURE",
            LessonContentType.SCORM => "LECTURE",
            LessonContentType.OVERVIEW => "LECTURE",
            LessonContentType.PDF => "DOCUMENT",
            LessonContentType.DOCX => "DOCUMENT",
            LessonContentType.LINK => "DOCUMENT",
            LessonContentType.PRACTICE => "PRACTICE",
            LessonContentType.QUIZ => "QUIZ",
            LessonContentType.ANNOUNCEMENT => "FORUM",
            _ => "LECTURE"
        };
    }

    private static LessonContentType ParseActivityTypeToContentType(string? activityType, string? resourceUrl = null)
    {
        var raw = activityType?.Trim().ToUpper() ?? "";
        if (raw == "DOCUMENT")
        {
            if (!string.IsNullOrWhiteSpace(resourceUrl))
            {
                var lower = resourceUrl.ToLowerInvariant();
                if (lower.EndsWith(".docx") || lower.EndsWith(".doc")) return LessonContentType.DOCX;
                if (lower.EndsWith(".pdf")) return LessonContentType.PDF;
                if (lower.EndsWith(".txt")) return LessonContentType.TEXT;
            }
            return LessonContentType.PDF;
        }

        return raw switch
        {
            "LECTURE" => LessonContentType.VIDEO,
            "DOCUMENT" => LessonContentType.PDF,
            "PRACTICE" => LessonContentType.PRACTICE,
            "QUIZ" => LessonContentType.QUIZ,
            "FORUM" => LessonContentType.ANNOUNCEMENT,
            "VIDEO" => LessonContentType.VIDEO,
            "SCORM" => LessonContentType.SCORM,
            "OVERVIEW" => LessonContentType.OVERVIEW,
            "PDF" => LessonContentType.PDF,
            "DOCX" => LessonContentType.DOCX,
            "LINK" => LessonContentType.LINK,
            "TEXT" => LessonContentType.TEXT,
            _ => LessonContentType.VIDEO
        };
    }

    private static object ToCourseStudentResponse(Enrollment enrollment)
    {
        var student = enrollment.Student;
        var profile = student.StudentProfile;

        return new
        {
            id = enrollment.StudentId.ToString(),
            courseId = enrollment.CourseId.ToString(),
            studentCode = profile?.StudentCode ?? "SV2024" + enrollment.StudentId.ToString()[..4],
            fullName = student.FullName,
            email = student.Email,
            className = profile?.AdministrativeClass ?? "CNTT-K65",
            enrolledAt = enrollment.EnrolledAt.ToString("yyyy-MM-dd"),
            progressPercentage = (double)enrollment.ProgressPercentage,
            status = enrollment.Status
        };
    }

    /// <summary>
    /// Lấy danh sách bài học / hoạt động của khóa học
    /// </summary>
    [HttpGet("courses/{courseId}/lessons")]
    public async Task<IActionResult> GetCourseLessons(Guid courseId)
    {
        var lessons = await _db.Lessons
            .Include(l => l.Section)
            .Include(l => l.Quiz)
            .Where(l => l.CourseId == courseId)
            .OrderBy(l => l.Section != null ? l.Section.OrderIndex : 1)
            .ThenBy(l => l.OrderIndex)
            .ToListAsync();

        var assignments = await _db.Assignments
            .Where(a => a.CourseId == courseId)
            .ToListAsync();

        var result = lessons.Select(l =>
        {
            var assignment = assignments.FirstOrDefault(a => a.LessonId == l.Id);
            return new
            {
                id = l.Id.ToString(),
                courseId = l.CourseId.ToString(),
                weekNumber = l.Section?.OrderIndex ?? 1,
                activityType = MapContentTypeToCategory(l.ContentType),
                contentType = l.ContentType.ToString(),
                lessonNumber = l.OrderIndex,
                title = l.Title,
                subtitle = l.Subtitle,
                durationMinutes = l.Quiz?.TimeLimitMinutes ?? 45,
                isUnlocked = !l.IsLocked,
                description = l.BodyMarkdown,
                resourceUrl = l.ContentUrl,
                quizId = l.Quiz?.Id.ToString(),
                password = l.Quiz?.Password,
                dueDate = assignment?.DueDate.ToString("yyyy-MM-dd")
            };
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

        var contentType = ParseActivityTypeToContentType(request.ActivityType, request.ResourceUrl);

        var maxOrder = await _db.Lessons
            .Where(l => l.CourseId == courseId && l.SectionId == section.Id)
            .Select(l => (int?)l.OrderIndex)
            .MaxAsync() ?? 0;

        DateTime? parsedDueDate = null;
        if (!string.IsNullOrWhiteSpace(request.DueDate) && DateTime.TryParse(request.DueDate, out var dDateVal))
        {
            parsedDueDate = dDateVal;
        }

        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            SectionId = section.Id,
            Title = request.Title,
            Subtitle = request.Subtitle ?? request.FileName,
            OrderIndex = maxOrder + 1,
            ContentType = contentType,
            ContentUrl = request.ResourceUrl,
            BodyMarkdown = request.Description,
            IsLocked = request.IsLocked ?? false,
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
                DueDate = parsedDueDate ?? DateTime.UtcNow.AddDays(7),
                MaxScore = 10.00m,
                AllowGitRepo = true
            };
            _db.Assignments.Add(assignment);
        }
        else if (contentType == LessonContentType.QUIZ)
        {
            var quiz = new Quiz
            {
                Id = Guid.NewGuid(),
                LessonId = lesson.Id,
                Title = request.Title,
                Description = request.Description,
                Password = string.IsNullOrWhiteSpace(request.Password) ? (string.IsNullOrWhiteSpace(request.QuizData?.Password) ? null : request.QuizData.Password.Trim()) : request.Password.Trim(),
                PassingScore = request.QuizData?.PassingScore ?? 7.00m,
                MaxScore = request.QuizData?.MaxScore ?? 10.00m,
                TimeLimitMinutes = request.DurationMinutes > 0 ? request.DurationMinutes : (request.QuizData?.TimeLimitMinutes ?? 15),
                ShuffleQuestions = true,
                CreatedAt = DateTime.UtcNow
            };

            // Nếu có hạn nộp cho bài trắc nghiệm, tạo Assignment liên kết để lưu hạn nộp
            if (parsedDueDate.HasValue)
            {
                var assignment = new Assignment
                {
                    Id = Guid.NewGuid(),
                    CourseId = courseId,
                    LessonId = lesson.Id,
                    Title = request.Title,
                    Instructions = "Bài trắc nghiệm đánh giá kiến thức tuần.",
                    DueDate = parsedDueDate.Value,
                    MaxScore = 10.00m,
                    AllowGitRepo = false
                };
                _db.Assignments.Add(assignment);
            }

            if (request.QuizData?.Questions != null && request.QuizData.Questions.Any())
            {
                int qOrder = 1;
                foreach (var qDto in request.QuizData.Questions)
                {
                    if (string.IsNullOrWhiteSpace(qDto.QuestionText)) continue;

                    var question = new QuizQuestion
                    {
                        Id = Guid.NewGuid(),
                        QuizId = quiz.Id,
                        QuestionText = qDto.QuestionText.Trim(),
                        QuestionType = QuestionType.SINGLE_CHOICE,
                        Points = qDto.Points > 0 ? qDto.Points : 1.00m,
                        OrderIndex = qOrder++,
                        Explanation = qDto.Explanation,
                        CreatedAt = DateTime.UtcNow
                    };

                    foreach (var oDto in qDto.Options)
                    {
                        if (string.IsNullOrWhiteSpace(oDto.OptionText)) continue;
                        question.Options.Add(new QuizOption
                        {
                            Id = Guid.NewGuid(),
                            QuestionId = question.Id,
                            OptionText = oDto.OptionText.Trim(),
                            IsCorrect = oDto.IsCorrect,
                            Explanation = oDto.Explanation
                        });
                    }

                    if (question.Options.Any() && !question.Options.Any(o => o.IsCorrect))
                    {
                        question.Options.First().IsCorrect = true;
                    }

                    quiz.Questions.Add(question);
                }
            }
            else
            {
                // Tự động nạp toàn bộ câu hỏi từ ngân hàng đề thi CSDL theo tuần học!
                var bankQuestions = await _db.QuestionBanks
                    .Include(qb => qb.Options)
                    .Where(qb => qb.WeekNumber == request.WeekNumber && (qb.CourseId == courseId || qb.CourseId == null))
                    .OrderBy(qb => qb.CreatedAt)
                    .ToListAsync();

                if (!bankQuestions.Any())
                {
                    bankQuestions = await _db.QuestionBanks
                        .Include(qb => qb.Options)
                        .OrderBy(qb => qb.WeekNumber)
                        .Take(5)
                        .ToListAsync();
                }

                int qOrder = 1;
                foreach (var bq in bankQuestions)
                {
                    var question = new QuizQuestion
                    {
                        Id = Guid.NewGuid(),
                        QuizId = quiz.Id,
                        QuestionText = bq.QuestionText,
                        QuestionType = bq.QuestionType,
                        Points = bq.Points > 0 ? bq.Points : 2.50m,
                        OrderIndex = qOrder++,
                        Explanation = bq.Explanation,
                        CreatedAt = DateTime.UtcNow
                    };

                    foreach (var bo in bq.Options)
                    {
                        question.Options.Add(new QuizOption
                        {
                            Id = Guid.NewGuid(),
                            QuestionId = question.Id,
                            OptionText = bo.OptionText,
                            IsCorrect = bo.IsCorrect,
                            Explanation = bo.Explanation
                        });
                    }

                    quiz.Questions.Add(question);
                }
            }

            _db.Quizzes.Add(quiz);
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = lesson.Id.ToString(),
            courseId = lesson.CourseId.ToString(),
            weekNumber = request.WeekNumber,
            activityType = MapContentTypeToCategory(lesson.ContentType),
            contentType = lesson.ContentType.ToString(),
            lessonNumber = lesson.OrderIndex,
            title = lesson.Title,
            subtitle = lesson.Subtitle,
            durationMinutes = request.DurationMinutes > 0 ? request.DurationMinutes : 45,
            isUnlocked = !lesson.IsLocked,
            description = lesson.BodyMarkdown,
            resourceUrl = lesson.ContentUrl,
            dueDate = parsedDueDate?.ToString("yyyy-MM-dd"),
            quizId = lesson.Quiz?.Id.ToString(),
            password = request.Password
        });
    }

    /// <summary>
    /// Giảng viên cập nhật bài học / hoạt động
    /// </summary>
    [HttpPut("lessons/{lessonId}")]
    public async Task<IActionResult> UpdateLesson(Guid lessonId, [FromBody] UpdateTeacherLessonDto request)
    {
        var lesson = await _db.Lessons
            .Include(l => l.Section)
            .FirstOrDefaultAsync(l => l.Id == lessonId);
        if (lesson == null) return NotFound("Không tìm thấy bài học.");

        var contentType = ParseActivityTypeToContentType(request.ActivityType, request.ResourceUrl);

        lesson.Title = request.Title;
        if (!string.IsNullOrWhiteSpace(request.Subtitle) || !string.IsNullOrWhiteSpace(request.FileName))
        {
            lesson.Subtitle = request.Subtitle ?? request.FileName;
        }
        lesson.ContentType = contentType;
        lesson.ContentUrl = request.ResourceUrl;
        lesson.BodyMarkdown = request.Description;

        if (request.IsLocked.HasValue)
        {
            lesson.IsLocked = request.IsLocked.Value;
        }

        // Xử lý chuyển tuần nếu weekNumber thay đổi
        if (lesson.Section == null || lesson.Section.OrderIndex != request.WeekNumber)
        {
            var section = await _db.CourseSections
                .FirstOrDefaultAsync(s => s.CourseId == lesson.CourseId && s.OrderIndex == request.WeekNumber);
            if (section == null)
            {
                section = new CourseSection
                {
                    Id = Guid.NewGuid(),
                    CourseId = lesson.CourseId,
                    Title = $"Week {request.WeekNumber}: Kế hoạch học tập tuần {request.WeekNumber}",
                    OrderIndex = request.WeekNumber,
                    IsExpanded = true,
                    IsLocked = false
                };
                _db.CourseSections.Add(section);
                await _db.SaveChangesAsync();
            }
            lesson.SectionId = section.Id;
            lesson.Section = section;
        }

        DateTime? parsedDueDate = null;
        if (!string.IsNullOrWhiteSpace(request.DueDate) && DateTime.TryParse(request.DueDate, out var dDate))
        {
            parsedDueDate = DateTime.SpecifyKind(dDate, DateTimeKind.Utc);
        }

        // Cập nhật Assignment liên kết nếu có
        if (contentType == LessonContentType.PRACTICE)
        {
            var assignment = await _db.Assignments.FirstOrDefaultAsync(a => a.LessonId == lesson.Id);
            if (assignment != null)
            {
                assignment.Title = request.Title;
                if (!string.IsNullOrEmpty(request.Description))
                {
                    assignment.Instructions = request.Description;
                }
                if (parsedDueDate.HasValue)
                {
                    assignment.DueDate = parsedDueDate.Value;
                }
            }
            else
            {
                _db.Assignments.Add(new Assignment
                {
                    Id = Guid.NewGuid(),
                    CourseId = lesson.CourseId,
                    LessonId = lesson.Id,
                    Title = request.Title,
                    Instructions = request.Description ?? "Vui lòng hoàn thành yêu cầu thực hành và nộp bài đúng hạn.",
                    DueDate = parsedDueDate ?? DateTime.UtcNow.AddDays(7),
                    MaxScore = 10.00m,
                    AllowGitRepo = true
                });
            }
        }
        else if (contentType == LessonContentType.QUIZ)
        {
            var assignment = await _db.Assignments.FirstOrDefaultAsync(a => a.LessonId == lesson.Id);
            if (parsedDueDate.HasValue)
            {
                if (assignment != null)
                {
                    assignment.DueDate = parsedDueDate.Value;
                    assignment.Title = request.Title;
                }
                else
                {
                    _db.Assignments.Add(new Assignment
                    {
                        Id = Guid.NewGuid(),
                        CourseId = lesson.CourseId,
                        LessonId = lesson.Id,
                        Title = request.Title,
                        Instructions = "Bài trắc nghiệm đánh giá kiến thức tuần.",
                        DueDate = parsedDueDate.Value,
                        MaxScore = 10.00m,
                        AllowGitRepo = false
                    });
                }
            }

            var quiz = await _db.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(qq => qq.Options)
                .FirstOrDefaultAsync(q => q.LessonId == lesson.Id);

            if (quiz == null)
            {
                quiz = new Quiz
                {
                    Id = Guid.NewGuid(),
                    LessonId = lesson.Id,
                    Title = request.Title,
                    Description = request.Description,
                    Password = string.IsNullOrWhiteSpace(request.Password) ? (string.IsNullOrWhiteSpace(request.QuizData?.Password) ? null : request.QuizData.Password.Trim()) : request.Password.Trim(),
                    PassingScore = request.QuizData?.PassingScore ?? 7.00m,
                    MaxScore = request.QuizData?.MaxScore ?? 10.00m,
                    TimeLimitMinutes = request.DurationMinutes > 0 ? request.DurationMinutes : (request.QuizData?.TimeLimitMinutes ?? 15),
                    ShuffleQuestions = true,
                    CreatedAt = DateTime.UtcNow
                };
                _db.Quizzes.Add(quiz);
            }
            else
            {
                quiz.Title = request.Title;
                quiz.Description = request.Description;
                quiz.Password = string.IsNullOrWhiteSpace(request.Password) ? (string.IsNullOrWhiteSpace(request.QuizData?.Password) ? null : request.QuizData.Password.Trim()) : request.Password.Trim();
                if (request.DurationMinutes > 0)
                {
                    quiz.TimeLimitMinutes = request.DurationMinutes;
                }
                else if (request.QuizData?.TimeLimitMinutes > 0)
                {
                    quiz.TimeLimitMinutes = request.QuizData.TimeLimitMinutes;
                }

                if (request.QuizData != null)
                {
                    quiz.PassingScore = request.QuizData.PassingScore;
                    quiz.MaxScore = request.QuizData.MaxScore;
                }
            }

            if (request.QuizData?.Questions != null && request.QuizData.Questions.Any())
            {
                // Xóa các câu hỏi & đáp án cũ nếu có
                foreach (var q in quiz.Questions)
                {
                    _db.QuizOptions.RemoveRange(q.Options);
                }
                _db.QuizQuestions.RemoveRange(quiz.Questions);
                quiz.Questions.Clear();

                int qOrder = 1;
                foreach (var qDto in request.QuizData.Questions)
                {
                    if (string.IsNullOrWhiteSpace(qDto.QuestionText)) continue;

                    var question = new QuizQuestion
                    {
                        Id = Guid.NewGuid(),
                        QuizId = quiz.Id,
                        QuestionText = qDto.QuestionText.Trim(),
                        QuestionType = QuestionType.SINGLE_CHOICE,
                        Points = qDto.Points > 0 ? qDto.Points : 1.00m,
                        OrderIndex = qOrder++,
                        Explanation = qDto.Explanation,
                        CreatedAt = DateTime.UtcNow
                    };

                    foreach (var oDto in qDto.Options)
                    {
                        if (string.IsNullOrWhiteSpace(oDto.OptionText)) continue;
                        question.Options.Add(new QuizOption
                        {
                            Id = Guid.NewGuid(),
                            QuestionId = question.Id,
                            OptionText = oDto.OptionText.Trim(),
                            IsCorrect = oDto.IsCorrect,
                            Explanation = oDto.Explanation
                        });
                    }

                    if (question.Options.Any() && !question.Options.Any(o => o.IsCorrect))
                    {
                        question.Options.First().IsCorrect = true;
                    }

                    quiz.Questions.Add(question);
                }
            }
            else if (!quiz.Questions.Any())
            {
                // Tự động nạp câu hỏi từ ngân hàng câu hỏi nếu quiz chưa có câu hỏi
                var targetWeek = lesson.Section?.OrderIndex ?? request.WeekNumber;
                var bankQuestions = await _db.QuestionBanks
                    .Include(qb => qb.Options)
                    .Where(qb => qb.WeekNumber == targetWeek && (qb.CourseId == lesson.CourseId || qb.CourseId == null))
                    .OrderBy(qb => qb.CreatedAt)
                    .ToListAsync();

                if (!bankQuestions.Any())
                {
                    bankQuestions = await _db.QuestionBanks
                        .Include(qb => qb.Options)
                        .OrderBy(qb => qb.WeekNumber)
                        .Take(5)
                        .ToListAsync();
                }

                int qOrder = 1;
                foreach (var bq in bankQuestions)
                {
                    var question = new QuizQuestion
                    {
                        Id = Guid.NewGuid(),
                        QuizId = quiz.Id,
                        QuestionText = bq.QuestionText,
                        QuestionType = bq.QuestionType,
                        Points = bq.Points > 0 ? bq.Points : 2.50m,
                        OrderIndex = qOrder++,
                        Explanation = bq.Explanation,
                        CreatedAt = DateTime.UtcNow
                    };

                    foreach (var bo in bq.Options)
                    {
                        question.Options.Add(new QuizOption
                        {
                            Id = Guid.NewGuid(),
                            QuestionId = question.Id,
                            OptionText = bo.OptionText,
                            IsCorrect = bo.IsCorrect,
                            Explanation = bo.Explanation
                        });
                    }

                    quiz.Questions.Add(question);
                }
            }
        }

        await _db.SaveChangesAsync();

        var finalDueDate = parsedDueDate?.ToString("yyyy-MM-dd") ?? 
            (await _db.Assignments.Where(a => a.LessonId == lesson.Id).Select(a => (DateTime?)a.DueDate).FirstOrDefaultAsync())?.ToString("yyyy-MM-dd");
        var quizInfo = await _db.Quizzes.FirstOrDefaultAsync(q => q.LessonId == lesson.Id);

        return Ok(new
        {
            id = lesson.Id.ToString(),
            courseId = lesson.CourseId.ToString(),
            weekNumber = lesson.Section?.OrderIndex ?? request.WeekNumber,
            activityType = MapContentTypeToCategory(lesson.ContentType),
            contentType = lesson.ContentType.ToString(),
            lessonNumber = lesson.OrderIndex,
            title = lesson.Title,
            subtitle = lesson.Subtitle,
            durationMinutes = quizInfo?.TimeLimitMinutes ?? (request.DurationMinutes > 0 ? request.DurationMinutes : 45),
            isUnlocked = !lesson.IsLocked,
            description = lesson.BodyMarkdown,
            resourceUrl = lesson.ContentUrl,
            dueDate = finalDueDate,
            quizId = quizInfo?.Id.ToString(),
            password = quizInfo?.Password ?? request.Password
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
        var lesson = await _db.Lessons
            .Include(l => l.Progresses)
            .Include(l => l.Quiz)
            .FirstOrDefaultAsync(l => l.Id == lessonId);
        if (lesson == null) return NotFound("Không tìm thấy bài học.");

        if (lesson.Progresses.Any())
        {
            _db.LessonProgresses.RemoveRange(lesson.Progresses);
        }

        if (lesson.Quiz != null)
        {
            var quiz = await _db.Quizzes
                .Include(q => q.Attempts)
                    .ThenInclude(qa => qa.Answers)
                .Include(q => q.Questions)
                    .ThenInclude(qq => qq.Options)
                .FirstOrDefaultAsync(q => q.Id == lesson.Quiz.Id);

            if (quiz != null)
            {
                foreach (var att in quiz.Attempts)
                {
                    _db.QuizAttemptAnswers.RemoveRange(att.Answers);
                }
                _db.QuizAttempts.RemoveRange(quiz.Attempts);
                foreach (var q in quiz.Questions)
                {
                    _db.QuizOptions.RemoveRange(q.Options);
                }
                _db.QuizQuestions.RemoveRange(quiz.Questions);
                _db.Quizzes.Remove(quiz);
            }
        }

        // Xóa hoàn toàn các bài tập (Assignment) liên kết với bài học này, cùng bài nộp của sinh viên
        var assignments = await _db.Assignments
            .Include(a => a.Submissions)
                .ThenInclude(s => s.Files)
            .Where(a => a.LessonId == lessonId || (a.CourseId == lesson.CourseId && a.Title == lesson.Title))
            .ToListAsync();

        foreach (var a in assignments)
        {
            foreach (var s in a.Submissions)
            {
                if (s.Files != null && s.Files.Any())
                {
                    _db.SubmissionFiles.RemoveRange(s.Files);
                }
            }
            if (a.Submissions != null && a.Submissions.Any())
            {
                _db.Submissions.RemoveRange(a.Submissions);
            }
            _db.Assignments.Remove(a);
        }

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

        var result = enrollments.Select(ToCourseStudentResponse);

        return Ok(result);
    }

    /// <summary>
    /// Giảng viên tải lên tệp tài liệu bài học (PDF, Word, Excel, PowerPoint...)
    /// </summary>
    [HttpPost("upload-document")]
    public async Task<IActionResult> UploadDocument([FromForm] IFormFile? file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Vui lòng chọn tệp tài liệu để tải lên." });
        }

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "documents");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var originalFileName = Path.GetFileName(file.FileName);
        var extension = Path.GetExtension(originalFileName);
        var safeFileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(uploadsFolder, safeFileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var relativeUrl = $"/uploads/documents/{safeFileName}";
        var extLower = extension.ToLowerInvariant();
        var contentType = extLower switch
        {
            ".pdf" => "PDF",
            ".docx" or ".doc" => "DOCX",
            ".txt" => "TEXT",
            _ => "PDF"
        };

        return Ok(new
        {
            fileUrl = relativeUrl,
            fileName = originalFileName,
            fileSize = file.Length,
            contentType = contentType
        });
    }

    /// <summary>
    /// Giảng viên lấy chi tiết đề thi trắc nghiệm (bao gồm cả đáp án đúng) để xem hoặc chỉnh sửa
    /// </summary>
    [HttpGet("lessons/{lessonId}/quiz")]
    public async Task<IActionResult> GetTeacherLessonQuiz(Guid lessonId)
    {
        var quiz = await _db.Quizzes
            .Include(q => q.Questions)
                .ThenInclude(qq => qq.Options)
            .FirstOrDefaultAsync(q => q.LessonId == lessonId);

        if (quiz == null)
        {
            return Ok(new
            {
                quizId = (string?)null,
                lessonId = lessonId.ToString(),
                title = "",
                passingScore = 7.00m,
                maxScore = 10.00m,
                timeLimitMinutes = 15,
                password = "",
                questions = new List<object>()
            });
        }

        return Ok(new
        {
            quizId = quiz.Id.ToString(),
            lessonId = quiz.LessonId.ToString(),
            title = quiz.Title,
            passingScore = quiz.PassingScore,
            maxScore = quiz.MaxScore,
            timeLimitMinutes = quiz.TimeLimitMinutes ?? 15,
            password = quiz.Password ?? "",
            questions = quiz.Questions.OrderBy(q => q.OrderIndex).Select(q => new
            {
                id = q.Id.ToString(),
                questionText = q.QuestionText,
                points = q.Points,
                explanation = q.Explanation,
                options = q.Options.Select(o => new
                {
                    id = o.Id.ToString(),
                    optionText = o.OptionText,
                    isCorrect = o.IsCorrect,
                    explanation = o.Explanation
                }).ToList()
            }).ToList()
        });
    }

    /// <summary>
    /// Giảng viên lọc câu hỏi từ Ngân hàng đề thi trong CSDL theo tuần học, hỗ trợ tự động trộn ngẫu nhiên đáp án
    /// </summary>
    [HttpGet("question-bank")]
    public async Task<IActionResult> GetQuestionBank(
        [FromQuery] int weekNumber = 1,
        [FromQuery] Guid? courseId = null,
        [FromQuery] bool shuffleOptions = true,
        [FromQuery] bool shuffleQuestions = false)
    {
        var query = _db.QuestionBanks
            .Include(qb => qb.Options)
            .Where(qb => qb.WeekNumber == weekNumber);

        if (courseId.HasValue && courseId.Value != Guid.Empty)
        {
            query = query.Where(qb => qb.CourseId == courseId.Value || qb.CourseId == null);
        }

        var list = await query.OrderBy(qb => qb.CreatedAt).ToListAsync();

        if (!list.Any())
        {
            list = await _db.QuestionBanks
                .Include(qb => qb.Options)
                .OrderBy(qb => qb.WeekNumber)
                .Take(5)
                .ToListAsync();
        }

        var result = list.Select(q =>
        {
            var optionsList = q.Options.AsEnumerable();
            if (shuffleOptions)
            {
                optionsList = optionsList.OrderBy(_ => Guid.NewGuid());
            }
            else
            {
                optionsList = optionsList.OrderBy(o => o.OrderIndex);
            }

            return new
            {
                id = q.Id.ToString(),
                weekNumber = q.WeekNumber,
                topic = q.Topic,
                questionText = q.QuestionText,
                points = q.Points,
                explanation = q.Explanation,
                options = optionsList.Select(o => new
                {
                    id = o.Id.ToString(),
                    optionText = o.OptionText,
                    isCorrect = o.IsCorrect,
                    explanation = o.Explanation
                }).ToList()
            };
        });

        if (shuffleQuestions)
        {
            result = result.OrderBy(_ => Guid.NewGuid());
        }

        return Ok(result.ToList());
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
    /// Giảng viên import danh sách nhiều sinh viên vào lớp học phần (từ tệp CSV/Excel)
    /// </summary>
    [HttpPost("courses/{courseId}/students/import")]
    public async Task<IActionResult> ImportCourseStudents(Guid courseId, [FromBody] ImportStudentsRequestDto request)
    {
        var course = await _db.Courses.FindAsync(courseId);
        if (course == null) return NotFound(new { message = "Khóa học không tồn tại." });

        if (request.Students == null || !request.Students.Any())
        {
            return BadRequest(new { message = "Danh sách sinh viên rỗng." });
        }

        var importedStudents = new List<object>();
        var skippedCount = 0;

        foreach (var item in request.Students)
        {
            if (string.IsNullOrWhiteSpace(item.Email))
            {
                skippedCount++;
                continue;
            }

            var cleanEmail = item.Email.Trim().ToLower();
            var cleanCode = !string.IsNullOrWhiteSpace(item.StudentCode) ? item.StudentCode.Trim().ToUpperInvariant() : "SV" + new Random().Next(1000000, 9999999);
            var cleanName = !string.IsNullOrWhiteSpace(item.FullName) ? item.FullName.Trim() : "Sinh viên " + cleanCode;
            var cleanClass = !string.IsNullOrWhiteSpace(item.ClassName) ? item.ClassName.Trim() : "CNTT-K65";

            var student = await _db.Users
                .Include(u => u.StudentProfile)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == cleanEmail);

            if (student == null)
            {
                student = new User
                {
                    Id = Guid.NewGuid(),
                    FullName = cleanName,
                    Email = cleanEmail,
                    PasswordHash = "student123",
                    Role = UserRole.STUDENT,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                var studentProfile = new StudentProfile
                {
                    UserId = student.Id,
                    StudentCode = cleanCode,
                    AdministrativeClass = cleanClass,
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
                skippedCount++;
                continue;
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
            importedStudents.Add(new
            {
                id = student.Id.ToString(),
                courseId = courseId.ToString(),
                studentCode = student.StudentProfile?.StudentCode ?? cleanCode,
                fullName = student.FullName,
                email = student.Email,
                className = student.StudentProfile?.AdministrativeClass ?? cleanClass,
                enrolledAt = enrollment.EnrolledAt.ToString("yyyy-MM-dd"),
                progressPercentage = 0,
                status = "ACTIVE"
            });
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            importedCount = importedStudents.Count,
            skippedCount = skippedCount,
            students = importedStudents,
            message = $"Đã ghi danh thành công {importedStudents.Count} sinh viên vào lớp học phần!"
        });
    }

    /// <summary>
    /// Thay đổi trạng thái học tập của sinh viên trong lớp (ACTIVE / SUSPENDED)
    /// </summary>
    [HttpPut("courses/{courseId}/students/{studentId}")]
    public async Task<IActionResult> UpdateCourseStudent(Guid courseId, Guid studentId, [FromBody] UpdateCourseStudentDto request)
    {
        var enrollment = await _db.Enrollments
            .Include(e => e.Student)
                .ThenInclude(s => s.StudentProfile)
            .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentId == studentId);

        if (enrollment == null)
            return NotFound(new { message = "Khong tim thay sinh vien trong lop hoc phan." });

        var student = enrollment.Student;
        if (student.Role != UserRole.STUDENT)
            return BadRequest(new { message = "Tai khoan nay khong phai sinh vien." });

        var nextStudentCode = string.IsNullOrWhiteSpace(request.StudentCode)
            ? student.StudentProfile?.StudentCode
            : request.StudentCode.Trim().ToUpperInvariant();

        if (!string.IsNullOrWhiteSpace(nextStudentCode))
        {
            var duplicateCode = await _db.StudentProfiles
                .AnyAsync(sp => sp.UserId != studentId && sp.StudentCode.ToUpper() == nextStudentCode);

            if (duplicateCode)
                return BadRequest(new { message = "MSSV da duoc su dung boi sinh vien khac." });
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var nextEmail = request.Email.Trim();
            var duplicateEmail = await _db.Users
                .AnyAsync(u => u.Id != studentId && u.Email.ToLower() == nextEmail.ToLower());

            if (duplicateEmail)
                return BadRequest(new { message = "Email da duoc su dung boi tai khoan khac." });

            student.Email = nextEmail;
        }

        if (!string.IsNullOrWhiteSpace(request.FullName))
            student.FullName = request.FullName.Trim();

        if (student.StudentProfile == null)
        {
            student.StudentProfile = new StudentProfile
            {
                UserId = student.Id,
                StudentCode = nextStudentCode ?? "SV" + DateTime.UtcNow.Ticks.ToString()[^6..],
                AdministrativeClass = string.IsNullOrWhiteSpace(request.ClassName) ? "CNTT-K65" : request.ClassName.Trim(),
                Major = "Cong nghe Thong tin",
                EnrollmentYear = DateTime.UtcNow.Year
            };
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(nextStudentCode))
                student.StudentProfile.StudentCode = nextStudentCode;

            if (!string.IsNullOrWhiteSpace(request.ClassName))
                student.StudentProfile.AdministrativeClass = request.ClassName.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            var nextStatus = request.Status.Trim().ToUpperInvariant();
            if (nextStatus is not ("ACTIVE" or "SUSPENDED"))
                return BadRequest(new { message = "Trang thai sinh vien khong hop le." });

            enrollment.Status = nextStatus;
        }

        student.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(ToCourseStudentResponse(enrollment));
    }

    [HttpDelete("courses/{courseId}/students/{studentId}")]
    public async Task<IActionResult> RemoveStudentFromCourse(Guid courseId, Guid studentId)
    {
        var enrollment = await _db.Enrollments
            .Include(e => e.Student)
                .ThenInclude(s => s.StudentProfile)
            .Include(e => e.LessonProgresses)
            .Include(e => e.FinalGrade)
            .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentId == studentId);

        if (enrollment == null)
            return NotFound(new { message = "Khong tim thay sinh vien trong lop hoc phan." });

        var removedStudent = ToCourseStudentResponse(enrollment);

        if (enrollment.LessonProgresses.Any())
            _db.LessonProgresses.RemoveRange(enrollment.LessonProgresses);

        if (enrollment.FinalGrade != null)
            _db.FinalGrades.Remove(enrollment.FinalGrade);

        _db.Enrollments.Remove(enrollment);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Da xoa sinh vien khoi lop hoc phan.",
            student = removedStudent
        });
    }

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
            .Include(s => s.Files)
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
            fileUrl = s.FileUrl ?? "",
            gitRepoUrl = s.GitRepoUrl ?? "",
            submissionText = s.SubmissionText ?? "",
            files = s.Files.Select(f => new
            {
                id = f.Id.ToString(),
                fileName = f.FileName,
                fileUrl = f.FileUrl,
                fileSize = f.FileSize,
                fileType = f.FileType
            }).ToList(),
            grade = s.Grade.HasValue ? (double?)s.Grade.Value : null,
            feedback = s.Feedback,
            status = s.Status.ToString()
        });

        return Ok(result);
    }

    /// <summary>
    /// Download a submitted practice file with the student's original file name.
    /// </summary>
    [HttpGet("submission-files/{fileId}/download")]
    public async Task<IActionResult> DownloadSubmissionFile(Guid fileId)
    {
        var submissionFile = await _db.SubmissionFiles.FindAsync(fileId);
        if (submissionFile == null)
        {
            return NotFound("Khong tim thay tep bai nop.");
        }

        var storedFileName = Path.GetFileName(submissionFile.FileUrl);
        if (string.IsNullOrWhiteSpace(storedFileName))
        {
            return NotFound("Duong dan tep bai nop khong hop le.");
        }

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "submissions");
        var filePath = Path.Combine(uploadsFolder, storedFileName);
        if (!System.IO.File.Exists(filePath))
        {
            return NotFound("Tep bai nop khong con ton tai tren may chu.");
        }

        var contentType = string.IsNullOrWhiteSpace(submissionFile.FileType)
            ? "application/octet-stream"
            : submissionFile.FileType;

        return PhysicalFile(filePath, contentType, submissionFile.FileName);
    }

    /// <summary>
    /// Grade a student practice submission and save teacher feedback.
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
    /// Bảng điểm tổng kết học phần của các sinh viên - 100% dữ liệu thực từ CSDL
    /// </summary>
    [HttpGet("courses/{courseId}/gradebook")]
    public async Task<IActionResult> GetCourseGradebook(Guid courseId)
    {
        var course = await _db.Courses.FindAsync(courseId);
        if (course == null) return NotFound(new { message = "Khóa học không tồn tại." });

        var enrollments = await _db.Enrollments
            .Include(e => e.Student)
                .ThenInclude(s => s.StudentProfile)
            .Include(e => e.FinalGrade)
            .Where(e => e.CourseId == courseId)
            .OrderBy(e => e.Student.FullName)
            .ToListAsync();

        var assignmentIds = await _db.Assignments
            .Where(a => a.CourseId == courseId)
            .Select(a => a.Id)
            .ToListAsync();

        var submissions = await _db.Submissions
            .Where(s => assignmentIds.Contains(s.AssignmentId) && s.Grade.HasValue)
            .ToListAsync();

        var wAtt = course.WeightAttendance > 0 ? course.WeightAttendance : 10m;
        var wAss = course.WeightAssignments > 0 ? course.WeightAssignments : 30m;
        var wExam = course.WeightFinalExam > 0 ? course.WeightFinalExam : 60m;
        var totalWeight = wAtt + wAss + wExam;
        if (totalWeight <= 0) totalWeight = 100m;

        var result = enrollments.Select(e =>
        {
            var fg = e.FinalGrade;
            decimal att;
            decimal ass;
            decimal exam;
            decimal total;
            string letter;
            bool isPassed;

            if (fg != null)
            {
                att = fg.AttendanceScore;
                ass = fg.AssignmentsScore;
                exam = fg.FinalExamScore;
                total = fg.TotalScore;
                letter = fg.LetterGrade ?? CalculateGradeLetter(total);
                isPassed = fg.IsPassed;
            }
            else
            {
                // Tính toán điểm động từ dữ liệu CSDL thực tế
                att = Math.Round((e.ProgressPercentage / 10m), 2);
                var studentSubs = submissions.Where(s => s.StudentId == e.StudentId).ToList();
                ass = studentSubs.Any() ? Math.Round(studentSubs.Average(s => s.Grade!.Value), 2) : 0.0m;
                exam = 0.0m;
                total = Math.Round((att * wAtt + ass * wAss + exam * wExam) / totalWeight, 2);
                letter = CalculateGradeLetter(total);
                isPassed = total >= 4.0m;
            }

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
                totalScore = (double)total,
                letterGrade = letter,
                isPassed = isPassed,
                progressPercentage = (double)e.ProgressPercentage,
                isFinalized = fg != null
            };
        });

        return Ok(result);
    }

    /// <summary>
    /// Giảng viên cập nhật điểm tổng kết cho sinh viên trong lớp học phần
    /// </summary>
    [HttpPost("courses/{courseId}/gradebook/{studentId}")]
    public async Task<IActionResult> SaveStudentGrade(Guid courseId, Guid studentId, [FromBody] SaveStudentGradeDto request)
    {
        var course = await _db.Courses.FindAsync(courseId);
        if (course == null) return NotFound(new { message = "Khóa học không tồn tại." });

        var enrollment = await _db.Enrollments
            .Include(e => e.FinalGrade)
            .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentId == studentId);

        if (enrollment == null) return NotFound(new { message = "Sinh viên chưa ghi danh trong khóa học." });

        var wAtt = course.WeightAttendance > 0 ? course.WeightAttendance : 10m;
        var wAss = course.WeightAssignments > 0 ? course.WeightAssignments : 30m;
        var wExam = course.WeightFinalExam > 0 ? course.WeightFinalExam : 60m;
        var totalWeight = wAtt + wAss + wExam;
        if (totalWeight <= 0) totalWeight = 100m;

        var att = Math.Clamp(request.AttendanceScore, 0.0m, 10.0m);
        var ass = Math.Clamp(request.AssignmentScore, 0.0m, 10.0m);
        var exam = Math.Clamp(request.ExamScore, 0.0m, 10.0m);
        var total = Math.Round((att * wAtt + ass * wAss + exam * wExam) / totalWeight, 2);
        var letter = CalculateGradeLetter(total);
        var isPassed = total >= 4.0m;

        if (enrollment.FinalGrade == null)
        {
            enrollment.FinalGrade = new FinalGrade
            {
                Id = Guid.NewGuid(),
                EnrollmentId = enrollment.Id,
                AttendanceScore = att,
                AssignmentsScore = ass,
                FinalExamScore = exam,
                TotalScore = total,
                LetterGrade = letter,
                IsPassed = isPassed,
                FinalizedAt = DateTime.UtcNow
            };
            _db.FinalGrades.Add(enrollment.FinalGrade);
        }
        else
        {
            enrollment.FinalGrade.AttendanceScore = att;
            enrollment.FinalGrade.AssignmentsScore = ass;
            enrollment.FinalGrade.FinalExamScore = exam;
            enrollment.FinalGrade.TotalScore = total;
            enrollment.FinalGrade.LetterGrade = letter;
            enrollment.FinalGrade.IsPassed = isPassed;
            enrollment.FinalGrade.FinalizedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            studentId = studentId.ToString(),
            courseId = courseId.ToString(),
            attendanceScore = (double)att,
            assignmentScore = (double)ass,
            examScore = (double)exam,
            totalScore = (double)total,
            letterGrade = letter,
            isPassed = isPassed,
            message = "Đã lưu bảng điểm sinh viên thành công vào CSDL!"
        });
    }

    private static string CalculateGradeLetter(decimal totalScore)
    {
        if (totalScore >= 9.0m) return "A+";
        if (totalScore >= 8.5m) return "A";
        if (totalScore >= 8.0m) return "B+";
        if (totalScore >= 7.0m) return "B";
        if (totalScore >= 6.5m) return "C+";
        if (totalScore >= 5.5m) return "C";
        if (totalScore >= 5.0m) return "D+";
        if (totalScore >= 4.0m) return "D";
        return "F";
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

        var allEnrollments = courses.SelectMany(c => c.Enrollments).ToList();
        double averageProgress = allEnrollments.Any()
            ? Math.Round((double)allEnrollments.Average(e => (double)e.ProgressPercentage), 0)
            : 0;

        var courseIds = courses.Select(c => c.Id).ToList();
        var recentSubmissions = await _db.Submissions
            .Include(s => s.Assignment)
                .ThenInclude(a => a.Course)
            .Include(s => s.Student)
                .ThenInclude(st => st.StudentProfile)
            .Include(s => s.Files)
            .Where(s => courseIds.Contains(s.Assignment.CourseId))
            .OrderByDescending(s => s.SubmittedAt)
            .Take(10)
            .Select(s => new
            {
                id = s.Id.ToString(),
                courseId = s.Assignment.CourseId.ToString(),
                courseCode = s.Assignment.Course.CourseCode,
                assignmentTitle = s.Assignment.Title,
                studentName = s.Student.FullName,
                studentCode = s.Student.StudentProfile != null ? s.Student.StudentProfile.StudentCode : "SV2024",
                submittedAt = s.SubmittedAt.ToString("yyyy-MM-dd HH:mm"),
                fileUrl = s.FileUrl ?? "",
                gitRepoUrl = s.GitRepoUrl ?? "",
                submissionText = s.SubmissionText ?? "",
                grade = s.Grade.HasValue ? (double?)s.Grade.Value : null,
                feedback = s.Feedback,
                status = s.Status.ToString()
            })
            .ToListAsync();

        return Ok(new
        {
            totalCourses,
            totalStudents,
            pendingSubmissions,
            averageProgress,
            recentSubmissions
        });
    }

    /// <summary>
    /// Giảng viên cập nhật hoặc gỡ bỏ mật khẩu ghi danh của khóa học
    /// </summary>
    [HttpPost("courses/{courseId}/password")]
    public async Task<IActionResult> UpdateCoursePassword(Guid courseId, [FromBody] UpdateCoursePasswordDto request)
    {
        var course = await _db.Courses.FindAsync(courseId);
        if (course == null) return NotFound(new { message = "Không tìm thấy khóa học." });

        course.EnrollmentPassword = string.IsNullOrWhiteSpace(request.Password) ? null : request.Password.Trim();
        course.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            courseId = course.Id.ToString(),
            hasPassword = !string.IsNullOrEmpty(course.EnrollmentPassword),
            accessPassword = course.EnrollmentPassword,
            message = string.IsNullOrEmpty(course.EnrollmentPassword)
                ? "Đã gỡ bỏ mật khẩu ghi danh khóa học."
                : "Đã cập nhật mật khẩu ghi danh khóa học thành công trong CSDL!"
        });
    }
}

public record UpdateCoursePasswordDto(string? Password);
public record CreateTeacherCourseDto(string CourseCode, string Title, string? Description, decimal WeightAttendance = 10, decimal WeightAssignments = 30, decimal WeightFinalExam = 60, string? Password = null);

public class CreateTeacherLessonDto
{
    public int WeekNumber { get; set; } = 1;
    public string ActivityType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int DurationMinutes { get; set; } = 45;
    public string? ResourceUrl { get; set; }
    public string? Subtitle { get; set; }
    public string? FileName { get; set; }
    public string? Description { get; set; }
    public string? Password { get; set; }
    public string? DueDate { get; set; }
    public bool? IsLocked { get; set; }
    public TeacherQuizDataDto? QuizData { get; set; }
}

public class UpdateTeacherLessonDto
{
    public int WeekNumber { get; set; } = 1;
    public string ActivityType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int DurationMinutes { get; set; } = 45;
    public string? ResourceUrl { get; set; }
    public string? Subtitle { get; set; }
    public string? FileName { get; set; }
    public string? Description { get; set; }
    public string? Password { get; set; }
    public string? DueDate { get; set; }
    public bool? IsLocked { get; set; }
    public TeacherQuizDataDto? QuizData { get; set; }
}

public class TeacherQuizDataDto
{
    public decimal PassingScore { get; set; } = 7.00m;
    public decimal MaxScore { get; set; } = 10.00m;
    public int TimeLimitMinutes { get; set; } = 15;
    public string? Password { get; set; }
    public List<TeacherQuizQuestionDto> Questions { get; set; } = new();
}

public class TeacherQuizQuestionDto
{
    public Guid? Id { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public decimal Points { get; set; } = 1.00m;
    public string? Explanation { get; set; }
    public List<TeacherQuizOptionDto> Options { get; set; } = new();
}

public class TeacherQuizOptionDto
{
    public Guid? Id { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; } = false;
    public string? Explanation { get; set; }
}

public record AddStudentToCourseDto(string StudentCode, string FullName, string Email, string ClassName);

public class UpdateCourseStudentDto
{
    public string? StudentCode { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? ClassName { get; set; }
    public string? Status { get; set; }
}

public record GradeSubmissionRequestDto(decimal Grade, string? Feedback);
public record CreateAnnouncementDto(string Title, string Content, bool IsPinned = false);
public record SaveStudentGradeDto(decimal AttendanceScore, decimal AssignmentScore, decimal ExamScore);
public record ImportStudentsRequestDto(List<AddStudentToCourseDto> Students);


