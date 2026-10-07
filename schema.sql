-- ===================================================================================
-- HỆ THỐNG QUẢN LÝ HỌC TẬP (LEARNING MANAGEMENT SYSTEM - LMS)
-- CƠ SỞ DỮ LIỆU ĐẦY ĐỦ (COMPLETE DATABASE CREATION, TABLES DDL & SEED DATA)
-- Hệ quản trị CSDL: Microsoft SQL Server (T-SQL / SSMS / Azure SQL)
-- Tên Cơ sở dữ liệu: lms_db
-- ===================================================================================

-- ===================================================================================
-- PHẦN 0: TẠO CƠ SỞ DỮ LIỆU (CREATE DATABASE) VÀ KẾT NỐI VÀO CSDL
-- ===================================================================================
USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'lms_db')
BEGIN
    CREATE DATABASE [lms_db];
END
GO

USE [lms_db];
GO

-- ===================================================================================
-- PHẦN I: XÓA CÁC BẢNG CŨ THEO THỨ TỰ QUAN HỆ PHỤ THUỘC (CHILD -> PARENT)
-- ===================================================================================
IF OBJECT_ID(N'dbo.notifications', N'U') IS NOT NULL DROP TABLE dbo.notifications;
IF OBJECT_ID(N'dbo.announcement_comments', N'U') IS NOT NULL DROP TABLE dbo.announcement_comments;
IF OBJECT_ID(N'dbo.announcements', N'U') IS NOT NULL DROP TABLE dbo.announcements;
IF OBJECT_ID(N'dbo.submission_files', N'U') IS NOT NULL DROP TABLE dbo.submission_files;
IF OBJECT_ID(N'dbo.submissions', N'U') IS NOT NULL DROP TABLE dbo.submissions;
IF OBJECT_ID(N'dbo.assignments', N'U') IS NOT NULL DROP TABLE dbo.assignments;
IF OBJECT_ID(N'dbo.quiz_attempt_answers', N'U') IS NOT NULL DROP TABLE dbo.quiz_attempt_answers;
IF OBJECT_ID(N'dbo.quiz_attempts', N'U') IS NOT NULL DROP TABLE dbo.quiz_attempts;
IF OBJECT_ID(N'dbo.quiz_options', N'U') IS NOT NULL DROP TABLE dbo.quiz_options;
IF OBJECT_ID(N'dbo.quiz_questions', N'U') IS NOT NULL DROP TABLE dbo.quiz_questions;
IF OBJECT_ID(N'dbo.quizzes', N'U') IS NOT NULL DROP TABLE dbo.quizzes;
IF OBJECT_ID(N'dbo.lesson_progress', N'U') IS NOT NULL DROP TABLE dbo.lesson_progress;
IF OBJECT_ID(N'dbo.lessons', N'U') IS NOT NULL DROP TABLE dbo.lessons;
IF OBJECT_ID(N'dbo.course_sections', N'U') IS NOT NULL DROP TABLE dbo.course_sections;
IF OBJECT_ID(N'dbo.final_grades', N'U') IS NOT NULL DROP TABLE dbo.final_grades;
IF OBJECT_ID(N'dbo.enrollments', N'U') IS NOT NULL DROP TABLE dbo.enrollments;
IF OBJECT_ID(N'dbo.courses', N'U') IS NOT NULL DROP TABLE dbo.courses;
IF OBJECT_ID(N'dbo.teacher_profiles', N'U') IS NOT NULL DROP TABLE dbo.teacher_profiles;
IF OBJECT_ID(N'dbo.student_profiles', N'U') IS NOT NULL DROP TABLE dbo.student_profiles;
IF OBJECT_ID(N'dbo.users', N'U') IS NOT NULL DROP TABLE dbo.users;
GO

-- ===================================================================================
-- PHẦN II: TẠO CÁC BẢNG DỮ LIỆU (TABLE DEFINITIONS - DDL)
-- ===================================================================================

-- -----------------------------------------------------------------------------------
-- 1. BẢNG USERS (Tài khoản người dùng hệ thống)
-- Quản lý tài khoản: Admin, Giảng viên (Teacher) và Sinh viên (Student).
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(500) NOT NULL,
    full_name NVARCHAR(150) NOT NULL,
    phone VARCHAR(20) NULL,
    avatar_url VARCHAR(500) NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT')),
    is_active BIT NOT NULL DEFAULT 1,
    refresh_token NVARCHAR(MAX) NULL,
    refresh_token_expiry_time DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- -----------------------------------------------------------------------------------
