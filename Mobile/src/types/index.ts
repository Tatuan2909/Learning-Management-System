export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  token: string;
  refreshToken: string;
  studentCode?: string;
  teacherCode?: string;
  department?: string;
  className?: string;
  major?: string;
}

export interface UpcomingDeadline {
  id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  type: 'ASSIGNMENT' | 'QUIZ';
  dueDate: string;
  remainingSeconds: number;
  urgency: 'RED' | 'YELLOW' | 'GREEN';
  maxScore: number;
  targetUrl: string;
}

export interface EnrolledCourseSummary {
  id: string;
  courseCode: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  teacherName?: string;
  progressPercentage: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  department?: string;
}

export interface CourseItem {
  id: string;
  courseCode: string;
  title: string;
  description?: string;
  teacherName?: string;
  teacherEmail?: string;
  department?: string;
  thumbnailUrl?: string;
  totalLessons?: number;
  enrolledStudentsCount?: number;
  isEnrolled?: boolean;
  hasPassword?: boolean;
  accessPassword?: string;
  progressPercentage?: number;
}

export interface AssignmentGradeItem {
  id: string;
  title: string;
  dueDate: string;
  maxScore: number;
  isSubmitted: boolean;
  submittedAt: string | null;
  grade: number | null;
  feedback: string | null;
  status: string;
}

export interface CourseTranscriptItem {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  teacherName: string;
  credits: number;
  attendanceScore: number;
  assignmentScore: number;
  examScore: number;
  totalScore: number;
  letterGrade: string;
  gpa4: number;
  isPassed: boolean;
  progressPercentage: number;
  isFinalized: boolean;
  status: 'PASSED' | 'FAILED' | 'IN_PROGRESS';
  assignments?: AssignmentGradeItem[];
}

export interface TranscriptSummary {
  totalCourses: number;
  passedCourses: number;
  inProgressCourses: number;
  failedCourses: number;
  totalCredits: number;
  earnedCredits: number;
  averageGpa10: number;
  averageGpa4: number;
  overallGrade: string;
}

export interface TranscriptData {
  student: {
    id: string;
    fullName: string;
    email: string;
    studentCode: string;
    className: string;
    major: string;
  };
  summary: TranscriptSummary;
  courses: CourseTranscriptItem[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface UserProfileDetail {
  id: string;
  email: string;
  fullName: string;
  role: string;
  studentCode?: string;
  teacherCode?: string;
  department?: string;
  className?: string;
  major?: string;
  avatarUrl?: string;
  createdAt?: string;
}

// Teacher Types
export interface TeacherRecentSubmission {
  id: string;
  courseId: string;
  courseCode: string;
  assignmentTitle: string;
  studentName: string;
  studentCode: string;
  submittedAt: string;
  fileUrl: string;
  status: 'SUBMITTED' | 'GRADED';
  grade: number | null;
}

export interface TeacherOverviewData {
  assignedCoursesCount: number;
  totalStudentsCount: number;
  pendingSubmissionsCount: number;
  averagePassRate: number;
  recentSubmissions: TeacherRecentSubmission[];
}

export interface TeacherCourse {
  id: string;
  courseCode: string;
  title: string;
  department: string;
  enrolledStudents: number;
  lessonsCount: number;
  accessPassword?: string;
}

export interface StudentGradeRow {
  studentId: string;
  courseId: string;
  studentCode: string;
  fullName: string;
  className: string;
  attendanceScore: number;
  assignmentScore: number;
  examScore: number;
  totalScore: number;
  letterGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  progressPercentage: number;
}
