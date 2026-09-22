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

export interface LessonItem {
  id: string;
  title: string;
  orderIndex: number;
  contentType: 'VIDEO' | 'PDF' | 'TEXT';
  contentUrl?: string;
  isLocked: boolean;
  isCompleted: boolean;
  quizPassed: boolean;
}

export interface CourseItem {
  id: string;
  courseCode: string;
  title: string;
  description: string;
  teacherName: string;
  progressPercentage: number;
  isEnrolled: boolean;
  lessonsCount: number;
  lessons?: LessonItem[];
}

export interface QuizOption {
  optionId: string;
  optionText: string;
}

export interface QuizQuestion {
  questionId: string;
  questionText: string;
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  points: number;
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