-- 2. BẢNG STUDENT_PROFILES (Hồ sơ sinh viên - Quan hệ 1:1 với Users)
-- Chứa thông tin chuyên biệt: Mã SV, Lớp sinh hoạt, Niên khóa, Ngành học...
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.student_profiles (
    user_id UNIQUEIDENTIFIER PRIMARY KEY,
    student_code VARCHAR(50) NOT NULL UNIQUE, -- MSSV (Mã số sinh viên)
    administrative_class NVARCHAR(100) NULL,  -- Lớp hành chính/sinh hoạt (vd: K65-CNTT)
    enrollment_year INT NULL,                 -- Năm nhập học
    major NVARCHAR(150) NULL,                 -- Ngành học
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_student_profile_user FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO

-- -----------------------------------------------------------------------------------
-- 3. BẢNG TEACHER_PROFILES (Hồ sơ giảng viên - Quan hệ 1:1 với Users)
-- Chứa thông tin chuyên biệt: Mã GV, Khoa/Bộ môn, Học hàm/Học vị...
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.teacher_profiles (
    user_id UNIQUEIDENTIFIER PRIMARY KEY,
    teacher_code VARCHAR(50) NOT NULL UNIQUE, -- Mã cán bộ giảng viên
    department NVARCHAR(150) NULL,            -- Khoa hoặc Bộ môn công tác
    academic_title NVARCHAR(100) NULL,        -- Học vị/Học hàm (ThS, TS, PGS, GS...)
    bio NVARCHAR(MAX) NULL,                   -- Tiểu sử tóm tắt
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_teacher_profile_user FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO

-- -----------------------------------------------------------------------------------
-- 4. BẢNG COURSES (Khóa học / Lớp học phần)
-- Đại diện cho một môn học được mở giảng dạy trong học kỳ.
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.courses (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    course_code VARCHAR(50) NOT NULL,        -- Mã học phần (vd: INT3306)
    title NVARCHAR(255) NOT NULL,            -- Tên học phần
    description NVARCHAR(MAX) NULL,
    thumbnail_url VARCHAR(500) NULL,
    teacher_id UNIQUEIDENTIFIER NOT NULL,    -- Giảng viên phụ trách
    is_published BIT NOT NULL DEFAULT 0,
    weight_attendance NUMERIC(5,2) NOT NULL DEFAULT 10.00,  -- % Trọng số điểm chuyên cần
    weight_assignments NUMERIC(5,2) NOT NULL DEFAULT 30.00, -- % Trọng số điểm bài tập
    weight_final_exam NUMERIC(5,2) NOT NULL DEFAULT 60.00,  -- % Trọng số điểm thi kết thúc
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_course_teacher FOREIGN KEY (teacher_id) REFERENCES dbo.users(id) ON DELETE NO ACTION,
    CONSTRAINT chk_course_weights CHECK (weight_attendance + weight_assignments + weight_final_exam = 100.00)
);
GO

-- -----------------------------------------------------------------------------------
-- 5. BẢNG COURSE_SECTIONS (Chương mục / Tuần học trong khóa học)
-- Phân cấp học phần thành từng Tuần (Week 1, Week 2...) hoặc từng Chương học.
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.course_sections (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    course_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(200) NOT NULL,            -- Tiêu đề: Tuần 1, Chương 1...
    order_index INT NOT NULL DEFAULT 1,
    is_locked BIT NOT NULL DEFAULT 0,
    is_expanded BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_section_course FOREIGN KEY (course_id) REFERENCES dbo.courses(id) ON DELETE CASCADE
);
GO

-- -----------------------------------------------------------------------------------
-- 6. BẢNG LESSONS (Bài học & Hoạt động học phần)
-- Đại diện cho từng hoạt động: Video, SCORM, Slide PDF, Luyện tập nộp file, Trắc nghiệm...
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.lessons (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    course_id UNIQUEIDENTIFIER NOT NULL,
    section_id UNIQUEIDENTIFIER NULL,        -- Thuộc chương/tuần nào
    title NVARCHAR(255) NOT NULL,
    order_index INT NOT NULL DEFAULT 1,
    content_type VARCHAR(30) NOT NULL DEFAULT 'VIDEO' 
        CHECK (content_type IN ('OVERVIEW', 'SCORM', 'PDF', 'DOCX', 'LINK', 'ANNOUNCEMENT', 'PRACTICE', 'QUIZ', 'VIDEO', 'TEXT')),
    subtitle NVARCHAR(50) NULL,              -- Nhãn phụ: PDF, DOCX, SCORM...
    content_url VARCHAR(1000) NULL,          -- Link slide, youtube iframe, file download...
    body_markdown NVARCHAR(MAX) NULL,        -- Nội dung văn bản / markdown
    is_locked BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_lesson_course FOREIGN KEY (course_id) REFERENCES dbo.courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_lesson_section FOREIGN KEY (section_id) REFERENCES dbo.course_sections(id) ON DELETE NO ACTION
);
GO

-- -----------------------------------------------------------------------------------
-- 7. BẢNG ENROLLMENTS (Ghi danh / Đăng ký học phần)
-- Liên kết sinh viên tham gia khóa học, ghi nhận tiến độ % hoàn thành.
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.enrollments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    course_id UNIQUEIDENTIFIER NOT NULL,
    student_id UNIQUEIDENTIFIER NOT NULL,
    enrolled_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    progress_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    is_completed BIT NOT NULL DEFAULT 0,
    completed_at DATETIME2 NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'DROPPED')),
    CONSTRAINT fk_enrollment_course FOREIGN KEY (course_id) REFERENCES dbo.courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES dbo.users(id) ON DELETE NO ACTION,
    CONSTRAINT uq_enrollment UNIQUE (course_id, student_id)
);
GO

