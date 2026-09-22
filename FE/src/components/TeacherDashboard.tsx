import React, { useState } from 'react';
import { BookOpen, PlusCircle, CheckSquare, Award, Bell, Users, FileText, Download, Edit3, Pin, CheckCircle2, Clock, Sparkles, AlertCircle, Save, Trash2 } from 'lucide-react';
import { AuthUser } from '../types';

interface Props {
  user: AuthUser;
}

interface StudentGradeRow {
  studentId: string;
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

interface TeacherSubmission {
  id: string;
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

interface TeacherCourse {
  id: string;
  courseCode: string;
  title: string;
  enrolledStudents: number;
  lessonsCount: number;
  weightAttendance: number;
  weightAssignments: number;
  weightFinalExam: number;
}

export const TeacherDashboard: React.FC<Props> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'grading' | 'gradebook' | 'announcements'>('overview');

  // State for Course creation modal
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');

  // State for Announcement posting
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPinned, setAnnPinned] = useState(false);
  const [announcementsList, setAnnouncementsList] = useState([
    {
      id: 'ann-1',
      title: '📌 THÔNG BÁO: Lịch nộp Bài tập lớn học kỳ I',
      content: 'Các em sinh viên chú ý hoàn thành các bài tập đúng hạn để tính điểm chuyên cần.',
      isPinned: true,
      createdAt: '2026-09-22 14:00'
    }
  ]);

  // Mock Teacher Courses
  const [courses, setCourses] = useState<TeacherCourse[]>([
    {
      id: 'c1',
      courseCode: 'INT3306',
      title: 'Lập trình Web C# .NET 8 & ReactJS',
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
      enrolledStudents: 38,
      lessonsCount: 5,
      weightAttendance: 10,
      weightAssignments: 30,
      weightFinalExam: 60
    }
  ]);

  // Mock Student Submissions for Grading
  const [submissions, setSubmissions] = useState<TeacherSubmission[]>([
    {
      id: 'sub-1',
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
      assignmentTitle: 'Bài tập 2: Thiết kế Database Schema EF Core',
      studentName: 'Nguyễn Văn C',
      studentCode: 'SV2024002',
      submittedAt: '2026-09-22 15:45',
      fileUrl: 'https://example.com/sub/db-schema.zip',
      submissionText: 'Dạ thầy kiểm tra giúp em file DbContext Fluent API.',
      status: 'SUBMITTED'
    }
  ]);

  // Mock Gradebook rows
  const [gradebookRows, setGradebookRows] = useState<StudentGradeRow[]>([
    {
      studentId: 's1',
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
      studentCode: 'SV2024003',
      fullName: 'Lê Hoàng D',
      className: 'CNTT-K65',
      attendanceScore: 8.5,
      assignmentScore: 7.5,
      examScore: 6.5,
      totalScore: 7.00,
      letterGrade: 'B',
      progressPercentage: 25.0
    }
  ]);

