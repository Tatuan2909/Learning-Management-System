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
  | 'TEXT';

export interface LessonSummary {
  id: string;
  title: string;
  orderIndex: number;
  contentType: ActivityType;
  subtitle?: string;
  contentUrl?: string;
  bodyMarkdown?: string;
  isLocked: boolean;
  isCompleted: boolean;
  quizPassed: boolean;
  quizId?: string;
  assignmentId?: string;
}

export interface SectionSummary {
  id: string;
  title: string;
  orderIndex: number;
  isLocked: boolean;
  isExpanded: boolean;
  items: LessonSummary[];
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

export interface CourseItem {
  id: string;
  courseCode: string;
  title: string;
  description: string;
  teacherName: string;
  progressPercentage: number;
  isEnrolled: boolean;
  accessPassword?: string;
  lessonsCount: number;
  weightAttendance?: number;
  weightAssignments?: number;
  weightFinalExam?: number;
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

export interface SubmitQuizRequest {
  quizId: string;
  studentId: string;
  answers: QuestionAnswer[];
}

export interface SubmitQuizResponse {
  quizAttemptId: string;
  score: number;
  passingScore: number;
  isPassed: boolean;
  lessonProgressUpdated: boolean;
  message: string;
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
  files: SubmissionFile[];
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