-- -----------------------------------------------------------------------------------
-- 8. BẢNG LESSON_PROGRESS (Tiến độ học tập từng bài của sinh viên)
-- Lưu trạng thái hoàn thành (To do -> Done) của từng sinh viên đối với mỗi hoạt động.
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.lesson_progress (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    enrollment_id UNIQUEIDENTIFIER NOT NULL,
    lesson_id UNIQUEIDENTIFIER NOT NULL,
    is_completed BIT NOT NULL DEFAULT 0,
    quiz_passed BIT NOT NULL DEFAULT 0,
    completed_at DATETIME2 NULL,
    last_accessed_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_progress_enrollment FOREIGN KEY (enrollment_id) REFERENCES dbo.enrollments(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_lesson FOREIGN KEY (lesson_id) REFERENCES dbo.lessons(id) ON DELETE NO ACTION,
    CONSTRAINT uq_enrollment_lesson UNIQUE (enrollment_id, lesson_id)
);
GO

-- -----------------------------------------------------------------------------------
-- 9. BẢNG FINAL_GRADES (Bảng điểm tổng kết học phần)
-- Tổng hợp điểm Chuyên cần, Điểm Bài tập, Điểm Cuối kỳ theo cơ cấu trọng số.
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.final_grades (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    enrollment_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
    attendance_score NUMERIC(4,2) NOT NULL DEFAULT 0.00 CHECK (attendance_score BETWEEN 0 AND 10),
    assignments_score NUMERIC(4,2) NOT NULL DEFAULT 0.00 CHECK (assignments_score BETWEEN 0 AND 10),
    final_exam_score NUMERIC(4,2) NOT NULL DEFAULT 0.00 CHECK (final_exam_score BETWEEN 0 AND 10),
    total_score NUMERIC(4,2) NOT NULL DEFAULT 0.00 CHECK (total_score BETWEEN 0 AND 10),
    letter_grade VARCHAR(5) NULL CHECK (letter_grade IN ('A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F')),
    is_passed BIT NOT NULL DEFAULT 0,
    finalized_at DATETIME2 NULL,
    graded_by UNIQUEIDENTIFIER NULL,
    CONSTRAINT fk_final_grade_enrollment FOREIGN KEY (enrollment_id) REFERENCES dbo.enrollments(id) ON DELETE CASCADE,
    CONSTRAINT fk_final_grade_grader FOREIGN KEY (graded_by) REFERENCES dbo.users(id) ON DELETE NO ACTION
);
GO

-- -----------------------------------------------------------------------------------
-- 10. BẢNG QUIZZES (Đề thi / Bài kiểm tra trắc nghiệm)
-- Gắn liền với một bài học (1:1), có mật khẩu mở đề, điểm đạt và thời gian làm bài.
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.quizzes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    lesson_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    password VARCHAR(100) NULL,              -- Mật khẩu bài trắc nghiệm (vd: 123456)
    passing_score NUMERIC(4,2) NOT NULL DEFAULT 7.00,
    max_score NUMERIC(4,2) NOT NULL DEFAULT 10.00,
    time_limit_minutes INT NULL,             -- Thời gian tính theo phút
    max_attempts INT DEFAULT 3,              -- Số lần làm tối đa
    shuffle_questions BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_quiz_lesson FOREIGN KEY (lesson_id) REFERENCES dbo.lessons(id) ON DELETE CASCADE
);
GO

