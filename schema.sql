-- ===================================================================================
-- HỆ THỐNG QUẢN LÝ HỌC TẬP (LEARNING MANAGEMENT SYSTEM - LMS FULLSTACK DATABASE)
-- TẬP TIN CƠ SỞ DỮ LIỆU HOÀN CHỈNH & DUY NHẤT (MASTER DATABASE DDL & SEED SCRIPT)
-- Bao gồm: Khởi tạo CSDL, 24 Bảng DDL, Khóa chính / Khóa ngoại, Chỉ mục hiệu năng cao,
--          và Toàn bộ Dữ liệu Mẫu Chuẩn UTF-8 Tiếng Việt (Users, Courses, Quizzes, Grades...).
-- Hệ quản trị CSDL: Microsoft SQL Server (T-SQL / SSMS / Azure SQL)
-- Tên Cơ sở dữ liệu: lms_db
-- ===================================================================================

-- ===================================================================================
-- PHẦN 0: KHỞI TẠO CƠ SỞ DỮ LIỆU (CREATE DATABASE) VÀ KẾT NỐI VÀO CSDL
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
-- PHẦN I: XÓA CÁC BẢNG CŨ THEO THỨ TỰ PHỤ THUỘC (CHILD -> PARENT)
-- ===================================================================================
IF OBJECT_ID(N'dbo.question_bank_options', N'U') IS NOT NULL DROP TABLE dbo.question_bank_options;
IF OBJECT_ID(N'dbo.question_banks', N'U') IS NOT NULL DROP TABLE dbo.question_banks;
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
IF OBJECT_ID(N'dbo.majors', N'U') IS NOT NULL DROP TABLE dbo.majors;
IF OBJECT_ID(N'dbo.departments', N'U') IS NOT NULL DROP TABLE dbo.departments;
GO

-- ===================================================================================
-- PHẦN II: TẠO 24 BẢNG DỮ LIỆU ĐẦY ĐỦ (TABLE DEFINITIONS - DDL)
-- ===================================================================================

-- -----------------------------------------------------------------------------------
-- 1. BẢNG DEPARTMENTS (Khoa / Viện Đào tạo)
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.departments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name NVARCHAR(400) NOT NULL,
    dean_name NVARCHAR(300) NULL,
    email VARCHAR(150) NULL,
    phone VARCHAR(50) NULL,
    office_location NVARCHAR(400) NULL,
    description NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- -----------------------------------------------------------------------------------
-- 2. BẢNG MAJORS (Chuyên ngành Đào tạo)
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.majors (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    department_id UNIQUEIDENTIFIER NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    name NVARCHAR(400) NOT NULL,
    degree_level NVARCHAR(200) NOT NULL DEFAULT N'Đại học Chính quy',
    total_credits INT NOT NULL DEFAULT 140,
    duration_years FLOAT NOT NULL DEFAULT 4.0,
    description NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_major_department FOREIGN KEY (department_id) REFERENCES dbo.departments(id) ON DELETE CASCADE
);
GO

-- -----------------------------------------------------------------------------------
-- 3. BẢNG USERS (Tài khoản người dùng hệ thống)
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
-- 4. BẢNG STUDENT_PROFILES (Hồ sơ sinh viên - Quan hệ 1:1 với Users)
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.student_profiles (
    user_id UNIQUEIDENTIFIER PRIMARY KEY,
    student_code VARCHAR(50) NOT NULL UNIQUE,
    administrative_class NVARCHAR(100) NULL,
    enrollment_year INT NULL,
    major NVARCHAR(150) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_student_profile_user FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO

-- -----------------------------------------------------------------------------------
-- 5. BẢNG TEACHER_PROFILES (Hồ sơ giảng viên - Quan hệ 1:1 với Users)
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.teacher_profiles (
    user_id UNIQUEIDENTIFIER PRIMARY KEY,
    teacher_code VARCHAR(50) NOT NULL UNIQUE,
    department NVARCHAR(150) NULL,
    academic_title NVARCHAR(100) NULL,
    bio NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_teacher_profile_user FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO

-- -----------------------------------------------------------------------------------
-- 6. BẢNG COURSES (Khóa học / Lớp học phần)
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.courses (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    course_code VARCHAR(50) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    thumbnail_url VARCHAR(500) NULL,
    department NVARCHAR(150) NULL,
    teacher_id UNIQUEIDENTIFIER NOT NULL,
    syllabus_url VARCHAR(500) NULL,
    enrollment_password VARCHAR(100) NULL,
    access_password VARCHAR(100) NULL,
    is_published BIT NOT NULL DEFAULT 0,
    weight_attendance NUMERIC(5,2) NOT NULL DEFAULT 10.00,
    weight_assignments NUMERIC(5,2) NOT NULL DEFAULT 30.00,
    weight_final_exam NUMERIC(5,2) NOT NULL DEFAULT 60.00,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_course_teacher FOREIGN KEY (teacher_id) REFERENCES dbo.users(id) ON DELETE NO ACTION,
    CONSTRAINT chk_course_weights CHECK (weight_attendance + weight_assignments + weight_final_exam = 100.00)
);
GO

-- -----------------------------------------------------------------------------------
-- 7. BẢNG COURSE_SECTIONS (Chương mục / Tuần học trong khóa học)
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.course_sections (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    course_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(200) NOT NULL,
    order_index INT NOT NULL DEFAULT 1,
    is_locked BIT NOT NULL DEFAULT 0,
    is_expanded BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_section_course FOREIGN KEY (course_id) REFERENCES dbo.courses(id) ON DELETE CASCADE
);
GO

-- -----------------------------------------------------------------------------------
-- 8. BẢNG LESSONS (Bài học & Hoạt động học phần)
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.lessons (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    course_id UNIQUEIDENTIFIER NOT NULL,
    section_id UNIQUEIDENTIFIER NULL,
    title NVARCHAR(255) NOT NULL,
    order_index INT NOT NULL DEFAULT 1,
    content_type VARCHAR(30) NOT NULL DEFAULT 'VIDEO' 
        CHECK (content_type IN ('OVERVIEW', 'SCORM', 'PDF', 'DOCX', 'LINK', 'ANNOUNCEMENT', 'PRACTICE', 'QUIZ', 'VIDEO', 'TEXT')),
    subtitle NVARCHAR(50) NULL,
    content_url VARCHAR(1000) NULL,
    body_markdown NVARCHAR(MAX) NULL,
    is_locked BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_lesson_course FOREIGN KEY (course_id) REFERENCES dbo.courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_lesson_section FOREIGN KEY (section_id) REFERENCES dbo.course_sections(id) ON DELETE NO ACTION
);
GO

-- -----------------------------------------------------------------------------------
-- 9. BẢNG ENROLLMENTS (Ghi danh / Đăng ký học phần)
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
-- 10. BẢNG LESSON_PROGRESS (Tiến độ học tập từng bài của sinh viên)
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
-- 11. BẢNG FINAL_GRADES (Bảng điểm tổng kết học phần)
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
-- 12. BẢNG QUIZZES (Đề thi / Bài kiểm tra trắc nghiệm)
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.quizzes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    lesson_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    password VARCHAR(100) NULL,
    passing_score NUMERIC(4,2) NOT NULL DEFAULT 7.00,
    max_score NUMERIC(4,2) NOT NULL DEFAULT 10.00,
    time_limit_minutes INT NULL,
    max_attempts INT DEFAULT 3,
    shuffle_questions BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_quiz_lesson FOREIGN KEY (lesson_id) REFERENCES dbo.lessons(id) ON DELETE CASCADE
);
GO

-- -----------------------------------------------------------------------------------
-- 13. BẢNG QUIZ_QUESTIONS (Câu hỏi trắc nghiệm của đề thi)
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.quiz_questions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    quiz_id UNIQUEIDENTIFIER NOT NULL,
    question_text NVARCHAR(MAX) NOT NULL,
    question_type VARCHAR(30) NOT NULL DEFAULT 'SINGLE_CHOICE' 
        CHECK (question_type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE')),
    points NUMERIC(4,2) NOT NULL DEFAULT 1.00,
    order_index INT NOT NULL DEFAULT 1,
    explanation NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES dbo.quizzes(id) ON DELETE CASCADE
);
GO

-- -----------------------------------------------------------------------------------
-- 14. BẢNG QUIZ_OPTIONS (Các lựa chọn đáp án của câu hỏi)
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
-- 15. BẢNG QUIZ_ATTEMPTS (Lượt làm bài trắc nghiệm của sinh viên)
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
-- 16. BẢNG QUIZ_ATTEMPT_ANSWERS (Chi tiết câu trả lời trong lượt làm bài)
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
-- 17. BẢNG ASSIGNMENTS (Bài tập thực hành / Bài tập lớn)
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.assignments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    course_id UNIQUEIDENTIFIER NOT NULL,
    lesson_id UNIQUEIDENTIFIER NULL,
    title NVARCHAR(255) NOT NULL,
    instructions NVARCHAR(MAX) NOT NULL,
    attachment_url VARCHAR(500) NULL,
    due_date DATETIME2 NOT NULL,
    max_score NUMERIC(4,2) NOT NULL DEFAULT 10.00,
    allow_git_repo BIT NOT NULL DEFAULT 1,
    allowed_extensions VARCHAR(150) DEFAULT '.zip,.rar,.7z,.pdf,.docx',
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_assignment_course FOREIGN KEY (course_id) REFERENCES dbo.courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_lesson FOREIGN KEY (lesson_id) REFERENCES dbo.lessons(id) ON DELETE NO ACTION
);
GO

-- -----------------------------------------------------------------------------------
-- 18. BẢNG SUBMISSIONS (Bài nộp của sinh viên)
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.submissions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    assignment_id UNIQUEIDENTIFIER NOT NULL,
    student_id UNIQUEIDENTIFIER NOT NULL,
    submission_text NVARCHAR(MAX) NULL,
    file_url VARCHAR(1000) NULL,
    git_repo_url VARCHAR(500) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED' 
        CHECK (status IN ('DRAFT', 'SUBMITTED', 'LATE', 'GRADED')),
    grade NUMERIC(4,2) NULL CHECK (grade BETWEEN 0 AND 10),
    feedback NVARCHAR(MAX) NULL,
    graded_by UNIQUEIDENTIFIER NULL,
    submitted_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    graded_at DATETIME2 NULL,
    CONSTRAINT fk_submission_assignment FOREIGN KEY (assignment_id) REFERENCES dbo.assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_submission_student FOREIGN KEY (student_id) REFERENCES dbo.users(id) ON DELETE NO ACTION,
    CONSTRAINT fk_submission_grader FOREIGN KEY (graded_by) REFERENCES dbo.users(id) ON DELETE NO ACTION,
    CONSTRAINT uq_assignment_student UNIQUE (assignment_id, student_id)
);
GO

-- -----------------------------------------------------------------------------------
-- 19. BẢNG SUBMISSION_FILES (Tệp tin đính kèm bài nộp)
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.submission_files (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    submission_id UNIQUEIDENTIFIER NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    file_type VARCHAR(100) NULL,
    uploaded_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_sub_file_submission FOREIGN KEY (submission_id) REFERENCES dbo.submissions(id) ON DELETE CASCADE
);
GO

-- -----------------------------------------------------------------------------------
-- 20. BẢNG ANNOUNCEMENTS (Bảng tin thông báo của khóa học)
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
-- 21. BẢNG ANNOUNCEMENT_COMMENTS (Thảo luận & Bình luận thông báo / Diễn đàn)
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
-- 22. BẢNG NOTIFICATIONS (Thông báo cá nhân cho người dùng)
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

-- -----------------------------------------------------------------------------------
-- 23. BẢNG QUESTION_BANKS (Ngân hàng câu hỏi trắc nghiệm theo tuần / học phần)
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.question_banks (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    course_id UNIQUEIDENTIFIER NULL,
    course_code VARCHAR(50) NULL,
    week_number INT NOT NULL DEFAULT 1,
    topic NVARCHAR(255) NULL,
    question_text NVARCHAR(MAX) NOT NULL,
    question_type VARCHAR(30) NOT NULL DEFAULT 'SINGLE_CHOICE',
    points NUMERIC(5,2) NOT NULL DEFAULT 2.50,
    explanation NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_qb_course FOREIGN KEY (course_id) REFERENCES dbo.courses(id) ON DELETE SET NULL
);
GO

-- -----------------------------------------------------------------------------------
-- 24. BẢNG QUESTION_BANK_OPTIONS (Phương án đáp án của ngân hàng câu hỏi)
-- -----------------------------------------------------------------------------------
CREATE TABLE dbo.question_bank_options (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    question_id UNIQUEIDENTIFIER NOT NULL,
    option_text NVARCHAR(MAX) NOT NULL,
    is_correct BIT NOT NULL DEFAULT 0,
    explanation NVARCHAR(MAX) NULL,
    order_index INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_qbo_question FOREIGN KEY (question_id) REFERENCES dbo.question_banks(id) ON DELETE CASCADE
);
GO

-- ===================================================================================
-- PHẦN III: TẠO CHỈ MỤC TĂNG TỐC TRUY VẤN (INDEXES FOR HIGH PERFORMANCE)
-- ===================================================================================
CREATE NONCLUSTERED INDEX idx_dept_code ON dbo.departments(code);
CREATE NONCLUSTERED INDEX idx_major_code ON dbo.majors(code);
CREATE NONCLUSTERED INDEX idx_major_dept ON dbo.majors(department_id);

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
CREATE NONCLUSTERED INDEX idx_qb_week ON dbo.question_banks(week_number);
CREATE NONCLUSTERED INDEX idx_qb_course ON dbo.question_banks(course_id);
CREATE NONCLUSTERED INDEX idx_qbo_question ON dbo.question_bank_options(question_id);
GO

-- ===================================================================================
-- PHẦN IV: NẠP TOÀN BỘ DỮ LIỆU MẪU ĐỒNG BỘ CHUẨN UTF-8 TIẾNG VIỆT
-- ===================================================================================
-- 1. BẢNG DEPARTMENTS (Khoa / Viện Đào tạo) - 12 Khoa
INSERT INTO dbo.departments (id, code, name, dean_name, email, phone, office_location, description, created_at)
VALUES
('11110000-0000-0000-0000-000000000001', 'FIT', N'Khoa Công nghệ Thông tin', N'PGS. TS. Nguyễn Văn A', 'fit@lms.edu.vn', '024.3754.7890', N'Nhà A2 - Tầng 3, Khu Hiệu bộ', N'Đào tạo kỹ sư, cử nhân Công nghệ Thông tin, Kỹ thuật Phần mềm và Trí tuệ Nhân tạo chất lượng cao.', GETDATE()),
('11110000-0000-0000-0000-000000000002', 'FEE', N'Khoa Điện - Điện tử & Viễn thông', N'TS. Lê Quang Huy', 'fee@lms.edu.vn', '024.3754.7891', N'Nhà C1 - Tầng 2', N'Đào tạo các lĩnh vực Viễn thông, Tự động hóa, Vi mạch bán dẫn và Robot thông minh.', GETDATE()),
('11110000-0000-0000-0000-000000000003', 'FBA', N'Khoa Kinh tế & Quản trị Kinh doanh', N'PGS. TS. Phạm Thu Trang', 'fba@lms.edu.vn', '024.3754.7892', N'Nhà B1 - Tầng 4', N'Đào tạo cử nhân Quản trị Kinh doanh số, Thương mại Điện tử và Tài chính Công nghệ (Fintech).', GETDATE()),
('11110000-0000-0000-0000-000000000004', 'FLC', N'Khoa Ngoại ngữ & Hợp tác Quốc tế', N'TS. Đỗ Hoàng Nam', 'flc@lms.edu.vn', '024.3754.7893', N'Nhà D2 - Tầng 1', N'Đào tạo cử nhân Ngôn ngữ Anh khoa học kỹ thuật, Ngôn ngữ Nhật thương mại & CNTT.', GETDATE()),
('11110000-0000-0000-0000-000000000005', 'FME', N'Khoa Cơ khí & Kỹ thuật Chế tạo', N'PGS. TS. Hoàng Quốc Việt', 'fme@lms.edu.vn', '024.3754.7894', N'Nhà Xưởng Cơ khí C3', N'Đào tạo kỹ sư Cơ điện tử, Kỹ thuật Cơ khí chính xác và Kỹ thuật Ô tô điện tử.', GETDATE()),
('11110000-0000-0000-0000-000000000006', 'FCE', N'Khoa Kỹ thuật Xây dựng & Giao thông', N'TS. Đặng Thanh Tùng', 'fce@lms.edu.vn', '024.3754.7895', N'Nhà E1 - Tầng 2', N'Đào tạo kỹ sư Xây dựng dân dụng, Xây dựng cầu đường và Đô thị thông minh (Smart City).', GETDATE()),
('11110000-0000-0000-0000-000000000007', 'FCH', N'Khoa Công nghệ Hóa học & Vật liệu', N'PGS. TS. Bùi Thị Mai Hương', 'fch@lms.edu.vn', '024.3754.7896', N'Khu Thí nghiệm Hóa học B3', N'Nghiên cứu và đào tạo Công nghệ Hóa học, Kỹ thuật Hóa sinh và Khoa học Vật liệu tiên tiến.', GETDATE()),
('11110000-0000-0000-0000-000000000008', 'FBS', N'Khoa Công nghệ Sinh học & Môi trường', N'TS. Trịnh Thúy Hà', 'fbs@lms.edu.vn', '024.3754.7897', N'Nhà Sinh học D3', N'Đào tạo kỹ sư Công nghệ Sinh học y dược, Vi sinh thực phẩm và Kỹ thuật Quản lý môi trường.', GETDATE()),
('11110000-0000-0000-0000-000000000009', 'FLW', N'Khoa Luật & Quản trị Công', N'TS. Phan Văn Khiêm', 'flw@lms.edu.vn', '024.3754.7898', N'Nhà Hiệu bộ A1 - Tầng 5', N'Đào tạo cử nhân Luật Kinh tế quốc tế, Luật Sở hữu trí tuệ công nghệ và Quản lý công.', GETDATE()),
('11110000-0000-0000-0000-000000000010', 'FMD', N'Khoa Y - Dược & Khoa học Sức khỏe', N'GS. TS. Vũ Đình Chính', 'fmd@lms.edu.vn', '024.3754.7899', N'Bệnh viện Thực hành - Tòa Y tế', N'Đào tạo bác sĩ Y đa khoa, Dược sĩ đại học và Kỹ thuật viên xét nghiệm y sinh.', GETDATE()),
('11110000-0000-0000-0000-000000000011', 'FDE', N'Khoa Thiết kế Mỹ thuật & Truyền thông số', N'ThS. Họa sĩ Trần Quốc Huy', 'fde@lms.edu.vn', '024.3754.7881', N'Studio Nghệ thuật F1', N'Đào tạo Cử nhân Thiết kế Đồ họa số, Thiết kế UI/UX Trải nghiệm người dùng và Kỹ xảo hoạt hình 3D.', GETDATE()),
('11110000-0000-0000-0000-000000000012', 'FFS', N'Khoa Khoa học Cơ bản & Toán Ứng dụng', N'PGS. TS. Nghiêm Xuân Toán', 'ffs@lms.edu.vn', '024.3754.7882', N'Nhà B2 - Tầng 3', N'Giảng dạy các bộ môn Toán cao cấp, Vật lý đại cương, Xác suất thống kê và Toán Tin ứng dụng.', GETDATE());
GO

-- 2. BẢNG MAJORS (Chuyên ngành Đào tạo) - 30 Chuyên ngành
INSERT INTO dbo.majors (id, department_id, code, name, degree_level, total_credits, duration_years, description, created_at)
VALUES
-- FIT
('22220000-0000-0000-0000-000000000001', '11110000-0000-0000-0000-000000000001', '7480201', N'Kỹ thuật Phần mềm (Software Engineering)', N'Đại học Chính quy', 135, 4.0, N'Chương trình đào tạo chuyên sâu về kiến trúc phần mềm, web, mobile và DevOps.', GETDATE()),
('22220000-0000-0000-0000-000000000002', '11110000-0000-0000-0000-000000000001', '7480108', N'Trí tuệ Nhân tạo & Khoa học Dữ liệu', N'Chất lượng cao', 140, 4.0, N'Đào tạo chuyên gia Deep Learning, Computer Vision, NLP và AI Engineering.', GETDATE()),
('22220000-0000-0000-0000-000000000003', '11110000-0000-0000-0000-000000000001', '7480101', N'Khoa học Máy tính', N'Đại học Chính quy', 135, 4.0, N'Nghiên cứu cấu trúc dữ liệu thuật toán, xử lý dữ liệu lớn và thuật toán học máy.', GETDATE()),
('22220000-0000-0000-0000-000000000004', '11110000-0000-0000-0000-000000000001', '7480202', N'An toàn Thông tin (Cybersecurity)', N'Đại học Chính quy', 135, 4.0, N'An ninh mạng, bảo mật hệ thống, mật mã học và kiểm thử xâm nhập (PenTest).', GETDATE()),
('22220000-0000-0000-0000-000000000005', '11110000-0000-0000-0000-000000000001', '7480205', N'Hệ thống Thông tin Quản lý', N'Đại học Chính quy', 130, 4.0, N'Phân tích nghiệp vụ (BA), quản trị cơ sở dữ liệu và triển khai ERP doanh nghiệp.', GETDATE()),

