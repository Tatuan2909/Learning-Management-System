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
  totalCourses?: number;
  assignedCoursesCount?: number;
  totalStudents?: number;
  totalStudentsCount?: number;
  pendingSubmissions?: number;
  pendingSubmissionsCount?: number;
  averageProgress?: number;
  averagePassRate?: number;
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

// Course Study & Activity Types
export type ActivityType =
  | 'OVERVIEW'
  | 'SCORM'
  | 'PDF'
  | 'DOCX'
  | 'LINK'
  | 'ANNOUNCEMENT'
  | 'PRACTICE'
  | 'QUIZ'
  | 'VIDEO'
  | 'LECTURE'
  | 'TEXT';

export interface CurriculumItem {
  id: string;
  title: string;
  subtitle?: string;
  type: ActivityType;
  contentUrl?: string;
  isCompleted: boolean;
  isLocked: boolean;
  quizId?: string;
  assignmentId?: string;
  hasPassword?: boolean;
  password?: string;
  bodyMarkdown?: string;
}

export interface SectionSummary {
  id: string;
  title: string;
  description?: string[];
  isExpanded: boolean;
  isLocked: boolean;
  items: CurriculumItem[];
}

export interface CourseDetail {
  id: string;
  courseCode: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  teacherName: string;
  progressPercentage: number;
  isEnrolled: boolean;
  sections: SectionSummary[];
}

export interface QuizOption {
  optionId: string;
  optionText: string;
}

export interface QuizQuestion {
  questionId: string;
  questionText: string;
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  points: number;
  explanation?: string;
  options: QuizOption[];
}

export interface QuizDetail {
  quizId: string;
  lessonId: string;
  title: string;
  passingScore: number;
  timeLimitMinutes: number;
  questions: QuizQuestion[];
}

export interface QuestionAnswer {
  questionId: string;
  selectedOptionIds: string[];
}

export interface SubmitQuizResponse {
  quizAttemptId: string;
  score: number;
  passingScore: number;
  isPassed: boolean;
  lessonProgressUpdated: boolean;
  message: string;
}

export interface QuizAttemptSummary {
  attemptId: string;
  quizId: string;
  attemptNumber: number;
  scoreAchieved: number;
  passingScore: number;
  maxScore: number;
  isPassed: boolean;
  submittedAt?: string;
}

export interface QuizReviewOption {
  optionId: string;
  optionText: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizReviewQuestion {
  questionId: string;
  questionText: string;
  questionType: string;
  points: number;
  pointsEarned: number;
  isCorrect: boolean;
  explanation?: string;
  selectedOptionIds: string[];
  options: QuizReviewOption[];
}

export interface QuizReview {
  attemptId: string;
  quizId: string;
  title: string;
  attemptNumber: number;
  scoreAchieved: number;
  passingScore: number;
  maxScore: number;
  isPassed: boolean;
  submittedAt?: string;
  questions: QuizReviewQuestion[];
}

export interface SubmissionFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType?: string;
}

export interface SubmissionDetail {
  id: string;
  submissionText?: string;
  gitRepoUrl?: string;
  fileUrl?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'LATE' | 'GRADED';
  grade?: number;
  feedback?: string;
  submittedAt: string;
  files?: SubmissionFile[];
}

export interface AssignmentDetail {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  instructions: string;
  attachmentUrl?: string;
  dueDate: string;
  maxScore: number;
  allowGitRepo: boolean;
  allowedExtensions?: string;
  mySubmission?: SubmissionDetail;
}