-- -----------------------------------------------------------------------------------
-- 11. BẢNG QUIZ_QUESTIONS (Ngân hàng câu hỏi trắc nghiệm của đề thi)
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.quiz_questions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    quiz_id UNIQUEIDENTIFIER NOT NULL,
    question_text NVARCHAR(MAX) NOT NULL,
    question_type VARCHAR(30) NOT NULL DEFAULT 'SINGLE_CHOICE' 
        CHECK (question_type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE')),
    points NUMERIC(4,2) NOT NULL DEFAULT 1.00,
    order_index INT NOT NULL DEFAULT 1,
    explanation NVARCHAR(MAX) NULL,          -- Giải thích đáp án sau khi làm
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES dbo.quizzes(id) ON DELETE CASCADE
);
GO

-- -----------------------------------------------------------------------------------
-- 12. BẢNG QUIZ_OPTIONS (Các lựa chọn đáp án của câu hỏi)
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.quiz_options (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    question_id UNIQUEIDENTIFIER NOT NULL,
    option_text NVARCHAR(MAX) NOT NULL,
    is_correct BIT NOT NULL DEFAULT 0,
    explanation NVARCHAR(MAX) NULL,
    CONSTRAINT fk_option_question FOREIGN KEY (question_id) REFERENCES dbo.quiz_questions(id) ON DELETE CASCADE
);
GO

-- -----------------------------------------------------------------------------------
-- 13. BẢNG QUIZ_ATTEMPTS (Lượt làm bài trắc nghiệm của sinh viên)
-- Lưu trữ mỗi lần sinh viên ấn nộp bài trắc nghiệm.
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.quiz_attempts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    quiz_id UNIQUEIDENTIFIER NOT NULL,
    student_id UNIQUEIDENTIFIER NOT NULL,
    attempt_number INT NOT NULL DEFAULT 1,
    score_achieved NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    is_passed BIT NOT NULL DEFAULT 0,
    started_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    submitted_at DATETIME2 NULL,
    CONSTRAINT fk_attempt_quiz FOREIGN KEY (quiz_id) REFERENCES dbo.quizzes(id) ON DELETE CASCADE,
    CONSTRAINT fk_attempt_student FOREIGN KEY (student_id) REFERENCES dbo.users(id) ON DELETE NO ACTION
);
GO

-- -----------------------------------------------------------------------------------
-- 14. BẢNG QUIZ_ATTEMPT_ANSWERS (Chi tiết câu trả lời trong lượt làm bài)
-- Lưu lại sinh viên đã chọn phương án nào cho từng câu hỏi để đối soát / phúc khảo.
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.quiz_attempt_answers (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    attempt_id UNIQUEIDENTIFIER NOT NULL,
    question_id UNIQUEIDENTIFIER NOT NULL,
    selected_option_id UNIQUEIDENTIFIER NULL,
    is_correct BIT NOT NULL DEFAULT 0,
    points_earned NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_ans_attempt FOREIGN KEY (attempt_id) REFERENCES dbo.quiz_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_ans_question FOREIGN KEY (question_id) REFERENCES dbo.quiz_questions(id) ON DELETE NO ACTION,
    CONSTRAINT fk_ans_option FOREIGN KEY (selected_option_id) REFERENCES dbo.quiz_options(id) ON DELETE NO ACTION
);
GO

