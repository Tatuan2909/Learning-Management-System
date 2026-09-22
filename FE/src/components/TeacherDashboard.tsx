import React, { useState } from 'react';
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
  ArrowLeft,
  ChevronRight,
  UserPlus,
  Search,
  Filter,
  Lock,
  Unlock,
  UserCheck,
  UserX
} from 'lucide-react';
import { AuthUser } from '../types';

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
  weightAttendance: number;
  weightAssignments: number;
  weightFinalExam: number;
}

export interface TeacherLesson {
  id: string;
  courseId: string;
  lessonNumber: number;
  title: string;
  durationMinutes: number;
  isUnlocked: boolean;
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

export interface TeacherSubmission {
  id: string;
  courseId: string;
  courseCode: string;
  assignmentTitle: string;
  studentName: string;
  studentCode: string;
  submittedAt: string;
  fileUrl: string;
  submissionText: string;
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

  // Courses List
  const [courses, setCourses] = useState<TeacherCourse[]>([
    {
      id: 'c1',
      courseCode: 'INT3306',
      title: 'Lập trình Web C# .NET 8 & ReactJS',
      department: 'Khoa Công nghệ Thông tin',
      enrolledStudents: 45,
      lessonsCount: 4,
      weightAttendance: 10,
      weightAssignments: 30,
      weightFinalExam: 60
    },
    {
      id: 'c2',
      courseCode: 'SE302',
      title: 'Kiến trúc Phần mềm & Microservices',
      department: 'Khoa Công nghệ Phần mềm',
      enrolledStudents: 38,
      lessonsCount: 3,
      weightAttendance: 10,
      weightAssignments: 30,
      weightFinalExam: 60
    }
  ]);

  // Lessons inside Courses
  const [lessons, setLessons] = useState<TeacherLesson[]>([
    {
      id: 'les-1',
      courseId: 'c1',
      lessonNumber: 1,
      title: 'Giới thiệu Clean Architecture & RESTful API .NET 8',
      durationMinutes: 45,
      isUnlocked: true
    },
    {
      id: 'les-2',
      courseId: 'c1',
      lessonNumber: 2,
      title: 'Entity Framework Core & PostgreSQL Database Migration',
      durationMinutes: 60,
      isUnlocked: true
    },
    {
      id: 'les-3',
      courseId: 'c1',
      lessonNumber: 3,
      title: 'Xác thực JWT Token & Cơ chế Refresh Token Rotation',
      durationMinutes: 50,
      isUnlocked: true
    },
    {
      id: 'les-4',
      courseId: 'c1',
      lessonNumber: 4,
      title: 'Tích hợp Frontend React Vite TypeScript & API Client',
      durationMinutes: 75,
      isUnlocked: false
    },
    {
      id: 'les-5',
      courseId: 'c2',
      lessonNumber: 1,
      title: 'Nguyên lý Domain-Driven Design (DDD) & Bounded Context',
      durationMinutes: 60,
      isUnlocked: true
    },
    {
      id: 'les-6',
      courseId: 'c2',
      lessonNumber: 2,
      title: 'API Gateway Ocelot & Service Discovery Consul',
      durationMinutes: 55,
      isUnlocked: true
    },
    {
      id: 'les-7',
      courseId: 'c2',
      lessonNumber: 3,
      title: 'Message Broker RabbitMQ & Event-Driven Architecture',
      durationMinutes: 80,
      isUnlocked: false
    }
  ]);