  // State for active grading form item
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [tempGrade, setTempGrade] = useState<number>(0);
  const [tempFeedback, setTempFeedback] = useState<string>('');

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseTitle) return;

    const newCourse: TeacherCourse = {
      id: `c-${Date.now()}`,
      courseCode: newCourseCode.toUpperCase(),
      title: newCourseTitle,
      enrolledStudents: 0,
      lessonsCount: 0,
      weightAttendance: 10,
      weightAssignments: 30,
      weightFinalExam: 60
    };

    setCourses([...courses, newCourse]);
    setShowAddCourseModal(false);
    setNewCourseCode('');
    setNewCourseTitle('');
    setNewCourseDesc('');
    alert('Tạo khóa học mới thành công!');
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
    alert('Đã lưu điểm và lời nhận xét!');
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    const newAnn = {
      id: `ann-${Date.now()}`,
      title: annPinned ? `📌 ${annTitle}` : annTitle,
      content: annContent,
      isPinned: annPinned,
      createdAt: new Date().toLocaleString()
    };

    const updated = annPinned ? [newAnn, ...announcementsList] : [...announcementsList, newAnn];
    setAnnouncementsList(updated);
    setAnnTitle('');
    setAnnContent('');
    setAnnPinned(false);
    alert('Đã đăng thông báo lên bảng tin lớp học!');
  };

  const handleExportExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["MSSV,Họ tên,Lớp,Chuyên cần (10%),Bài tập (30%),Thi (60%),Điểm tổng kết,Xếp loại"].join(",") + "\n"
      + gradebookRows.map(r => `${r.studentCode},${r.fullName},${r.className},${r.attendanceScore},${r.assignmentScore},${r.examScore},${r.totalScore},${r.letterGrade}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Bang_Diem_INT3306.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 w-full text-slate-900">
      {/* Softer, Gentle Teacher Portal Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-50/90 via-blue-50/50 to-slate-50 rounded-3xl p-8 text-slate-800 shadow-2xs border border-indigo-100/80 relative overflow-hidden w-full">
        <div className="relative z-10 max-w-3xl">
          <span className="bg-indigo-100/80 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-3 border border-indigo-200/60">
            👨‍🏫 Cổng Thông tin Giảng viên (Teacher Portal)
          </span>
          <h2 className="text-3xl font-extrabold leading-tight text-slate-900">
            Xin chào, {user.fullName}!
          </h2>
          <p className="text-slate-600 text-sm mt-2 leading-relaxed">
            {user.teacherCode ? `Mã cán bộ: ${user.teacherCode} • ` : ''} Quản lý bài giảng, chấm điểm bài tập về nhà, cập nhật sổ điểm và đăng thông báo cho lớp học.
          </p>
        </div>
      </div>

      {/* Teacher Navigation Tabs - Pure White */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Tổng quan giảng dạy</span>
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'courses'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Quản lý Khóa học ({courses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('grading')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'grading'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Chấm bài tập ({submissions.filter((s) => s.status === 'SUBMITTED').length} chờ chấm)</span>
        </button>
        <button
          onClick={() => setActiveTab('gradebook')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'gradebook'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Sổ điểm & Tiến độ Lớp</span>
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'announcements'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Thông báo Lớp học</span>
        </button>
      </div>

      {/* Tab 1: Overview Metric Cards */}
      {activeTab === 'overview' && (
        <div className="space-y-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Khóa học phụ trách</span>
                <h3 className="font-extrabold text-2xl text-slate-900 mt-0.5">{courses.length} môn</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Tổng số Sinh viên</span>
                <h3 className="font-extrabold text-2xl text-slate-900 mt-0.5">83 học viên</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Bài tập chờ chấm</span>
                <h3 className="font-extrabold text-2xl text-amber-600 mt-0.5">
                  {submissions.filter((s) => s.status === 'SUBMITTED').length} bài
                </h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Tiến độ lớp trung bình</span>
                <h3 className="font-extrabold text-2xl text-emerald-600 mt-0.5">68%</h3>
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
                <button
                  onClick={() => setActiveTab('grading')}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Xem tất cả ({submissions.length})
                </button>
              </div>

              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">{sub.studentName}</span>
                        <span className="text-xs text-slate-500">({sub.studentCode})</span>
                      </div>
                      <p className="text-xs text-blue-600 font-semibold">{sub.assignmentTitle}</p>
                    </div>

                    <div>
                      {sub.status === 'GRADED' ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                          Đã chấm: {sub.grade}đ
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveTab('grading')}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs"
                        >
                          Chấm bài
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
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs"
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
                      onClick={() => setActiveTab('courses')}
                      className="px-3 py-1.5 bg-slate-100 text-slate-800 hover:bg-slate-200 font-semibold text-xs rounded-xl transition-all border border-slate-200"
                    >
                      Quản lý
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Courses & Create Course */}
      {activeTab === 'courses' && (
        <div className="space-y-6 w-full">
          <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Quản lý Khóa học & Bài giảng</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tạo lớp học phần mới, cấu trúc bài giảng và bộ câu hỏi trắc nghiệm</p>
            </div>
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Khóa học mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {courses.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 uppercase">
                      {c.courseCode}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-lg mt-2">{c.title}</h4>
                  </div>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    Đang mở
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1 text-slate-600 border border-slate-200">
                  <div className="flex justify-between">
                    <span>Trọng số Chuyên cần:</span>
                    <strong className="text-slate-900">{c.weightAttendance}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Trọng số Bài tập về nhà:</span>
                    <strong className="text-slate-900">{c.weightAssignments}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Trọng số Thi cuối kỳ:</span>
                    <strong className="text-slate-900">{c.weightFinalExam}%</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => alert(`Đang mở giao diện chỉnh sửa bài giảng cho khóa ${c.courseCode}`)}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Thêm bài giảng</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('gradebook')}
                    className="py-2 px-3 bg-slate-100 text-slate-800 hover:bg-slate-200 font-semibold text-xs rounded-xl transition-all border border-slate-200"
                  >
                    Xem sổ điểm
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Homework Submissions & Grading Form */}
      {activeTab === 'grading' && (
        <div className="space-y-6 w-full">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="font-extrabold text-slate-900 text-lg">Chấm điểm Bài tập về nhà</h3>
            <p className="text-xs text-slate-500 mt-0.5">Xem file bài nộp của sinh viên, chấm điểm và để lại lời nhận xét</p>
          </div>

          <div className="space-y-4 w-full">
            {submissions.map((sub) => (
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

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    sub.status === 'GRADED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {sub.status === 'GRADED' ? `Đã chấm: ${sub.grade} / 10 điểm` : 'Chưa chấm điểm'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 text-xs space-y-2 border border-slate-200">
                  <span className="font-bold text-slate-700">Nội dung bài nộp / Ghi chú của Sinh viên:</span>
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
                          placeholder="Ví dụ: Bài làm tốt, thuật toán tối ưu!"
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
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu điểm số</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs pt-2">
                    {sub.feedback && (
                      <span className="text-slate-600">
                        Lời phê: <strong className="text-slate-800 italic">"{sub.feedback}"</strong>
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setEditingSubId(sub.id);
                        setTempGrade(sub.grade || 8.0);
                        setTempFeedback(sub.feedback || '');
                      }}
                      className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{sub.status === 'GRADED' ? 'Sửa điểm số' : 'Nhập điểm & Nhận xét'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Gradebook & Export Excel */}
      {activeTab === 'gradebook' && (
        <div className="space-y-6 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Sổ điểm Lớp học & Điểm Tổng kết</h3>
              <p className="text-xs text-slate-500 mt-0.5">Công thức: Total = (Chuyên cần 10%) + (Bài tập 30%) + (Thi 60%)</p>
            </div>

            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Xuất sổ điểm ra Excel (.CSV)</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 font-extrabold">
                    <th className="p-4">MSSV</th>
                    <th className="p-4">Họ và tên Sinh viên</th>
                    <th className="p-4">Lớp</th>
                    <th className="p-4 text-center">Chuyên cần (10%)</th>
                    <th className="p-4 text-center">Bài tập (30%)</th>
                    <th className="p-4 text-center">Thi cuối kỳ (60%)</th>
                    <th className="p-4 text-center">Điểm Tổng kết</th>
                    <th className="p-4 text-center">Xếp loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {gradebookRows.map((row) => (
                    <tr key={row.studentId} className="hover:bg-slate-50/80">
                      <td className="p-4 font-mono font-bold text-blue-600">{row.studentCode}</td>
                      <td className="p-4 font-semibold text-slate-900">{row.fullName}</td>
                      <td className="p-4 text-slate-500">{row.className}</td>
                      <td className="p-4 text-center font-semibold">{row.attendanceScore}</td>
                      <td className="p-4 text-center font-semibold">{row.assignmentScore}</td>
                      <td className="p-4 text-center font-semibold">{row.examScore}</td>
                      <td className="p-4 text-center font-extrabold text-blue-600">{row.totalScore}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                          row.letterGrade === 'A'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
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

      {/* Tab 5: Class Announcements Management */}
      {activeTab === 'announcements' && (
        <div className="space-y-6 w-full">
          {/* Post Announcement Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Đăng Thông báo mới cho Lớp học
            </h3>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề thông báo:
                </label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Ví dụ: Lịch nộp Bài tập lớn hoặc Thông báo họp lớp..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung chi tiết:
                </label>
                <textarea
                  rows={3}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Nhập chi tiết nội dung thông báo cho sinh viên..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-amber-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={annPinned}
                    onChange={(e) => setAnnPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>📌 Ghim thông báo lên đầu bảng tin</span>
                </label>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Bell className="w-4 h-4" />
                  <span>Đăng thông báo ngay</span>
                </button>
              </div>
            </form>
          </div>

          {/* Announcements Posted List */}
          <div className="space-y-4 w-full">
            <h4 className="font-bold text-slate-900 text-sm">Danh sách thông báo đã đăng:</h4>
            {announcementsList.map((ann) => (
              <div
                key={ann.id}
                className={`p-5 rounded-2xl border shadow-2xs space-y-2 ${
                  ann.isPinned
                    ? 'bg-amber-50/80 border-amber-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-base">{ann.title}</h4>
                  <span className="text-xs text-slate-400">{ann.createdAt}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Course */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl p-6 text-slate-900 space-y-5">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              Tạo Khóa học mới
            </h3>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã khóa học (Course Code):</label>
                <input
                  type="text"
                  placeholder="Ví dụ: CS101, INT3306"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên khóa học:</label>
                <input
                  type="text"
                  placeholder="Nhập tên đầy đủ của môn học"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả ngắn:</label>
                <textarea
                  rows={2}
                  placeholder="Nội dung tổng quan môn học"
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Tạo khóa học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