-- -----------------------------------------------------------------------------------
-- 15. BẢNG ASSIGNMENTS (Bài tập thực hành / Bài tập lớn)
-- Đề bài tập thực hành được giao cho lớp học.
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.assignments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    course_id UNIQUEIDENTIFIER NOT NULL,
    lesson_id UNIQUEIDENTIFIER NULL,         -- Hoạt động tương ứng kiểu PRACTICE
    title NVARCHAR(255) NOT NULL,
    instructions NVARCHAR(MAX) NOT NULL,     -- Yêu cầu thực hành chi tiết
    attachment_url VARCHAR(500) NULL,        -- File tài liệu đính kèm đề bài
    due_date DATETIME2 NOT NULL,
    max_score NUMERIC(4,2) NOT NULL DEFAULT 10.00,
    allow_git_repo BIT NOT NULL DEFAULT 1,   -- Cho phép gửi link GitHub/GitLab
    allowed_extensions VARCHAR(150) DEFAULT '.zip,.rar,.7z,.pdf,.docx',
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_assignment_course FOREIGN KEY (course_id) REFERENCES dbo.courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_lesson FOREIGN KEY (lesson_id) REFERENCES dbo.lessons(id) ON DELETE NO ACTION
);
GO

-- -----------------------------------------------------------------------------------
-- 16. BẢNG SUBMISSIONS (Bài nộp của sinh viên)
-- Quản lý trạng thái nộp bài, điểm số và nhận xét từ giảng viên.
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.submissions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    assignment_id UNIQUEIDENTIFIER NOT NULL,
    student_id UNIQUEIDENTIFIER NOT NULL,
    submission_text NVARCHAR(MAX) NULL,      -- Ghi chú / Lời nhắn của sinh viên
    file_url VARCHAR(1000) NULL,             -- Đường dẫn file bài nộp (nếu có)
    git_repo_url VARCHAR(500) NULL,          -- Link GitHub/GitLab repository
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED' 
        CHECK (status IN ('DRAFT', 'SUBMITTED', 'LATE', 'GRADED')),
    grade NUMERIC(4,2) NULL CHECK (grade BETWEEN 0 AND 10),
    feedback NVARCHAR(MAX) NULL,             -- Nhận xét / Góp ý của giảng viên
    graded_by UNIQUEIDENTIFIER NULL,         -- Giảng viên thực hiện chấm
    submitted_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    graded_at DATETIME2 NULL,
    CONSTRAINT fk_submission_assignment FOREIGN KEY (assignment_id) REFERENCES dbo.assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_submission_student FOREIGN KEY (student_id) REFERENCES dbo.users(id) ON DELETE NO ACTION,
    CONSTRAINT fk_submission_grader FOREIGN KEY (graded_by) REFERENCES dbo.users(id) ON DELETE NO ACTION,
    CONSTRAINT uq_assignment_student UNIQUE (assignment_id, student_id)
);
GO

-- -----------------------------------------------------------------------------------
-- 17. BẢNG SUBMISSION_FILES (Tệp tin đính kèm bài nộp)
-- Hỗ trợ 1 bài nộp có thể đính kèm nhiều file (.zip, .pdf, .docx...) với kích thước tệp.
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.submission_files (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    submission_id UNIQUEIDENTIFIER NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,     -- Kích thước file (bytes)
    file_type VARCHAR(100) NULL,
    uploaded_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_sub_file_submission FOREIGN KEY (submission_id) REFERENCES dbo.submissions(id) ON DELETE CASCADE
);
GO

-- -----------------------------------------------------------------------------------
-- 18. BẢNG ANNOUNCEMENTS (Bảng tin thông báo của khóa học)
-- Giảng viên đăng tải thông báo quan trọng cho cả lớp.
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.announcements (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    course_id UNIQUEIDENTIFIER NOT NULL,
    teacher_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    is_pinned BIT NOT NULL DEFAULT 0,
    attachment_url VARCHAR(500) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_announcement_course FOREIGN KEY (course_id) REFERENCES dbo.courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_announcement_teacher FOREIGN KEY (teacher_id) REFERENCES dbo.users(id) ON DELETE NO ACTION
);
GO

-- -----------------------------------------------------------------------------------
-- 19. BẢNG ANNOUNCEMENT_COMMENTS (Thảo luận & Bình luận thông báo / Diễn đàn)
-- Sinh viên và giảng viên tương tác, đặt câu hỏi dưới từng thông báo.
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.announcement_comments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    announcement_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_comment_announcement FOREIGN KEY (announcement_id) REFERENCES dbo.announcements(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE NO ACTION
);
GO