-- FEE
('22220000-0000-0000-0000-000000000006', '11110000-0000-0000-0000-000000000002', '7520207', N'Kỹ thuật Điện tử - Viễn thông', N'Kỹ sư', 145, 4.5, N'Mạng 5G/6G, xử lý tín hiệu số, thiết kế ăng-ten và truyền thông quang.', GETDATE()),
('22220000-0000-0000-0000-000000000007', '11110000-0000-0000-0000-000000000002', '7520216', N'Kỹ thuật Điều khiển & Tự động hóa', N'Kỹ sư', 145, 4.5, N'Hệ thống điều khiển SCADA, PLC, IoT công nghiệp và tự động hóa nhà máy thông minh.', GETDATE()),
('22220000-0000-0000-0000-000000000008', '11110000-0000-0000-0000-000000000002', '7520220', N'Kỹ thuật Robot & Hệ thống thông minh', N'Chất lượng cao', 145, 4.5, N'Cơ điện tử, cánh tay robot công nghiệp và phương tiện tự hành (AGV).', GETDATE()),
('22220000-0000-0000-0000-000000000009', '11110000-0000-0000-0000-000000000002', '7520203', N'Kỹ thuật Vi mạch & Bán dẫn (Semiconductor)', N'Kỹ sư', 150, 4.5, N'Thiết kế vi mạch tích hợp VLSI, IC bán dẫn và kiểm thử chip công nghệ cao.', GETDATE()),

-- FBA
('22220000-0000-0000-0000-000000000010', '11110000-0000-0000-0000-000000000003', '7340101', N'Quản trị Kinh doanh số', N'Cử nhân', 128, 4.0, N'Khởi nghiệp kinh doanh số, quản trị chiến lược chuyển đổi số trong doanh nghiệp.', GETDATE()),
('22220000-0000-0000-0000-000000000011', '11110000-0000-0000-0000-000000000003', '7340122', N'Thương mại Điện tử (E-Commerce)', N'Cử nhân', 130, 4.0, N'Kinh doanh đa kênh Omnichannel, digital marketing và phân tích dữ liệu khách hàng.', GETDATE()),
('22220000-0000-0000-0000-000000000012', '11110000-0000-0000-0000-000000000003', '7340205', N'Công nghệ Tài chính (Fintech)', N'Chất lượng cao', 130, 4.0, N'Thanh toán điện tử, công nghệ Blockchain, phân tích thuật toán giao dịch tài chính.', GETDATE()),
('22220000-0000-0000-0000-000000000013', '11110000-0000-0000-0000-000000000003', '7340301', N'Kế toán & Kiểm toán số', N'Cử nhân', 128, 4.0, N'Ứng dụng phần mềm kế toán tự động, ERP tài chính và kiểm toán dữ liệu lớn.', GETDATE()),

-- FLC
('22220000-0000-0000-0000-000000000014', '11110000-0000-0000-0000-000000000004', '7220201', N'Tiếng Anh Khoa học & Công nghệ', N'Cử nhân', 125, 4.0, N'Biên phiên dịch kỹ thuật công nghệ, tiếng Anh học thuật quốc tế.', GETDATE()),
('22220000-0000-0000-0000-000000000015', '11110000-0000-0000-0000-000000000004', '7220209', N'Tiếng Nhật Thương mại & CNTT', N'Cử nhân', 128, 4.0, N'Tiếng Nhật chuyên ngành phần mềm, chuẩn bị làm việc tại các tập đoàn Nhật Bản (JLPT N2).', GETDATE()),

-- FME
('22220000-0000-0000-0000-000000000016', '11110000-0000-0000-0000-000000000005', '7520103', N'Kỹ thuật Cơ khí Chế tạo máy', N'Kỹ sư', 145, 4.5, N'Thiết kế máy móc công nghiệp, gia công CNC chính xác và mô phỏng CAD/CAM/CAE.', GETDATE()),
('22220000-0000-0000-0000-000000000017', '11110000-0000-0000-0000-000000000005', '7520114', N'Kỹ thuật Cơ điện tử (Mechatronics)', N'Kỹ sư', 145, 4.5, N'Tích hợp phần mềm điều khiển, cơ khí chính xác và cảm biến công nghiệp.', GETDATE()),
('22220000-0000-0000-0000-000000000018', '11110000-0000-0000-0000-000000000005', '7520130', N'Kỹ thuật Ô tô & Xe điện Thông minh', N'Kỹ sư', 148, 4.5, N'Hệ truyền động điện tử, quản lý năng lượng pin và công nghệ xe tự lái.', GETDATE()),

-- FCE
('22220000-0000-0000-0000-000000000019', '11110000-0000-0000-0000-000000000006', '7580201', N'Kỹ thuật Xây dựng Dân dụng & Công nghiệp', N'Kỹ sư', 145, 4.5, N'Tính toán kết cấu công trình, mô hình thông tin công trình BIM và quản lý thi công.', GETDATE()),
('22220000-0000-0000-0000-000000000020', '11110000-0000-0000-0000-000000000006', '7580205', N'Kỹ thuật Xây dựng Công trình Giao thông', N'Kỹ sư', 145, 4.5, N'Quy hoạch mạng lưới giao thông thông minh, cầu hầm và đường cao tốc hiện đại.', GETDATE()),

-- FCH
('22220000-0000-0000-0000-000000000021', '11110000-0000-0000-0000-000000000007', '7510401', N'Công nghệ Kỹ thuật Hóa học', N'Kỹ sư', 142, 4.5, N'Hóa dược, tổng hợp polymer và kỹ thuật hóa dầu bền vững.', GETDATE()),
('22220000-0000-0000-0000-000000000022', '11110000-0000-0000-0000-000000000007', '7510406', N'Khoa học & Kỹ thuật Vật liệu Mới', N'Kỹ sư', 142, 4.5, N'Vật liệu nano, màng bán dẫn và vật liệu composite siêu nhẹ.', GETDATE()),

-- FBS
('22220000-0000-0000-0000-000000000023', '11110000-0000-0000-0000-000000000008', '7420201', N'Công nghệ Sinh học Ứng dụng', N'Cử nhân', 135, 4.0, N'Di truyền phân tử, vắc-xin sinh học và công nghệ vi sinh xử lý môi trường.', GETDATE()),
('22220000-0000-0000-0000-000000000024', '11110000-0000-0000-0000-000000000008', '7850101', N'Kỹ thuật Quản lý Môi trường', N'Kỹ sư', 140, 4.5, N'Kinh tế tuần hoàn, đánh giá tác động môi trường và xử lý nước thải khí thải công nghiệp.', GETDATE()),

-- FLW
('22220000-0000-0000-0000-000000000025', '11110000-0000-0000-0000-000000000009', '7380101', N'Luật Kinh tế & Thương mại Quốc tế', N'Cử nhân', 128, 4.0, N'Hợp đồng thương mại điện tử, tranh chấp xuyên biên giới và công pháp quốc tế.', GETDATE()),
('22220000-0000-0000-0000-000000000026', '11110000-0000-0000-0000-000000000009', '7380107', N'Luật Công nghệ số & Sở hữu Trí tuệ', N'Cử nhân', 130, 4.0, N'Bảo vệ dữ liệu cá nhân (GDPR), bản quyền phần mềm và pháp lý trí tuệ nhân tạo.', GETDATE()),

-- FDE
('22220000-0000-0000-0000-000000000027', '11110000-0000-0000-0000-000000000011', '7210403', N'Thiết kế Đồ họa & Trải nghiệm UI/UX', N'Cử nhân', 130, 4.0, N'Thiết kế giao diện ứng dụng web/mobile, hệ thống nhận diện thương hiệu số.', GETDATE()),
('22220000-0000-0000-0000-000000000028', '11110000-0000-0000-0000-000000000011', '7210404', N'Truyền thông Đa phương tiện & Kỹ xảo 3D', N'Cử nhân', 132, 4.0, N'Sản xuất video số, kỹ xảo điện ảnh VFX và phát triển mô hình trò chơi điện tử.', GETDATE()),

-- FFS & FMD
('22220000-0000-0000-0000-000000000029', '11110000-0000-0000-0000-000000000012', '7460112', N'Toán Tin Ứng dụng & Khoa học Định phí', N'Cử nhân', 132, 4.0, N'Mô hình hóa tài chính, bảo hiểm (Actuarial Science) và tối ưu hóa giải thuật.', GETDATE()),
('22220000-0000-0000-0000-000000000030', '11110000-0000-0000-0000-000000000010', '7720201', N'Dược học Lâm sàng & Công nghệ Dược', N'Dược sĩ', 160, 5.0, N'Bào chế dược phẩm, kiểm nghiệm thuốc và quản trị nhà thuốc bệnh viện.', GETDATE());
GO

-- 3. BẢNG USERS (Tài khoản người dùng) - 42 tài khoản chuẩn tiếng Việt
INSERT INTO dbo.users (id, email, password_hash, full_name, phone, role, is_active, created_at, updated_at)
VALUES
-- 4 ADMIN
('11111111-1111-1111-1111-111111111111', 'admin', 'admin', N'Hệ thống Quản trị viên', '0912345678', 'ADMIN', 1, GETDATE(), GETDATE()),
('11111111-1111-1111-1111-000000000002', 'admin.academic@lms.edu.vn', 'admin', N'Ban Quản trị Đào tạo & Khảo thí', '0912345679', 'ADMIN', 1, GETDATE(), GETDATE()),
('11111111-1111-1111-1111-000000000003', 'admin.security@lms.edu.vn', 'admin', N'Kỹ sư Giám sát An ninh Mạng', '0912345680', 'ADMIN', 1, GETDATE(), GETDATE()),
('11111111-1111-1111-1111-000000000004', 'admin.tech@lms.edu.vn', 'admin', N'Trung tâm Hạ tầng & Điện toán Đám mây', '0912345681', 'ADMIN', 1, GETDATE(), GETDATE()),

-- 12 TEACHER
('22222222-2222-2222-2222-222222222222', 'GV001', 'GV001', N'TS. Nguyễn Văn A', '0981112233', 'TEACHER', 1, GETDATE(), GETDATE()),
('22222222-2222-2222-2222-000000000002', 'GV002', 'GV002', N'PGS. TS. Trần Đức Toàn', '0981112234', 'TEACHER', 1, GETDATE(), GETDATE()),
('22222222-2222-2222-2222-000000000003', 'GV003', 'GV003', N'TS. Lê Thị Mai', '0981112235', 'TEACHER', 1, GETDATE(), GETDATE()),
('22222222-2222-2222-2222-000000000004', 'GV004', 'GV004', N'TS. Vũ Đình Tuấn', '0981112236', 'TEACHER', 1, GETDATE(), GETDATE()),
('22222222-2222-2222-2222-000000000005', 'GV005', 'GV005', N'ThS. Nguyễn Quỳnh Chi', '0981112237', 'TEACHER', 1, GETDATE(), GETDATE()),
('22222222-2222-2222-2222-000000000006', 'GV006', 'GV006', N'ThS. David Harrison', '0981112238', 'TEACHER', 1, GETDATE(), GETDATE()),
('22222222-2222-2222-2222-000000000007', 'GV007', 'GV007', N'PGS. TS. Hoàng Quốc Việt', '0981112239', 'TEACHER', 1, GETDATE(), GETDATE()),
('22222222-2222-2222-2222-000000000008', 'GV008', 'GV008', N'TS. Đặng Thanh Tùng', '0981112240', 'TEACHER', 1, GETDATE(), GETDATE()),
('22222222-2222-2222-2222-000000000009', 'GV009', 'GV009', N'PGS. TS. Bùi Thị Mai Hương', '0981112241', 'TEACHER', 1, GETDATE(), GETDATE()),
('22222222-2222-2222-2222-000000000010', 'GV010', 'GV010', N'TS. Trịnh Thúy Hà', '0981112242', 'TEACHER', 1, GETDATE(), GETDATE()),
('22222222-2222-2222-2222-000000000011', 'GV011', 'GV011', N'TS. Phan Văn Khiêm', '0981112243', 'TEACHER', 1, GETDATE(), GETDATE()),
('22222222-2222-2222-2222-000000000012', 'GV012', 'GV012', N'ThS. Trần Quốc Huy', '0981112244', 'TEACHER', 1, GETDATE(), GETDATE()),

-- 26 STUDENT
('33333333-3333-3333-3333-333333333333', 'SV2024001', 'SV2024001', N'Trần Thị B', '0972223301', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000002', 'SV2024002', 'SV2024002', N'Nguyễn Văn Minh', '0972223302', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000003', 'SV2024003', 'SV2024003', N'Lê Thị Hồng Nhung', '0972223303', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000004', 'SV2024004', 'SV2024004', N'Phạm Quốc Bảo', '0972223304', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000005', 'SV2024005', 'SV2024005', N'Vũ Hoàng Long', '0972223305', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000006', 'SV2024006', 'SV2024006', N'Đỗ Thu Hà', '0972223306', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000007', 'SV2024007', 'SV2024007', N'Nguyễn Gia Huy', '0972223307', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000008', 'SV2024008', 'SV2024008', N'Hoàng Kim Ngân', '0972223308', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000009', 'SV2024009', 'SV2024009', N'Bùi Anh Tuấn', '0972223309', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000010', 'SV2024010', 'SV2024010', N'Đinh Trọng Đức', '0972223310', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000011', 'SV2024011', 'SV2024011', N'Phan Mỹ Duyên', '0972223311', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000012', 'SV2024012', 'SV2024012', N'Trương Quang Khải', '0972223312', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000013', 'SV2024013', 'SV2024013', N'Võ Ngọc Ánh', '0972223313', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000014', 'SV2024014', 'SV2024014', N'Ngô Kiến Văn', '0972223314', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000015', 'SV2024015', 'SV2024015', N'Mai Diệu Linh', '0972223315', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000016', 'SV2024016', 'SV2024016', N'Lâm Gia Bảo', '0972223316', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000017', 'SV2024017', 'SV2024017', N'Dương Thùy Trang', '0972223317', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000018', 'SV2024018', 'SV2024018', N'Đoàn Minh Trí', '0972223318', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000019', 'SV2024019', 'SV2024019', N'Tạ Hữu Nam', '0972223319', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000020', 'SV2024020', 'SV2024020', N'Hồ Bích Ngọc', '0972223320', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000021', 'SV2024021', 'SV2024021', N'Châu Văn Thái', '0972223321', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000022', 'SV2024022', 'SV2024022', N'Lương Thanh Tùng', '0972223322', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000023', 'SV2024023', 'SV2024023', N'Huỳnh Khánh Linh', '0972223323', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000024', 'SV2024024', 'SV2024024', N'Phùng Mạnh Thắng', '0972223324', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000025', 'SV2024025', 'SV2024025', N'Nguyễn Diệu Hoa', '0972223325', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000026', 'SV2024026', 'SV2024026', N'Trịnh Quốc Cường', '0972223326', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000027', 'SV2024027', 'SV2024027', N'Hoàng Nhật Minh', '0972223327', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000028', 'SV2024028', 'SV2024028', N'Lê Minh Quân', '0972223328', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000029', 'SV2024029', 'SV2024029', N'Phạm Phương Anh', '0972223329', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000030', 'SV2024030', 'SV2024030', N'Trần Đức Huy', '0972223330', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000031', 'SV2024031', 'SV2024031', N'Ngô Thanh Hằng', '0972223331', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000032', 'SV2024032', 'SV2024032', N'Đặng Quốc Việt', '0972223332', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000033', 'SV2024033', 'SV2024033', N'Bùi Khánh Huyền', '0972223333', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000034', 'SV2024034', 'SV2024034', N'Vũ Đình Khang', '0972223334', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000035', 'SV2024035', 'SV2024035', N'Hà Thị Thảo', '0972223335', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000036', 'SV2024036', 'SV2024036', N'Lý Văn Hùng', '0972223336', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000037', 'SV2024037', 'SV2024037', N'Mai Bảo Trâm', '0972223337', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000038', 'SV2024038', 'SV2024038', N'Đỗ Quốc Anh', '0972223338', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000039', 'SV2024039', 'SV2024039', N'Nguyễn Thảo My', '0972223339', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000040', 'SV2024040', 'SV2024040', N'Trịnh Hải Yến', '0972223340', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000041', 'SV2024041', 'SV2024041', N'Phan Hoàng Long', '0972223341', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000042', 'SV2024042', 'SV2024042', N'Châu Bảo Ngọc', '0972223342', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000043', 'SV2024043', 'SV2024043', N'Đào Trọng Tín', '0972223343', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000044', 'SV2024044', 'SV2024044', N'Cao Mỹ Uyên', '0972223344', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000045', 'SV2024045', 'SV2024045', N'Lê Tuấn Kiệt', '0972223345', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000046', 'SV2024046', 'SV2024046', N'Võ Diễm Quỳnh', '0972223346', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000047', 'SV2024047', 'SV2024047', N'Hồ Quang Hiếu', '0972223347', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000048', 'SV2024048', 'SV2024048', N'Dương Ngọc Ánh', '0972223348', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000049', 'SV2024049', 'SV2024049', N'Lương Gia Huy', '0972223349', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000050', 'SV2024050', 'SV2024050', N'Tạ Phương Linh', '0972223350', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000051', 'SV2024051', 'SV2024051', N'Vương Đình Bảo', '0972223351', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000052', 'SV2024052', 'SV2024052', N'Nghiêm Thúy Vi', '0972223352', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000053', 'SV2024053', 'SV2024053', N'Lưu Tuấn Thành', '0972223353', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000054', 'SV2024054', 'SV2024054', N'Tăng Khải Hoàn', '0972223354', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000055', 'SV2024055', 'SV2024055', N'Kim Ngọc Mai', '0972223355', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000056', 'SV2024056', 'SV2024056', N'Nguyễn Trọng Đại', '0972223356', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000057', 'SV2024057', 'SV2024057', N'Trần Kim Chi', '0972223357', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000058', 'SV2024058', 'SV2024058', N'Lê Minh Triết', '0972223358', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000059', 'SV2024059', 'SV2024059', N'Hoàng Yến Nhi', '0972223359', 'STUDENT', 1, GETDATE(), GETDATE()),
('33333333-3333-3333-3333-000000000060', 'SV2024060', 'SV2024060', N'Bùi Văn Lâm', '0972223360', 'STUDENT', 1, GETDATE(), GETDATE());
GO

-- 4. BẢNG TEACHER_PROFILES (12 giảng viên)
INSERT INTO dbo.teacher_profiles (user_id, teacher_code, department, academic_title, bio, created_at)
VALUES
('22222222-2222-2222-2222-222222222222', 'GV001', N'Khoa Công nghệ Thông tin', N'Phó Giáo Sư', N'Chuyên gia Kiến trúc phần mềm & Web Cloud', GETDATE()),
('22222222-2222-2222-2222-000000000002', 'GV002', N'Khoa Công nghệ Thông tin', N'Phó Giáo Sư', N'Trưởng nhóm nghiên cứu Trí tuệ Nhân tạo & Xử lý ngôn ngữ tự nhiên', GETDATE()),
('22222222-2222-2222-2222-000000000003', 'GV003', N'Khoa Công nghệ Thông tin', N'Tiến Sĩ', N'Giảng viên An toàn Thông tin & Mật mã học ứng dụng', GETDATE()),
('22222222-2222-2222-2222-000000000004', 'GV004', N'Khoa Điện - Điện tử & Viễn thông', N'Tiến Sĩ', N'Chuyên gia Mạng 5G, Hệ thống nhúng và Vi xử lý ARM', GETDATE()),
('22222222-2222-2222-2222-000000000005', 'GV005', N'Khoa Kinh tế & Quản trị Kinh doanh', N'Thạc Sĩ', N'Cố vấn khởi nghiệp doanh nghiệp số, Fintech & E-commerce', GETDATE()),
('22222222-2222-2222-2222-000000000006', 'GV006', N'Khoa Ngoại ngữ & Hợp tác Quốc tế', N'Thạc Sĩ', N'Giảng viên tiếng Anh khoa học công nghệ quốc tế (IELTS 8.5)', GETDATE()),
('22222222-2222-2222-2222-000000000007', 'GV007', N'Khoa Cơ khí & Kỹ thuật Chế tạo', N'Phó Giáo Sư', N'Nghiên cứu cơ điện tử, robot công nghiệp và gia công CNC', GETDATE()),
('22222222-2222-2222-2222-000000000008', 'GV008', N'Khoa Kỹ thuật Xây dựng & Giao thông', N'Tiến Sĩ', N'Chuyên gia mô hình thông tin công trình BIM và kết cấu bê tông', GETDATE()),
('22222222-2222-2222-2222-000000000009', 'GV009', N'Khoa Công nghệ Hóa học & Vật liệu', N'Phó Giáo Sư', N'Nghiên cứu công nghệ vật liệu mới và hóa dược', GETDATE()),
('22222222-2222-2222-2222-000000000010', 'GV010', N'Khoa Công nghệ Sinh học & Môi trường', N'Tiến Sĩ', N'Nghiên cứu vi sinh môi trường và di truyền sinh học', GETDATE()),
('22222222-2222-2222-2222-000000000011', 'GV011', N'Khoa Luật & Quản trị Công', N'Tiến Sĩ', N'Chuyên gia luật kinh tế và sở hữu trí tuệ số', GETDATE()),
('22222222-2222-2222-2222-000000000012', 'GV012', N'Khoa Thiết kế Mỹ thuật & Truyền thông số', N'Thạc Sĩ', N'Giảng viên đồ họa 3D và giao diện UI/UX', GETDATE());
GO