  // Enrolled Students per Course
  const [studentsList, setStudentsList] = useState<CourseStudent[]>([
    {
      id: 'cs-1',
      courseId: 'c1',
      studentCode: 'SV2024001',
      fullName: 'Trần Thị B',
      email: 'student@lms.edu.vn',
      className: 'CNTT-K65',
      enrolledAt: '2024-08-15',
      progressPercentage: 75,
      status: 'ACTIVE'
    },
    {
      id: 'cs-2',
      courseId: 'c1',
      studentCode: 'SV2024002',
      fullName: 'Nguyễn Văn C',
      email: 'student2@lms.edu.vn',
      className: 'CNTT-K65',
      enrolledAt: '2024-08-16',
      progressPercentage: 50,
      status: 'ACTIVE'
    },
    {
      id: 'cs-3',
      courseId: 'c1',
      studentCode: 'SV2024003',
      fullName: 'Lê Hoàng D',
      email: 'student3@lms.edu.vn',
      className: 'CNTT-K65',
      enrolledAt: '2024-08-18',
      progressPercentage: 25,
      status: 'ACTIVE'
    },
    {
      id: 'cs-4',
      courseId: 'c1',
      studentCode: 'SV2024006',
      fullName: 'Phan Thanh N',
      email: 'student6@lms.edu.vn',
      className: 'CNTT-K65',
      enrolledAt: '2024-08-20',
      progressPercentage: 0,
      status: 'SUSPENDED'
    },
    {
      id: 'cs-5',
      courseId: 'c2',
      studentCode: 'SV2024004',
      fullName: 'Phạm Quang H',
      email: 'student4@lms.edu.vn',
      className: 'CNTT-K65',
      enrolledAt: '2024-08-15',
      progressPercentage: 66,
      status: 'ACTIVE'
    },
    {
      id: 'cs-6',
      courseId: 'c2',
      studentCode: 'SV2024005',
      fullName: 'Vũ Thị M',
      email: 'student5@lms.edu.vn',
      className: 'CNTT-K65',
      enrolledAt: '2024-08-17',
      progressPercentage: 33,
      status: 'ACTIVE'
    }
  ]);

  // Submissions per Course
  const [submissions, setSubmissions] = useState<TeacherSubmission[]>([
    {
      id: 'sub-1',
      courseId: 'c1',
      courseCode: 'INT3306',
      assignmentTitle: 'Bài tập 1: Lập trình API Đăng nhập JWT',
      studentName: 'Trần Thị B',
      studentCode: 'SV2024001',
      submittedAt: '2026-09-22 10:30',
      fileUrl: 'https://example.com/sub/jwt-auth.zip',
      submissionText: 'Em đã hoàn thành các endpoint AuthController và đính kèm JWT Bearer Token.',
      grade: 9.5,
      feedback: 'Bài làm rất tốt, cấu trúc Clean Architecture chuẩn!',
      status: 'GRADED'
    },
    {
      id: 'sub-2',
      courseId: 'c1',
      courseCode: 'INT3306',
      assignmentTitle: 'Bài tập 2: Thiết kế Database Schema EF Core',
      studentName: 'Nguyễn Văn C',
      studentCode: 'SV2024002',
      submittedAt: '2026-09-22 15:45',
      fileUrl: 'https://example.com/sub/db-schema.zip',
      submissionText: 'Dạ thầy kiểm tra giúp em file DbContext Fluent API.',
      status: 'SUBMITTED'
    },
    {
      id: 'sub-3',
      courseId: 'c2',
      courseCode: 'SE302',
      assignmentTitle: 'Bài tập: Cấu hình Ocelot Reverse Proxy & Rate Limiting',
      studentName: 'Lê Hoàng D',
      studentCode: 'SV2024003',
      submittedAt: '2026-09-22 17:15',
      fileUrl: 'https://example.com/sub/ocelot-config.zip',
      submissionText: 'Em đã định tuyến các downstream services qua port 5000.',
      status: 'SUBMITTED'
    }
  ]);

  // Gradebook rows per Course
  const [gradebookRows, setGradebookRows] = useState<StudentGradeRow[]>([
    {
      studentId: 's1',
      courseId: 'c1',
      studentCode: 'SV2024001',
      fullName: 'Trần Thị B',
      className: 'CNTT-K65',
      attendanceScore: 10.0,
      assignmentScore: 9.5,
      examScore: 8.5,
      totalScore: 8.95,
      letterGrade: 'A',
      progressPercentage: 50.0
    },
    {
      studentId: 's2',
      courseId: 'c1',
      studentCode: 'SV2024002',
      fullName: 'Nguyễn Văn C',
      className: 'CNTT-K65',
      attendanceScore: 9.0,
      assignmentScore: 8.0,
      examScore: 7.0,
      totalScore: 7.50,
      letterGrade: 'B',
      progressPercentage: 75.0
    },
    {
      studentId: 's3',
      courseId: 'c1',
      studentCode: 'SV2024003',
      fullName: 'Lê Hoàng D',
      className: 'CNTT-K65',
      attendanceScore: 8.5,
      assignmentScore: 7.5,
      examScore: 6.5,
      totalScore: 7.00,
      letterGrade: 'B',
      progressPercentage: 25.0
    },
    {
      studentId: 's4',
      courseId: 'c2',
      studentCode: 'SV2024004',
      fullName: 'Phạm Quang H',
      className: 'CNTT-K65',
      attendanceScore: 9.5,
      assignmentScore: 8.5,
      examScore: 8.0,
      totalScore: 8.35,
      letterGrade: 'A',
      progressPercentage: 66.0
    },
    {
      studentId: 's5',
      courseId: 'c2',
      studentCode: 'SV2024005',
      fullName: 'Vũ Thị M',
      className: 'CNTT-K65',
      attendanceScore: 8.0,
      assignmentScore: 7.0,
      examScore: 7.5,
      totalScore: 7.40,
      letterGrade: 'B',
      progressPercentage: 33.0
    }
  ]);