-- -----------------------------------------------------------------------------------
-- 20. BẢNG NOTIFICATIONS (Thông báo cá nhân cho người dùng)
-- Gửi thông báo đến chuông thông báo cá nhân (nhắc hạn nộp bài, điểm mới...).
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.notifications (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'SYSTEM' 
        CHECK (type IN ('SYSTEM', 'DEADLINE', 'GRADE', 'ANNOUNCEMENT', 'COURSE')),
    is_read BIT NOT NULL DEFAULT 0,
    link_url VARCHAR(500) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO

-- ===================================================================================
-- PHẦN III: TẠO CÁC CHỈ MỤC TĂNG TỐC TRUY VẤN (INDEXES FOR HIGH PERFORMANCE)
-- ===================================================================================
CREATE NONCLUSTERED INDEX idx_users_email ON dbo.users(email);
CREATE NONCLUSTERED INDEX idx_users_role ON dbo.users(role);
CREATE NONCLUSTERED INDEX idx_student_code ON dbo.student_profiles(student_code);
CREATE NONCLUSTERED INDEX idx_teacher_code ON dbo.teacher_profiles(teacher_code);

CREATE NONCLUSTERED INDEX idx_courses_teacher ON dbo.courses(teacher_id);
CREATE NONCLUSTERED INDEX idx_courses_code ON dbo.courses(course_code);
CREATE NONCLUSTERED INDEX idx_sections_course ON dbo.course_sections(course_id, order_index);
CREATE NONCLUSTERED INDEX idx_lessons_course ON dbo.lessons(course_id, order_index);
CREATE NONCLUSTERED INDEX idx_lessons_section ON dbo.lessons(section_id);

CREATE NONCLUSTERED INDEX idx_enrollments_student ON dbo.enrollments(student_id);
CREATE NONCLUSTERED INDEX idx_enrollments_course ON dbo.enrollments(course_id);
CREATE NONCLUSTERED INDEX idx_progress_enrollment ON dbo.lesson_progress(enrollment_id);

CREATE NONCLUSTERED INDEX idx_quizzes_lesson ON dbo.quizzes(lesson_id);
CREATE NONCLUSTERED INDEX idx_questions_quiz ON dbo.quiz_questions(quiz_id);
CREATE NONCLUSTERED INDEX idx_options_question ON dbo.quiz_options(question_id);
CREATE NONCLUSTERED INDEX idx_attempts_quiz_student ON dbo.quiz_attempts(quiz_id, student_id);

CREATE NONCLUSTERED INDEX idx_assignments_course ON dbo.assignments(course_id);
CREATE NONCLUSTERED INDEX idx_assignments_due_date ON dbo.assignments(due_date);
CREATE NONCLUSTERED INDEX idx_submissions_assignment ON dbo.submissions(assignment_id);
CREATE NONCLUSTERED INDEX idx_submissions_student ON dbo.submissions(student_id);
CREATE NONCLUSTERED INDEX idx_sub_files_submission ON dbo.submission_files(submission_id);

CREATE NONCLUSTERED INDEX idx_announcements_course ON dbo.announcements(course_id);
CREATE NONCLUSTERED INDEX idx_notifications_user_unread ON dbo.notifications(user_id, is_read);
GO

-- ===================================================================================
-- PHẦN IV: DỮ LIỆU KHỞI TẠO MẪU (SEED DATA SẴN SÀNG SỬ DỤNG)
-- ===================================================================================

-- 1. Chèn Tài khoản Người dùng
INSERT INTO dbo.users (id, email, password_hash, full_name, role, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@lms.edu.vn', 'admin123', N'Hệ thống Quản trị viên', 'ADMIN', 1),
('22222222-2222-2222-2222-222222222222', 'teacher@lms.edu.vn', 'teacher123', N'TS. Nguyễn Văn A', 'TEACHER', 1),
('33333333-3333-3333-3333-333333333333', 'student@lms.edu.vn', 'student123', N'Trần Thị B', 'STUDENT', 1);

-- 2. Chèn Hồ sơ Giảng viên và Sinh viên
INSERT INTO dbo.teacher_profiles (user_id, teacher_code, department, academic_title, bio) VALUES
('22222222-2222-2222-2222-222222222222', 'GV001', N'Khoa Công nghệ Thông tin', N'Phó Giáo Sư', N'Chuyên gia Kiến trúc phần mềm & Web Cloud');

INSERT INTO dbo.student_profiles (user_id, student_code, administrative_class, enrollment_year, major) VALUES
('33333333-3333-3333-3333-333333333333', 'SV2024001', N'CNTT-K65', 2024, N'Kỹ thuật Phần mềm');

-- 3. Chèn Khóa học
INSERT INTO dbo.courses (id, course_code, title, description, thumbnail_url, teacher_id, is_published, weight_attendance, weight_assignments, weight_final_exam) VALUES
('44444444-4444-4444-4444-444444444444', 'INT3306', N'20241_Phát triển ứng dụng Mobile đa nền tảng (2+1)_12626W.1', N'Khóa học kiến trúc Fullstack Client-Server và Mobile đa nền tảng hiện đại.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800', '22222222-2222-2222-2222-222222222222', 1, 10.00, 30.00, 60.00);

-- 4. Chèn Ghi danh học phần
INSERT INTO dbo.enrollments (id, course_id, student_id, progress_percentage, is_completed, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 25.00, 0, 'ACTIVE');

-- 5. Chèn Phân mục Chương / Tuần học
INSERT INTO dbo.course_sections (id, course_id, title, order_index, is_locked, is_expanded) VALUES
('bbbbbbbb-0001-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', N'Giới thiệu chung & Tài liệu học phần', 1, 0, 1),
('bbbbbbbb-0002-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', N'Week 1: 24 August - 30 August', 2, 0, 1),
('bbbbbbbb-0003-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', N'Week 2: 31 August - 6 September', 3, 1, 0);

-- 6. Chèn Hoạt động / Bài học
INSERT INTO dbo.lessons (id, course_id, section_id, title, order_index, content_type, subtitle, content_url, is_locked) VALUES
('55555555-0001-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-0001-0000-0000-000000000001', N'Thông tin tổng quan học phần: Phát triển ứng dụng Mobile & Web đa nền tảng', 1, 'OVERVIEW', NULL, NULL, 0),
('55555555-0002-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-0001-0000-0000-000000000001', N'Scorm giới thiệu tổng quan học phần lập trình ứng dụng', 2, 'SCORM', 'SCORM', 'https://www.youtube.com/embed/d95475151', 0),
('55555555-0003-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-0001-0000-0000-000000000001', N'Đề cương chi tiết học phần', 3, 'PDF', 'PDF', 'https://example.com/docs/de-cuong.pdf', 0),
('55555555-0004-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-0001-0000-0000-000000000001', N'Danh sách đề tài Bài tập lớn (gợi ý)', 4, 'DOCX', 'DOCX', 'https://example.com/docs/de-tai-btl.docx', 0),
-- Tuần 1
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-0002-0000-0000-000000000002', N'Bài 1: Bài giảng SCORM Tổng quan Clean Architecture & Web API', 1, 'SCORM', 'SCORM', 'https://www.youtube.com/embed/d95475151', 0),
('55555555-0005-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-0002-0000-0000-000000000002', N'Tài liệu (file pdf) cho bài học 1', 2, 'PDF', 'PDF', 'https://example.com/docs/week1.pdf', 0),
('55555555-0006-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-0002-0000-0000-000000000002', N'Luyện tập 1: Xây dựng Endpoint RESTful API với C# .NET 8', 3, 'PRACTICE', 'PRACTICE', NULL, 0),
('55555555-0007-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-0002-0000-0000-000000000002', N'Bài trắc nghiệm đánh giá thường xuyên Bài 1', 4, 'QUIZ', 'QUIZ', NULL, 0);

-- 7. Chèn Đề kiểm tra trắc nghiệm & Câu hỏi
INSERT INTO dbo.quizzes (id, lesson_id, title, description, password, passing_score, max_score, time_limit_minutes, max_attempts) VALUES
('66666666-6666-6666-6666-666666666666', '55555555-0007-0000-0000-000000000001', N'Bài trắc nghiệm đánh giá thường xuyên Bài 1', N'Đề kiểm tra trắc nghiệm kiến thức Tuần 1. Đạt >= 7.0 điểm sẽ mở khóa Tuần 2.', '123456', 7.00, 10.00, 15, 3);

INSERT INTO dbo.quiz_questions (id, quiz_id, question_text, question_type, points, order_index) VALUES
('77777777-1111-0000-0000-000000000001', '66666666-6666-6666-6666-666666666666', N'Thành phần nào thuộc tầng Domain trong Clean Architecture?', 'SINGLE_CHOICE', 5.00, 1),
('77777777-2222-0000-0000-000000000002', '66666666-6666-6666-6666-666666666666', N'HTTP Method nào là phương thức chuẩn dùng cho việc tạo mới tài nguyên?', 'SINGLE_CHOICE', 5.00, 2);

INSERT INTO dbo.quiz_options (id, question_id, option_text, is_correct) VALUES
(NEWID(), '77777777-1111-0000-0000-000000000001', N'Entities và Enums (Enterprise Business Rules)', 1),
(NEWID(), '77777777-1111-0000-0000-000000000001', N'DbContext, Repositories và Migrations', 0),
(NEWID(), '77777777-1111-0000-0000-000000000001', N'Controllers, Middleware và Swagger UI', 0),
(NEWID(), '77777777-2222-0000-0000-000000000002', N'POST', 1),
(NEWID(), '77777777-2222-0000-0000-000000000002', N'GET', 0),
(NEWID(), '77777777-2222-0000-0000-000000000002', N'DELETE', 0);

-- 8. Chèn Bài tập thực hành & Bài nộp mẫu của sinh viên
INSERT INTO dbo.assignments (id, course_id, lesson_id, title, instructions, due_date, max_score) VALUES
('cccccccc-1111-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', '55555555-0006-0000-0000-000000000001', N'Luyện tập 1: Xây dựng Endpoint RESTful API với C# .NET 8', N'Yêu cầu: Khởi tạo Web API project với .NET 8 SDK theo kiến trúc Clean Architecture. Triển khai tầng Domain với Entity Course, Student. Nộp file nén hoặc link Git repository.', DATEADD(day, 3, GETDATE()), 10.00);

INSERT INTO dbo.submissions (id, assignment_id, student_id, submission_text, git_repo_url, status, grade, feedback, graded_by, submitted_at) VALUES
('dddddddd-1111-0000-0000-000000000001', 'cccccccc-1111-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', N'Em đã hoàn thành các tầng Domain, Application và Unit test. Nhờ thầy xem giúp em phần API Controller ạ.', 'https://github.com/Tatuan2909/Learning-Management-System', 'SUBMITTED', NULL, NULL, NULL, DATEADD(hour, -2, GETDATE()));

INSERT INTO dbo.submission_files (id, submission_id, file_name, file_url, file_size, file_type) VALUES
(NEWID(), 'dddddddd-1111-0000-0000-000000000001', N'SV2024001_TranThiB_BaiTap1.zip', 'https://storage.lms.edu.vn/submissions/SV2024001_TranThiB_BaiTap1.zip', 4823449, 'application/zip');

-- 9. Chèn Bảng tin Thông báo & Bình luận
INSERT INTO dbo.announcements (id, course_id, teacher_id, title, content, is_pinned) VALUES
('eeeeeeee-1111-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', N'📌 Thông báo: Kế hoạch học tập và nộp bài thực hành Tuần 1', N'Chào các em, tuần này chúng ta học về Clean Architecture và RESTful API. Hãy xem trước slide PDF và làm bài trắc nghiệm cuối tuần 1 để kịp mở khóa nội dung tuần 2 nhé!', 1);

INSERT INTO dbo.announcement_comments (id, announcement_id, user_id, content) VALUES
(NEWID(), 'eeeeeeee-1111-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', N'Thưa thầy, em đã nộp bài tập thực hành 1 và đính kèm link Git repository rồi ạ. Em cảm ơn thầy!');

-- 10. Chèn Thông báo cá nhân
INSERT INTO dbo.notifications (id, user_id, title, message, type, is_read, link_url) VALUES
(NEWID(), '33333333-3333-3333-3333-333333333333', N'Nhắc nhở hạn nộp bài tập', N'Bạn có bài tập thực hành 1 sắp đến hạn nộp trong 3 ngày tới.', 'DEADLINE', 0, '/courses/44444444-4444-4444-4444-444444444444'),
(NEWID(), '33333333-3333-3333-3333-333333333333', N'Thông báo mới từ giảng viên', N'TS. Nguyễn Văn A vừa đăng thông báo mới trong học phần INT3306.', 'ANNOUNCEMENT', 1, '/courses/44444444-4444-4444-4444-444444444444');
GO