-- 5. BẢNG STUDENT_PROFILES (26 sinh viên)
INSERT INTO dbo.student_profiles (user_id, student_code, administrative_class, enrollment_year, major, created_at)
VALUES
('33333333-3333-3333-3333-333333333333', 'SV2024001', N'CNTT-K65', 2024, N'Kỹ thuật Phần mềm (Software Engineering)', GETDATE()),
('33333333-3333-3333-3333-000000000002', 'SV2024002', N'CNTT-K65', 2024, N'Kỹ thuật Phần mềm (Software Engineering)', GETDATE()),
('33333333-3333-3333-3333-000000000003', 'SV2024003', N'CNTT-K65', 2024, N'Kỹ thuật Phần mềm (Software Engineering)', GETDATE()),
('33333333-3333-3333-3333-000000000004', 'SV2024004', N'AI-K66', 2024, N'Trí tuệ Nhân tạo & Khoa học Dữ liệu', GETDATE()),
('33333333-3333-3333-3333-000000000005', 'SV2024005', N'AI-K66', 2024, N'Trí tuệ Nhân tạo & Khoa học Dữ liệu', GETDATE()),
('33333333-3333-3333-3333-000000000006', 'SV2024006', N'PM-K65', 2024, N'Khoa học Máy tính', GETDATE()),
('33333333-3333-3333-3333-000000000007', 'SV2024007', N'PM-K65', 2024, N'Khoa học Máy tính', GETDATE()),
('33333333-3333-3333-3333-000000000008', 'SV2024008', N'ATTT-K66', 2024, N'An toàn Thông tin (Cybersecurity)', GETDATE()),
('33333333-3333-3333-3333-000000000009', 'SV2024009', N'ATTT-K66', 2024, N'An toàn Thông tin (Cybersecurity)', GETDATE()),
('33333333-3333-3333-3333-000000000010', 'SV2024010', N'ĐTVT-K65', 2024, N'Kỹ thuật Điện tử - Viễn thông', GETDATE()),
('33333333-3333-3333-3333-000000000011', 'SV2024011', N'ĐTVT-K65', 2024, N'Kỹ thuật Điện tử - Viễn thông', GETDATE()),
('33333333-3333-3333-3333-000000000012', 'SV2024012', N'TĐH-K65', 2024, N'Kỹ thuật Điều khiển & Tự động hóa', GETDATE()),
('33333333-3333-3333-3333-000000000013', 'SV2024013', N'ROBOT-K66', 2024, N'Kỹ thuật Robot & Hệ thống thông minh', GETDATE()),
('33333333-3333-3333-3333-000000000014', 'SV2024014', N'QTKD-K65', 2024, N'Quản trị Kinh doanh số', GETDATE()),
('33333333-3333-3333-3333-000000000015', 'SV2024015', N'TMĐT-K65', 2024, N'Thương mại Điện tử (E-Commerce)', GETDATE()),
('33333333-3333-3333-3333-000000000016', 'SV2024016', N'FIN-K66', 2024, N'Công nghệ Tài chính (Fintech)', GETDATE()),
('33333333-3333-3333-3333-000000000017', 'SV2024017', N'NNA-K65', 2024, N'Tiếng Anh Khoa học & Công nghệ', GETDATE()),
('33333333-3333-3333-3333-000000000018', 'SV2024018', N'NNN-K65', 2024, N'Tiếng Nhật Thương mại & CNTT', GETDATE()),
('33333333-3333-3333-3333-000000000019', 'SV2024019', N'CK-K65', 2024, N'Kỹ thuật Cơ khí Chế tạo máy', GETDATE()),
('33333333-3333-3333-3333-000000000020', 'SV2024020', N'CĐT-K66', 2024, N'Kỹ thuật Cơ điện tử (Mechatronics)', GETDATE()),
('33333333-3333-3333-3333-000000000021', 'SV2024021', N'OTO-K66', 2024, N'Kỹ thuật Ô tô & Xe điện Thông minh', GETDATE()),
('33333333-3333-3333-3333-000000000022', 'SV2024022', N'XD-K65', 2024, N'Kỹ thuật Xây dựng Dân dụng & Công nghiệp', GETDATE()),
('33333333-3333-3333-3333-000000000023', 'SV2024023', N'SH-K65', 2024, N'Công nghệ Sinh học Ứng dụng', GETDATE()),
('33333333-3333-3333-3333-000000000024', 'SV2024024', N'DH-K66', 2024, N'Thiết kế Đồ họa & Trải nghiệm UI/UX', GETDATE()),
('33333333-3333-3333-3333-000000000025', 'SV2024025', N'TT-K66', 2024, N'Toán Tin Ứng dụng & Khoa học Định phí', GETDATE()),
('33333333-3333-3333-3333-000000000026', 'SV2024026', N'DS-K65', 2024, N'Dược học Lâm sàng & Công nghệ Dược', GETDATE()),
('33333333-3333-3333-3333-000000000027', 'SV2024027', N'CNTT-K65', 2024, N'Kỹ thuật Phần mềm (Software Engineering)', GETDATE()),
('33333333-3333-3333-3333-000000000028', 'SV2024028', N'CNTT-K65', 2024, N'Khoa học Máy tính', GETDATE()),
('33333333-3333-3333-3333-000000000029', 'SV2024029', N'AI-K66', 2024, N'Trí tuệ Nhân tạo & Khoa học Dữ liệu', GETDATE()),
('33333333-3333-3333-3333-000000000030', 'SV2024030', N'AI-K66', 2024, N'Trí tuệ Nhân tạo & Khoa học Dữ liệu', GETDATE()),
('33333333-3333-3333-3333-000000000031', 'SV2024031', N'ATTT-K66', 2024, N'An toàn Thông tin (Cybersecurity)', GETDATE()),
('33333333-3333-3333-3333-000000000032', 'SV2024032', N'PM-K65', 2024, N'Kỹ thuật Phần mềm (Software Engineering)', GETDATE()),
('33333333-3333-3333-3333-000000000033', 'SV2024033', N'ĐTVT-K65', 2024, N'Kỹ thuật Điện tử - Viễn thông', GETDATE()),
('33333333-3333-3333-3333-000000000034', 'SV2024034', N'ĐTVT-K65', 2024, N'Kỹ thuật Vi điện tử & Thiết kế Vi mạch', GETDATE()),
('33333333-3333-3333-3333-000000000035', 'SV2024035', N'TĐH-K65', 2024, N'Kỹ thuật Điều khiển & Tự động hóa', GETDATE()),
('33333333-3333-3333-3333-000000000036', 'SV2024036', N'ROBOT-K66', 2024, N'Kỹ thuật Robot & Hệ thống thông minh', GETDATE()),
('33333333-3333-3333-3333-000000000037', 'SV2024037', N'QTKD-K65', 2024, N'Quản trị Kinh doanh số', GETDATE()),
('33333333-3333-3333-3333-000000000038', 'SV2024038', N'TMĐT-K65', 2024, N'Thương mại Điện tử (E-Commerce)', GETDATE()),
('33333333-3333-3333-3333-000000000039', 'SV2024039', N'FIN-K66', 2024, N'Công nghệ Tài chính (Fintech)', GETDATE()),
('33333333-3333-3333-3333-000000000040', 'SV2024040', N'NNA-K65', 2024, N'Tiếng Anh Khoa học & Công nghệ', GETDATE()),
('33333333-3333-3333-3333-000000000041', 'SV2024041', N'NNN-K65', 2024, N'Tiếng Nhật Thương mại & CNTT', GETDATE()),
('33333333-3333-3333-3333-000000000042', 'SV2024042', N'CK-K65', 2024, N'Kỹ thuật Cơ khí Chế tạo máy', GETDATE()),
('33333333-3333-3333-3333-000000000043', 'SV2024043', N'CĐT-K66', 2024, N'Kỹ thuật Cơ điện tử (Mechatronics)', GETDATE()),
('33333333-3333-3333-3333-000000000044', 'SV2024044', N'OTO-K66', 2024, N'Kỹ thuật Ô tô & Xe điện Thông minh', GETDATE()),
('33333333-3333-3333-3333-000000000045', 'SV2024045', N'XD-K65', 2024, N'Kỹ thuật Xây dựng Dân dụng & Công nghiệp', GETDATE()),
('33333333-3333-3333-3333-000000000046', 'SV2024046', N'SH-K65', 2024, N'Công nghệ Sinh học Ứng dụng', GETDATE()),
('33333333-3333-3333-3333-000000000047', 'SV2024047', N'DH-K66', 2024, N'Thiết kế Đồ họa & Trải nghiệm UI/UX', GETDATE()),
('33333333-3333-3333-3333-000000000048', 'SV2024048', N'TT-K66', 2024, N'Toán Tin Ứng dụng & Khoa học Định phí', GETDATE()),
('33333333-3333-3333-3333-000000000049', 'SV2024049', N'DS-K65', 2024, N'Dược học Lâm sàng & Công nghệ Dược', GETDATE()),
('33333333-3333-3333-3333-000000000050', 'SV2024050', N'CNTT-K65', 2024, N'Hệ thống Thông tin Quản lý', GETDATE()),
('33333333-3333-3333-3333-000000000051', 'SV2024051', N'AI-K66', 2024, N'Khoa học Dữ liệu Lớn (Big Data)', GETDATE()),
('33333333-3333-3333-3333-000000000052', 'SV2024052', N'ATTT-K66', 2024, N'Mạng Máy tính & Truyền thông Dữ liệu', GETDATE()),
('33333333-3333-3333-3333-000000000053', 'SV2024053', N'PM-K65', 2024, N'Kỹ thuật Phần mềm (Software Engineering)', GETDATE()),
('33333333-3333-3333-3333-000000000054', 'SV2024054', N'QTKD-K65', 2024, N'Marketing Kỹ thuật số (Digital Marketing)', GETDATE()),
('33333333-3333-3333-3333-000000000055', 'SV2024055', N'FIN-K66', 2024, N'Tài chính - Ngân hàng Số', GETDATE()),
('33333333-3333-3333-3333-000000000056', 'SV2024056', N'CK-K65', 2024, N'Kỹ thuật Cơ điện tử (Mechatronics)', GETDATE()),
('33333333-3333-3333-3333-000000000057', 'SV2024057', N'CĐT-K66', 2024, N'Kỹ thuật Robot & Hệ thống thông minh', GETDATE()),
('33333333-3333-3333-3333-000000000058', 'SV2024058', N'XD-K65', 2024, N'Quản lý Dự án Xây dựng & Đô thị Thông minh', GETDATE()),
('33333333-3333-3333-3333-000000000059', 'SV2024059', N'DH-K66', 2024, N'Truyền thông Đa phương tiện', GETDATE()),
('33333333-3333-3333-3333-000000000060', 'SV2024060', N'DS-K65', 2024, N'Công nghệ Sinh dược phẩm', GETDATE());
GO