  // Announcements per Course
  const [announcements, setAnnouncements] = useState<TeacherAnnouncement[]>([
    {
      id: 'ann-1',
      courseId: 'c1',
      courseCode: 'INT3306',
      title: '📌 THÔNG BÁO: Lịch nộp Bài tập lớn học kỳ I môn Lập trình Web C#',
      content: 'Các em sinh viên chú ý hoàn thành các bài tập đúng hạn để tính điểm chuyên cần.',
      isPinned: true,
      createdAt: '2026-09-22 14:00'
    },
    {
      id: 'ann-2',
      courseId: 'c2',
      courseCode: 'SE302',
      title: '📌 THÔNG BÁO: Tài liệu tham khảo đồ án Microservices phân tán',
      content: 'Tài liệu hướng dẫn triển khai Docker Compose và RabbitMQ đã được đăng tải.',
      isPinned: true,
      createdAt: '2026-09-21 09:30'
    }
  ]);

  // Modal States
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDept, setNewCourseDept] = useState('Khoa Công nghệ Thông tin');

  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState(45);

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

  // Filtered data for the current active course
  const courseLessons = lessons.filter((l) => l.courseId === currentCourse?.id);
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

  const handleBackToCoursesList = () => {
    setSelectedCourseId(null);
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseTitle) return;

    const newCourse: TeacherCourse = {
      id: `c-${Date.now()}`,
      courseCode: newCourseCode.toUpperCase(),
      title: newCourseTitle,
      department: newCourseDept,
      enrolledStudents: 0,
      lessonsCount: 0,
      weightAttendance: 10,
      weightAssignments: 30,
      weightFinalExam: 60
    };

