-- =============================================================================
-- HỆ THỐNG QUẢN LÝ HỌC TẬP (LMS - LEAN EDITION)
-- TÀI LIỆU ĐẶC TẢ VÀ THIẾT KẾ CƠ SỞ DỮ LIỆU CHI TIẾT (PostgreSQL Dialect)
-- =============================================================================
-- Danh sách phân hệ:
-- 1. Quản lý Người dùng & Vai trò (Users, Profiles, RBAC)
-- 2. Quản lý Môn học & Ghi danh (Courses, Enrollments)
-- 3. Quản lý Bài giảng & Tiến trình (Lessons, Progress Tracking)
-- 4. Quản lý Đánh giá & Khảo thí (Quizzes, Questions, Attempts)
-- 5. Quản lý Bài tập & Nộp bài (Assignments, Submissions)
-- 6. Quản lý Bảng tin & Thông báo (Announcements)
-- 7. Quản lý Điểm tổng hợp & Xếp loại (Final Grades)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PHẦN 1: ENUM TYPES (Định nghĩa kiểu dữ liệu liệt kê)
-- =============================================================================

CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');
CREATE TYPE lesson_content_type_enum AS ENUM ('VIDEO', 'PDF', 'TEXT');
CREATE TYPE question_type_enum AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE');
CREATE TYPE submission_status_enum AS ENUM ('SUBMITTED', 'LATE', 'GRADED');
CREATE TYPE grade_letter_enum AS ENUM ('A', 'B', 'C', 'D', 'F');

-- =============================================================================
-- PHẦN 2: CÁC BẢNG DỮ LIỆU CỐT LÕI (TABLE DEFINITIONS)
-- =============================================================================

-- 1. Bảng USERS (Tài khoản xác thực trung tâm)

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    role user_role_enum NOT NULL DEFAULT 'STUDENT',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng STUDENT_PROFILES (Thông tin bổ sung dành riêng cho Sinh viên)

CREATE TABLE student_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    student_code VARCHAR(50) NOT NULL UNIQUE, -- MSSV
    administrative_class VARCHAR(100),       -- Lớp sinh hoạt (vd: K65-CNTT)
    enrollment_year INT CHECK (enrollment_year >= 2000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng TEACHER_PROFILES (Thông tin bổ sung dành riêng cho Giảng viên)

CREATE TABLE teacher_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    teacher_code VARCHAR(50) NOT NULL UNIQUE, -- Mã cán bộ giảng viên
    department VARCHAR(150),                  -- Khoa/Bộ môn
    academic_title VARCHAR(50),               -- ThS, TS, PGS, GS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng COURSES (Lớp học phần / Môn học)

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_code VARCHAR(50) NOT NULL,          -- Mã môn học (vd: CS101)
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    -- Trọng số điểm cấu hình theo phần trăm (Tổng = 100%)
    weight_attendance NUMERIC(4, 2) NOT NULL DEFAULT 10.00 CHECK (weight_attendance >= 0),
    weight_assignments NUMERIC(4, 2) NOT NULL DEFAULT 30.00 CHECK (weight_assignments >= 0),
    weight_final_exam NUMERIC(4, 2) NOT NULL DEFAULT 60.00 CHECK (weight_final_exam >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_total_weights CHECK (weight_attendance + weight_assignments + weight_final_exam = 100.00)
);

-- 5. Bảng ENROLLMENTS (Ghi danh Sinh viên vào Khóa học)

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progress_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (progress_percentage BETWEEN 0.00 AND 100.00),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_student_course UNIQUE (course_id, student_id)
);

-- 6. Bảng LESSONS (Bài giảng phân cấp trong Khóa học)

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INT NOT NULL DEFAULT 1,          -- Thứ tự hiển thị bài học
    content_type lesson_content_type_enum NOT NULL DEFAULT 'VIDEO',
    content_url VARCHAR(1000),                   -- Link video/PDF hoặc nội dung
    body_markdown TEXT,                          -- Nội dung chi tiết nếu dạng text
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,    -- Có yêu cầu tuần tự không
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bảng LESSON_PROGRESS (Ghi nhận tiến trình học của từng Sinh viên)

CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    quiz_passed BOOLEAN NOT NULL DEFAULT FALSE,  -- Bài quiz kèm theo đã đậu chưa
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_enrollment_lesson UNIQUE (enrollment_id, lesson_id)
);

-- 8. Bảng QUIZZES (Bộ câu hỏi trắc nghiệm kiểm tra sau bài học)

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    passing_score NUMERIC(5, 2) NOT NULL DEFAULT 7.00 CHECK (passing_score >= 0),
    max_score NUMERIC(5, 2) NOT NULL DEFAULT 10.00 CHECK (max_score > 0),
    time_limit_minutes INT DEFAULT NULL,         -- NULL = Không giới hạn thời gian
    max_attempts INT DEFAULT NULL,               -- NULL = Không giới hạn số lần làm
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Bảng QUIZ_QUESTIONS (Câu hỏi trắc nghiệm)

CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type_enum NOT NULL DEFAULT 'SINGLE_CHOICE',
    points NUMERIC(4, 2) NOT NULL DEFAULT 1.00 CHECK (points > 0),
    order_index INT NOT NULL DEFAULT 1
);

-- 10. Bảng QUIZ_OPTIONS (Các lựa chọn đáp án cho từng câu hỏi)

CREATE TABLE quiz_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    explanation TEXT                             -- Giải thích đáp án khi xem lại
);

-- 11. Bảng QUIZ_ATTEMPTS (Lịch sử làm bài trắc nghiệm của sinh viên)

CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL DEFAULT 1,
    score_achieved NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    is_passed BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE
);

-- 12. Bảng ASSIGNMENTS (Bài tập về nhà & Dự án môn học)

CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    attachment_url VARCHAR(500),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,  -- Hạn chót nộp bài
    max_score NUMERIC(5, 2) NOT NULL DEFAULT 10.00 CHECK (max_score > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Bảng SUBMISSIONS (Bài nộp của sinh viên & Chấm điểm)

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submission_text TEXT,
    file_url VARCHAR(500) NOT NULL,
    status submission_status_enum NOT NULL DEFAULT 'SUBMITTED',
    grade NUMERIC(5, 2) CHECK (grade >= 0),
    feedback TEXT,                               -- Lời phê của Giảng viên
    graded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_student_assignment UNIQUE (assignment_id, student_id)
);

-- 14. Bảng ANNOUNCEMENTS (Bảng tin & Thông báo lớp học)

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,    -- Ghim lên đầu bảng tin
    attachment_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Bảng FINAL_GRADES (Sổ điểm tổng kết môn học)

CREATE TABLE final_grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL UNIQUE REFERENCES enrollments(id) ON DELETE CASCADE,
    attendance_score NUMERIC(5, 2) DEFAULT 0.00,
    assignments_score NUMERIC(5, 2) DEFAULT 0.00,
    final_exam_score NUMERIC(5, 2) DEFAULT 0.00,
    total_score NUMERIC(5, 2) GENERATED ALWAYS AS (
        ROUND((attendance_score * 0.10) + (assignments_score * 0.30) + (final_exam_score * 0.60), 2)
    ) STORED,
    letter_grade grade_letter_enum,
    is_passed BOOLEAN DEFAULT FALSE,
    finalized_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- PHẦN 3: TỐI ƯU HÓA HIỆU NĂNG (INDEXES)
-- =============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_lessons_course ON lessons(course_id, order_index);
CREATE INDEX idx_announcements_feed ON announcements(course_id, is_pinned DESC, created_at DESC);
CREATE INDEX idx_assignments_due_date ON assignments(course_id, due_date ASC);
CREATE INDEX idx_submissions_status ON submissions(assignment_id, student_id);