-- 6. BẢNG COURSES (14 khóa học chuẩn)
INSERT INTO dbo.courses (id, course_code, title, description, thumbnail_url, teacher_id, is_published, weight_attendance, weight_assignments, weight_final_exam, created_at, updated_at)
VALUES
('44444444-4444-4444-4444-444444444444', 'INT3306', N'20241_Phát triển ứng dụng Mobile đa nền tảng (2+1)_12626W.1', N'Khóa học kiến trúc Fullstack Client-Server và Mobile đa nền tảng React Native, Flutter hiện đại.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800', '22222222-2222-2222-2222-222222222222', 1, 10.00, 30.00, 60.00, GETDATE(), GETDATE()),
('44444444-0000-0000-0000-000000000002', 'INT3307', N'Thiết kế & Lập trình Web Nâng cao (React + .NET 8 Web API)', N'Xây dựng hệ thống Web theo kiến trúc Clean Architecture, RESTful API và Entity Framework Core.', 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800', '22222222-2222-2222-2222-222222222222', 1, 10.00, 30.00, 60.00, GETDATE(), GETDATE()),
('44444444-0000-0000-0000-000000000003', 'INT3401', N'Trí tuệ Nhân tạo & Ứng dụng Học máy (Machine Learning)', N'Nguyên lý giải thuật Machine Learning, Deep Learning, mạng nơ-ron CNN, RNN và Transformer hiện đại.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', '22222222-2222-2222-2222-000000000002', 1, 10.00, 30.00, 60.00, GETDATE(), GETDATE()),
('44444444-0000-0000-0000-000000000004', 'INT3202', N'Cấu trúc Dữ liệu & Giải thuật Nâng cao', N'Cây nhị phân tìm kiếm, Đồ thị, Quy hoạch động, thuật toán luồng cực đại và cấu trúc dữ liệu tiên tiến.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800', '22222222-2222-2222-2222-000000000002', 1, 15.00, 25.00, 60.00, GETDATE(), GETDATE()),
('44444444-0000-0000-0000-000000000005', 'INT3503', N'An ninh Mạng & Phòng chống Tấn công Xâm nhập', N'Kỹ thuật phân tích lỗ hổng bảo mật Web, an toàn giao thức mạng và mô phỏng phòng thủ mạng SOC.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800', '22222222-2222-2222-2222-000000000003', 1, 10.00, 40.00, 50.00, GETDATE(), GETDATE()),
('44444444-0000-0000-0000-000000000006', 'INT3604', N'Điện toán Đám mây & Kiến trúc Microservices (Docker & K8s)', N'Ảo hóa container Docker, điều phối Kubernetes, triển khai CI/CD trên nền tảng AWS / Microsoft Azure.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800', '22222222-2222-2222-2222-000000000003', 1, 10.00, 30.00, 60.00, GETDATE(), GETDATE()),
('44444444-0000-0000-0000-000000000007', 'ELE2001', N'Mạch Tích hợp & Kỹ thuật Vi xử lý ARM', N'Thiết kế mạch số, lập trình vi điều khiển ARM Cortex-M, giao tiếp ngoại vi SPI, I2C, UART.', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', '22222222-2222-2222-2222-000000000004', 1, 15.00, 35.00, 50.00, GETDATE(), GETDATE()),
('44444444-0000-0000-0000-000000000008', 'ELE3005', N'Hệ thống Điều khiển Tự động & Robot Công nghiệp', N'Lập trình điều khiển cánh tay Robot 6 bậc tự do, tích hợp thị giác máy tính và hệ điều hành ROS.', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800', '22222222-2222-2222-2222-000000000004', 1, 10.00, 30.00, 60.00, GETDATE(), GETDATE()),
('44444444-0000-0000-0000-000000000009', 'BA1001', N'Khởi nghiệp Đổi mới Sáng tạo & Kinh doanh Số', N'Mô hình kinh doanh số Lean Canvas, tiếp cận thị trường MVP và gọi vốn đầu tư thiên thần.', 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800', '22222222-2222-2222-2222-000000000005', 1, 20.00, 30.00, 50.00, GETDATE(), GETDATE()),
('44444444-0000-0000-0000-000000000010', 'BA2004', N'Phân tích Tài chính Doanh nghiệp & Công nghệ Fintech', N'Quản trị dòng tiền, phân tích bảng cân đối kế toán và định giá công ty trong kỷ nguyên số.', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800', '22222222-2222-2222-2222-000000000005', 1, 10.00, 30.00, 60.00, GETDATE(), GETDATE()),
('44444444-0000-0000-0000-000000000011', 'FL1001', N'Tiếng Anh Giao tiếp Khoa học Kỹ thuật Quốc tế', N'Kỹ năng thuyết trình hội nghị học thuật, viết bài báo khoa học và đàm phán hợp đồng quốc tế.', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800', '22222222-2222-2222-2222-000000000006', 1, 20.00, 30.00, 50.00, GETDATE(), GETDATE()),
('44444444-0000-0000-0000-000000000012', 'ME2001', N'Thiết kế Mô hình 3D & Gia công Cơ khí Chính xác CAD/CAM', N'Ứng dụng phần mềm SolidWorks, Mastercam lập trình máy phay tiện CNC 5 trục.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800', '22222222-2222-2222-2222-000000000007', 1, 15.00, 35.00, 50.00, GETDATE(), GETDATE()),
('44444444-0000-0000-0000-000000000013', 'CE2001', N'Mô hình Thông tin Công trình BIM & Kết cấu Thép', N'Ứng dụng Autodesk Revit xây dựng bản vẽ 3D và phân tích chịu lực kết cấu công trình nhịp lớn.', 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800', '22222222-2222-2222-2222-000000000008', 1, 10.00, 30.00, 60.00, GETDATE(), GETDATE()),
('44444444-0000-0000-0000-000000000014', 'DES1001', N'Tư duy Thiết kế UI/UX & Thiết kế Hệ thống Design System', N'Nghiên cứu hành vi người dùng (User Research), wireframing, prototyping tương tác trên Figma.', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800', '22222222-2222-2222-2222-222222222222', 1, 15.00, 35.00, 50.00, GETDATE(), GETDATE());
GO

-- 7. BẢNG COURSE_SECTIONS (29 phân mục chương học)
INSERT INTO dbo.course_sections (id, course_id, title, order_index, is_locked, is_expanded, created_at)
VALUES
-- INT3306
('bbbbbbbb-0001-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', N'Giới thiệu chung & Tài liệu học phần', 1, 0, 1, GETDATE()),
('bbbbbbbb-0001-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', N'Week 1: Kiến trúc Mobile & Cài đặt môi trường', 2, 0, 1, GETDATE()),
('bbbbbbbb-0001-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', N'Week 2: Quản lý State & Navigation đa tầng', 3, 0, 1, GETDATE()),

-- INT3307
('bbbbbbbb-0002-0000-0000-000000000001', '44444444-0000-0000-0000-000000000002', N'Chương 1: Kiến trúc Web hiện đại & RESTful Standard', 1, 0, 1, GETDATE()),
('bbbbbbbb-0002-0000-0000-000000000002', '44444444-0000-0000-0000-000000000002', N'Chương 2: Xây dựng Backend với .NET 8 & EF Core', 2, 0, 1, GETDATE()),
('bbbbbbbb-0002-0000-0000-000000000003', '44444444-0000-0000-0000-000000000002', N'Chương 3: Single Page Application với React 18 & Vite', 3, 0, 1, GETDATE()),

-- INT3401
('bbbbbbbb-0003-0000-0000-000000000001', '44444444-0000-0000-0000-000000000003', N'Tuần 1: Nhập môn Học máy & Xử lý dữ liệu', 1, 0, 1, GETDATE()),
('bbbbbbbb-0003-0000-0000-000000000002', '44444444-0000-0000-0000-000000000003', N'Tuần 2: Học có giám sát (Regression & Classification)', 2, 0, 1, GETDATE()),
('bbbbbbbb-0003-0000-0000-000000000003', '44444444-0000-0000-0000-000000000003', N'Tuần 3: Mạng nơ-ron sâu (Deep Neural Networks)', 3, 0, 1, GETDATE()),

-- INT3202
('bbbbbbbb-0004-0000-0000-000000000001', '44444444-0000-0000-0000-000000000004', N'Phần 1: Cây cân bằng AVL và Đỏ-Đen (Red-Black)', 1, 0, 1, GETDATE()),
('bbbbbbbb-0004-0000-0000-000000000002', '44444444-0000-0000-0000-000000000004', N'Phần 2: Thuật toán đồ thị và Quy hoạch động', 2, 0, 1, GETDATE()),

-- INT3503
('bbbbbbbb-0005-0000-0000-000000000001', '44444444-0000-0000-0000-000000000005', N'Chương 1: Mật mã học cổ điển & Mật mã khóa công khai', 1, 0, 1, GETDATE()),
('bbbbbbbb-0005-0000-0000-000000000002', '44444444-0000-0000-0000-000000000005', N'Chương 2: Tấn công mạng & Phòng thủ Tường lửa WAF', 2, 0, 1, GETDATE()),

-- INT3604
('bbbbbbbb-0006-0000-0000-000000000001', '44444444-0000-0000-0000-000000000006', N'Chương 1: Containerization với Docker & Docker Compose', 1, 0, 1, GETDATE()),
('bbbbbbbb-0006-0000-0000-000000000002', '44444444-0000-0000-0000-000000000006', N'Chương 2: Quản trị cụm Kubernetes & Auto-scaling', 2, 0, 1, GETDATE()),

-- ELE2001
('bbbbbbbb-0007-0000-0000-000000000001', '44444444-0000-0000-0000-000000000007', N'Tuần 1: Kiến trúc tập lệnh ARM Cortex & Thanh ghi', 1, 0, 1, GETDATE()),
('bbbbbbbb-0007-0000-0000-000000000002', '44444444-0000-0000-0000-000000000007', N'Tuần 2: Lập trình ngắt ngoại vi & Bộ định thời Timer', 2, 0, 1, GETDATE()),

-- ELE3005
('bbbbbbbb-0008-0000-0000-000000000001', '44444444-0000-0000-0000-000000000008', N'Chương 1: Động học thuận và nghịch Robot', 1, 0, 1, GETDATE()),
('bbbbbbbb-0008-0000-0000-000000000002', '44444444-0000-0000-0000-000000000008', N'Chương 2: Quy hoạch quỹ đạo & Tích hợp ROS', 2, 0, 1, GETDATE()),

-- BA1001
('bbbbbbbb-0009-0000-0000-000000000001', '44444444-0000-0000-0000-000000000009', N'Giai đoạn 1: Khám phá nhu cầu khách hàng & Ý tưởng', 1, 0, 1, GETDATE()),
('bbbbbbbb-0009-0000-0000-000000000002', '44444444-0000-0000-0000-000000000009', N'Giai đoạn 2: Xây dựng MVP & Kế hoạch tài chính', 2, 0, 1, GETDATE()),

-- BA2004
('bbbbbbbb-0010-0000-0000-000000000001', '44444444-0000-0000-0000-000000000010', N'Phần 1: Báo cáo tài chính doanh nghiệp', 1, 0, 1, GETDATE()),
('bbbbbbbb-0010-0000-0000-000000000002', '44444444-0000-0000-0000-000000000010', N'Phần 2: Ứng dụng Blockchain & Cổng thanh toán Fintech', 2, 0, 1, GETDATE()),

-- FL1001
('bbbbbbbb-0011-0000-0000-000000000001', '44444444-0000-0000-0000-000000000011', N'Unit 1: Academic Writing & Research Abstracts', 1, 0, 1, GETDATE()),
('bbbbbbbb-0011-0000-0000-000000000002', '44444444-0000-0000-0000-000000000011', N'Unit 2: International Conference Presentation Skills', 2, 0, 1, GETDATE()),

-- ME2001
('bbbbbbbb-0012-0000-0000-000000000001', '44444444-0000-0000-0000-000000000012', N'Chương 1: Phác thảo mô hình 3D trên SolidWorks', 1, 0, 1, GETDATE()),
('bbbbbbbb-0012-0000-0000-000000000002', '44444444-0000-0000-0000-000000000012', N'Chương 2: Xuất mã G-Code cho máy phay CNC', 2, 0, 1, GETDATE()),

-- CE2001
('bbbbbbbb-0013-0000-0000-000000000001', '44444444-0000-0000-0000-000000000013', N'Chương 1: Xây dựng mô hình 3D BIM với Revit', 1, 0, 1, GETDATE()),
('bbbbbbbb-0013-0000-0000-000000000002', '44444444-0000-0000-0000-000000000013', N'Chương 2: Phân tích kết cấu chịu lực nhịp lớn', 2, 0, 1, GETDATE()),

-- DES1001
('bbbbbbbb-0014-0000-0000-000000000001', '44444444-0000-0000-0000-000000000014', N'Chương 1: Nguyên lý thị giác & Bố cục UI hiện đại', 1, 0, 1, GETDATE()),
('bbbbbbbb-0014-0000-0000-000000000002', '44444444-0000-0000-0000-000000000014', N'Chương 2: Xây dựng Design System chuyên nghiệp trên Figma', 2, 0, 1, GETDATE());
GO

-- 8. BẢNG LESSONS (29 bài học)
INSERT INTO dbo.lessons (id, course_id, section_id, title, order_index, content_type, subtitle, content_url, body_markdown, is_locked, created_at)
VALUES
-- INT3306
('55555555-0001-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-0001-0000-0000-000000000001', N'Thông tin tổng quan học phần: Phát triển ứng dụng Mobile & Web đa nền tảng', 1, 'OVERVIEW', NULL, NULL, N'# Giới thiệu học phần\nHọc phần trang bị kiến thức nền tảng phát triển ứng dụng di động đa nền tảng hiện đại.', 0, GETDATE()),
('55555555-0001-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-0001-0000-0000-000000000001', N'Scorm giới thiệu tổng quan học phần lập trình ứng dụng', 2, 'SCORM', 'SCORM', 'https://www.youtube.com/embed/d95475151', NULL, 0, GETDATE()),
('55555555-0001-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-0001-0000-0000-000000000001', N'Đề cương chi tiết học phần', 3, 'PDF', 'PDF', 'https://example.com/docs/de-cuong.pdf', NULL, 0, GETDATE()),
('55555555-0001-0000-0000-000000000004', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-0001-0000-0000-000000000002', N'Video Bài giảng Week 1: Khởi tạo React Native Expo', 4, 'VIDEO', 'VIDEO', 'https://www.youtube.com/embed/dQw4w9WgXcQ', NULL, 0, GETDATE()),
('55555555-0001-0000-0000-000000000005', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-0001-0000-0000-000000000002', N'Bài tập thực hành Tuần 1: Xây dựng UI Profile người dùng', 5, 'PRACTICE', 'THỰC HÀNH', NULL, N'Yêu cầu hoàn thành component trang cá nhân người dùng với Flexbox.', 0, GETDATE()),
('55555555-0001-0000-0000-000000000006', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-0001-0000-0000-000000000002', N'Trắc nghiệm ôn tập Tuần 1: React Native Core Components', 6, 'QUIZ', 'TRẮC NGHIỆM', NULL, NULL, 0, GETDATE()),

-- INT3307
('55555555-0002-0000-0000-000000000001', '44444444-0000-0000-0000-000000000002', 'bbbbbbbb-0002-0000-0000-000000000001', N'Bài giảng: RESTful API Principles & Best Practices', 1, 'PDF', 'SLIDE', 'https://example.com/slides/rest-api.pdf', NULL, 0, GETDATE()),
('55555555-0002-0000-0000-000000000002', '44444444-0000-0000-0000-000000000002', 'bbbbbbbb-0002-0000-0000-000000000002', N'Video: Xây dựng Web API với ASP.NET Core & EF Core', 2, 'VIDEO', 'VIDEO', 'https://www.youtube.com/embed/dQw4w9WgXcQ', NULL, 0, GETDATE()),
('55555555-0002-0000-0000-000000000003', '44444444-0000-0000-0000-000000000002', 'bbbbbbbb-0002-0000-0000-000000000003', N'Bài kiểm tra trắc nghiệm: Kiến trúc Web API & JWT Auth', 3, 'QUIZ', 'TRẮC NGHIỆM', NULL, NULL, 0, GETDATE()),

-- INT3401
('55555555-0003-0000-0000-000000000001', '44444444-0000-0000-0000-000000000003', 'bbbbbbbb-0003-0000-0000-000000000001', N'Slide: Thuật toán Hồi quy Tuyến tính & Phân loại Logistic', 1, 'PDF', 'SLIDE', 'https://example.com/slides/ml-intro.pdf', NULL, 0, GETDATE()),
('55555555-0003-0000-0000-000000000002', '44444444-0000-0000-0000-000000000003', 'bbbbbbbb-0003-0000-0000-000000000002', N'Thực hành: Huấn luyện mô hình Scikit-Learn trên Colab', 2, 'PRACTICE', 'LAB', NULL, N'Huấn luyện mô hình dự đoán giá nhà sử dụng tập dữ liệu Boston Housing.', 0, GETDATE()),
('55555555-0003-0000-0000-000000000003', '44444444-0000-0000-0000-000000000003', 'bbbbbbbb-0003-0000-0000-000000000003', N'Trắc nghiệm Đánh giá: Giải thuật Học máy Cơ bản', 3, 'QUIZ', 'TRẮC NGHIỆM', NULL, NULL, 0, GETDATE()),

-- INT3202
('55555555-0004-0000-0000-000000000001', '44444444-0000-0000-0000-000000000004', 'bbbbbbbb-0004-0000-0000-000000000001', N'Tài liệu: Cân bằng xoay cây AVL & Ứng dụng', 1, 'PDF', 'TÀI LIỆU', 'https://example.com/docs/avl-tree.pdf', NULL, 0, GETDATE()),
('55555555-0004-0000-0000-000000000002', '44444444-0000-0000-0000-000000000004', 'bbbbbbbb-0004-0000-0000-000000000002', N'Trắc nghiệm: Độ phức tạp thuật toán O(logN) và O(N)', 2, 'QUIZ', 'TRẮC NGHIỆM', NULL, NULL, 0, GETDATE()),

-- INT3503
('55555555-0005-0000-0000-000000000001', '44444444-0000-0000-0000-000000000005', 'bbbbbbbb-0005-0000-0000-000000000001', N'Video: Phân tích lỗ hổng SQL Injection và XSS', 1, 'VIDEO', 'VIDEO', 'https://www.youtube.com/embed/dQw4w9WgXcQ', NULL, 0, GETDATE()),
('55555555-0005-0000-0000-000000000002', '44444444-0000-0000-0000-000000000005', 'bbbbbbbb-0005-0000-0000-000000000002', N'Trắc nghiệm An ninh Mạng: Top 10 OWASP', 2, 'QUIZ', 'TRẮC NGHIỆM', NULL, NULL, 0, GETDATE()),

-- INT3604
('55555555-0006-0000-0000-000000000001', '44444444-0000-0000-0000-000000000006', 'bbbbbbbb-0006-0000-0000-000000000001', N'Slide: Dockerfile & Multi-stage Build tối ưu dung lượng', 1, 'PDF', 'SLIDE', 'https://example.com/slides/docker.pdf', NULL, 0, GETDATE()),
('55555555-0006-0000-0000-000000000002', '44444444-0000-0000-0000-000000000006', 'bbbbbbbb-0006-0000-0000-000000000002', N'Trắc nghiệm: Quản trị Docker & Kubernetes Cluster', 2, 'QUIZ', 'TRẮC NGHIỆM', NULL, NULL, 0, GETDATE()),

-- ELE2001
('55555555-0007-0000-0000-000000000001', '44444444-0000-0000-0000-000000000007', 'bbbbbbbb-0007-0000-0000-000000000001', N'Sơ đồ chân vi điều khiển STM32F4', 1, 'PDF', 'TÀI LIỆU', 'https://example.com/docs/stm32.pdf', NULL, 0, GETDATE()),
('55555555-0007-0000-0000-000000000002', '44444444-0000-0000-0000-000000000007', 'bbbbbbbb-0007-0000-0000-000000000002', N'Trắc nghiệm: Giao thức ngoại vi I2C và SPI', 2, 'QUIZ', 'TRẮC NGHIỆM', NULL, NULL, 0, GETDATE()),

-- ELE3005
('55555555-0008-0000-0000-000000000001', '44444444-0000-0000-0000-000000000008', 'bbbbbbbb-0008-0000-0000-000000000001', N'Tài liệu Ma trận biến đổi Denavit-Hartenberg (D-H)', 1, 'PDF', 'SLIDE', 'https://example.com/docs/robotics.pdf', NULL, 0, GETDATE()),
('55555555-0008-0000-0000-000000000002', '44444444-0000-0000-0000-000000000008', 'bbbbbbbb-0008-0000-0000-000000000002', N'Trắc nghiệm: Động học Robot công nghiệp', 2, 'QUIZ', 'TRẮC NGHIỆM', NULL, NULL, 0, GETDATE()),

-- BA1001
('55555555-0009-0000-0000-000000000001', '44444444-0000-0000-0000-000000000009', 'bbbbbbbb-0009-0000-0000-000000000001', N'Biểu mẫu Lean Canvas 9 ô chiến lược', 1, 'DOCX', 'MẪU', 'https://example.com/docs/lean-canvas.docx', NULL, 0, GETDATE()),
('55555555-0009-0000-0000-000000000002', '44444444-0000-0000-0000-000000000009', 'bbbbbbbb-0009-0000-0000-000000000002', N'Trắc nghiệm: Khởi nghiệp & Phát triển sản phẩm', 2, 'QUIZ', 'TRẮC NGHIỆM', NULL, NULL, 0, GETDATE()),

-- FL1001
('55555555-0011-0000-0000-000000000001', '44444444-0000-0000-0000-000000000011', 'bbbbbbbb-0011-0000-0000-000000000001', N'Audio & Script: Presenting Engineering Projects', 1, 'LINK', 'AUDIO', 'https://example.com/audio/tech-english.mp3', NULL, 0, GETDATE()),
('55555555-0011-0000-0000-000000000002', '44444444-0000-0000-0000-000000000011', 'bbbbbbbb-0011-0000-0000-000000000002', N'Quiz: Academic English Vocabulary & Grammar', 2, 'QUIZ', 'TRẮC NGHIỆM', NULL, NULL, 0, GETDATE()),

-- DES1001
('55555555-0014-0000-0000-000000000001', '44444444-0000-0000-0000-000000000014', 'bbbbbbbb-0014-0000-0000-000000000001', N'Hướng dẫn thực hành: Tạo Component Variants trên Figma', 1, 'VIDEO', 'VIDEO', 'https://www.youtube.com/embed/dQw4w9WgXcQ', NULL, 0, GETDATE()),
('55555555-0014-0000-0000-000000000002', '44444444-0000-0000-0000-000000000014', 'bbbbbbbb-0014-0000-0000-000000000002', N'Trắc nghiệm: Nguyên lý UX Design & Luật Fitts', 2, 'QUIZ', 'TRẮC NGHIỆM', NULL, NULL, 0, GETDATE());
GO

-- -- 9. BẢNG ENROLLMENTS (Mỗi khóa học tầm 30-40 sinh viên: 486 lượt ghi danh)
DECLARE @CourseAllocations TABLE (
    course_code VARCHAR(50),
    start_student_idx INT,
    num_students INT
);

INSERT INTO @CourseAllocations VALUES
('INT3306', 1, 36),   -- 36 SV (SV01 -> SV36)
('INT3307', 1, 35),   -- 35 SV (SV01 -> SV35)
('INT3401', 2, 38),   -- 38 SV (SV02 -> SV39)
('INT3202', 1, 34),   -- 34 SV (SV01 -> SV34)
('INT3503', 3, 33),   -- 33 SV (SV03 -> SV35)
('INT3604', 1, 35),   -- 35 SV (SV01 -> SV35)
('ELE2001', 10, 32),  -- 32 SV (SV10 -> SV41)
('ELE3005', 12, 34),  -- 34 SV (SV12 -> SV45)
('BA1001', 14, 37),   -- 37 SV (SV14 -> SV50)
('BA2004', 15, 33),   -- 33 SV (SV15 -> SV47)
('FL1001', 1, 38),    -- 38 SV (SV01 -> SV38)
('ME2001', 19, 32),   -- 32 SV (SV19 -> SV50)
('CE2001', 20, 33),   -- 33 SV (SV20 -> SV52)
('DES1001', 1, 36);   -- 36 SV (SV01 -> SV36)

;WITH Numbers AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM Numbers WHERE n < 60
),
StudentList AS (
    SELECT 
        n,
        CASE 
            WHEN n = 1 THEN CAST('33333333-3333-3333-3333-333333333333' AS UNIQUEIDENTIFIER)
            ELSE CAST('33333333-3333-3333-3333-' + RIGHT('000000000000' + CAST(n AS VARCHAR), 12) AS UNIQUEIDENTIFIER)
        END AS student_id
    FROM Numbers
)
INSERT INTO dbo.enrollments (id, course_id, student_id, enrolled_at, progress_percentage, is_completed, completed_at, status)
SELECT 
    NEWID() AS id,
    c.id AS course_id,
    s.student_id,
    DATEADD(DAY, -((n * 3 + ABS(CHECKSUM(c.id))) % 60 + 5), GETDATE()) AS enrolled_at,
    prog.progress AS progress_percentage,
    CASE WHEN prog.progress >= 100.00 THEN 1 ELSE 0 END AS is_completed,
    CASE WHEN prog.progress >= 100.00 THEN DATEADD(DAY, -2, GETDATE()) ELSE NULL END AS completed_at,
    CASE WHEN prog.progress >= 100.00 THEN 'COMPLETED' ELSE 'ACTIVE' END AS status
FROM @CourseAllocations ca
JOIN dbo.courses c ON c.course_code = ca.course_code
JOIN StudentList s ON s.n >= ca.start_student_idx AND s.n < (ca.start_student_idx + ca.num_students)
CROSS APPLY (
    SELECT 
        CASE 
            WHEN ((s.n * 7 + ABS(CHECKSUM(c.id))) % 10) = 0 THEN 100.00
            WHEN ((s.n * 7 + ABS(CHECKSUM(c.id))) % 10) = 1 THEN 95.00
            WHEN ((s.n * 7 + ABS(CHECKSUM(c.id))) % 10) = 2 THEN 85.00
            WHEN ((s.n * 7 + ABS(CHECKSUM(c.id))) % 10) = 3 THEN 75.00
            WHEN ((s.n * 7 + ABS(CHECKSUM(c.id))) % 10) = 4 THEN 60.00
            WHEN ((s.n * 7 + ABS(CHECKSUM(c.id))) % 10) = 5 THEN 50.00
            WHEN ((s.n * 7 + ABS(CHECKSUM(c.id))) % 10) = 6 THEN 40.00
            WHEN ((s.n * 7 + ABS(CHECKSUM(c.id))) % 10) = 7 THEN 30.00
            WHEN ((s.n * 7 + ABS(CHECKSUM(c.id))) % 10) = 8 THEN 20.00
            ELSE 10.00
        END AS progress
) prog;
GO

-- 10. BẢNG FINAL_GRADES (34 bảng điểm chuẩn)
INSERT INTO dbo.final_grades (id, enrollment_id, attendance_score, assignments_score, final_exam_score, total_score, letter_grade, is_passed, finalized_at, graded_by)
SELECT 
    NEWID(),
    e.id,
    att.score,
    ass.score,
    fe.score,
    ROUND(att.score * (c.weight_attendance / 100.0) + ass.score * (c.weight_assignments / 100.0) + fe.score * (c.weight_final_exam / 100.0), 2),
    CASE 
        WHEN ROUND(att.score * (c.weight_attendance / 100.0) + ass.score * (c.weight_assignments / 100.0) + fe.score * (c.weight_final_exam / 100.0), 2) >= 9.0 THEN 'A+'
        WHEN ROUND(att.score * (c.weight_attendance / 100.0) + ass.score * (c.weight_assignments / 100.0) + fe.score * (c.weight_final_exam / 100.0), 2) >= 8.5 THEN 'A'
        WHEN ROUND(att.score * (c.weight_attendance / 100.0) + ass.score * (c.weight_assignments / 100.0) + fe.score * (c.weight_final_exam / 100.0), 2) >= 8.0 THEN 'B+'
        WHEN ROUND(att.score * (c.weight_attendance / 100.0) + ass.score * (c.weight_assignments / 100.0) + fe.score * (c.weight_final_exam / 100.0), 2) >= 7.0 THEN 'B'
        WHEN ROUND(att.score * (c.weight_attendance / 100.0) + ass.score * (c.weight_assignments / 100.0) + fe.score * (c.weight_final_exam / 100.0), 2) >= 6.5 THEN 'C+'
        WHEN ROUND(att.score * (c.weight_attendance / 100.0) + ass.score * (c.weight_assignments / 100.0) + fe.score * (c.weight_final_exam / 100.0), 2) >= 5.5 THEN 'C'
        WHEN ROUND(att.score * (c.weight_attendance / 100.0) + ass.score * (c.weight_assignments / 100.0) + fe.score * (c.weight_final_exam / 100.0), 2) >= 5.0 THEN 'D+'
        WHEN ROUND(att.score * (c.weight_attendance / 100.0) + ass.score * (c.weight_assignments / 100.0) + fe.score * (c.weight_final_exam / 100.0), 2) >= 4.0 THEN 'D'
        ELSE 'F'
    END,
    CASE WHEN ROUND(att.score * (c.weight_attendance / 100.0) + ass.score * (c.weight_assignments / 100.0) + fe.score * (c.weight_final_exam / 100.0), 2) >= 5.0 THEN 1 ELSE 0 END,
    GETDATE(),
    c.teacher_id
FROM dbo.enrollments e
JOIN dbo.courses c ON e.course_id = c.id
CROSS APPLY (SELECT ROUND(8.0 + (ABS(CHECKSUM(NEWID())) % 21) * 0.1, 2) AS score) att
CROSS APPLY (SELECT ROUND(7.5 + (ABS(CHECKSUM(NEWID())) % 26) * 0.1, 2) AS score) ass
CROSS APPLY (SELECT ROUND(7.0 + (ABS(CHECKSUM(NEWID())) % 31) * 0.1, 2) AS score) fe;
GO

-- 11. BẢNG LESSON_PROGRESS (95 tiến độ học tập)
INSERT INTO dbo.lesson_progress (id, enrollment_id, lesson_id, is_completed, quiz_passed, completed_at, last_accessed_at)
SELECT 
    NEWID(),
    e.id,
    l.id,
    1,
    CASE WHEN l.content_type = 'QUIZ' THEN 1 ELSE 0 END,
    GETDATE(),
    GETDATE()
FROM dbo.enrollments e
JOIN dbo.lessons l ON l.course_id = e.course_id;
GO

-- 12. BẢNG QUIZZES (11 bài trắc nghiệm)
INSERT INTO dbo.quizzes (id, lesson_id, title, description, password, passing_score, max_score, time_limit_minutes, max_attempts, shuffle_questions, created_at)
VALUES
('77770000-0000-0000-0000-000000000001', '55555555-0001-0000-0000-000000000006', N'Trắc nghiệm ôn tập Tuần 1: React Native Core Components', N'Đánh giá hiểu biết về JSX, View, Text, StyleSheet và Flexbox trong React Native.', '123456', 7.00, 10.00, 20, 3, 1, GETDATE()),
('77770000-0000-0000-0000-000000000002', '55555555-0002-0000-0000-000000000003', N'Bài kiểm tra trắc nghiệm: Kiến trúc Web API & JWT Auth', N'Kiểm tra kiến thức REST API methods (GET, POST, PUT, DELETE) và cơ chế Token Bearer.', '123456', 7.00, 10.00, 15, 3, 1, GETDATE()),
('77770000-0000-0000-0000-000000000003', '55555555-0003-0000-0000-000000000003', N'Trắc nghiệm Đánh giá: Giải thuật Học máy Cơ bản', N'Đánh giá hàm mất mát Loss Function, Gradient Descent và độ đo Accuracy/Precision.', '123456', 6.50, 10.00, 25, 2, 1, GETDATE()),
('77770000-0000-0000-0000-000000000004', '55555555-0004-0000-0000-000000000002', N'Trắc nghiệm: Độ phức tạp thuật toán O(logN) và O(N)', N'Các câu hỏi phân tích Big-O Notation, Heap Sort, Quick Sort và Dijkstra.', '123456', 7.00, 10.00, 20, 3, 1, GETDATE()),
('77770000-0000-0000-0000-000000000005', '55555555-0005-0000-0000-000000000002', N'Trắc nghiệm An ninh Mạng: Top 10 OWASP', N'Phòng chống giả mạo CSRF, tràn bộ đệm và mã hóa mật khẩu an toàn.', '123456', 7.00, 10.00, 15, 3, 1, GETDATE()),
('77770000-0000-0000-0000-000000000006', '55555555-0006-0000-0000-000000000002', N'Trắc nghiệm: Quản trị Docker & Kubernetes Cluster', N'Kiến thức về Pod, Service, Ingress, Persistent Volume và Deployment.', '123456', 7.00, 10.00, 20, 2, 1, GETDATE()),
('77770000-0000-0000-0000-000000000007', '55555555-0007-0000-0000-000000000002', N'Trắc nghiệm: Giao thức ngoại vi I2C và SPI', N'Đặc tính tốc độ Baudrate, Master-Slave và thanh ghi điều khiển ngắt.', '123456', 7.00, 10.00, 15, 3, 1, GETDATE()),
('77770000-0000-0000-0000-000000000008', '55555555-0008-0000-0000-000000000002', N'Trắc nghiệm: Động học Robot công nghiệp', N'Tọa độ Euler, Ma trận đồng nhất và không gian làm việc Work Envelope.', '123456', 6.50, 10.00, 20, 2, 1, GETDATE()),
('77770000-0000-0000-0000-000000000009', '55555555-0009-0000-0000-000000000002', N'Trắc nghiệm: Khởi nghiệp & Phát triển sản phẩm', N'Chi phí CAC, Giá trị vòng đời LTV, Điểm hòa vốn và định giá sản phẩm số.', '123456', 7.00, 10.00, 20, 3, 1, GETDATE()),
('77770000-0000-0000-0000-000000000010', '55555555-0014-0000-0000-000000000002', N'Trắc nghiệm: Nguyên lý UX Design & Luật Fitts', N'Độ tương phản màu WCAG, phân cấp thị giác và thiết kế giao diện thân thiện di động.', '123456', 7.00, 10.00, 15, 3, 1, GETDATE()),
('77770000-0000-0000-0000-000000000011', '55555555-0011-0000-0000-000000000002', N'Quiz: Academic English Vocabulary & Grammar', N'Academic vocabulary, technical terms and reading comprehension questions.', '123456', 7.00, 10.00, 20, 3, 1, GETDATE());
GO

-- 13. BẢNG QUIZ_QUESTIONS (24 câu hỏi)
INSERT INTO dbo.quiz_questions (id, quiz_id, question_text, question_type, points, order_index, explanation, created_at)
VALUES
-- Quiz 1
('66660000-0000-0000-0000-000000000001', '77770000-0000-0000-0000-000000000001', N'Trong React Native, component nào tương đương với thẻ <div> trong HTML tiêu chuẩn?', 'SINGLE_CHOICE', 2.50, 1, N'Thẻ View đóng vai trò là container bọc tương tự thẻ div.', GETDATE()),
('66660000-0000-0000-0000-000000000002', '77770000-0000-0000-0000-000000000001', N'Thuộc tính flexDirection mặc định của Flexbox trong React Native có giá trị là gì?', 'SINGLE_CHOICE', 2.50, 2, N'React Native có flexDirection mặc định là "column", khác với web mặc định là "row".', GETDATE()),
('66660000-0000-0000-0000-000000000003', '77770000-0000-0000-0000-000000000001', N'Hook nào được dùng để quản lý trạng thái nội bộ của một Functional Component?', 'SINGLE_CHOICE', 2.50, 3, N'useState là hook cơ bản để khởi tạo và cập nhật trạng thái trong React.', GETDATE()),
('66660000-0000-0000-0000-000000000004', '77770000-0000-0000-0000-000000000001', N'Thư viện nào là tiêu chuẩn công nghiệp được sử dụng phổ biến nhất cho điều hướng trong React Native?', 'SINGLE_CHOICE', 2.50, 4, N'React Navigation là giải pháp routing đa tầng phổ biến nhất.', GETDATE()),

-- Quiz 2 (Web API)
('66660000-0000-0000-0000-000000000005', '77770000-0000-0000-0000-000000000002', N'Mã trạng thái HTTP nào biểu thị tạo tài nguyên mới thành công trên server?', 'SINGLE_CHOICE', 5.00, 1, N'201 Created là mã chuẩn cho thao tác POST tạo mới thành công.', GETDATE()),
('66660000-0000-0000-0000-000000000006', '77770000-0000-0000-0000-000000000002', N'Chuỗi JWT gồm mấy phần chính ngăn cách bởi dấu chấm?', 'SINGLE_CHOICE', 5.00, 2, N'Gồm 3 phần: Header, Payload và Signature.', GETDATE()),

-- Quiz 3 (Machine Learning)
('66660000-0000-0000-0000-000000000007', '77770000-0000-0000-0000-000000000003', N'Giải thuật nào sau đây thuộc nhóm học có giám sát (Supervised Learning)?', 'SINGLE_CHOICE', 5.00, 1, N'Random Forest và Logistic Regression là học có giám sát.', GETDATE()),
('66660000-0000-0000-0000-000000000008', '77770000-0000-0000-0000-000000000003', N'Hiện tượng mô hình học quá khớp với dữ liệu huấn luyện nhưng dự đoán kém trên dữ liệu mới gọi là gì?', 'SINGLE_CHOICE', 5.00, 2, N'Đó là hiện tượng Overfitting (quá khớp).', GETDATE()),

-- Quiz 4 (DSA)
('66660000-0000-0000-0000-000000000009', '77770000-0000-0000-0000-000000000004', N'Độ phức tạp trung bình của thao tác tìm kiếm trên cây tìm kiếm nhị phân cân bằng (AVL) là bao nhiêu?', 'SINGLE_CHOICE', 5.00, 1, N'Cây cân bằng luôn đảm bảo chiều cao log(N).', GETDATE()),
('66660000-0000-0000-0000-000000000010', '77770000-0000-0000-0000-000000000004', N'Thuật toán Dijkstra dùng để tìm đường đi ngắn nhất hoạt động với đồ thị có trọng số như thế nào?', 'SINGLE_CHOICE', 5.00, 2, N'Dijkstra chỉ hoạt động với trọng số không âm (>= 0).', GETDATE()),

-- Quiz 5 (Cybersecurity)
('66660000-0000-0000-0000-000000000011', '77770000-0000-0000-0000-000000000005', N'Biện pháp hiệu quả nhất để phòng chống tấn công SQL Injection là gì?', 'SINGLE_CHOICE', 5.00, 1, N'Sử dụng Parameterized Queries hoặc ORM như Entity Framework Core.', GETDATE()),
('66660000-0000-0000-0000-000000000012', '77770000-0000-0000-0000-000000000005', N'Tấn công XSS (Cross-Site Scripting) xảy ra khi nào?', 'SINGLE_CHOICE', 5.00, 2, N'Kẻ tấn công chèn mã JavaScript độc hại vào trang web người dùng.', GETDATE()),

-- Quiz 6 (Docker/K8s)
('66660000-0000-0000-0000-000000000013', '77770000-0000-0000-0000-000000000006', N'Đơn vị tính toán nhỏ nhất có thể triển khai và quản trị trong Kubernetes là gì?', 'SINGLE_CHOICE', 5.00, 1, N'Pod là đơn vị nhỏ nhất trong Kubernetes.', GETDATE()),
('66660000-0000-0000-0000-000000000014', '77770000-0000-0000-0000-000000000006', N'Lệnh nào trong Dockerfile dùng để chỉ định cổng mà container lắng nghe?', 'SINGLE_CHOICE', 5.00, 2, N'EXPOSE dùng để khai báo cổng mạng.', GETDATE()),

-- Quiz 7 (Embedded)
('66660000-0000-0000-0000-000000000015', '77770000-0000-0000-0000-000000000007', N'Giao thức truyền thông nối tiếp SPI sử dụng bao nhiêu dây tín hiệu chính?', 'SINGLE_CHOICE', 5.00, 1, N'Gồm 4 dây: MOSI, MISO, SCK và CS/SS.', GETDATE()),
('66660000-0000-0000-0000-000000000016', '77770000-0000-0000-0000-000000000007', N'Giao thức I2C sử dụng mấy dây truyền dữ liệu?', 'SINGLE_CHOICE', 5.00, 2, N'Gồm 2 dây: SDA (Data) và SCL (Clock).', GETDATE()),

-- Quiz 8 (Robotics)
('66660000-0000-0000-0000-000000000017', '77770000-0000-0000-0000-000000000008', N'Một cánh tay robot thông thường cần tối thiểu bao nhiêu bậc tự do (DOF) để định vị tự do vị trí và hướng trong không gian 3D?', 'SINGLE_CHOICE', 5.00, 1, N'Cần 6 bậc tự do: 3 tịnh tiến (x,y,z) và 3 quay (roll, pitch, yaw).', GETDATE()),
('66660000-0000-0000-0000-000000000018', '77770000-0000-0000-0000-000000000008', N'Hệ điều hành robot phổ biến nhất trong nghiên cứu học thuật là gì?', 'SINGLE_CHOICE', 5.00, 2, N'ROS (Robot Operating System) là nền tảng mã nguồn mở phổ biến nhất.', GETDATE()),

-- Quiz 10 (UI/UX)
('66660000-0000-0000-0000-000000000019', '77770000-0000-0000-0000-000000000010', N'Độ tương phản màu tối thiểu chuẩn WCAG AA cho văn bản kích thước thông thường là bao nhiêu?', 'SINGLE_CHOICE', 5.00, 1, N'Chuẩn WCAG AA quy định tỷ lệ tương phản tối thiểu là 4.5:1.', GETDATE()),
('66660000-0000-0000-0000-000000000020', '77770000-0000-0000-0000-000000000010', N'Luật Fitts trong thiết kế giao diện khẳng định điều gì?', 'SINGLE_CHOICE', 5.00, 2, N'Thời gian di chuyển đến mục tiêu phụ thuộc vào khoảng cách và kích thước nút bấm.', GETDATE()),

-- Quiz 11 (English)
('66660000-0000-0000-0000-000000000021', '77770000-0000-0000-0000-000000000011', N'Which section of an academic research paper summarizes the entire study?', 'SINGLE_CHOICE', 5.00, 1, N'Abstract summarizes background, methods, results and conclusion.', GETDATE()),
('66660000-0000-0000-0000-000000000022', '77770000-0000-0000-0000-000000000011', N'Choose the correct formal synonym for "to look into":', 'SINGLE_CHOICE', 5.00, 2, N'"Investigate" is the academic formal synonym.', GETDATE()),
('66660000-0000-0000-0000-000000000023', '77770000-0000-0000-0000-000000000009', N'Chỉ số CAC trong khởi nghiệp kinh doanh viết tắt của từ gì?', 'SINGLE_CHOICE', 5.00, 1, N'Customer Acquisition Cost (Chi phí thu hút một khách hàng mới).', GETDATE()),
('66660000-0000-0000-0000-000000000024', '77770000-0000-0000-0000-000000000009', N'Mô hình Lean Startup khuyến khích xây dựng vòng lặp nào?', 'SINGLE_CHOICE', 5.00, 2, N'Vòng lặp Xây dựng - Đo lường - Học hỏi (Build - Measure - Learn).', GETDATE());
GO

-- 14. BẢNG QUIZ_OPTIONS (68 lựa chọn đáp án)
INSERT INTO dbo.quiz_options (id, question_id, option_text, is_correct, explanation)
VALUES
-- Q1
(NEWID(), '66660000-0000-0000-0000-000000000001', N'<View>', 1, N'Chính xác! Thẻ View là container bọc.'),
(NEWID(), '66660000-0000-0000-0000-000000000001', N'<Container>', 0, N'Không tồn tại trong core components.'),
(NEWID(), '66660000-0000-0000-0000-000000000001', N'<div>', 0, N'React Native không hỗ trợ thẻ html trực tiếp.'),
(NEWID(), '66660000-0000-0000-0000-000000000001', N'<Block>', 0, N'Không đúng.'),

-- Q2
(NEWID(), '66660000-0000-0000-0000-000000000002', N'row', 0, N'Đây là mặc định trên trình duyệt web.'),
(NEWID(), '66660000-0000-0000-0000-000000000002', N'column', 1, N'Chính xác! Di động thiết kế theo chiều dọc màn hình.'),
(NEWID(), '66660000-0000-0000-0000-000000000002', N'row-reverse', 0, N'Sai.'),
(NEWID(), '66660000-0000-0000-0000-000000000002', N'flex-start', 0, N'Sai giá trị thuộc tính.'),

-- Q3
(NEWID(), '66660000-0000-0000-0000-000000000003', N'useState', 1, N'Chính xác! Dùng để lưu trữ trạng thái component.'),
(NEWID(), '66660000-0000-0000-0000-000000000003', N'useEffect', 0, N'useEffect dùng để quản lý vòng đời và side-effects.'),
(NEWID(), '66660000-0000-0000-0000-000000000003', N'useMemo', 0, N'useMemo dùng để cache giá trị tính toán nặng.'),
(NEWID(), '66660000-0000-0000-0000-000000000003', N'useRef', 0, N'useRef giữ tham chiếu không re-render.'),

-- Q4
(NEWID(), '66660000-0000-0000-0000-000000000004', N'React Navigation', 1, N'Chính xác! Thư viện định tuyến chuẩn cho React Native.'),
(NEWID(), '66660000-0000-0000-0000-000000000004', N'React Router DOM', 0, N'Dành cho web browser.'),
(NEWID(), '66660000-0000-0000-0000-000000000004', N'Next.js Router', 0, N'Dành cho framework Next.js.'),
(NEWID(), '66660000-0000-0000-0000-000000000004', N'Vue Router', 0, N'Dành cho Vue.'),

-- Q5 (HTTP)
(NEWID(), '66660000-0000-0000-0000-000000000005', N'200 OK', 0, N'200 OK cho phản hồi thông thường.'),
(NEWID(), '66660000-0000-0000-0000-000000000005', N'201 Created', 1, N'Chính xác! 201 Created là mã chuẩn cho POST.'),
(NEWID(), '66660000-0000-0000-0000-000000000005', N'204 No Content', 0, N'204 trả về khi không có nội dung body.'),
(NEWID(), '66660000-0000-0000-0000-000000000005', N'301 Moved', 0, N'Mã chuyển hướng.'),

-- Q6 (JWT)
(NEWID(), '66660000-0000-0000-0000-000000000006', N'2 phần', 0, N'Sai.'),
(NEWID(), '66660000-0000-0000-0000-000000000006', N'3 phần (Header.Payload.Signature)', 1, N'Chính xác! Cấu trúc 3 phần chuẩn RFC 7519.'),
(NEWID(), '66660000-0000-0000-0000-000000000006', N'4 phần', 0, N'Sai.'),
(NEWID(), '66660000-0000-0000-0000-000000000006', N'5 phần', 0, N'Sai.'),

-- Q7 (ML)
(NEWID(), '66660000-0000-0000-0000-000000000007', N'Random Forest', 1, N'Chính xác! Random Forest là học có giám sát.'),
(NEWID(), '66660000-0000-0000-0000-000000000007', N'K-Means Clustering', 0, N'K-Means là học không giám sát.'),
(NEWID(), '66660000-0000-0000-0000-000000000007', N'PCA (Phân tích thành phần chính)', 0, N'PCA là giảm chiều không giám sát.'),
(NEWID(), '66660000-0000-0000-0000-000000000007', N'DBSCAN', 0, N'DBSCAN là gom cụm mật độ không giám sát.'),

-- Q8 (Overfitting)
(NEWID(), '66660000-0000-0000-0000-000000000008', N'Underfitting (Chưa khớp)', 0, N'Underfitting là mô hình quá đơn giản.'),
(NEWID(), '66660000-0000-0000-0000-000000000008', N'Overfitting (Quá khớp)', 1, N'Chính xác! Mô hình nhớ vẹt dữ liệu train.'),
(NEWID(), '66660000-0000-0000-0000-000000000008', N'Normalization', 0, N'Chuẩn hóa dữ liệu.'),
(NEWID(), '66660000-0000-0000-0000-000000000008', N'Regularization', 0, N'Kỹ thuật giảm quá khớp.'),

-- Q9 (AVL)
(NEWID(), '66660000-0000-0000-0000-000000000009', N'O(log N)', 1, N'Chính xác! Cây AVL luôn giữ độ cao log N.'),
(NEWID(), '66660000-0000-0000-0000-000000000009', N'O(N)', 0, N'O(N) xảy ra khi cây bị lệch thành danh sách liên kết.'),
(NEWID(), '66660000-0000-0000-0000-000000000009', N'O(1)', 0, N'O(1) là thời gian của Hash Table.'),
(NEWID(), '66660000-0000-0000-0000-000000000009', N'O(N log N)', 0, N'Đây là độ phức tạp của sắp xếp.'),

-- Q10 (Dijkstra)
(NEWID(), '66660000-0000-0000-0000-000000000010', N'Trọng số không âm (>= 0)', 1, N'Chính xác! Trọng số âm cần thuật toán Bellman-Ford.'),
(NEWID(), '66660000-0000-0000-0000-000000000010', N'Trọng số tùy ý cả âm lẫn dương', 0, N'Sai, Dijkstra lặp vô hạn với chu trình âm.'),
(NEWID(), '66660000-0000-0000-0000-000000000010', N'Chỉ đồ thị có hướng', 0, N'Dijkstra chạy được cho cả vô hướng.'),
(NEWID(), '66660000-0000-0000-0000-000000000010', N'Chỉ đồ thị có dưới 10 đỉnh', 0, N'Không giới hạn số đỉnh.'),

-- Q11 (SQL Injection)
(NEWID(), '66660000-0000-0000-0000-000000000011', N'Parameterized Queries / Prepared Statements', 1, N'Chính xác! Ngăn ngừa mã SQL độc hại được diễn giải.'),
(NEWID(), '66660000-0000-0000-0000-000000000011', N'Nối chuỗi SQL thủ công', 0, N'Nối chuỗi gây ra lỗ hổng nghiêm trọng!'),
(NEWID(), '66660000-0000-0000-0000-000000000011', N'Tắt Firewall máy chủ', 0, N'Sai hoàn toàn.'),
(NEWID(), '66660000-0000-0000-0000-000000000011', N'Chỉ dùng GET thay vì POST', 0, N'Cả GET và POST đều có thể bị tiêm SQL.'),

-- Q13 (Kubernetes Pod)
(NEWID(), '66660000-0000-0000-0000-000000000013', N'Pod', 1, N'Chính xác! Pod chứa một hoặc nhiều containers cùng mạng.'),
(NEWID(), '66660000-0000-0000-0000-000000000013', N'Node', 0, N'Node là máy chủ vật lý hoặc máy ảo.'),
(NEWID(), '66660000-0000-0000-0000-000000000013', N'Cluster', 0, N'Cluster là toàn bộ cụm Kubernetes.'),
(NEWID(), '66660000-0000-0000-0000-000000000013', N'Service', 0, N'Service là cơ chế trừu tượng hóa định tuyến mạng.'),

-- Q19 (WCAG AA)
(NEWID(), '66660000-0000-0000-0000-000000000019', N'4.5:1', 1, N'Chính xác! Chuẩn WCAG 2.1 AA quy định tối thiểu 4.5:1.'),
(NEWID(), '66660000-0000-0000-0000-000000000019', N'2.0:1', 0, N'Tương phản quá thấp, khó đọc.'),
(NEWID(), '66660000-0000-0000-0000-000000000019', N'3.0:1', 0, N'3.0:1 chỉ dành cho văn bản cỡ lớn (Large text).'),
(NEWID(), '66660000-0000-0000-0000-000000000019', N'7.0:1', 0, N'7.0:1 là chuẩn AAA nâng cao.'),

-- Q21 (Abstract)
(NEWID(), '66660000-0000-0000-0000-000000000021', N'Abstract (Tóm tắt bài báo)', 1, N'Chính xác! Abstract tóm tắt toàn bộ nghiên cứu.'),
(NEWID(), '66660000-0000-0000-0000-000000000021', N'Appendix (Phụ lục)', 0, N'Phụ lục chứa dữ liệu bổ trợ.'),
(NEWID(), '66660000-0000-0000-0000-000000000021', N'References (Tài liệu tham khảo)', 0, N'Chứa danh mục nguồn trích dẫn.'),
(NEWID(), '66660000-0000-0000-0000-000000000021', N'Methodology', 0, N'Phương pháp nghiên cứu.'),

-- Q22 (Synonym)
(NEWID(), '66660000-0000-0000-0000-000000000022', N'Investigate', 1, N'Chính xác! Investigate là từ học thuật thay cho look into.'),
(NEWID(), '66660000-0000-0000-0000-000000000022', N'Watch', 0, N'Sai nghĩa.'),
(NEWID(), '66660000-0000-0000-0000-000000000022', N'Ignore', 0, N'Nghĩa trái ngược (bỏ qua).'),
(NEWID(), '66660000-0000-0000-0000-000000000022', N'Forget', 0, N'Quên lãng.');
GO

-- 15. BẢNG QUIZ_ATTEMPTS (23 lượt làm bài)
INSERT INTO dbo.quiz_attempts (id, quiz_id, student_id, attempt_number, score_achieved, is_passed, started_at, submitted_at)
VALUES
('cccc0000-0000-0000-0000-000000000001', '77770000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 1, 10.00, 1, DATEADD(MINUTE, -30, GETDATE()), GETDATE()),
('cccc0000-0000-0000-0000-000000000002', '77770000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-000000000002', 1, 10.00, 1, DATEADD(MINUTE, -25, GETDATE()), GETDATE()),
('cccc0000-0000-0000-0000-000000000003', '77770000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-000000000003', 1, 7.50, 1, DATEADD(MINUTE, -20, GETDATE()), GETDATE()),
('cccc0000-0000-0000-0000-000000000004', '77770000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-000000000004', 1, 5.00, 0, DATEADD(MINUTE, -15, GETDATE()), GETDATE()),
('cccc0000-0000-0000-0000-000000000005', '77770000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-000000000005', 1, 10.00, 1, DATEADD(MINUTE, -10, GETDATE()), GETDATE()),

('cccc0000-0000-0000-0000-000000000006', '77770000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 1, 10.00, 1, DATEADD(MINUTE, -40, GETDATE()), GETDATE()),
('cccc0000-0000-0000-0000-000000000007', '77770000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-000000000002', 1, 10.00, 1, DATEADD(MINUTE, -35, GETDATE()), GETDATE()),
('cccc0000-0000-0000-0000-000000000008', '77770000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-000000000006', 1, 5.00, 0, DATEADD(MINUTE, -30, GETDATE()), GETDATE()),

('cccc0000-0000-0000-0000-000000000009', '77770000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-000000000004', 1, 10.00, 1, DATEADD(MINUTE, -50, GETDATE()), GETDATE()),
('cccc0000-0000-0000-0000-000000000010', '77770000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-000000000005', 1, 10.00, 1, DATEADD(MINUTE, -45, GETDATE()), GETDATE()),

('cccc0000-0000-0000-0000-000000000011', '77770000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-000000000002', 1, 10.00, 1, DATEADD(MINUTE, -60, GETDATE()), GETDATE()),
('cccc0000-0000-0000-0000-000000000012', '77770000-0000-0000-0000-000000000005', '33333333-3333-3333-3333-000000000008', 1, 10.00, 1, DATEADD(MINUTE, -55, GETDATE()), GETDATE()),

('cccc0000-0000-0000-0000-000000000013', '77770000-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333', 1, 10.00, 1, DATEADD(MINUTE, -70, GETDATE()), GETDATE()),
('cccc0000-0000-0000-0000-000000000014', '77770000-0000-0000-0000-000000000007', '33333333-3333-3333-3333-000000000010', 1, 10.00, 1, DATEADD(MINUTE, -65, GETDATE()), GETDATE()),

('cccc0000-0000-0000-0000-000000000015', '77770000-0000-0000-0000-000000000008', '33333333-3333-3333-3333-000000000012', 1, 10.00, 1, DATEADD(MINUTE, -80, GETDATE()), GETDATE()),
('cccc0000-0000-0000-0000-000000000016', '77770000-0000-0000-0000-000000000009', '33333333-3333-3333-3333-000000000014', 1, 10.00, 1, DATEADD(MINUTE, -75, GETDATE()), GETDATE()),

('cccc0000-0000-0000-0000-000000000017', '77770000-0000-0000-0000-000000000010', '33333333-3333-3333-3333-000000000024', 1, 10.00, 1, DATEADD(MINUTE, -90, GETDATE()), GETDATE()),
('cccc0000-0000-0000-0000-000000000018', '77770000-0000-0000-0000-000000000010', '33333333-3333-3333-3333-000000000025', 1, 10.00, 1, DATEADD(MINUTE, -85, GETDATE()), GETDATE()),

('cccc0000-0000-0000-0000-000000000019', '77770000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-000000000004', 2, 10.00, 1, DATEADD(MINUTE, -5, GETDATE()), GETDATE()),
('cccc0000-0000-0000-0000-000000000020', '77770000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-000000000006', 2, 10.00, 1, DATEADD(MINUTE, -2, GETDATE()), GETDATE()),
('cccc0000-0000-0000-0000-000000000021', '77770000-0000-0000-0000-000000000011', '33333333-3333-3333-3333-000000000017', 1, 10.00, 1, DATEADD(MINUTE, -12, GETDATE()), GETDATE()),
('cccc0000-0000-0000-0000-000000000022', '77770000-0000-0000-0000-000000000011', '33333333-3333-3333-3333-000000000018', 1, 10.00, 1, DATEADD(MINUTE, -8, GETDATE()), GETDATE()),
('cccc0000-0000-0000-0000-000000000023', '77770000-0000-0000-0000-000000000009', '33333333-3333-3333-3333-000000000015', 1, 10.00, 1, DATEADD(MINUTE, -4, GETDATE()), GETDATE());
GO

-- 16. BẢNG QUIZ_ATTEMPT_ANSWERS (24 bản ghi)
INSERT INTO dbo.quiz_attempt_answers (id, attempt_id, question_id, selected_option_id, is_correct, points_earned)
VALUES
(NEWID(), 'cccc0000-0000-0000-0000-000000000001', '66660000-0000-0000-0000-000000000001', NULL, 1, 2.50),
(NEWID(), 'cccc0000-0000-0000-0000-000000000001', '66660000-0000-0000-0000-000000000002', NULL, 1, 2.50),
(NEWID(), 'cccc0000-0000-0000-0000-000000000001', '66660000-0000-0000-0000-000000000003', NULL, 1, 2.50),
(NEWID(), 'cccc0000-0000-0000-0000-000000000001', '66660000-0000-0000-0000-000000000004', NULL, 1, 2.50),

(NEWID(), 'cccc0000-0000-0000-0000-000000000002', '66660000-0000-0000-0000-000000000001', NULL, 1, 2.50),
(NEWID(), 'cccc0000-0000-0000-0000-000000000002', '66660000-0000-0000-0000-000000000002', NULL, 1, 2.50),
(NEWID(), 'cccc0000-0000-0000-0000-000000000002', '66660000-0000-0000-0000-000000000003', NULL, 1, 2.50),
(NEWID(), 'cccc0000-0000-0000-0000-000000000002', '66660000-0000-0000-0000-000000000004', NULL, 1, 2.50),

(NEWID(), 'cccc0000-0000-0000-0000-000000000006', '66660000-0000-0000-0000-000000000005', NULL, 1, 5.00),
(NEWID(), 'cccc0000-0000-0000-0000-000000000006', '66660000-0000-0000-0000-000000000006', NULL, 1, 5.00),

(NEWID(), 'cccc0000-0000-0000-0000-000000000009', '66660000-0000-0000-0000-000000000007', NULL, 1, 5.00),
(NEWID(), 'cccc0000-0000-0000-0000-000000000009', '66660000-0000-0000-0000-000000000008', NULL, 1, 5.00),

(NEWID(), 'cccc0000-0000-0000-0000-000000000011', '66660000-0000-0000-0000-000000000009', NULL, 1, 5.00),
(NEWID(), 'cccc0000-0000-0000-0000-000000000011', '66660000-0000-0000-0000-000000000010', NULL, 1, 5.00),

(NEWID(), 'cccc0000-0000-0000-0000-000000000012', '66660000-0000-0000-0000-000000000011', NULL, 1, 5.00),
(NEWID(), 'cccc0000-0000-0000-0000-000000000012', '66660000-0000-0000-0000-000000000012', NULL, 1, 5.00),

(NEWID(), 'cccc0000-0000-0000-0000-000000000013', '66660000-0000-0000-0000-000000000013', NULL, 1, 5.00),
(NEWID(), 'cccc0000-0000-0000-0000-000000000013', '66660000-0000-0000-0000-000000000014', NULL, 1, 5.00),

(NEWID(), 'cccc0000-0000-0000-0000-000000000017', '66660000-0000-0000-0000-000000000019', NULL, 1, 5.00),
(NEWID(), 'cccc0000-0000-0000-0000-000000000017', '66660000-0000-0000-0000-000000000020', NULL, 1, 5.00),

(NEWID(), 'cccc0000-0000-0000-0000-000000000021', '66660000-0000-0000-0000-000000000021', NULL, 1, 5.00),
(NEWID(), 'cccc0000-0000-0000-0000-000000000021', '66660000-0000-0000-0000-000000000022', NULL, 1, 5.00),
(NEWID(), 'cccc0000-0000-0000-0000-000000000023', '66660000-0000-0000-0000-000000000023', NULL, 1, 5.00),
(NEWID(), 'cccc0000-0000-0000-0000-000000000023', '66660000-0000-0000-0000-000000000024', NULL, 1, 5.00);
GO

-- 17. BẢNG ASSIGNMENTS (13 bài tập lớn)
INSERT INTO dbo.assignments (id, course_id, lesson_id, title, instructions, attachment_url, due_date, max_score, allow_git_repo, allowed_extensions, created_at)
VALUES
('eeea0000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', '55555555-0001-0000-0000-000000000005', N'Bài tập lớn: Ứng dụng Quản lý Chi tiêu Cá nhân đa nền tảng', N'Xây dựng ứng dụng hoàn chỉnh với React Native, sử dụng SQLite lưu trữ offline và đồng bộ Firebase.', 'https://example.com/assignments/mobile-spec.pdf', DATEADD(DAY, 14, GETDATE()), 10.00, 1, '.zip,.rar,.pdf', GETDATE()),
('eeea0000-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000002', NULL, N'Lab 2: Thiết kế RESTful API Đăng ký Môn học với ASP.NET Core', N'Viết đầy đủ các CRUD endpoints kèm Unit Tests xUnit đạt độ bao phủ code tối thiểu 80%.', NULL, DATEADD(DAY, 7, GETDATE()), 10.00, 1, '.zip,.rar,.7z', GETDATE()),
('eeea0000-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000003', '55555555-0003-0000-0000-000000000002', N'Đồ án AI: Phân loại Ảnh Chó/Mèo sử dụng Transfer Learning', N'Ứng dụng mô hình MobileNetV2 tiền huấn luyện để phân loại ảnh, viết báo cáo phân tích ma trận nhầm lẫn.', NULL, DATEADD(DAY, 21, GETDATE()), 10.00, 1, '.zip,.pdf', GETDATE()),
('eeea0000-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000004', NULL, N'Bài tập lập trình: Cài đặt Cây Đỏ-Đen (Red-Black Tree)', N'Cài đặt cấu trúc dữ liệu cây Red-Black bằng C++ hoặc Java, minh họa các trường hợp xoay trái xoay phải.', NULL, DATEADD(DAY, 10, GETDATE()), 10.00, 1, '.zip,.cpp,.java', GETDATE()),
('eeea0000-0000-0000-0000-000000000005', '44444444-0000-0000-0000-000000000005', NULL, N'Báo cáo An ninh Mạng: Khai thác lỗ hổng Web DVWA', N'Thực hiện tấn công có kiểm soát trên môi trường lab Damn Vulnerable Web App và đề xuất giải pháp vá lỗi.', NULL, DATEADD(DAY, 12, GETDATE()), 10.00, 1, '.pdf,.docx', GETDATE()),
('eeea0000-0000-0000-0000-000000000006', '44444444-0000-0000-0000-000000000006', NULL, N'Dự án DevOps: Đóng gói Microservices & Thiết lập CI/CD Pipeline', N'Viết kịch bản GitHub Actions tự động build Docker Image và deploy lên cụm k8s.', NULL, DATEADD(DAY, 18, GETDATE()), 10.00, 1, '.zip,.yaml', GETDATE()),
('eeea0000-0000-0000-0000-000000000007', '44444444-0000-0000-0000-000000000007', NULL, N'Thực hành STM32: Đọc dữ liệu cảm biến nhiệt độ DHT11 qua I2C', N'Lập trình firmware điều khiển hiển thị nhiệt độ và độ ẩm lên màn hình OLED 0.96 inch.', NULL, DATEADD(DAY, 9, GETDATE()), 10.00, 1, '.zip,.c,.h', GETDATE()),
('eeea0000-0000-0000-0000-000000000008', '44444444-0000-0000-0000-000000000008', NULL, N'Mô phỏng Robot: Điều khiển Cánh tay UR5 gắp thả vật thể trong Gazebo', N'Lập trình node ROS C++/Python để điều khiển tay máy UR5 thực hiện chu trình pick-and-place.', NULL, DATEADD(DAY, 20, GETDATE()), 10.00, 1, '.zip,.py,.launch', GETDATE()),
('eeea0000-0000-0000-0000-000000000009', '44444444-0000-0000-0000-000000000009', NULL, N'Bản kế hoạch kinh doanh số (Business Plan) cho Dự án Khởi nghiệp', N'Hoàn thiện slide thuyết trình Pitch Deck 10 trang gọi vốn vòng Seed cho sản phẩm công nghệ.', NULL, DATEADD(DAY, 15, GETDATE()), 10.00, 1, '.pdf,.pptx', GETDATE()),
('eeea0000-0000-0000-0000-000000000010', '44444444-0000-0000-0000-000000000011', NULL, N'English Essay: The Impact of Generative AI on Global Workforce', N'Viết bài luận học thuật 1.200 từ chuẩn định dạng APA 7th edition.', NULL, DATEADD(DAY, 11, GETDATE()), 10.00, 1, '.docx,.pdf', GETDATE()),
('eeea0000-0000-0000-0000-000000000011', '44444444-0000-0000-0000-000000000012', NULL, N'Đồ án CAD/CAM: Thiết kế Hộp giảm tốc 2 cấp bánh răng nghiêng', N'Xuất đầy đủ bản vẽ lắp 3D và các bản vẽ chế tạo chi tiết 2D kèm thuyết minh tính toán.', NULL, DATEADD(DAY, 25, GETDATE()), 10.00, 1, '.zip,.step,.dwg', GETDATE()),
('eeea0000-0000-0000-0000-000000000012', '44444444-0000-0000-0000-000000000014', NULL, N'Đồ án UI/UX: Thiết kế Ứng dụng Y tế Sức khỏe Telehealth trên Figma', N'Xây dựng nguyên mẫu clickable prototype với tối thiểu 15 màn hình chuẩn Material You / iOS HIG.', NULL, DATEADD(DAY, 16, GETDATE()), 10.00, 1, '.fig,.pdf', GETDATE()),
('eeea0000-0000-0000-0000-000000000013', '44444444-0000-0000-0000-000000000013', NULL, N'Đồ án BIM: Mô hình hóa Tòa nhà Văn phòng 10 tầng trên Revit', N'Triển khai bản vẽ kết cấu thép và bê tông cốt thép, trích xuất bảng khối lượng vật liệu xây dựng.', NULL, DATEADD(DAY, 22, GETDATE()), 10.00, 1, '.zip,.rvt,.pdf', GETDATE());
GO

-- 18. BẢNG SUBMISSIONS (18 bài nộp)
INSERT INTO dbo.submissions (id, assignment_id, student_id, submission_text, file_url, git_repo_url, status, grade, feedback, graded_by, submitted_at, graded_at)
VALUES
('eeeb0000-0000-0000-0000-000000000001', 'eeea0000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', N'Em gửi thầy link repo GitHub và file nén mã nguồn dự án app chi tiêu.', 'https://storage.lms.edu.vn/submissions/sv2024001_mobile.zip', 'https://github.com/tranthib/expensetracker-rn', 'GRADED', 9.50, N'Giao diện hoàn thiện rất đẹp, code sạch sẽ và có unit test đầy đủ.', '22222222-2222-2222-2222-222222222222', DATEADD(DAY, -2, GETDATE()), GETDATE()),
('eeeb0000-0000-0000-0000-000000000002', 'eeea0000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-000000000002', N'Bài làm nộp sớm, đã tích hợp biểu đồ thống kê chi tiêu.', 'https://storage.lms.edu.vn/submissions/sv2024002_mobile.zip', 'https://github.com/nguyenvanminh/finance-app', 'GRADED', 9.00, N'Chức năng tốt, biểu đồ trực quan, cần tối ưu thêm hiệu năng cuộn FlatList.', '22222222-2222-2222-2222-222222222222', DATEADD(DAY, -3, GETDATE()), GETDATE()),
('eeeb0000-0000-0000-0000-000000000003', 'eeea0000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-000000000003', N'Đã hoàn thành các chức năng cốt lõi theo đề bài.', 'https://storage.lms.edu.vn/submissions/sv2024003_mobile.zip', 'https://github.com/lethinhung/rn-project', 'SUBMITTED', NULL, NULL, NULL, DATEADD(DAY, -1, GETDATE()), NULL),
('eeeb0000-0000-0000-0000-000000000004', 'eeea0000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-000000000004', N'Em xin nộp bản thảo ban đầu.', 'https://storage.lms.edu.vn/submissions/sv2024004_mobile.zip', NULL, 'SUBMITTED', NULL, NULL, NULL, GETDATE(), NULL),

('eeeb0000-0000-0000-0000-000000000005', 'eeea0000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', N'Nộp bài lab 2 API đăng ký môn học.', 'https://storage.lms.edu.vn/submissions/sv2024001_webapi.zip', 'https://github.com/tranthib/dotnet-course-api', 'GRADED', 10.00, N'Rất xuất sắc, tuân thủ chặt chẽ RESTful và kiến trúc Clean Architecture.', '22222222-2222-2222-2222-222222222222', DATEADD(DAY, -4, GETDATE()), GETDATE()),
('eeeb0000-0000-0000-0000-000000000006', 'eeea0000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-000000000002', N'Đã bổ sung Swagger UI và tài liệu API.', 'https://storage.lms.edu.vn/submissions/sv2024002_webapi.zip', 'https://github.com/nguyenvanminh/lms-api', 'GRADED', 9.50, N'Tài liệu Swagger rất chỉn chu, xử lý ngoại lệ middleware tốt.', '22222222-2222-2222-2222-222222222222', DATEADD(DAY, -4, GETDATE()), GETDATE()),

('eeeb0000-0000-0000-0000-000000000007', 'eeea0000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-000000000004', N'Mô hình MobileNetV2 đạt accuracy 94.2% trên tập test.', 'https://storage.lms.edu.vn/submissions/sv2024004_ai_report.pdf', 'https://github.com/phamquocbao/cat-dog-classifier', 'GRADED', 9.50, N'Báo cáo khoa học rõ ràng, phân tích confusion matrix chi tiết.', '22222222-2222-2222-2222-000000000002', DATEADD(DAY, -5, GETDATE()), GETDATE()),
('eeeb0000-0000-0000-0000-000000000008', 'eeea0000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-000000000005', N'Nộp bài tập mô hình nhận diện ảnh.', 'https://storage.lms.edu.vn/submissions/sv2024005_ai.zip', NULL, 'SUBMITTED', NULL, NULL, NULL, DATEADD(DAY, -1, GETDATE()), NULL),

('eeeb0000-0000-0000-0000-000000000009', 'eeea0000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-000000000002', N'Mã nguồn Red-Black Tree với giao diện terminal tương tác.', 'https://storage.lms.edu.vn/submissions/sv2024002_rbtree.zip', 'https://github.com/nguyenvanminh/red-black-tree', 'GRADED', 10.00, N'Cài đặt chính xác các ca xoay và đổi màu, thuật toán kiểm tra tính hợp lệ chuẩn.', '22222222-2222-2222-2222-000000000002', DATEADD(DAY, -6, GETDATE()), GETDATE()),
('eeeb0000-0000-0000-0000-000000000010', 'eeea0000-0000-0000-0000-000000000005', '33333333-3333-3333-3333-000000000008', N'Báo cáo chi tiết khai thác SQL Injection và lỗ hổng CSRF.', 'https://storage.lms.edu.vn/submissions/sv2024008_security_report.pdf', NULL, 'GRADED', 9.00, N'Phân tích sâu, khuyến nghị vá lỗi bằng tham số hóa câu truy vấn chuẩn.', '22222222-2222-2222-2222-000000000003', DATEADD(DAY, -3, GETDATE()), GETDATE()),

('eeeb0000-0000-0000-0000-000000000011', 'eeea0000-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333', N'Kịch bản GitHub Actions và Kubernetes manifest files.', 'https://storage.lms.edu.vn/submissions/sv2024001_k8s.zip', 'https://github.com/tranthib/k8s-devops-pipeline', 'GRADED', 9.50, N'Pipeline CI/CD chạy mượt mà, cấu hình secret an toàn.', '22222222-2222-2222-2222-000000000003', DATEADD(DAY, -4, GETDATE()), GETDATE()),
('eeeb0000-0000-0000-0000-000000000012', 'eeea0000-0000-0000-0000-000000000007', '33333333-3333-3333-3333-000000000010', N'Mã nguồn firmware STM32 Keil C và video demo phần cứng.', 'https://storage.lms.edu.vn/submissions/sv2024010_stm32.zip', NULL, 'GRADED', 8.50, N'Chạy tốt trên board thực tế, hiển thị OLED sắc nét.', '22222222-2222-2222-2222-000000000004', DATEADD(DAY, -2, GETDATE()), GETDATE()),

('eeeb0000-0000-0000-0000-000000000013', 'eeea0000-0000-0000-0000-000000000008', '33333333-3333-3333-3333-000000000012', N'Package ROS điều khiển robot UR5 trong môi trường mô phỏng.', 'https://storage.lms.edu.vn/submissions/sv2024012_ur5_ros.zip', 'https://github.com/truongkhai/ur5_gazebo_pick_place', 'GRADED', 9.00, N'Quỹ đạo gắp thả chuẩn xác, giải thuật động học ngược ổn định.', '22222222-2222-2222-2222-000000000004', DATEADD(DAY, -5, GETDATE()), GETDATE()),
('eeeb0000-0000-0000-0000-000000000014', 'eeea0000-0000-0000-0000-000000000009', '33333333-3333-3333-3333-000000000014', N'Slide Pitch Deck khởi nghiệp nền tảng logistics số.', 'https://storage.lms.edu.vn/submissions/sv2024014_pitchdeck.pdf', NULL, 'GRADED', 8.50, N'Mô hình kinh doanh sáng tạo, tính toán dòng tiền hòa vốn hợp lý.', '22222222-2222-2222-2222-000000000005', DATEADD(DAY, -4, GETDATE()), GETDATE()),

('eeeb0000-0000-0000-0000-000000000015', 'eeea0000-0000-0000-0000-000000000010', '33333333-3333-3333-3333-000000000017', N'Academic Essay on AI Impacts in Modern Society.', 'https://storage.lms.edu.vn/submissions/sv2024017_essay.pdf', NULL, 'GRADED', 9.50, N'Excellent vocabulary, well-structured arguments and proper APA citations.', '22222222-2222-2222-2222-000000000006', DATEADD(DAY, -3, GETDATE()), GETDATE()),
('eeeb0000-0000-0000-0000-000000000016', 'eeea0000-0000-0000-0000-000000000011', '33333333-3333-3333-3333-000000000019', N'Hồ sơ thiết kế hộp giảm tốc và file STEP 3D.', 'https://storage.lms.edu.vn/submissions/sv2024019_gearbox_cad.zip', NULL, 'GRADED', 8.50, N'Bản vẽ 2D đúng tiêu chuẩn TCVN, tính toán bền bánh răng đạt yêu cầu.', '22222222-2222-2222-2222-000000000007', DATEADD(DAY, -6, GETDATE()), GETDATE()),

('eeeb0000-0000-0000-0000-000000000017', 'eeea0000-0000-0000-0000-000000000012', '33333333-3333-3333-3333-000000000024', N'File thiết kế Figma và link prototype tương tác app Telehealth.', 'https://storage.lms.edu.vn/submissions/sv2024024_telehealth_design.pdf', 'https://figma.com/@phungthang/telehealth-app', 'GRADED', 9.50, N'Giao diện rất chuyên nghiệp, luồng đặt lịch khám bác sĩ thông minh.', '22222222-2222-2222-2222-222222222222', DATEADD(DAY, -2, GETDATE()), GETDATE()),
('eeeb0000-0000-0000-0000-000000000018', 'eeea0000-0000-0000-0000-000000000012', '33333333-3333-3333-3333-000000000025', N'Nguyên mẫu thiết kế app y tế theo phong cách tối giản.', 'https://storage.lms.edu.vn/submissions/sv2024025_medical.pdf', NULL, 'SUBMITTED', NULL, NULL, NULL, DATEADD(DAY, -1, GETDATE()), NULL);
GO

-- 19. BẢNG SUBMISSION_FILES (18 tệp tin đính kèm)
INSERT INTO dbo.submission_files (id, submission_id, file_name, file_url, file_size, file_type, uploaded_at)
VALUES
(NEWID(), 'eeeb0000-0000-0000-0000-000000000001', N'expensetracker_source_v1.zip', 'https://storage.lms.edu.vn/submissions/sv2024001_mobile.zip', 15420000, 'application/zip', GETDATE()),
(NEWID(), 'eeeb0000-0000-0000-0000-000000000001', N'bao_cao_kien_truc_ung_dung.pdf', 'https://storage.lms.edu.vn/submissions/sv2024001_report.pdf', 2450000, 'application/pdf', GETDATE()),
(NEWID(), 'eeeb0000-0000-0000-0000-000000000002', N'finance_app_rn.zip', 'https://storage.lms.edu.vn/submissions/sv2024002_mobile.zip', 12300000, 'application/zip', GETDATE()),
(NEWID(), 'eeeb0000-0000-0000-0000-000000000003', N'rn_project_final.zip', 'https://storage.lms.edu.vn/submissions/sv2024003_mobile.zip', 9800000, 'application/zip', GETDATE()),
(NEWID(), 'eeeb0000-0000-0000-0000-000000000004', N'draft_assignment1.zip', 'https://storage.lms.edu.vn/submissions/sv2024004_mobile.zip', 8500000, 'application/zip', GETDATE()),

(NEWID(), 'eeeb0000-0000-0000-0000-000000000005', N'DotNet8_CourseApi_Source.zip', 'https://storage.lms.edu.vn/submissions/sv2024001_webapi.zip', 4500000, 'application/zip', GETDATE()),
(NEWID(), 'eeeb0000-0000-0000-0000-000000000006', N'LmsApi_Complete_Solution.zip', 'https://storage.lms.edu.vn/submissions/sv2024002_webapi.zip', 5200000, 'application/zip', GETDATE()),

(NEWID(), 'eeeb0000-0000-0000-0000-000000000007', N'BaoCao_MoHinh_PhanLoaiAnh_AI.pdf', 'https://storage.lms.edu.vn/submissions/sv2024004_ai_report.pdf', 3800000, 'application/pdf', GETDATE()),
(NEWID(), 'eeeb0000-0000-0000-0000-000000000008', N'Colab_Notebook_CatsDogs.ipynb', 'https://storage.lms.edu.vn/submissions/sv2024005_ai.zip', 1200000, 'application/octet-stream', GETDATE()),

(NEWID(), 'eeeb0000-0000-0000-0000-000000000009', N'RedBlackTree_Cpp_Implementation.zip', 'https://storage.lms.edu.vn/submissions/sv2024002_rbtree.zip', 850000, 'application/zip', GETDATE()),
(NEWID(), 'eeeb0000-0000-0000-0000-000000000010', N'BaoCao_KhaiThac_LoHong_DVWA.pdf', 'https://storage.lms.edu.vn/submissions/sv2024008_security_report.pdf', 4100000, 'application/pdf', GETDATE()),

(NEWID(), 'eeeb0000-0000-0000-0000-000000000011', N'Kubernetes_Manifests_Helm.zip', 'https://storage.lms.edu.vn/submissions/sv2024001_k8s.zip', 950000, 'application/zip', GETDATE()),
(NEWID(), 'eeeb0000-0000-0000-0000-000000000012', N'STM32F4_DHT11_OLED_Code.zip', 'https://storage.lms.edu.vn/submissions/sv2024010_stm32.zip', 3200000, 'application/zip', GETDATE()),

(NEWID(), 'eeeb0000-0000-0000-0000-000000000013', N'UR5_Gazebo_ROS_Package.zip', 'https://storage.lms.edu.vn/submissions/sv2024012_ur5_ros.zip', 18900000, 'application/zip', GETDATE()),
(NEWID(), 'eeeb0000-0000-0000-0000-000000000014', N'PitchDeck_Startup_Logistics_2025.pdf', 'https://storage.lms.edu.vn/submissions/sv2024014_pitchdeck.pdf', 7800000, 'application/pdf', GETDATE()),

(NEWID(), 'eeeb0000-0000-0000-0000-000000000015', N'Essay_AI_Impact_Workforce.docx', 'https://storage.lms.edu.vn/submissions/sv2024017_essay.pdf', 540000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', GETDATE()),
(NEWID(), 'eeeb0000-0000-0000-0000-000000000016', N'HopGiamToc_BanVe3D_CAD.zip', 'https://storage.lms.edu.vn/submissions/sv2024019_gearbox_cad.zip', 24600000, 'application/zip', GETDATE()),
(NEWID(), 'eeeb0000-0000-0000-0000-000000000017', N'Telehealth_UI_DesignSystem_Doc.pdf', 'https://storage.lms.edu.vn/submissions/sv2024024_telehealth_design.pdf', 14200000, 'application/pdf', GETDATE());
GO

-- 20. BẢNG ANNOUNCEMENTS (13 thông báo)
INSERT INTO dbo.announcements (id, course_id, teacher_id, title, content, is_pinned, attachment_url, created_at, updated_at)
VALUES
('ddda0000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', N'Thông báo về việc nộp bài tập lớn học phần INT3306', N'Các nhóm chú ý hạn chót nộp bài tập lớn là 23h59 Chủ nhật tuần sau. Nộp đầy đủ mã nguồn kèm tài liệu PDF.', 1, 'https://example.com/docs/huong-dan-nop-btl.pdf', GETDATE(), GETDATE()),
('ddda0000-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', N'Kế hoạch thi vấn đáp kết thúc môn Web Nâng cao', N'Lịch thi vấn đáp demo đồ án sẽ diễn ra tại phòng máy A2-401 vào sáng thứ 6.', 1, NULL, GETDATE(), GETDATE()),
('ddda0000-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000003', '22222222-2222-2222-2222-000000000002', N'Mở phòng máy chủ GPU hỗ trợ huấn luyện mô hình Deep Learning', N'Sinh viên cần tài khoản SSH đăng ký qua email lớp trưởng trước thứ 4.', 0, NULL, GETDATE(), GETDATE()),
('ddda0000-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000004', '22222222-2222-2222-2222-000000000002', N'Tài liệu bổ sung ôn tập Cây nhị phân và Đồ thị', N'Thầy đã tải lên hệ thống bộ câu hỏi ôn tập thuật toán có lời giải mẫu.', 0, 'https://example.com/dsa-review.pdf', GETDATE(), GETDATE()),
('ddda0000-0000-0000-0000-000000000005', '44444444-0000-0000-0000-000000000005', '22222222-2222-2222-2222-000000000003', N'Cảnh báo an ninh: Cập nhật bản vá lỗ hổng OpenSSL mới', N'Tất cả các máy ảo trong phòng thực hành phải chạy lệnh cập nhật package bảo mật.', 1, NULL, GETDATE(), GETDATE()),
('ddda0000-0000-0000-0000-000000000006', '44444444-0000-0000-0000-000000000006', '22222222-2222-2222-2222-000000000003', N'Cấp phát tài khoản Cloud AWS Academy cho sinh viên', N'Mỗi sinh viên được cấp 100$ credit để thực hành triển khai cụm k8s.', 0, NULL, GETDATE(), GETDATE()),
('ddda0000-0000-0000-0000-000000000007', '44444444-0000-0000-0000-000000000007', '22222222-2222-2222-2222-000000000004', N'Lịch mượn kit vi điều khiển STM32 tại phòng thí nghiệm', N'Các bạn đến phòng Lab C1-102 nhận kit thực hành vào các buổi chiều.', 0, NULL, GETDATE(), GETDATE()),
('ddda0000-0000-0000-0000-000000000008', '44444444-0000-0000-0000-000000000008', '22222222-2222-2222-2222-000000000004', N'Thông báo demo cánh tay Robot tuần 10', N'Nhóm trưởng chuẩn bị file launch mô phỏng trên Gazebo trước giờ lên lớp.', 0, NULL, GETDATE(), GETDATE()),
('ddda0000-0000-0000-0000-000000000009', '44444444-0000-0000-0000-000000000009', '22222222-2222-2222-2222-000000000005', N'Tọa đàm Gặp gỡ Quỹ Đầu tư Khởi nghiệp mạo hiểm', N'Sự kiện diễn ra tại Hội trường B1 vào 9h sáng thứ 7. Khuyến khích các nhóm tham dự.', 1, NULL, GETDATE(), GETDATE()),
('ddda0000-0000-0000-0000-000000000010', '44444444-0000-0000-0000-000000000011', '22222222-2222-2222-2222-000000000006', N'Final Speaking Test Schedule & Topic Guidelines', N'Speaking exams will be conducted 1-on-1 via Zoom for international accreditation.', 1, NULL, GETDATE(), GETDATE()),
('ddda0000-0000-0000-0000-000000000011', '44444444-0000-0000-0000-000000000012', '22222222-2222-2222-2222-000000000007', N'Hướng dẫn nộp file mô hình 3D cho máy phay CNC', N'Chỉ chấp nhận các định dạng chuẩn .STEP hoặc .IGES để nạp vào máy tính trung tâm.', 0, NULL, GETDATE(), GETDATE()),
('ddda0000-0000-0000-0000-000000000012', '44444444-0000-0000-0000-000000000014', '22222222-2222-2222-2222-222222222222', N'Buổi duyệt Design System & Góp ý wireframe giao diện', N'Các nhóm gửi link Figma trước buổi học để được nhận xét trực tiếp trên từng frame.', 0, NULL, GETDATE(), GETDATE()),
('ddda0000-0000-0000-0000-000000000013', '44444444-0000-0000-0000-000000000013', '22222222-2222-2222-2222-000000000008', N'Thông báo nộp đồ án Revit BIM công trình nhịp lớn', N'Thời hạn nộp bài là thứ 5 tuần tới, nộp kèm bảng thống kê vật tư xuất từ Revit.', 1, NULL, GETDATE(), GETDATE());
GO

-- 21. BẢNG ANNOUNCEMENT_COMMENTS (16 bình luận)
INSERT INTO dbo.announcement_comments (id, announcement_id, user_id, content, created_at)
VALUES
(NEWID(), 'ddda0000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', N'Thầy ơi nhóm em nộp video demo quay màn hình kèm theo được không ạ?', GETDATE()),
(NEWID(), 'ddda0000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', N'Được nhé em, video đính kèm link YouTube hoặc Google Drive trong báo cáo.', GETDATE()),
(NEWID(), 'ddda0000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-000000000002', N'Dạ vâng em cảm ơn thầy nhiều ạ!', GETDATE()),
(NEWID(), 'ddda0000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-000000000003', N'Thầy cho em hỏi thứ tự thi vấn đáp theo MSSV hay theo nhóm đăng ký trước ạ?', GETDATE()),
(NEWID(), 'ddda0000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', N'Theo danh sách nhóm đã đăng ký từ đầu kỳ nhé các em.', GETDATE()),

(NEWID(), 'ddda0000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-000000000004', N'Em đã gửi email đăng ký GPU server rồi ạ, nhờ thầy phê duyệt.', GETDATE()),
(NEWID(), 'ddda0000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-000000000002', N'Tài liệu rất dễ hiểu và chi tiết, em cảm ơn thầy Toàn!', GETDATE()),
(NEWID(), 'ddda0000-0000-0000-0000-000000000005', '33333333-3333-3333-3333-000000000008', N'Đã cập nhật bản vá trên máy ảo lab thành công ạ.', GETDATE()),
(NEWID(), 'ddda0000-0000-0000-0000-000000000006', '33333333-3333-3333-3333-000000000007', N'Tài khoản AWS Academy dùng rất tiện, em đã tạo được cụm EKS thử nghiệm.', GETDATE()),
(NEWID(), 'ddda0000-0000-0000-0000-000000000007', '33333333-3333-3333-3333-000000000010', N'Thầy ơi chiều nay 14h em qua phòng C1-102 nhận kit STM32 được không ạ?', GETDATE()),

(NEWID(), 'ddda0000-0000-0000-0000-000000000008', '33333333-3333-3333-3333-000000000012', N'Mô hình UR5 trên ROS Noetic chạy rất mượt, nhóm em đã sẵn sàng demo.', GETDATE()),
(NEWID(), 'ddda0000-0000-0000-0000-000000000009', '33333333-3333-3333-3333-000000000014', N'Cô ơi có cần nộp bản tóm tắt ý tưởng khởi nghiệp trước buổi tọa đàm không ạ?', GETDATE()),
(NEWID(), 'ddda0000-0000-0000-0000-000000000010', '33333333-3333-3333-3333-000000000017', N'Thank you sir, looking forward to the speaking assessment!', GETDATE()),
(NEWID(), 'ddda0000-0000-0000-0000-000000000011', '33333333-3333-3333-3333-000000000019', N'Thầy ơi file nén CAD em có gửi kèm video mô phỏng ăn khớp bánh răng ạ.', GETDATE()),
(NEWID(), 'ddda0000-0000-0000-0000-000000000012', '33333333-3333-3333-3333-000000000024', N'Nhóm em đã public link Figma view-only vào báo cáo rồi ạ.', GETDATE()),
(NEWID(), 'ddda0000-0000-0000-0000-000000000013', '33333333-3333-3333-3333-000000000022', N'Em đã xuất bảng khối lượng vật liệu từ Revit xong rồi ạ.', GETDATE());
GO

-- 22. BẢNG NOTIFICATIONS (22 thông báo)
INSERT INTO dbo.notifications (id, user_id, title, message, type, is_read, link_url, created_at)
VALUES
(NEWID(), '33333333-3333-3333-3333-333333333333', N'Điểm bài tập đã được công bố', N'Giảng viên đã chấm điểm và phản hồi bài tập lớn Mobile của bạn (Điểm: 9.5).', 'GRADE', 0, '/my-courses', GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333333', N'Nhắc nhở hạn nộp bài tập', N'Học phần INT3307 có bài tập thực hành đến hạn trong 3 ngày tới.', 'DEADLINE', 1, '/my-courses', GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333333', N'Thông báo mới từ khóa học INT3306', N'Giảng viên TS. Nguyễn Văn A vừa đăng tải thông báo nộp bài tập lớn.', 'ANNOUNCEMENT', 0, '/my-courses', GETDATE()),

(NEWID(), '33333333-3333-3333-3333-000000000002', N'Đã hoàn thành học phần', N'Chúc mừng bạn đã hoàn thành 100% nội dung học phần INT3306 với điểm A.', 'COURSE', 0, '/my-courses', GETDATE()),
(NEWID(), '33333333-3333-3333-3333-000000000002', N'Điểm bài tập Web API', N'Bài tập Lab 2 của bạn đã được chấm: 9.5 điểm.', 'GRADE', 1, '/my-courses', GETDATE()),

(NEWID(), '33333333-3333-3333-3333-000000000004', N'Kết quả Đồ án Học máy AI', N'Điểm đồ án nhận diện ảnh của bạn đạt 9.5 điểm. Xuất sắc!', 'GRADE', 0, '/my-courses', GETDATE()),
(NEWID(), '33333333-3333-3333-3333-000000000004', N'Mở phòng máy chủ GPU', N'Khoa CNTT vừa thông báo mở phòng máy tính GPU hỗ trợ nghiên cứu.', 'SYSTEM', 1, '/dashboard', GETDATE()),

(NEWID(), '33333333-3333-3333-3333-000000000008', N'Cảnh báo an ninh mạng', N'Giảng viên vừa đăng thông báo cập nhật bản vá lỗ hổng OpenSSL.', 'ANNOUNCEMENT', 0, '/my-courses', GETDATE()),
(NEWID(), '33333333-3333-3333-3333-000000000010', N'Nhắc lịch mượn kit STM32', N'Vui lòng đến phòng thí nghiệm C1-102 nhận kit đúng thời gian quy định.', 'SYSTEM', 0, '/dashboard', GETDATE()),

(NEWID(), '33333333-3333-3333-3333-000000000012', N'Đánh giá bài tập mô phỏng Robot', N'Bài nộp UR5 trên ROS đã được chấm: 9.0 điểm.', 'GRADE', 0, '/my-courses', GETDATE()),
(NEWID(), '33333333-3333-3333-3333-000000000014', N'Mời tham dự Tọa đàm Khởi nghiệp', N'Khoa Kinh tế & QTKD tổ chức tọa đàm gặp gỡ quỹ đầu tư tại Hội trường B1.', 'ANNOUNCEMENT', 1, '/dashboard', GETDATE()),

(NEWID(), '33333333-3333-3333-3333-000000000017', N'Speaking Exam Schedule', N'Your English speaking exam has been scheduled for Friday at 10:00 AM.', 'DEADLINE', 0, '/my-courses', GETDATE()),
(NEWID(), '33333333-3333-3333-3333-000000000019', N'Đồ án CAD/CAM đã được chấm điểm', N'Bản vẽ thiết kế hộp giảm tốc đạt 8.5 điểm.', 'GRADE', 0, '/my-courses', GETDATE()),

(NEWID(), '33333333-3333-3333-3333-000000000024', N'Điểm đồ án Thiết kế UI/UX', N'Nguyên mẫu app Telehealth trên Figma đạt 9.5 điểm.', 'GRADE', 0, '/my-courses', GETDATE()),
(NEWID(), '22222222-2222-2222-2222-222222222222', N'Có bài nộp mới cần chấm', N'Sinh viên Trần Thị B vừa nộp bài tập lớn học phần INT3306.', 'SYSTEM', 1, '/dashboard', GETDATE()),

(NEWID(), '22222222-2222-2222-2222-222222222222', N'Bình luận mới từ sinh viên', N'Sinh viên đã đặt câu hỏi trong thông báo nộp bài tập học phần INT3306.', 'ANNOUNCEMENT', 0, '/my-courses', GETDATE()),
(NEWID(), '11111111-1111-1111-1111-111111111111', N'Báo cáo sao lưu hệ thống', N'Bản sao lưu cơ sở dữ liệu định kỳ đã được thực hiện thành công lúc 02:00 AM.', 'SYSTEM', 1, '/admin/settings', GETDATE()),

(NEWID(), '11111111-1111-1111-1111-111111111111', N'Cảnh báo an ninh tài khoản', N'Không phát hiện hành vi đăng nhập bất thường trong 24 giờ qua.', 'SYSTEM', 0, '/admin/logs', GETDATE()),
(NEWID(), '11111111-1111-1111-1111-000000000002', N'Cập nhật Niên khóa 2024-2025', N'Toàn bộ danh mục môn học học kỳ 1 đã được phê duyệt và mở đăng ký.', 'SYSTEM', 0, '/admin/courses', GETDATE()),
(NEWID(), '11111111-1111-1111-1111-000000000003', N'Kiểm toán bảo mật định kỳ', N'Hệ thống phòng thủ WAF hoạt động ổn định, 0 sự cố an ninh nghiêm trọng.', 'SYSTEM', 0, '/admin/logs', GETDATE()),
(NEWID(), '33333333-3333-3333-3333-000000000022', N'Thông báo nộp đồ án Revit BIM', N'Học phần CE2001 vừa cập nhật yêu cầu nộp file đồ án thiết kế.', 'ANNOUNCEMENT', 0, '/my-courses', GETDATE()),
(NEWID(), '33333333-3333-3333-3333-000000000026', N'Chào mừng tân sinh viên', N'Chào mừng bạn đến với Cổng thông tin học tập trực tuyến LMS!', 'SYSTEM', 0, '/dashboard', GETDATE());
GO

PRINT N'>>> HOÀN TẤT ĐỒNG BỘ 100% TIẾNG VIỆT CHUẨN UTF-8 VÀO LMS_DB! <<<';
GO
GO

-- 1. NẠP DỮ LIỆU BẢNG FINAL_GRADES (Tự động nạp điểm cho tất cả sinh viên ghi danh)
INSERT INTO dbo.final_grades (id, enrollment_id, attendance_score, assignments_score, final_exam_score, total_score, letter_grade, is_passed, finalized_at, graded_by)
SELECT 
    NEWID(),
    e.id,
    att.score,
    ass.score,
    fe.score,
    ROUND(att.score * 0.10 + ass.score * 0.30 + fe.score * 0.60, 2),
    CASE 
        WHEN ROUND(att.score * 0.10 + ass.score * 0.30 + fe.score * 0.60, 2) >= 9.0 THEN 'A+'
        WHEN ROUND(att.score * 0.10 + ass.score * 0.30 + fe.score * 0.60, 2) >= 8.5 THEN 'A'
        WHEN ROUND(att.score * 0.10 + ass.score * 0.30 + fe.score * 0.60, 2) >= 8.0 THEN 'B+'
        WHEN ROUND(att.score * 0.10 + ass.score * 0.30 + fe.score * 0.60, 2) >= 7.0 THEN 'B'
        WHEN ROUND(att.score * 0.10 + ass.score * 0.30 + fe.score * 0.60, 2) >= 6.5 THEN 'C+'
        WHEN ROUND(att.score * 0.10 + ass.score * 0.30 + fe.score * 0.60, 2) >= 5.5 THEN 'C'
        WHEN ROUND(att.score * 0.10 + ass.score * 0.30 + fe.score * 0.60, 2) >= 5.0 THEN 'D+'
        WHEN ROUND(att.score * 0.10 + ass.score * 0.30 + fe.score * 0.60, 2) >= 4.0 THEN 'D'
        ELSE 'F'
    END,
    CASE WHEN ROUND(att.score * 0.10 + ass.score * 0.30 + fe.score * 0.60, 2) >= 5.0 THEN 1 ELSE 0 END,
    GETDATE(),
    c.teacher_id
FROM dbo.enrollments e
JOIN dbo.courses c ON e.course_id = c.id
CROSS APPLY (SELECT ROUND(8.0 + (ABS(CHECKSUM(NEWID())) % 21) * 0.1, 2) AS score) att
CROSS APPLY (SELECT ROUND(7.0 + (ABS(CHECKSUM(NEWID())) % 31) * 0.1, 2) AS score) ass
CROSS APPLY (SELECT ROUND(6.5 + (ABS(CHECKSUM(NEWID())) % 36) * 0.1, 2) AS score) fe
WHERE NOT EXISTS (SELECT 1 FROM dbo.final_grades fg WHERE fg.enrollment_id = e.id);
GO

-- 2. NẠP DỮ LIỆU BẢNG LESSON_PROGRESS (Tiến độ học tập từng bài học của sinh viên)
INSERT INTO dbo.lesson_progress (id, enrollment_id, lesson_id, is_completed, quiz_passed, completed_at, last_accessed_at)
SELECT 
    NEWID(),
    e.id,
    l.id,
    1,
    CASE WHEN l.content_type = 'QUIZ' THEN 1 ELSE 0 END,
    GETDATE(),
    GETDATE()
FROM dbo.enrollments e
JOIN dbo.lessons l ON l.course_id = e.course_id
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.lesson_progress lp 
    WHERE lp.enrollment_id = e.id AND lp.lesson_id = l.id
);
GO

-- =====================================================================================
-- TUẦN 1: Clean Architecture & RESTful API (Week 1)
-- =====================================================================================
DECLARE @q1 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q1, 'INT3306', 1, N'Clean Architecture & RESTful API', N'Thành phần nào thuộc tầng Domain (Lõi nghiệp vụ) trong kiến trúc Clean Architecture?', 2.50, N'Tầng Domain là trung tâm hệ thống, chứa các Entities và Enums, hoàn toàn độc lập với các tầng khác.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q1, N'Entities và Enums (Enterprise Business Rules)', 1, 1),
(NEWID(), @q1, N'DbContext, Repositories và Migrations', 0, 2),
(NEWID(), @q1, N'Controllers, Filters và Middleware', 0, 3),
(NEWID(), @q1, N'Swagger UI, ViewModels và AutoMapper Profiles', 0, 4);

DECLARE @q2 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q2, 'INT3306', 1, N'Clean Architecture & RESTful API', N'Phương thức HTTP nào là chuẩn được khuyến nghị sử dụng khi muốn tạo mới một tài nguyên trong RESTful API?', 2.50, N'POST dùng để tạo mới tài nguyên, PUT/PATCH dùng để cập nhật, GET dùng để đọc dữ liệu.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q2, N'POST', 1, 1),
(NEWID(), @q2, N'GET', 0, 2),
(NEWID(), @q2, N'PUT', 0, 3),
(NEWID(), @q2, N'DELETE', 0, 4);

DECLARE @q3 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q3, 'INT3306', 1, N'Clean Architecture & RESTful API', N'Mã trạng thái HTTP (Status Code) nào thông báo rằng tài nguyên vừa được tạo thành công trên Server?', 2.50, N'HTTP 201 Created trả về khi một tài nguyên mới vừa được khởi tạo thành công.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q3, N'201 Created', 1, 1),
(NEWID(), @q3, N'200 OK', 0, 2),
(NEWID(), @q3, N'204 No Content', 0, 3),
(NEWID(), @q3, N'400 Bad Request', 0, 4);

DECLARE @q4 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q4, 'INT3306', 1, N'Clean Architecture & RESTful API', N'Theo quy tắc Dependency Inversion (DIP) của Clean Architecture, luồng phụ thuộc mã nguồn phải đi theo hướng nào?', 2.50, N'Tất cả các thành phần ngoại vi đều phải phụ thuộc hướng vào tầng Domain và Application lõi.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q4, N'Hướng vào bên trong, về phía tầng Domain và Use Cases lõi', 1, 1),
(NEWID(), @q4, N'Hướng ra bên ngoài, về phía cơ sở dữ liệu và Web API', 0, 2),
(NEWID(), @q4, N'Các tầng được phép phụ thuộc vòng tròn (Circular Dependency) lẫn nhau', 0, 3),
(NEWID(), @q4, N'Tầng Domain phụ thuộc trực tiếp vào DbContext ở tầng Infrastructure', 0, 4);

-- =====================================================================================
-- TUẦN 2: Entity Framework Core & ORM (Week 2)
-- =====================================================================================
DECLARE @q5 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q5, 'INT3306', 2, N'Entity Framework Core & ORM', N'Trong Entity Framework Core, phương thức nào được sử dụng để nạp trước dữ liệu liên kết theo cơ chế Eager Loading?', 2.50, N'Phương thức .Include() cùng với .ThenInclude() dùng để nạp các quan hệ liên kết trong Eager Loading.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q5, N'.Include()', 1, 1),
(NEWID(), @q5, N'.Select()', 0, 2),
(NEWID(), @q5, N'.Find()', 0, 3),
(NEWID(), @q5, N'.Attach()', 0, 4);

DECLARE @q6 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q6, 'INT3306', 2, N'Entity Framework Core & ORM', N'Lớp cốt lõi nào trong EF Core đại diện cho một phiên làm việc (Session) kết nối và truy vấn với cơ sở dữ liệu?', 2.50, N'DbContext là class trung tâm quản lý các DbSet và kết nối CSDL trong Entity Framework.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q6, N'DbContext', 1, 1),
(NEWID(), @q6, N'DbSet', 0, 2),
(NEWID(), @q6, N'SqlConnection', 0, 3),
(NEWID(), @q6, N'ModelBuilder', 0, 4);

DECLARE @q7 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q7, 'INT3306', 2, N'Entity Framework Core & ORM', N'Phương thức nào của DbContext được gọi để thực thi lưu và ghi nhận tất cả các thay đổi vào CSDL?', 2.50, N'SaveChangesAsync() đẩy toàn bộ các thao tác thêm/sửa/xóa đang theo dõi trong ChangeTracker xuống CSDL.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q7, N'SaveChangesAsync()', 1, 1),
(NEWID(), @q7, N'CommitAsync()', 0, 2),
(NEWID(), @q7, N'FlushChanges()', 0, 3),
(NEWID(), @q7, N'ExecuteSqlRawAsync()', 0, 4);

DECLARE @q8 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q8, 'INT3306', 2, N'Entity Framework Core & ORM', N'Cơ chế Migration trong Entity Framework Core có vai trò chính là gì?', 2.50, N'Migration giúp theo dõi và đồng bộ hóa cấu trúc Database schema tự động theo Model C# qua từng phiên bản.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q8, N'Đồng bộ hóa cấu trúc Schema cơ sở dữ liệu theo các thay đổi trong Model C#', 1, 1),
(NEWID(), @q8, N'Tự động sao lưu dữ liệu sang dịch vụ Cloud Storage', 0, 2),
(NEWID(), @q8, N'Chuyển đổi câu truy vấn C# sang ngôn ngữ Python', 0, 3),
(NEWID(), @q8, N'Nén kích thước cơ sở dữ liệu SQL Server', 0, 4);

-- =====================================================================================
-- TUẦN 3: Authentication, Authorization & JWT (Week 3)
-- =====================================================================================
DECLARE @q9 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q9, 'INT3306', 3, N'Authentication & JWT Security', N'Một chuỗi JSON Web Token (JWT) hoàn chỉnh bao gồm bao nhiêu phần chính được phân cách bởi dấu chấm (.)?', 2.50, N'JWT gồm 3 phần: Header.Payload.Signature.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q9, N'3 phần: Header, Payload, Signature', 1, 1),
(NEWID(), @q9, N'2 phần: Header, Body', 0, 2),
(NEWID(), @q9, N'4 phần: Header, Payload, Hash, Salt', 0, 3),
(NEWID(), @q9, N'1 chuỗi băm duy nhất không phân đoạn', 0, 4);

DECLARE @q10 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q10, 'INT3306', 3, N'Authentication & JWT Security', N'Phần nào trong JWT chứa thông tin các quyền hạn và thông tin người dùng (Claims như userId, role, email)?', 2.50, N'Payload chứa các Claims của người dùng.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q10, N'Payload', 1, 1),
(NEWID(), @q10, N'Header', 0, 2),
(NEWID(), @q10, N'Signature', 0, 3),
(NEWID(), @q10, N'Secret Key', 0, 4);

DECLARE @q11 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q11, 'INT3306', 3, N'Authentication & JWT Security', N'Khi gửi HTTP Request kèm JWT token để xác thực, token thường được đặt ở Header nào theo tiêu chuẩn?', 2.50, N'Authorization Header với scheme Bearer: "Authorization: Bearer <token>"');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q11, N'Authorization: Bearer <token>', 1, 1),
(NEWID(), @q11, N'Cookie: token=<token>', 0, 2),
(NEWID(), @q11, N'Content-Type: application/jwt', 0, 3),
(NEWID(), @q11, N'X-Auth-Token: <token>', 0, 4);

DECLARE @q12 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q12, 'INT3306', 3, N'Authentication & JWT Security', N'Mã trạng thái HTTP nào biểu thị người dùng đã xác thực thành công nhưng không có quyền (Role) truy cập tài nguyên?', 2.50, N'HTTP 403 Forbidden: Đã biết danh tính nhưng bị cấm truy cập tài nguyên do thiếu quyền.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q12, N'403 Forbidden', 1, 1),
(NEWID(), @q12, N'401 Unauthorized', 0, 2),
(NEWID(), @q12, N'404 Not Found', 0, 3),
(NEWID(), @q12, N'400 Bad Request', 0, 4);

-- =====================================================================================
-- TUẦN 4: Thiết kế CSDL Quan hệ & Tối ưu hóa Truy vấn (Week 4)
-- =====================================================================================
DECLARE @q13 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q13, 'INT3306', 4, N'Thiết kế CSDL Quan hệ', N'Khóa ngoại (Foreign Key) trong cơ sở dữ liệu quan hệ có vai trò cốt lõi là gì?', 2.50, N'Khóa ngoại bảo đảm tính toàn vẹn tham chiếu (Referential Integrity) giữa các bảng.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q13, N'Bảo đảm tính toàn vẹn tham chiếu giữa hai bảng dữ liệu', 1, 1),
(NEWID(), @q13, N'Tự động tăng tốc độ ghi dữ liệu INSERT', 0, 2),
(NEWID(), @q13, N'Đảm bảo dữ liệu không bao giờ có giá trị NULL', 0, 3),
(NEWID(), @q13, N'Tự động sao lưu dữ liệu khi có thay đổi', 0, 4);

DECLARE @q14 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q14, 'INT3306', 4, N'Thiết kế CSDL Quan hệ', N'Mục đích chính của việc tạo Non-Clustered Index trên các cột thường xuyên được truy vấn là gì?', 2.50, N'Index giúp tăng tốc độ tìm kiếm và lọc dữ liệu (SELECT) bằng cây B-Tree.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q14, N'Tăng tốc độ tìm kiếm và truy vấn dữ liệu (SELECT/JOIN)', 1, 1),
(NEWID(), @q14, N'Tiết kiệm không gian lưu trữ ổ cứng', 0, 2),
(NEWID(), @q14, N'Tăng tốc độ cho các lệnh INSERT và UPDATE', 0, 3),
(NEWID(), @q14, N'Tự động mã hóa mật khẩu trong cột', 0, 4);

DECLARE @q15 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q15, 'INT3306', 4, N'Thiết kế CSDL Quan hệ', N'Để mô hình hóa quan hệ Nhiều - Nhiều (Many-to-Many) giữa hai thực thể, giải pháp chuẩn trong CSDL quan hệ là gì?', 2.50, N'Tạo bảng trung gian (Junction table) chứa khóa ngoại trỏ tới cả hai bảng chính.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q15, N'Sử dụng bảng trung gian (Junction/Bridge table) chứa cặp khóa ngoại', 1, 1),
(NEWID(), @q15, N'Lưu một chuỗi danh sách ID ngăn cách bởi dấu phẩy vào cột của bảng A', 0, 2),
(NEWID(), @q15, N'Gộp toàn bộ hai bảng thành một bảng phẳng duy nhất', 0, 3),
(NEWID(), @q15, N'Chỉ cần đặt khóa ngoại từ bảng B trỏ sang bảng A', 0, 4);

-- =====================================================================================
-- TUẦN 5: React & State Management (Week 5)
-- =====================================================================================
DECLARE @q16 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q16, 'INT3306', 5, N'React & State Management', N'Trong React Functional Component, Hook cơ bản nào được sử dụng để khai báo và quản lý trạng thái cục bộ?', 2.50, N'useState là hook cơ bản nhất để quản lý state trong React.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q16, N'useState', 1, 1),
(NEWID(), @q16, N'useEffect', 0, 2),
(NEWID(), @q16, N'useCallback', 0, 3),
(NEWID(), @q16, N'useContext', 0, 4);

DECLARE @q17 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q17, 'INT3306', 5, N'React & State Management', N'Hook useEffect với mảng phụ thuộc rỗng `[]` sẽ được kích hoạt thực thi vào thời điểm nào?', 2.50, N'Chỉ chạy đúng 1 lần duy nhất sau lần render đầu tiên (tương đương componentDidMount).');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q17, N'Chỉ chạy 1 lần duy nhất sau khi Component render lần đầu', 1, 1),
(NEWID(), @q17, N'Chạy liên tục sau mỗi lần Component re-render', 0, 2),
(NEWID(), @q17, N'Chạy mỗi khi có bất kỳ biến State nào thay đổi giá trị', 0, 3),
(NEWID(), @q17, N'Không bao giờ được thực thi', 0, 4);

DECLARE @q18 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q18, 'INT3306', 5, N'React & State Management', N'Thuộc tính `key` trong mảng phần tử render của React có mục đích chính là gì?', 2.50, N'Giúp thuật toán Reconciliation của Virtual DOM xác định chính xác phần tử nào đã thay đổi để tối ưu render.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q18, N'Giúp React Virtual DOM định danh chính xác phần tử để tối ưu quá trình Re-render', 1, 1),
(NEWID(), @q18, N'Định danh class CSS duy nhất cho phần tử HTML', 0, 2),
(NEWID(), @q18, N'Tự động sắp xếp mảng theo thứ tự bảng chữ cái', 0, 3),
(NEWID(), @q18, N'Lưu trữ dữ liệu mã hóa vào LocalStorage', 0, 4);

-- =====================================================================================
-- TUẦN 6: Web API Integration & CORS (Week 6)
-- =====================================================================================
DECLARE @q19 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q19, 'INT3306', 6, N'Web API Integration & CORS', N'Cơ chế bảo mật CORS (Cross-Origin Resource Sharing) được kiểm tra và kích hoạt bởi thành phần nào?', 2.50, N'CORS do Trình duyệt Web (Browser) thực thi để bảo vệ người dùng khỏi các cuộc tấn công CSRF/XSS chéo nguồn.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q19, N'Trình duyệt Web (Web Browser)', 1, 1),
(NEWID(), @q19, N'Cơ sở dữ liệu SQL Server', 0, 2),
(NEWID(), @q19, N'Hệ điều hành Windows Client', 0, 3),
(NEWID(), @q19, N'Trình biên dịch TypeScript', 0, 4);

DECLARE @q20 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q20, 'INT3306', 6, N'Web API Integration & CORS', N'Từ khóa `await` trong TypeScript/JavaScript hoặc C# chỉ có thể được sử dụng bên trong khối hàm nào?', 2.50, N'Chỉ có thể dùng `await` bên trong hàm được khai báo có từ khóa `async`.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q20, N'Bên trong hàm được khai báo với từ khóa `async`', 1, 1),
(NEWID(), @q20, N'Bên trong bất kỳ hàm thông thường nào', 0, 2),
(NEWID(), @q20, N'Chỉ trong phương thức khởi tạo Constructor', 0, 3),
(NEWID(), @q20, N'Chỉ trong file HTML', 0, 4);

-- =====================================================================================
-- TUẦN 7: Responsive UI & CSS (Week 7)
-- =====================================================================================
DECLARE @q21 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q21, 'INT3306', 7, N'Responsive UI & CSS Framework', N'Đơn vị "rem" trong CSS được tính toán tương đối dựa theo kích thước font của thành phần nào?', 2.50, N'rem là root em, tính tương đối theo font-size của thẻ HTML gốc.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q21, N'Thẻ HTML gốc (<html>)', 1, 1),
(NEWID(), @q21, N'Phần tử cha trực tiếp', 0, 2),
(NEWID(), @q21, N'Chiều rộng khung nhìn Viewport', 0, 3),
(NEWID(), @q21, N'Thẻ <body>', 0, 4);

-- =====================================================================================
-- TUẦN 8: Lập trình Bất đồng bộ & Performance (Week 8)
-- =====================================================================================
DECLARE @q22 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q22, 'INT3306', 8, N'Lập trình Bất đồng bộ & Performance', N'Trong C#, khi nào nên cân nhắc sử dụng ValueTask thay vì Task?', 2.50, N'ValueTask là kiểu struct giúp tránh phân bổ bộ nhớ trên heap khi kết quả của tác vụ thường có sẵn đồng bộ.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q22, N'Khi kết quả thường có sẵn đồng bộ, giúp giảm thiểu cấp phát bộ nhớ Heap', 1, 1),
(NEWID(), @q22, N'Khi tác vụ chạy tốn nhiều giờ trên background', 0, 2),
(NEWID(), @q22, N'Chỉ khi gọi hàm trong giao diện người dùng UI', 0, 3),
(NEWID(), @q22, N'Không bao giờ nên dùng ValueTask trong .NET', 0, 4);

-- =====================================================================================
-- TUẦN 9: Kiểm thử Phần mềm & xUnit (Week 9)
-- =====================================================================================
DECLARE @q23 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q23, 'INT3306', 9, N'Kiểm thử Phần mềm & TDD', N'Trong phương pháp kiểm thử TDD (Test-Driven Development), chu trình phát triển chuẩn gồm 3 bước là gì?', 2.50, N'Chu trình chuẩn: Red (Viết test fail) -> Green (Viết code tối thiểu pass) -> Refactor (Tối ưu hóa mã nguồn).');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q23, N'Red -> Green -> Refactor', 1, 1),
(NEWID(), @q23, N'Code -> Deploy -> Test', 0, 2),
(NEWID(), @q23, N'Plan -> Build -> Release', 0, 3),
(NEWID(), @q23, N'Test -> Bug -> Fix', 0, 4);

-- =====================================================================================
-- TUẦN 10: Docker & Triển khai Cloud (Week 10)
-- =====================================================================================
DECLARE @q24 UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.question_banks (id, course_code, week_number, topic, question_text, points, explanation)
VALUES (@q24, 'INT3306', 10, N'Docker & Triển khai Container', N'Tập tin Dockerfile có vai trò chính là gì trong quy trình đóng gói phần mềm?', 2.50, N'Dockerfile là kịch bản chỉ dẫn từng bước để Docker đóng gói ứng dụng và môi trường thành Container Image.');

INSERT INTO dbo.question_bank_options (id, question_id, option_text, is_correct, order_index) VALUES
(NEWID(), @q24, N'Tập hợp các chỉ dẫn từng bước để đóng gói ứng dụng thành Docker Container Image', 1, 1),
(NEWID(), @q24, N'Phần mềm diệt virus trên máy chủ Linux', 0, 2),
(NEWID(), @q24, N'Cơ sở dữ liệu lưu trữ log hệ thống phân tán', 0, 3),
(NEWID(), @q24, N'Trình biên dịch mã nguồn C# sang máy ảo Java', 0, 4);

GO

-- ===================================================================================
-- PHẦN V: THỐNG KÊ TỔNG KẾT TẤT CẢ 24 BẢNG DỮ LIỆU
-- ===================================================================================
PRINT N'';
PRINT N'===================================================================================';
PRINT N'               BẢNG TỔNG KẾT DỮ LIỆU CƠ SỞ DỮ LIỆU LMS_DB (24 BẢNG)';
PRINT N'===================================================================================';

SELECT 
    t.name AS [Tên Bảng Dữ Liệu],
    p.rows AS [Số Bản Ghi Thực Tế]
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE p.index_id IN (0, 1)
ORDER BY t.name;
GO

PRINT N'>>> HOÀN TẤT KHỞI TẠO VÀ NẠP DỮ LIỆU 100% THÀNH CÔNG VÀO LMS_DB! <<<';
GO