    setCourses([newCourse, ...courses]);
    setShowAddCourseModal(false);
    setNewCourseCode('');
    setNewCourseTitle('');
    alert(`Đã tạo thành công khóa học: ${newCourse.courseCode} - ${newCourse.title}`);
  };

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle || !currentCourse) return;

    const newLesson: TeacherLesson = {
      id: `les-${Date.now()}`,
      courseId: currentCourse.id,
      lessonNumber: courseLessons.length + 1,
      title: newLessonTitle,
      durationMinutes: newLessonDuration || 45,
      isUnlocked: true
    };

    setLessons([...lessons, newLesson]);
    setCourses((prev) =>
      prev.map((c) => (c.id === currentCourse.id ? { ...c, lessonsCount: c.lessonsCount + 1 } : c))
    );
    setShowAddLessonModal(false);
    setNewLessonTitle('');
    setNewLessonDuration(45);
    alert('Đã thêm bài giảng mới vào khóa học!');
  };

  const handleAddStudentToCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentCode || !newStudentName || !newStudentEmail || !currentCourse) {
      alert('Vui lòng nhập đầy đủ MSSV, Họ tên và Email sinh viên!');
      return;
    }

    const newStudent: CourseStudent = {
      id: `cs-${Date.now()}`,
      courseId: currentCourse.id,
      studentCode: newStudentCode.toUpperCase(),
      fullName: newStudentName,
      email: newStudentEmail,
      className: newStudentClass || 'CNTT-K65',
      enrolledAt: new Date().toISOString().split('T')[0],
      progressPercentage: 0,
      status: 'ACTIVE'
    };

    setStudentsList([newStudent, ...studentsList]);
    setCourses((prev) =>
      prev.map((c) => (c.id === currentCourse.id ? { ...c, enrolledStudents: c.enrolledStudents + 1 } : c))
    );

    // Also add an initial gradebook row
    const newGradeRow: StudentGradeRow = {
      studentId: newStudent.id,
      courseId: currentCourse.id,
      studentCode: newStudent.studentCode,
      fullName: newStudent.fullName,
      className: newStudent.className,
      attendanceScore: 10.0,
      assignmentScore: 0,
      examScore: 0,
      totalScore: 1.0,
      letterGrade: 'F',
      progressPercentage: 0
    };
    setGradebookRows([...gradebookRows, newGradeRow]);

    setShowAddStudentModal(false);
    setNewStudentCode('');
    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentClass('CNTT-K65');
    alert(`Đã thêm sinh viên ${newStudent.fullName} (${newStudent.studentCode}) vào lớp học phần!`);
  };

  const toggleStudentStatus = (studentId: string) => {
    setStudentsList((prev) =>
      prev.map((st) => {
        if (st.id === studentId) {
          const nextStatus = st.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          return { ...st, status: nextStatus };
        }
        return st;
      })
    );
  };

  const handleRemoveStudent = (studentId: string, studentName: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa sinh viên ${studentName} khỏi lớp học phần này không?`)) {
      setStudentsList((prev) => prev.filter((st) => st.id !== studentId));
      if (currentCourse) {
        setCourses((prev) =>
          prev.map((c) => (c.id === currentCourse.id ? { ...c, enrolledStudents: Math.max(0, c.enrolledStudents - 1) } : c))
        );
      }
      alert(`Đã xóa sinh viên khỏi lớp học phần.`);
    }
  };

  const handleSaveGrade = (submissionId: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? { ...s, grade: tempGrade, feedback: tempFeedback, status: 'GRADED' }
          : s
      )
    );
    setEditingSubId(null);
    alert('Đã lưu điểm số và lời nhận xét của giảng viên!');
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent || !currentCourse) return;

    const newAnn: TeacherAnnouncement = {
      id: `ann-${Date.now()}`,
      courseId: currentCourse.id,
      courseCode: currentCourse.courseCode,
      title: annPinned ? `📌 ${annTitle}` : annTitle,
      content: annContent,
      isPinned: annPinned,
      createdAt: new Date().toLocaleString()
    };

    setAnnouncements(annPinned ? [newAnn, ...announcements] : [...announcements, newAnn]);
    setAnnTitle('');
    setAnnContent('');
    setAnnPinned(false);
    alert(`Đã đăng thông báo cho môn học ${currentCourse.courseCode}!`);
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
                    </div>

                    <button
                      onClick={() => handleOpenCourse(c.id, 'lessons')}
                      className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl transition-all border border-blue-200 flex items-center gap-1"
                    >
                      <span>Vào lớp</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
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
                    <button
                      onClick={handleBackToCoursesList}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-all"
                      title="Quay lại danh sách khóa học"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Tất cả khóa học</span>
                    </button>

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
                    </div>
                  </div>

                  {/* Fast Course Switcher */}
                  <div className="flex items-center gap-2">
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
                      onClick={() => setShowAddLessonModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Thêm bài giảng mới</span>
                    </button>
                  </div>

                  <div className="space-y-3 w-full">
                    {courseLessons.map((les) => (
                      <div
                        key={les.id}
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center text-sm border border-blue-200">
                            {les.lessonNumber}
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">{les.title}</h5>
                            <span className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <Clock className="w-3.5 h-3.5" /> Thời lượng dự kiến: {les.durationMinutes} phút
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              les.isUnlocked
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {les.isUnlocked ? 'Đang mở cho sinh viên' : 'Đang khóa (Tuần tự)'}
                          </span>
                          <button
                            onClick={() => alert(`Chỉnh sửa bài giảng: ${les.title}`)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                          >
                            Sửa
                          </button>
                        </div>
                      </div>
                    ))}
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

                          <div className="p-4 rounded-xl bg-slate-50 text-xs space-y-2 border border-slate-200">
                            <span className="font-bold text-slate-700">Ghi chú / Nội dung bài nộp của Sinh viên:</span>
                            <p className="text-slate-600 leading-relaxed italic">"{sub.submissionText}"</p>
                            {sub.fileUrl && (
                              <a
                                href={sub.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:underline pt-1"
                              >
                                <FileText className="w-4 h-4" />
                                <span>Tải file bài nộp: {sub.fileUrl}</span>
                              </a>
                            )}
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
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                Thêm Bài giảng vào {currentCourse?.courseCode}
              </h3>
              <button
                onClick={() => setShowAddLessonModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên bài giảng:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bài 5: Xử lý Exception & Global Middleware..."
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thời lượng học (phút):</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={newLessonDuration}
                  onChange={(e) => setNewLessonDuration(parseInt(e.target.value) || 45)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
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
                  Thêm bài giảng
                </button>
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
    </div>
  );
};
