import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  PlusCircle,
  Award,
  Bell,
  Users,
  FileText,
  Download,
  Edit3,
  CheckCircle2,
  Clock,
  Save,
  Trash2,
  ChevronRight,
  UserPlus,
  Search,
  Filter,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  HelpCircle,
  MessageSquare,
  PlayCircle,
  Video,
  ExternalLink,
  Github
} from 'lucide-react';
import { AuthUser } from '../types';
import api from '../api/axios';
import { parseVideoUrl } from '../utils/videoHelper';

const API_ORIGIN = (api.defaults.baseURL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
const getSubmissionFileDownloadUrl = (file: TeacherSubmissionFile) =>
  file.fileUrl.startsWith('http') ? file.fileUrl : `${API_ORIGIN}/api/teacher/submission-files/${file.id}/download`;
const getUploadedFileUrl = (fileUrl: string) =>
  fileUrl.startsWith('http') ? fileUrl : `${API_ORIGIN}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;

interface Props {
  user: AuthUser;
  activeTab?: 'overview' | 'courses';
  onTabChange?: (tab: 'overview' | 'courses') => void;
}

export interface TeacherCourse {
  id: string;
  courseCode: string;
  title: string;
  department: string;
  enrolledStudents: number;
  lessonsCount: number;
  accessPassword?: string;
  weightAttendance: number;
  weightAssignments: number;
  weightFinalExam: number;
}

export type TeacherActivityType = 'LECTURE' | 'DOCUMENT' | 'PRACTICE' | 'QUIZ' | 'FORUM';

export interface TeacherLesson {
  id: string;
  courseId: string;
  weekNumber: number;
  activityType: TeacherActivityType;
  lessonNumber: number;
  title: string;
  durationMinutes: number;
  isUnlocked: boolean;
  description?: string;
  resourceUrl?: string;
  password?: string;
  dueDate?: string;
}

export interface CourseStudent {
  id: string;
  courseId: string;
  studentCode: string;
  fullName: string;
  email: string;
  className: string;
  enrolledAt: string;
  progressPercentage: number;
  status: 'ACTIVE' | 'SUSPENDED';
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

export interface TeacherSubmissionFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType?: string;
}

export interface TeacherSubmission {
  id: string;
  courseId: string;
  courseCode: string;
  assignmentTitle: string;
  studentName: string;
  studentCode: string;
  submittedAt: string;
  fileUrl: string;
  gitRepoUrl?: string;
  submissionText: string;
  files?: TeacherSubmissionFile[];
  grade?: number;
  feedback?: string;
  status: 'SUBMITTED' | 'GRADED';
}

export interface TeacherAnnouncement {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}

const getCoursePasswordStorageKey = (courseCode: string) => `lms_course_password_${courseCode}`;
const readStoredCoursePassword = (courseCode: string, fallback?: string) => {
  const storedPassword = localStorage.getItem(getCoursePasswordStorageKey(courseCode));
  return storedPassword !== null ? storedPassword : fallback;
};
const saveStoredCoursePassword = (courseCode: string, password: string) => {
  localStorage.setItem(getCoursePasswordStorageKey(courseCode), password);
};
const courseHasEnrollmentPassword = (course: TeacherCourse) => Boolean((course.accessPassword || '').trim());
const teacherActivityOrder: TeacherActivityType[] = ['LECTURE', 'DOCUMENT', 'PRACTICE', 'QUIZ'];
const addableTeacherActivityTypes: TeacherActivityType[] = teacherActivityOrder;

export const mapToActivityCategory = (typeOrContentType: string): TeacherActivityType => {
  const t = (typeOrContentType || '').toUpperCase();
  if (t === 'LECTURE' || t === 'VIDEO' || t === 'SCORM' || t === 'OVERVIEW') return 'LECTURE';
  if (t === 'DOCUMENT' || t === 'PDF' || t === 'DOCX' || t === 'LINK') return 'DOCUMENT';
  if (t === 'PRACTICE') return 'PRACTICE';
  if (t === 'QUIZ') return 'QUIZ';
  if (t === 'FORUM' || t === 'ANNOUNCEMENT' || t === 'TEXT') return 'FORUM';
  return 'LECTURE';
};

const getActivityMeta = (type: TeacherActivityType) => {
  switch (type) {
    case 'LECTURE':
      return {
        label: 'Bài giảng',
        icon: BookOpen,
        color: 'bg-blue-50 text-blue-700 border-blue-200'
      };
    case 'DOCUMENT':
      return {
        label: 'Tài liệu',
        icon: FileText,
        color: 'bg-rose-50 text-rose-700 border-rose-200'
      };
    case 'PRACTICE':
      return {
        label: 'Luyện tập',
        icon: Edit3,
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    case 'QUIZ':
      return {
        label: 'Bài trắc nghiệm',
        icon: HelpCircle,
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
      };
    case 'FORUM':
      return {
        label: 'Diễn đàn',
        icon: MessageSquare,
        color: 'bg-amber-50 text-amber-700 border-amber-200'
      };
  }
};

export const TeacherDashboard: React.FC<Props> = ({
  user,
  activeTab: propActiveTab,
  onTabChange
}) => {
  // Main Tab: 'overview' or 'courses'
  const [internalActiveTab, setInternalActiveTab] = useState<'overview' | 'courses'>('overview');
  const mainTab = propActiveTab !== undefined ? propActiveTab : internalActiveTab;
  const setMainTab = (tab: 'overview' | 'courses') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  // State for which Course is currently opened
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Sub-tabs INSIDE a specific Course:
  // 'lessons' | 'students' | 'grading' | 'gradebook' | 'announcements'
  const [courseTab, setCourseTab] = useState<'lessons' | 'students' | 'grading' | 'gradebook' | 'announcements'>('lessons');

  // Dynamic state loaded from real database
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [lessons, setLessons] = useState<TeacherLesson[]>([]);
  const [studentsList, setStudentsList] = useState<CourseStudent[]>([]);
  const [submissions, setSubmissions] = useState<TeacherSubmission[]>([]);
  const [gradebookRows, setGradebookRows] = useState<StudentGradeRow[]>([]);
  const [announcements, setAnnouncements] = useState<TeacherAnnouncement[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  const teacherId = user.userId || '22222222-2222-2222-2222-222222222222';

  // Fetch teacher's courses from database
  const fetchTeacherCourses = async () => {
    try {
      setLoadingData(true);
      const res = await api.get<TeacherCourse[]>(`/teacher/courses?teacherId=${teacherId}`);
      setCourses(res.data || []);
      if (res.data && res.data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(res.data[0].id);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách khóa học giảng viên từ CSDL:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchTeacherCourses();
  }, [teacherId]);

  // Fetch details for the selected course from database
  const fetchCourseData = async (courseId: string) => {
    try {
      const [lesRes, stuRes, subRes, gbRes, annRes] = await Promise.all([
        api.get<TeacherLesson[]>(`/teacher/courses/${courseId}/lessons`),
        api.get<CourseStudent[]>(`/teacher/courses/${courseId}/students`),
        api.get<TeacherSubmission[]>(`/teacher/courses/${courseId}/submissions`),
        api.get<StudentGradeRow[]>(`/teacher/courses/${courseId}/gradebook`),
        api.get<TeacherAnnouncement[]>(`/teacher/courses/${courseId}/announcements`)
      ]);

      setLessons(lesRes.data || []);
      setStudentsList(stuRes.data || []);
      setSubmissions(subRes.data || []);
      setGradebookRows(gbRes.data || []);
      setAnnouncements(annRes.data || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu chi tiết môn học từ CSDL:', err);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseData(selectedCourseId);
    }
  }, [selectedCourseId]);

  // Modal States
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDept, setNewCourseDept] = useState('Khoa Công nghệ Thông tin');
  const [passwordCourseId, setPasswordCourseId] = useState<string | null>(null);
  const [coursePasswordDraft, setCoursePasswordDraft] = useState('');
  const [showCoursePasswordModal, setShowCoursePasswordModal] = useState(false);

  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [newLessonWeek, setNewLessonWeek] = useState(1);
  const [newLessonType, setNewLessonType] = useState<TeacherActivityType>('LECTURE');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState(45);
  const [newLessonUrl, setNewLessonUrl] = useState('');
  const [newLessonDescription, setNewLessonDescription] = useState('');
  const [newLessonPassword, setNewLessonPassword] = useState('');
  const [newLessonDueDate, setNewLessonDueDate] = useState('');

  // Edit Lesson Modal State
  const [showEditLessonModal, setShowEditLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<TeacherLesson | null>(null);
  const [editLessonWeek, setEditLessonWeek] = useState(1);
  const [editLessonType, setEditLessonType] = useState<TeacherActivityType>('LECTURE');
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonDuration, setEditLessonDuration] = useState(45);
  const [editLessonUrl, setEditLessonUrl] = useState('');
  const [editLessonDescription, setEditLessonDescription] = useState('');
  const [editLessonPassword, setEditLessonPassword] = useState('');
  const [editLessonDueDate, setEditLessonDueDate] = useState('');

  // Video Preview Modal State
  const [previewVideoLesson, setPreviewVideoLesson] = useState<TeacherLesson | null>(null);

  // Add Student to Course Modal State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentCode, setNewStudentCode] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('CNTT-K65');

  // Search & Filter for Students in Course
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  // Active grading edit
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [tempGrade, setTempGrade] = useState<number>(0);
  const [tempFeedback, setTempFeedback] = useState<string>('');

  // Add Announcement State inside current course
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPinned, setAnnPinned] = useState(false);

  // Currently selected course object
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const passwordEditingCourse = courses.find((c) => c.id === passwordCourseId) || null;

  // Filtered data for the current active course
  const courseLessons = lessons.filter((l) => l.courseId === currentCourse?.id);
  const courseWeekNumbers = Array.from(
    new Set([...courseLessons.map((lesson) => lesson.weekNumber), 1])
  ).sort((a, b) => a - b);
  const courseStudents = studentsList.filter((st) => st.courseId === currentCourse?.id);
  const courseSubmissions = submissions.filter((s) => s.courseId === currentCourse?.id);
  const coursePendingSubmissionsCount = courseSubmissions.filter((s) => s.status === 'SUBMITTED').length;
  const courseGradebookRows = gradebookRows.filter((r) => r.courseId === currentCourse?.id);
  const courseAnnouncements = announcements.filter((a) => a.courseId === currentCourse?.id);

  // Filtered students according to search and status filter
  const displayedCourseStudents = courseStudents.filter((st) => {
    const matchQuery =
      st.fullName.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      st.studentCode.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      st.email.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      st.className.toLowerCase().includes(studentSearchTerm.toLowerCase());
    if (studentStatusFilter === 'ALL') return matchQuery;
    return matchQuery && st.status === studentStatusFilter;
  });

  // Total pending submissions across all courses
  const totalPendingSubmissions = submissions.filter((s) => s.status === 'SUBMITTED').length;

  // Handlers
  const handleOpenCourse = (courseId: string, initialTab: 'lessons' | 'students' | 'grading' | 'gradebook' | 'announcements' = 'lessons') => {
    setSelectedCourseId(courseId);
    setCourseTab(initialTab);
    setMainTab('courses');
  };

  const openCoursePasswordModal = (course: TeacherCourse) => {
    setPasswordCourseId(course.id);
    setCoursePasswordDraft(course.accessPassword || '');
    setShowCoursePasswordModal(true);
  };

  const closeCoursePasswordModal = () => {
    setShowCoursePasswordModal(false);
    setPasswordCourseId(null);
    setCoursePasswordDraft('');
  };

  const handleSaveCoursePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordEditingCourse) return;

    const nextPassword = coursePasswordDraft.trim();
    setCourses((prev) =>
      prev.map((course) =>
        course.id === passwordEditingCourse.id ? { ...course, accessPassword: nextPassword } : course
      )
    );
    saveStoredCoursePassword(passwordEditingCourse.courseCode, nextPassword);
    closeCoursePasswordModal();
    alert(
      nextPassword
        ? `Đã đặt mật khẩu ghi danh cho khóa học ${passwordEditingCourse.courseCode}.`
        : `Đã bỏ mật khẩu ghi danh cho khóa học ${passwordEditingCourse.courseCode}. Sinh viên có thể ghi danh tự do.`
    );
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseTitle) return;

    try {
      const res = await api.post<TeacherCourse>(`/teacher/courses?teacherId=${teacherId}`, {
        courseCode: newCourseCode.toUpperCase(),
        title: newCourseTitle,
        description: 'Học phần LMS trực tuyến'
      });
      setCourses([res.data, ...courses]);
      setSelectedCourseId(res.data.id);
      setShowAddCourseModal(false);
      setNewCourseCode('');
      setNewCourseTitle('');
      alert(`Đã tạo thành công khóa học: ${res.data.courseCode} - ${res.data.title}`);
    } catch (err: any) {
      alert('Lỗi tạo khóa học: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleNewLessonTypeChange = (activityType: TeacherActivityType) => {
    setNewLessonType(activityType);
    setNewLessonDuration(activityType === 'QUIZ' ? 15 : 45);
    if (activityType !== 'QUIZ') {
      setNewLessonPassword('');
    }
  };

  const openAddActivityModal = (weekNumber?: number, activityType?: TeacherActivityType) => {
    const selectedType = activityType && addableTeacherActivityTypes.includes(activityType) ? activityType : 'LECTURE';
    setNewLessonWeek(weekNumber || Math.max(...courseWeekNumbers, 1));
    setNewLessonType(selectedType);
    setNewLessonTitle('');
    setNewLessonDuration(selectedType === 'QUIZ' ? 15 : 45);
    setNewLessonUrl('');
    setNewLessonDescription('');
    setNewLessonPassword('');
    setNewLessonDueDate('');
    setShowAddLessonModal(true);
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle || !currentCourse) return;

    try {
      const res = await api.post<TeacherLesson>(`/teacher/courses/${currentCourse.id}/lessons`, {
        weekNumber: newLessonWeek,
        activityType: newLessonType,
        title: newLessonTitle,
        durationMinutes: newLessonDuration || 45,
        description: newLessonDescription || undefined,
        resourceUrl: newLessonUrl || undefined,
        password: newLessonType === 'QUIZ' ? newLessonPassword || undefined : undefined
      });

      setLessons([...lessons, res.data]);
      setCourses((prev) =>
        prev.map((c) => (c.id === currentCourse.id ? { ...c, lessonsCount: c.lessonsCount + 1 } : c))
      );
      setShowAddLessonModal(false);
      setNewLessonTitle('');
      setNewLessonDuration(45);
      setNewLessonUrl('');
      setNewLessonDescription('');
      setNewLessonPassword('');
      setNewLessonDueDate('');
      alert('Đã thêm hoạt động mới vào tuần học trong CSDL!');
    } catch (err: any) {
      alert('Lỗi thêm hoạt động: ' + (err.response?.data?.message || err.message));
    }
  };

  const openEditActivityModal = (lesson: TeacherLesson) => {
    setEditingLesson(lesson);
    setEditLessonWeek(lesson.weekNumber);
    setEditLessonType(mapToActivityCategory(lesson.activityType));
    setEditLessonTitle(lesson.title);
    setEditLessonDuration(lesson.durationMinutes || 45);
    setEditLessonUrl(lesson.resourceUrl || '');
    setEditLessonDescription(lesson.description || '');
    setEditLessonPassword(lesson.password || '');
    setEditLessonDueDate(lesson.dueDate || '');
    setShowEditLessonModal(true);
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson || !editLessonTitle.trim() || !currentCourse) return;

    try {
      const res = await api.put<TeacherLesson>(`/teacher/lessons/${editingLesson.id}`, {
        weekNumber: editLessonWeek,
        activityType: editLessonType,
        title: editLessonTitle.trim(),
        durationMinutes: editLessonDuration || 45,
        description: editLessonDescription.trim() || undefined,
        resourceUrl: editLessonUrl.trim() || undefined,
        password: editLessonType === 'QUIZ' ? editLessonPassword.trim() || undefined : undefined
      });

      setLessons((prev) =>
        prev.map((les) => (les.id === editingLesson.id ? { ...les, ...res.data } : les))
      );
      setShowEditLessonModal(false);
      setEditingLesson(null);
      alert('Đã cập nhật hoạt động thành công trong CSDL!');
    } catch (err: any) {
      alert('Lỗi cập nhật hoạt động: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteLesson = async (lessonId: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hoạt động: "${title}"?\n\nHoạt động này sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu.`)) {
      return;
    }

    try {
      await api.delete(`/teacher/lessons/${lessonId}`);
      setLessons((prev) => prev.filter((les) => les.id !== lessonId));
      if (currentCourse) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === currentCourse.id ? { ...c, lessonsCount: Math.max(0, c.lessonsCount - 1) } : c
          )
        );
      }
      alert(`Đã xóa thành công hoạt động: "${title}" khỏi CSDL!`);
    } catch (err: any) {
      alert('Lỗi khi xóa hoạt động: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleLessonLock = async (lessonId: string) => {
    try {
      const res = await api.post<{ lessonId: string; isLocked: boolean }>(`/teacher/lessons/${lessonId}/toggle-lock`);
      setLessons((prev) =>
        prev.map((les) => (les.id === lessonId ? { ...les, isUnlocked: !res.data.isLocked } : les))
      );
    } catch (err: any) {
      alert('Lỗi chuyển trạng thái khóa: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddStudentToCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentCode || !newStudentName || !newStudentEmail || !currentCourse) {
      alert('Vui lòng nhập đầy đủ MSSV, Họ tên và Email sinh viên!');
      return;
    }

    try {
      const res = await api.post<CourseStudent>(`/teacher/courses/${currentCourse.id}/students`, {
        studentCode: newStudentCode.toUpperCase(),
        fullName: newStudentName,
        email: newStudentEmail,
        className: newStudentClass || 'CNTT-K65'
      });

      setStudentsList([res.data, ...studentsList]);
      setCourses((prev) =>
        prev.map((c) => (c.id === currentCourse.id ? { ...c, enrolledStudents: c.enrolledStudents + 1 } : c))
      );

      // Refresh gradebook
      const gbRes = await api.get<StudentGradeRow[]>(`/teacher/courses/${currentCourse.id}/gradebook`);
      setGradebookRows(gbRes.data || []);

      setShowAddStudentModal(false);
      setNewStudentCode('');
      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentClass('CNTT-K65');
      alert(`Đã thêm sinh viên ${res.data.fullName} (${res.data.studentCode}) vào lớp học phần!`);
    } catch (err: any) {
      alert('Lỗi thêm sinh viên: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleStudentStatus = async (studentId: string) => {
    if (!currentCourse) return;
    try {
      const res = await api.post<{ status: 'ACTIVE' | 'SUSPENDED' }>(
        `/teacher/courses/${currentCourse.id}/students/${studentId}/toggle-status`
      );
      setStudentsList((prev) =>
        prev.map((st) => (st.id === studentId ? { ...st, status: res.data.status } : st))
      );
    } catch (err) {
      console.error('Lỗi đổi trạng thái sinh viên:', err);
    }
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!currentCourse) return;
    if (confirm(`Bạn có chắc chắn muốn xóa sinh viên ${studentName} khỏi lớp học phần này không?`)) {
      const deleteResult = await api.delete(`/teacher/courses/${currentCourse.id}/students/${studentId}`).catch((err: any) => {
        alert('Loi xoa sinh vien: ' + (err.response?.data?.message || err.message));
        return null;
      });
      if (!deleteResult) return;
      setStudentsList((prev) => prev.filter((st) => st.id !== studentId));
      setGradebookRows((prev) => prev.filter((row) => row.studentId !== studentId));
      if (currentCourse) {
        setCourses((prev) =>
          prev.map((c) => (c.id === currentCourse.id ? { ...c, enrolledStudents: Math.max(0, c.enrolledStudents - 1) } : c))
        );
      }
      alert(`Đã xóa sinh viên khỏi lớp học phần.`);
    }
  };

  const handleSaveGrade = async (submissionId: string) => {
    try {
      await api.post(`/teacher/submissions/${submissionId}/grade?teacherId=${teacherId}`, {
        grade: tempGrade,
        feedback: tempFeedback
      });

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? { ...s, grade: tempGrade, feedback: tempFeedback, status: 'GRADED' }
            : s
        )
      );
      setEditingSubId(null);
      alert('Đã lưu điểm số và lời nhận xét của giảng viên vào CSDL!');
    } catch (err: any) {
      alert('Lỗi chấm điểm: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent || !currentCourse) return;

    try {
      const res = await api.post<TeacherAnnouncement>(
        `/teacher/courses/${currentCourse.id}/announcements?teacherId=${teacherId}`,
        {
          title: annTitle,
          content: annContent,
          isPinned: annPinned
        }
      );

      setAnnouncements(annPinned ? [res.data, ...announcements] : [...announcements, res.data]);
      setAnnTitle('');
      setAnnContent('');
      setAnnPinned(false);
      alert(`Đã đăng thông báo cho môn học ${currentCourse.courseCode}!`);
    } catch (err: any) {
      alert('Lỗi đăng thông báo: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExportExcel = () => {
    if (!currentCourse) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['MSSV,Họ tên,Lớp,Chuyên cần (10%),Bài tập (30%),Thi (60%),Điểm tổng kết,Xếp loại'].join(',') +
      '\n' +
      courseGradebookRows
        .map(
          (r) =>
            `${r.studentCode},${r.fullName},${r.className},${r.attendanceScore},${r.assignmentScore},${r.examScore},${r.totalScore},${r.letterGrade}`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bang_Diem_${currentCourse.courseCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 w-full text-slate-800 font-sans">
      {/* ========================================================================= */}
      {/* VIEW 1: TỔNG QUAN GIẢNG DẠY (OVERVIEW)                                    */}
      {/* ========================================================================= */}
      {mainTab === 'overview' && (
        <div className="space-y-8 w-full">
          {/* Gentle Welcome Banner */}
          <div className="bg-gradient-to-r from-indigo-50/90 via-blue-50/50 to-slate-50 rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xs border border-indigo-100/80 relative overflow-hidden w-full">
            <div className="relative z-10 max-w-3xl">
              <span className="bg-indigo-100/80 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-3 border border-indigo-200/60">
                <Award className="w-4 h-4 text-indigo-600" />
                Cổng Thông tin Giảng viên (Teacher Portal)
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-slate-900">
                Xin chào, {user.fullName}!
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                {user.teacherCode ? `Mã cán bộ: ${user.teacherCode} • ` : ''}Theo dõi tiến độ chung, xem danh sách bài nộp cần chấm điểm và quản lý các khóa học phụ trách.
              </p>
            </div>
          </div>

          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Khóa học phụ trách</span>
                <h3 className="font-extrabold text-2xl text-slate-900 mt-0.5">{courses.length} môn</h3>
                <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">Đang giảng dạy</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Tổng số Sinh viên</span>
                <h3 className="font-extrabold text-2xl text-slate-900 mt-0.5">
                  {courses.reduce((acc, c) => acc + c.enrolledStudents, 0)} học viên
                </h3>
                <span className="text-[11px] text-indigo-600 font-semibold mt-0.5 block">Trên toàn bộ các lớp</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Bài tập chờ chấm</span>
                <h3 className="font-extrabold text-2xl text-amber-600 mt-0.5">
                  {totalPendingSubmissions} bài
                </h3>
                <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">Cần xử lý sớm</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Tiến độ lớp trung bình</span>
                <h3 className="font-extrabold text-2xl text-emerald-600 mt-0.5">68%</h3>
                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Hoàn thành bài tập</span>
              </div>
            </div>
          </div>

          {/* Quick Tasks Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {/* Left: Pending Submissions Preview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                  Bài nộp cần chấm điểm mới nhất
                </h3>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  {totalPendingSubmissions} bài chờ chấm
                </span>
              </div>

              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-extrabold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                          {sub.courseCode}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{sub.studentName}</span>
                        <span className="text-xs text-slate-500">({sub.studentCode})</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{sub.assignmentTitle}</p>
                    </div>

                    <div>
                      {sub.status === 'GRADED' ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                          Đã chấm: {sub.grade}đ
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenCourse(sub.courseId, 'grading')}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Chấm bài</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Active Courses Overview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Danh sách Khóa học đang giảng dạy
                </h3>
                <button
                  onClick={() => setShowAddCourseModal(true)}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Tạo khóa học</span>
                </button>
              </div>

              <div className="space-y-3">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">{c.courseCode}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                      <span className="text-xs text-slate-500 mt-1 block">
                        {c.enrolledStudents} sinh viên • {c.lessonsCount} bài giảng
                      </span>
                      <span
                        className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                          courseHasEnrollmentPassword(c)
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {courseHasEnrollmentPassword(c) ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                        {courseHasEnrollmentPassword(c) ? 'Có mật khẩu ghi danh' : 'Ghi danh tự do'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => openCoursePasswordModal(c)}
                        className="px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl transition-all border border-slate-200 flex items-center justify-center gap-1"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Mật khẩu</span>
                      </button>
                      <button
                        onClick={() => handleOpenCourse(c.id, 'lessons')}
                        className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl transition-all border border-blue-200 flex items-center justify-center gap-1"
                      >
                        <span>Vào lớp</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: QUẢN LÝ KHÓA HỌC (COURSES VIEW)                                  */}
      {/* ========================================================================= */}
      {mainTab === 'courses' && (
        <div className="space-y-6 w-full">
          {/* LEVEL 1: NẾU CHƯA CHỌN KHÓA HỌC NÀO -> HIỂN THỊ DANH SÁCH KHÓA HỌC */}
          {!selectedCourseId ? (
            <div className="space-y-6 w-full">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Khóa học phụ trách & Lớp giảng dạy</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chọn môn học bên dưới để quản lý bài giảng, danh sách sinh viên, chấm điểm bài tập, sổ điểm và thông báo
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCourseModal(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tạo Khóa học mới</span>
                </button>
              </div>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {courses.map((c) => {
                  const pendingCount = submissions.filter((s) => s.courseId === c.id && s.status === 'SUBMITTED').length;
                  const studentCount = studentsList.filter((st) => st.courseId === c.id).length;
                  return (
                    <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 uppercase">
                            {c.courseCode}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-lg mt-2">{c.title}</h4>
                          <span className="text-xs text-slate-500 block mt-0.5">{c.department}</span>
                          <span
                            className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                              courseHasEnrollmentPassword(c)
                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {courseHasEnrollmentPassword(c) ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                            {courseHasEnrollmentPassword(c) ? 'Có mật khẩu ghi danh' : 'Không yêu cầu mật khẩu'}
                          </span>
                        </div>
                        <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          Đang giảng dạy
                        </span>
                      </div>

                      {/* Course Quick Stats */}
                      <div className="p-3.5 rounded-xl bg-slate-50 text-xs space-y-1.5 text-slate-600 border border-slate-200">
                        <div className="flex justify-between">
                          <span>Sinh viên ghi danh:</span>
                          <strong className="text-blue-700 font-bold">{studentCount} học viên</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Số bài giảng:</span>
                          <strong className="text-slate-900">{c.lessonsCount} bài học</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Bài tập chờ chấm:</span>
                          <strong className={pendingCount > 0 ? 'text-amber-600 font-bold' : 'text-slate-900'}>
                            {pendingCount} bài nộp
                          </strong>
                        </div>
                      </div>

                      {/* Action buttons inside course card */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenCourse(c.id, 'lessons')}
                          className="flex-1 py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Vào lớp & Quản lý</span>
                        </button>
                        <button
                          onClick={() => handleOpenCourse(c.id, 'students')}
                          className="py-2 px-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl transition-all border border-slate-200"
                        >
                          Sinh viên ({studentCount})
                        </button>
                        <button
                          onClick={() => openCoursePasswordModal(c)}
                          className="py-2 px-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl transition-all border border-slate-200 inline-flex items-center gap-1"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Mật khẩu</span>
                        </button>
                        <button
                          onClick={() => handleOpenCourse(c.id, 'grading')}
                          className={`py-2 px-3 font-bold text-xs rounded-xl transition-all border ${
                            pendingCount > 0
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          Chấm bài ({pendingCount})
                        </button>
                        <button
                          onClick={() => handleOpenCourse(c.id, 'gradebook')}
                          className="py-2 px-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl transition-all border border-slate-200"
                        >
                          Sổ điểm
                        </button>
                        <button
                          onClick={() => handleOpenCourse(c.id, 'announcements')}
                          className="py-2 px-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl transition-all border border-slate-200"
                        >
                          Thông báo
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* LEVEL 2: DEDICATED WORKSPACE DÀNH RIÊNG CHO KHÓA HỌC ĐƯỢC CHỌN */
            <div className="space-y-6 w-full">
              {/* Course Top Navigation & Switcher Header */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-extrabold uppercase">
                          {currentCourse.courseCode}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                          {currentCourse.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {currentCourse.department} • {courseStudents.length} sinh viên • {courseLessons.length} bài giảng
                      </p>
                      <span
                        className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                          courseHasEnrollmentPassword(currentCourse)
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {courseHasEnrollmentPassword(currentCourse) ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                        {courseHasEnrollmentPassword(currentCourse) ? 'Đang yêu cầu mật khẩu ghi danh' : 'Sinh viên ghi danh không cần mật khẩu'}
                      </span>
                    </div>
                  </div>

                  {/* Fast Course Switcher */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openCoursePasswordModal(currentCourse)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Mật khẩu</span>
                    </button>
                    <span className="text-xs text-slate-500 font-medium hidden md:inline">Đổi môn học:</span>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.courseCode} - {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sub-tabs inside this specific Course (Settings removed, Students added) */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                  <button
                    onClick={() => setCourseTab('lessons')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                      courseTab === 'lessons'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Bài giảng & Nội dung ({courseLessons.length})</span>
                  </button>

                  <button
                    onClick={() => setCourseTab('students')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                      courseTab === 'students'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Quản lý Sinh viên ({courseStudents.length})</span>
                  </button>

                  <button
                    onClick={() => setCourseTab('grading')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                      courseTab === 'grading'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>
                      Chấm bài tập{' '}
                      {coursePendingSubmissionsCount > 0 && `(${coursePendingSubmissionsCount} chờ chấm)`}
                    </span>
                  </button>

                  <button
                    onClick={() => setCourseTab('gradebook')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                      courseTab === 'gradebook'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>Sổ điểm môn học ({courseGradebookRows.length})</span>
                  </button>

                  <button
                    onClick={() => setCourseTab('announcements')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                      courseTab === 'announcements'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    <span>Thông báo môn học ({courseAnnouncements.length})</span>
                  </button>
                </div>
              </div>

              {/* COURSE TAB 1: BÀI GIẢNG & NỘI DUNG */}
              {courseTab === 'lessons' && (
                <div className="space-y-6 w-full">
                  <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">Danh sách Bài giảng & Tài liệu môn học</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sinh viên cần hoàn thành bài giảng trước để mở khóa bài học kế tiếp (Sequential Lock)
                      </p>
                    </div>
                    <button
                      onClick={() => openAddActivityModal()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Thêm hoạt động tuần học</span>
                    </button>
                  </div>

                  <div className="space-y-5 w-full">
                    {courseWeekNumbers.map((weekNumber) => {
                      const weekItems = courseLessons.filter((lesson) => lesson.weekNumber === weekNumber);
                      const availableActivityCount = teacherActivityOrder.filter((type) =>
                        weekItems.some((lesson) => mapToActivityCategory(lesson.activityType) === type)
                      ).length;
                      return (
                        <div key={weekNumber} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <h5 className="font-extrabold text-slate-900 text-sm">Tuần {weekNumber}</h5>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {availableActivityCount}/{teacherActivityOrder.length} loại hoạt động đã sẵn sàng cho tuần này ({weekItems.length} hoạt động)
                              </p>
                            </div>
                            <button
                              onClick={() => openAddActivityModal(weekNumber)}
                              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Thêm hoạt động tuần {weekNumber}</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 p-4">
                            {teacherActivityOrder.map((type) => {
                              const meta = getActivityMeta(type);
                              const Icon = meta.icon;
                              const matchingItems = weekItems.filter(
                                (lesson) => mapToActivityCategory(lesson.activityType) === type
                              );
                              const hasItems = matchingItems.length > 0;

                              return (
                                <div
                                  key={type}
                                  className={`min-h-[175px] rounded-2xl border p-4 flex flex-col justify-between ${
                                    hasItems ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50 border-dashed border-slate-300'
                                  }`}
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${meta.color}`}>
                                        <Icon className="w-3 h-3" />
                                        {meta.label}
                                      </span>
                                      {hasItems && (
                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                          {matchingItems.length} mục
                                        </span>
                                      )}
                                    </div>

                                    {hasItems ? (
                                      <div className="space-y-3">
                                        {matchingItems.map((item) => (
                                          <div key={item.id} className="space-y-1.5 pb-2.5 border-b border-slate-100 last:border-b-0 last:pb-0">
                                            <div className="flex items-start justify-between gap-2">
                                              <h6 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">{item.title}</h6>
                                              <button
                                                onClick={() => handleToggleLessonLock(item.id)}
                                                className={`shrink-0 text-[10px] font-bold rounded-full px-2 py-0.5 border cursor-pointer transition-colors ${
                                                  item.isUnlocked
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                                }`}
                                                title="Bấm để đổi trạng thái khóa/mở"
                                              >
                                                {item.isUnlocked ? 'Mở' : 'Khóa'}
                                              </button>
                                            </div>
                                            <div className="space-y-0.5 text-[11px] text-slate-500">
                                              <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {item.durationMinutes} phút
                                              </span>
                                              {item.resourceUrl && (
                                                <span className="block truncate text-blue-600 hover:underline" title={item.resourceUrl}>
                                                  Link: {item.resourceUrl}
                                                </span>
                                              )}
                                              {item.dueDate && <span className="block text-slate-400">Hạn: {item.dueDate}</span>}
                                              {item.password && <span className="block text-indigo-600 font-bold">Có mật khẩu quiz</span>}
                                            </div>
                                            <div className="flex items-center gap-1.5 pt-1">
                                              {item.resourceUrl && (
                                                <button
                                                  onClick={() => setPreviewVideoLesson(item)}
                                                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                                                  title="Xem video YouTube / tài nguyên"
                                                >
                                                  <PlayCircle className="w-3.5 h-3.5 text-red-600" />
                                                  <span>Xem</span>
                                                </button>
                                              )}
                                              <button
                                                onClick={() => openEditActivityModal(item)}
                                                className="flex-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                                              >
                                                <Edit3 className="w-3 h-3" />
                                                <span>Sửa</span>
                                              </button>
                                              <button
                                                onClick={() => handleDeleteLesson(item.id, item.title)}
                                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                                                title="Xóa hoạt động khỏi CSDL"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                                <span>Xóa</span>
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                                        Chưa có {meta.label.toLowerCase()} cho tuần này.
                                      </p>
                                    )}
                                  </div>

                                  {!hasItems && (
                                    <button
                                      onClick={() => openAddActivityModal(weekNumber, type)}
                                      className="mt-4 w-full px-3 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl inline-flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                      <PlusCircle className="w-3.5 h-3.5" />
                                      <span>Thêm {meta.label}</span>
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DANH SÁCH CHI TIẾT TẤT CẢ HOẠT ĐỘNG */}
                  <div className="space-y-3 w-full">
                    <div className="flex items-center justify-between pt-2">
                      <h5 className="font-extrabold text-slate-800 text-sm">
                        Toàn bộ danh sách hoạt động khóa học ({courseLessons.length} hoạt động)
                      </h5>
                    </div>
                    {courseLessons.length === 0 ? (
                      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                        Khóa học hiện chưa có hoạt động nào. Hãy bấm "Thêm hoạt động tuần học" để bắt đầu thiết kế nội dung giảng dạy.
                      </div>
                    ) : (
                      courseLessons.map((les) => {
                        const meta = getActivityMeta(mapToActivityCategory(les.activityType));
                        const Icon = meta.icon;
                        return (
                          <div
                            key={les.id}
                            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center text-sm border border-blue-200 shrink-0">
                                {les.lessonNumber}
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${meta.color}`}>
                                    <Icon className="w-2.5 h-2.5" />
                                    {meta.label}
                                  </span>
                                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                    Tuần {les.weekNumber}
                                  </span>
                                  <h5 className="font-bold text-slate-900 text-sm">{les.title}</h5>
                                </div>
                                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> {les.durationMinutes} phút
                                  </span>
                                  {les.resourceUrl && (
                                    <span className="truncate max-w-xs text-blue-600" title={les.resourceUrl}>
                                      Link: {les.resourceUrl}
                                    </span>
                                  )}
                                  {les.description && (
                                    <span className="text-slate-400 truncate max-w-md" title={les.description}>
                                      {les.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleToggleLessonLock(les.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                                  les.isUnlocked
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                }`}
                                title="Nhấp để đổi trạng thái Khóa / Mở cho sinh viên"
                              >
                                {les.isUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                <span>{les.isUnlocked ? 'Đang mở' : 'Đang khóa'}</span>
                              </button>

                              {les.resourceUrl && (
                                <button
                                  onClick={() => setPreviewVideoLesson(les)}
                                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-blue-200"
                                  title="Xem thử video YouTube / tài nguyên"
                                >
                                  <PlayCircle className="w-3.5 h-3.5 text-red-600" />
                                  <span>Xem</span>
                                </button>
                              )}

                              <button
                                onClick={() => openEditActivityModal(les)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Sửa</span>
                              </button>

                              <button
                                onClick={() => handleDeleteLesson(les.id, les.title)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-rose-200"
                                title="Xóa bài học khỏi CSDL"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Xóa</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* COURSE TAB 2: QUẢN LÝ SINH VIÊN TRONG KHÓA HỌC */}
              {courseTab === 'students' && (
                <div className="space-y-6 w-full">
                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">
                        Danh sách Sinh viên theo học môn {currentCourse.courseCode}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Quản lý hồ sơ học viên, theo dõi tiến độ hoàn thành bài giảng và phê duyệt tham gia lớp học
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddStudentModal(true)}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Thêm Sinh viên vào lớp</span>
                    </button>
                  </div>

                  {/* Search & Status Filter */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                    <div className="relative w-full md:w-80">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                        placeholder="Tìm theo Tên, MSSV, Email, Lớp..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                      <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                        <Filter className="w-3.5 h-3.5" /> Trạng thái:
                      </span>
                      <button
                        onClick={() => setStudentStatusFilter('ALL')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          studentStatusFilter === 'ALL'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Tất cả ({courseStudents.length})
                      </button>
                      <button
                        onClick={() => setStudentStatusFilter('ACTIVE')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          studentStatusFilter === 'ACTIVE'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Đang học ({courseStudents.filter((s) => s.status === 'ACTIVE').length})
                      </button>
                      <button
                        onClick={() => setStudentStatusFilter('SUSPENDED')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          studentStatusFilter === 'SUSPENDED'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Tạm dừng ({courseStudents.filter((s) => s.status === 'SUSPENDED').length})
                      </button>
                    </div>
                  </div>

                  {/* Student Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-extrabold uppercase tracking-wider">
                            <th className="p-4">MSSV</th>
                            <th className="p-4">Họ và tên</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Lớp sinh hoạt</th>
                            <th className="p-4">Ngày ghi danh</th>
                            <th className="p-4">Tiến độ bài học</th>
                            <th className="p-4 text-center">Trạng thái</th>
                            <th className="p-4 text-center">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {displayedCourseStudents.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-slate-500 font-semibold">
                                Không tìm thấy sinh viên nào phù hợp với bộ lọc.
                              </td>
                            </tr>
                          ) : (
                            displayedCourseStudents.map((st) => (
                              <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="p-4 font-mono font-bold text-blue-700">{st.studentCode}</td>
                                <td className="p-4 font-bold text-slate-900">{st.fullName}</td>
                                <td className="p-4 text-slate-500">{st.email}</td>
                                <td className="p-4 text-slate-600 font-medium">{st.className}</td>
                                <td className="p-4 text-slate-400 font-mono text-[11px]">{st.enrolledAt}</td>
                                <td className="p-4 min-w-[130px]">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                                      <div
                                        className="bg-blue-600 h-full rounded-full transition-all"
                                        style={{ width: `${st.progressPercentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-700 w-8">
                                      {st.progressPercentage}%
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  {st.status === 'ACTIVE' ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                      <UserCheck className="w-3 h-3" /> Đang học
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                                      <UserX className="w-3 h-3" /> Tạm dừng
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => toggleStudentStatus(st.id)}
                                      title={st.status === 'ACTIVE' ? 'Tạm dừng học viên' : 'Kích hoạt lại học viên'}
                                      className={`p-1.5 rounded-lg border text-xs font-semibold transition-all ${
                                        st.status === 'ACTIVE'
                                          ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200'
                                          : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                      }`}
                                    >
                                      {st.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                    </button>

                                    <button
                                      onClick={() => handleRemoveStudent(st.id, st.fullName)}
                                      title="Xóa sinh viên khỏi lớp"
                                      className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* COURSE TAB 3: CHẤM BÀI TẬP CỦA MÔN HỌC */}
              {courseTab === 'grading' && (
                <div className="space-y-6 w-full">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">
                        Chấm điểm bài tập môn {currentCourse.courseCode}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Xem danh sách bài tập đã nộp của sinh viên môn này và nhập điểm trực tiếp
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full">
                      Tổng số bài nộp: {courseSubmissions.length}
                    </span>
                  </div>

                  {courseSubmissions.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
                      <p className="font-bold text-sm">Chưa có bài nộp nào cho môn học này.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 w-full">
                      {courseSubmissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <div>
                              <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">{sub.assignmentTitle}</span>
                              <h4 className="font-extrabold text-slate-900 text-base mt-1">
                                Sinh viên: {sub.studentName} <span className="text-slate-400 font-mono">({sub.studentCode})</span>
                              </h4>
                              <span className="text-xs text-slate-500 block mt-0.5">Nộp lúc: {sub.submittedAt}</span>
                            </div>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                sub.status === 'GRADED'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {sub.status === 'GRADED' ? `Đã chấm: ${sub.grade} / 10 điểm` : 'Chưa chấm điểm'}
                            </span>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-50 text-xs space-y-3 border border-slate-200">
                            <div>
                              <span className="font-bold text-slate-700 block mb-1">Ghi chú / Lời nhắn của Sinh viên:</span>
                              <p className="text-slate-600 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-200">
                                "{sub.submissionText || 'Không có ghi chú thêm.'}"
                              </p>
                            </div>

                            {/* Git repository */}
                            {sub.gitRepoUrl && (
                              <div className="flex items-center gap-2 pt-1">
                                <a
                                  href={sub.gitRepoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-xs"
                                >
                                  <Github className="w-4 h-4" />
                                  <span>Xem mã nguồn GitHub: {sub.gitRepoUrl}</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            )}

                            {/* Files */}
                            {sub.files && sub.files.length > 0 ? (
                              <div className="space-y-1.5 pt-1">
                                <span className="font-bold text-slate-700 block">Danh sách tệp tin đính kèm ({sub.files.length} tệp):</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {sub.files.map((file) => {
                                    const downloadUrl = getSubmissionFileDownloadUrl(file);
                                    return (
                                      <a
                                        key={file.id}
                                        href={downloadUrl}
                                        className="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 flex items-center justify-between gap-3 transition-all group shadow-2xs"
                                        aria-label={`Tải file ${file.fileName}`}
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-4 h-4" />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="font-bold text-slate-800 group-hover:text-blue-700 truncate">{file.fileName}</p>
                                            <span className="text-[10px] text-slate-400">
                                              {file.fileSize > 0 ? `${(file.fileSize / 1024).toFixed(1)} KB` : 'Tệp bài làm'}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-blue-600 text-xs font-bold flex-shrink-0">
                                          <Download className="w-4 h-4" />
                                          <span className="hidden sm:inline">Tải về</span>
                                        </div>
                                      </a>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : sub.fileUrl ? (
                              <div className="pt-1">
                                <a
                                  href={getUploadedFileUrl(sub.fileUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-xl transition-all shadow-2xs"
                                >
                                  <Download className="w-4 h-4" />
                                  <span>Tải file bài nộp: {sub.fileUrl}</span>
                                </a>
                              </div>
                            ) : null}
                          </div>

                          {/* Grading Form / View */}
                          {editingSubId === sub.id ? (
                            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
                              <h5 className="font-bold text-xs text-blue-900">Nhập Điểm & Lời nhận xét:</h5>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Điểm số (Thang 10):
                                  </label>
                                  <input
                                    type="number"
                                    step="0.5"
                                    max="10"
                                    min="0"
                                    value={tempGrade}
                                    onChange={(e) => setTempGrade(parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                                  />
                                </div>

                                <div className="md:col-span-3">
                                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Lời nhận xét / Lời phê:
                                  </label>
                                  <input
                                    type="text"
                                    value={tempFeedback}
                                    onChange={(e) => setTempFeedback(e.target.value)}
                                    placeholder="Ví dụ: Bài làm tốt, Clean Architecture chuẩn!"
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-2">
                                <button
                                  onClick={() => setEditingSubId(null)}
                                  className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl"
                                >
                                  Hủy
                                </button>
                                <button
                                  onClick={() => handleSaveGrade(sub.id)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  <span>Lưu điểm số</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-xs pt-2">
                              {sub.feedback ? (
                                <span className="text-slate-600">
                                  Lời phê: <strong className="text-slate-800 italic">"{sub.feedback}"</strong>
                                </span>
                              ) : (
                                <span className="text-slate-400">Chưa có nhận xét</span>
                              )}

                              <button
                                onClick={() => {
                                  setEditingSubId(sub.id);
                                  setTempGrade(sub.grade || 8.0);
                                  setTempFeedback(sub.feedback || '');
                                }}
                                className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>{sub.status === 'GRADED' ? 'Sửa điểm số' : 'Nhập điểm & Nhận xét'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* COURSE TAB 4: SỔ ĐIỂM & ĐIỂM TỔNG KẾT */}
              {courseTab === 'gradebook' && (
                <div className="space-y-6 w-full">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">
                        Sổ điểm môn {currentCourse.courseCode} - {currentCourse.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Công thức: Điểm = (Chuyên cần {currentCourse.weightAttendance}%) + (Bài tập {currentCourse.weightAssignments}%) + (Thi {currentCourse.weightFinalExam}%)
                      </p>
                    </div>

                    <button
                      onClick={handleExportExcel}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Xuất sổ điểm ra Excel (.CSV)</span>
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200 font-extrabold">
                            <th className="p-4">MSSV</th>
                            <th className="p-4">Họ và tên Sinh viên</th>
                            <th className="p-4">Lớp</th>
                            <th className="p-4 text-center">Chuyên cần ({currentCourse.weightAttendance}%)</th>
                            <th className="p-4 text-center">Bài tập ({currentCourse.weightAssignments}%)</th>
                            <th className="p-4 text-center">Thi cuối kỳ ({currentCourse.weightFinalExam}%)</th>
                            <th className="p-4 text-center">Điểm Tổng kết</th>
                            <th className="p-4 text-center">Xếp loại</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {courseGradebookRows.map((row) => (
                            <tr key={row.studentId} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-4 font-mono font-bold text-blue-700">{row.studentCode}</td>
                              <td className="p-4 font-bold text-slate-900">{row.fullName}</td>
                              <td className="p-4 text-slate-500">{row.className}</td>
                              <td className="p-4 text-center font-semibold">{row.attendanceScore}</td>
                              <td className="p-4 text-center font-semibold">{row.assignmentScore}</td>
                              <td className="p-4 text-center font-semibold">{row.examScore}</td>
                              <td className="p-4 text-center font-extrabold text-blue-700">{row.totalScore}</td>
                              <td className="p-4 text-center">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-black ${
                                    row.letterGrade === 'A'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  Điểm {row.letterGrade}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* COURSE TAB 5: THÔNG BÁO MÔN HỌC */}
              {courseTab === 'announcements' && (
                <div className="space-y-6 w-full">
                  {/* Post Form */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-600" />
                      Đăng thông báo mới cho môn {currentCourse.courseCode}
                    </h4>

                    <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Tiêu đề thông báo:
                        </label>
                        <input
                          type="text"
                          value={annTitle}
                          onChange={(e) => setAnnTitle(e.target.value)}
                          placeholder="Ví dụ: Lịch nộp Bài tập lớn hoặc Thông báo phụ đạo..."
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Nội dung chi tiết thông báo:
                        </label>
                        <textarea
                          rows={3}
                          value={annContent}
                          onChange={(e) => setAnnContent(e.target.value)}
                          placeholder="Nhập nội dung thông báo gửi đến toàn bộ sinh viên đang theo học môn này..."
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={annPinned}
                            onChange={(e) => setAnnPinned(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span>Ghim thông báo lên đầu trang môn học</span>
                        </label>

                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <Bell className="w-4 h-4" />
                          <span>Đăng thông báo</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* List of Announcements */}
                  <div className="space-y-4">
                    {courseAnnouncements.map((ann) => (
                      <div
                        key={ann.id}
                        className={`bg-white p-5 rounded-2xl border shadow-2xs space-y-2 ${
                          ann.isPinned ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                            {ann.title}
                          </h5>
                          <span className="text-[11px] text-slate-400">{ann.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showCoursePasswordModal && passwordEditingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Mật khẩu ghi danh khóa học
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {passwordEditingCourse.courseCode} - {passwordEditingCourse.title}
                </p>
              </div>
              <button
                onClick={closeCoursePasswordModal}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveCoursePassword} className="space-y-4 text-xs">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <label className="block font-bold text-slate-700">Mật khẩu khóa học</label>
                <input
                  type="text"
                  value={coursePasswordDraft}
                  onChange={(e) => setCoursePasswordDraft(e.target.value)}
                  placeholder="Để trống nếu cho phép ghi danh tự do"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Khi có mật khẩu, sinh viên chưa ghi danh phải nhập đúng mật khẩu mới được ghi danh. Khi để trống, sinh viên có thể ghi danh ngay.
                </p>
              </div>

              <div className="flex justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCoursePasswordDraft('')}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-xl inline-flex items-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Bỏ mật khẩu</span>
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeCoursePasswordModal}
                    className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: TẠO KHÓA HỌC MỚI                                                */}
      {/* ========================================================================= */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                Tạo Khóa học mới
              </h3>
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã môn học (Course Code):</label>
                <input
                  type="text"
                  placeholder="Ví dụ: INT3306, CS101..."
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên khóa học:</label>
                <input
                  type="text"
                  placeholder="Nhập tên khóa học"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khoa / Bộ môn:</label>
                <input
                  type="text"
                  value={newCourseDept}
                  onChange={(e) => setNewCourseDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Tạo khóa học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: THÊM BÀI GIẢNG VÀO KHÓA HỌC                                    */}
      {/* ========================================================================= */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                Thêm hoạt động tuần học vào {currentCourse?.courseCode}
              </h3>
              <button
                onClick={() => setShowAddLessonModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tuần học:</label>
                  <input
                    type="number"
                    min="1"
                    value={newLessonWeek}
                    onChange={(e) => setNewLessonWeek(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại hoạt động:</label>
                  <select
                    value={newLessonType}
                    onChange={(e) => handleNewLessonTypeChange(e.target.value as TeacherActivityType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    {addableTeacherActivityTypes.map((type) => (
                      <option key={type} value={type}>
                        {getActivityMeta(type).label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                  <label className="block font-bold text-slate-700 mb-1">Tiêu đề hoạt động:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Bài giảng Tuần 3, Tài liệu PDF, Luyện tập hoặc Quiz..."
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thời lượng / thời gian làm (phút):</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={newLessonDuration}
                  onChange={(e) => setNewLessonDuration(parseInt(e.target.value) || 45)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Link tài nguyên / video bài giảng:</label>
                <input
                  type="text"
                  placeholder="Dán link YouTube (youtube.com/watch?v=... hoặc youtu.be/...), PDF, DOCX..."
                  value={newLessonUrl}
                  onChange={(e) => setNewLessonUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
                {parseVideoUrl(newLessonUrl).isYouTube && (
                  <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Hệ thống đã nhận diện link YouTube và sẽ tự động nhúng video player cho sinh viên!</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả / hướng dẫn:</label>
                  <textarea
                    rows={3}
                    placeholder="Nhập mô tả ngắn, yêu cầu luyện tập hoặc quy định làm quiz..."
                    value={newLessonDescription}
                    onChange={(e) => setNewLessonDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className={newLessonType === 'QUIZ' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'grid grid-cols-1 gap-3'}>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hạn nộp / hạn làm:</label>
                  <input
                    type="date"
                    value={newLessonDueDate}
                    onChange={(e) => setNewLessonDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                {newLessonType === 'QUIZ' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mật khẩu quiz:</label>
                    <input
                      type="text"
                      placeholder="Để trống nếu quiz không cần mật khẩu"
                      value={newLessonPassword}
                      onChange={(e) => setNewLessonPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Thêm hoạt động
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CHỈNH SỬA HOẠT ĐỘNG (EditLessonModal)                             */}
      {/* ========================================================================= */}
      {showEditLessonModal && editingLesson && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                Chỉnh sửa hoạt động: {editingLesson.title}
              </h3>
              <button
                onClick={() => {
                  setShowEditLessonModal(false);
                  setEditingLesson(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateLesson} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tuần học:</label>
                  <input
                    type="number"
                    min="1"
                    value={editLessonWeek}
                    onChange={(e) => setEditLessonWeek(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại hoạt động:</label>
                  <select
                    value={editLessonType}
                    onChange={(e) => {
                      const newType = e.target.value as TeacherActivityType;
                      setEditLessonType(newType);
                      if (newType !== 'QUIZ') setEditLessonPassword('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {addableTeacherActivityTypes.map((type) => (
                      <option key={type} value={type}>
                        {getActivityMeta(type).label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề hoạt động:</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tiêu đề hoạt động"
                  value={editLessonTitle}
                  onChange={(e) => setEditLessonTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thời lượng / thời gian làm (phút):</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={editLessonDuration}
                  onChange={(e) => setEditLessonDuration(parseInt(e.target.value) || 45)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Link tài nguyên / video bài giảng:</label>
                <input
                  type="text"
                  placeholder="Dán link YouTube (youtube.com/watch?v=... hoặc youtu.be/...), PDF, DOCX..."
                  value={editLessonUrl}
                  onChange={(e) => setEditLessonUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {parseVideoUrl(editLessonUrl).isYouTube && (
                  <div className="mt-2 p-2.5 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <PlayCircle className="w-4 h-4 text-red-600 shrink-0" />
                      Nhận diện link YouTube: Hệ thống sẽ tự động nhúng video player để sinh viên xem trực tiếp!
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewVideoLesson({ ...editingLesson, resourceUrl: editLessonUrl })}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[11px] shrink-0"
                    >
                      Xem thử
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả / hướng dẫn bài học:</label>
                <textarea
                  rows={3}
                  placeholder="Nội dung tóm tắt, mục tiêu học tập hoặc hướng dẫn làm bài..."
                  value={editLessonDescription}
                  onChange={(e) => setEditLessonDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className={editLessonType === 'QUIZ' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'grid grid-cols-1 gap-3'}>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hạn nộp / hạn làm:</label>
                  <input
                    type="date"
                    value={editLessonDueDate}
                    onChange={(e) => setEditLessonDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {editLessonType === 'QUIZ' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mật khẩu quiz:</label>
                    <input
                      type="text"
                      placeholder="Để trống nếu quiz không cần mật khẩu"
                      value={editLessonPassword}
                      onChange={(e) => setEditLessonPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteLesson(editingLesson.id, editingLesson.title);
                    setShowEditLessonModal(false);
                    setEditingLesson(null);
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa hoạt động này</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditLessonModal(false);
                      setEditingLesson(null);
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-xl hover:bg-slate-300 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu thay đổi</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: THÊM SINH VIÊN VÀO LỚP HỌC PHẦN                                  */}
      {/* ========================================================================= */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Thêm Sinh viên vào lớp {currentCourse?.courseCode}
              </h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudentToCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã sinh viên (MSSV):</label>
                <input
                  type="text"
                  placeholder="Ví dụ: SV2024009"
                  value={newStudentCode}
                  onChange={(e) => setNewStudentCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên sinh viên:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hoàng Minh Tuấn"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email sinh viên:</label>
                <input
                  type="email"
                  placeholder="tuanhm@lms.edu.vn"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lớp sinh hoạt:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: CNTT-K65"
                  value={newStudentClass}
                  onChange={(e) => setNewStudentClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Ghi danh vào lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: XEM THỬ VIDEO BÀI GIẢNG (VideoPreviewModal)                       */}
      {/* ========================================================================= */}
      {previewVideoLesson && (() => {
        const videoInfo = parseVideoUrl(previewVideoLesson.resourceUrl);
        const previewActivityMeta = getActivityMeta(mapToActivityCategory(previewVideoLesson.activityType));
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden text-slate-900 space-y-4">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${previewActivityMeta.color}`}>
                      {previewActivityMeta.label}
                    </span>
                    <span className="text-xs font-bold text-slate-500">Tuần {previewVideoLesson.weekNumber}</span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 mt-1">
                    {previewVideoLesson.title}
                  </h3>
                </div>
                <button
                  onClick={() => setPreviewVideoLesson(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="px-5">
                <div className="bg-black rounded-2xl overflow-hidden aspect-video w-full shadow-md flex items-center justify-center">
                  {videoInfo.embedUrl ? (
                    videoInfo.isDirectVideo ? (
                      <video controls className="w-full h-full" src={videoInfo.embedUrl}>
                        Trình duyệt không hỗ trợ thẻ video.
                      </video>
                    ) : (
                      <iframe
                        className="w-full h-full"
                        src={videoInfo.embedUrl}
                        title={previewVideoLesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                    )
                  ) : (
                    <div className="text-center p-8 text-slate-400 space-y-2">
                      <PlayCircle className="w-12 h-12 mx-auto text-slate-600" />
                      <p className="text-xs">Không tìm thấy nguồn tài nguyên hợp lệ từ URL: {previewVideoLesson.resourceUrl || '(Trống)'}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="truncate max-w-md text-slate-500">
                  <span className="font-semibold text-slate-700">Đường dẫn: </span>
                  <span className="font-mono text-blue-600">{previewVideoLesson.resourceUrl || 'Chưa cấu hình'}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewVideoLesson(null)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
