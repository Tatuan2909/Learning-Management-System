import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  BookOpen,
  Server,
  Activity,
  UserPlus,
  Lock,
  Unlock,
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  Database,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Calendar,
  Layers,
  HardDrive,
  FileText,
  KeyRound
} from 'lucide-react';
import { AuthUser } from '../types';

interface Props {
  user: AuthUser;
}

interface ManagedUser {
  id: string;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  code: string;
  departmentOrClass: string;
  status: 'ACTIVE' | 'LOCKED';
  createdAt: string;
}

interface AdminCourse {
  id: string;
  courseCode: string;
  title: string;
  department: string;
  teacherName: string;
  studentsCount: number;
  status: 'ACTIVE' | 'ARCHIVED';
}

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export const AdminDashboard: React.FC<Props> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'logs' | 'settings'>('overview');

  // Search & Filter for Users
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'TEACHER' | 'ADMIN'>('ALL');

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');
  const [newUserCode, setNewUserCode] = useState('');
  const [newUserClass, setNewUserClass] = useState('');

  // Add Course Modal State
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDept, setNewCourseDept] = useState('Khoa Công nghệ Thông tin');
  const [newCourseTeacher, setNewCourseTeacher] = useState('TS. Nguyễn Văn A');

  // Settings State
  const [academicYear, setAcademicYear] = useState('2024 - 2025');
  const [semester, setSemester] = useState('Học kỳ I');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Mock Managed Users List
  const [usersList, setUsersList] = useState<ManagedUser[]>([
    {
      id: 'u-1',
      fullName: 'Trần Thị B',
      email: 'student@lms.edu.vn',
      role: 'STUDENT',
      code: 'SV2024001',
      departmentOrClass: 'CNTT-K65',
      status: 'ACTIVE',
      createdAt: '2024-08-15'
    },
    {
      id: 'u-2',
      fullName: 'TS. Nguyễn Văn A',
      email: 'teacher@lms.edu.vn',
      role: 'TEACHER',
      code: 'GV001',
      departmentOrClass: 'Khoa Công nghệ Thông tin',
      status: 'ACTIVE',
      createdAt: '2023-01-10'
    },
    {
      id: 'u-3',
      fullName: 'Hệ thống Quản trị viên',
      email: 'admin@lms.edu.vn',
      role: 'ADMIN',
      code: 'ADM001',
      departmentOrClass: 'Phòng Quản trị Mạng',
      status: 'ACTIVE',
      createdAt: '2022-05-01'
    },
    {
      id: 'u-4',
      fullName: 'Nguyễn Văn C',
      email: 'student2@lms.edu.vn',
      role: 'STUDENT',
      code: 'SV2024002',
      departmentOrClass: 'CNTT-K65',
      status: 'ACTIVE',
      createdAt: '2024-08-16'
    },
    {
      id: 'u-5',
      fullName: 'PGS. TS. Lê Văn C',
      email: 'teacher2@lms.edu.vn',
      role: 'TEACHER',
      code: 'GV002',
      departmentOrClass: 'Khoa Khoa học Máy tính',
      status: 'LOCKED',
      createdAt: '2023-06-20'
    }
  ]);

  // Mock Admin Courses
  const [coursesList, setCoursesList] = useState<AdminCourse[]>([
    {
      id: 'c-1',
      courseCode: 'INT3306',
      title: 'Lập trình Web C# .NET 8 & ReactJS',
      department: 'Khoa Công nghệ Thông tin',
      teacherName: 'TS. Nguyễn Văn A',
      studentsCount: 45,
      status: 'ACTIVE'
    },
    {
      id: 'c-2',
      courseCode: 'CS101',
      title: 'Nhập môn Khoa học Máy tính & Thuật toán',
      department: 'Khoa Khoa học Máy tính',
      teacherName: 'PGS. TS. Lê Văn C',
      studentsCount: 60,
      status: 'ACTIVE'
    },
    {
      id: 'c-3',
      courseCode: 'DB201',
      title: 'Cơ sở Dữ liệu Quan hệ & PostgreSQL Advanced',
      department: 'Khoa Hệ thống Thông tin',
      teacherName: 'ThS. Phạm Thị D',
      studentsCount: 38,
      status: 'ACTIVE'
    },
    {
      id: 'c-4',
      courseCode: 'SE302',
      title: 'Kiến trúc Phần mềm & Microservices',
      department: 'Khoa Công nghệ Phần mềm',
      teacherName: 'TS. Nguyễn Văn A',
      studentsCount: 40,
      status: 'ACTIVE'
    }
  ]);

  // Mock Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      timestamp: '2026-09-22 23:55:12',
      actor: 'admin@lms.edu.vn',
      role: 'ADMIN',
      action: 'LOGIN_SUCCESS',
      details: 'Đăng nhập thành công từ IP quản trị viên',
      ipAddress: '192.168.1.10',
      severity: 'INFO'
    },
    {
      id: 'log-2',
      timestamp: '2026-09-22 22:30:45',
      actor: 'teacher@lms.edu.vn',
      role: 'TEACHER',
      action: 'GRADE_SUBMITTED',
      details: 'Chấm điểm Bài tập 1 cho sinh viên SV2024001: 9.5đ',
      ipAddress: '192.168.1.25',
      severity: 'INFO'
    },
    {
      id: 'log-3',
      timestamp: '2026-09-22 21:15:00',
      actor: 'student@lms.edu.vn',
      role: 'STUDENT',
      action: 'QUIZ_SUBMITTED',
      details: 'Hoàn thành bài trắc nghiệm bài 1 với điểm số 80%',
      ipAddress: '192.168.1.104',
      severity: 'INFO'
    },
    {
      id: 'log-4',
      timestamp: '2026-09-22 18:40:22',
      actor: 'System',
      role: 'SYSTEM',
      action: 'TOKEN_REFRESHED',
      details: 'Cấp mới JWT token qua Refresh Token rotation',
      ipAddress: '127.0.0.1',
      severity: 'INFO'
    },
    {
      id: 'log-5',
      timestamp: '2026-09-22 16:10:05',
      actor: 'unknown_client',
      role: 'GUEST',
      action: 'LOGIN_FAILED',
      details: 'Đăng nhập thất bại quá 3 lần với tài khoản guest@lms.edu.vn',
      ipAddress: '118.69.12.8',
      severity: 'WARNING'
    }
  ]);

  // Handle Add User
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserCode) {
      alert('Vui lòng điền đầy đủ Họ tên, Email và Mã định danh!');
      return;
    }

    const newUser: ManagedUser = {
      id: `u-${Date.now()}`,
      fullName: newUserName,
      email: newUserEmail,
      role: newUserRole,
      code: newUserCode,
      departmentOrClass: newUserClass || (newUserRole === 'STUDENT' ? 'CNTT-K65' : 'Khoa CNTT'),
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsersList([newUser, ...usersList]);
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserCode('');
    setNewUserClass('');

    // Append to audit log
    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        actor: user.email,
        role: 'ADMIN',
        action: 'USER_CREATED',
        details: `Tạo tài khoản mới: ${newUser.fullName} (${newUser.email}) - Vai trò: ${newUser.role}`,
        ipAddress: '127.0.0.1',
        severity: 'INFO'
      },
      ...auditLogs
    ]);

    alert('Tạo người dùng mới thành công!');
  };

  // Toggle User Lock
  const toggleUserLock = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  // Reset User Password Simulator
  const handleResetPassword = (targetUser: ManagedUser) => {
    alert(`Đã gửi liên kết đặt lại mật khẩu tạm thời đến email: ${targetUser.email}`);
  };

  // Handle Add Course
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseTitle) return;

    const newCourse: AdminCourse = {
      id: `c-${Date.now()}`,
      courseCode: newCourseCode.toUpperCase(),
      title: newCourseTitle,
      department: newCourseDept,
      teacherName: newCourseTeacher,
      studentsCount: 0,
      status: 'ACTIVE'
    };

    setCoursesList([newCourse, ...coursesList]);
    setShowAddCourseModal(false);
    setNewCourseCode('');
    setNewCourseTitle('');
    alert('Thêm khóa học mới thành công!');
  };

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.code.toLowerCase().includes(userSearchTerm.toLowerCase());

    if (roleFilter === 'ALL') return matchesSearch;
    return matchesSearch && u.role === roleFilter;
  });

  return (
    <div className="space-y-8 w-full text-slate-800">
      {/* Soothing, Gentle Admin Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-50/90 via-indigo-50/40 to-slate-50 rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xs border border-purple-100/80 relative overflow-hidden w-full">
        <div className="relative z-10 max-w-3xl">
          <span className="bg-purple-100 text-purple-700 text-[11px] sm:text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-3 border border-purple-200">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            Cổng Quản trị Hệ thống (Admin Portal)
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-slate-900">
            Xin chào, Quản trị viên!
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
            Giám sát toàn bộ người dùng, quản lý học phần, nhật ký an ninh bảo mật và cấu hình hệ thống máy chủ LMS.
          </p>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Tổng quan Hệ thống</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Quản lý Người dùng ({usersList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'courses'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Quản lý Khóa học ({coursesList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Nhật ký An ninh (Audit Logs)</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Cấu hình Học kỳ & Máy chủ</span>
        </button>
      </div>

      {/* Tab 1: Overview Metrics & Health */}
      {activeTab === 'overview' && (
        <div className="space-y-8 w-full">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Tổng người dùng</span>
                <h3 className="font-extrabold text-2xl text-slate-900 mt-0.5">{usersList.length} tài khoản</h3>
                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                  {usersList.filter((u) => u.role === 'STUDENT').length} SV • {usersList.filter((u) => u.role === 'TEACHER').length} GV
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Khóa học toàn trường</span>
                <h3 className="font-extrabold text-2xl text-slate-900 mt-0.5">{coursesList.length} môn học</h3>
                <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">Đang hoạt động 100%</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Máy chủ Backend API</span>
                <h3 className="font-extrabold text-2xl text-emerald-600 mt-0.5">Online</h3>
                <span className="text-[11px] text-slate-500 mt-0.5 block">.NET 8 & PostgreSQL</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Lưu trữ Hệ thống</span>
                <h3 className="font-extrabold text-2xl text-slate-900 mt-0.5">42.5 GB</h3>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Trên tổng số 100 GB</span>
              </div>
            </div>
          </div>

          {/* Quick System Oversight Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {/* Server Status Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  Trạng thái Cơ sở Hạ tầng & Dịch vụ
                </h3>
                <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                  Hoạt động bình thường
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-slate-800">.NET 8 Web API Core</span>
                  </div>
                  <span className="text-slate-500 font-mono">Port 5000 / HTTPS • Uptime 99.98%</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-slate-800">PostgreSQL Database Engine</span>
                  </div>
                  <span className="text-slate-500 font-mono">15 Tables • Connected Pool: 12/50</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-slate-800">JWT Token Security Service</span>
                  </div>
                  <span className="text-slate-500 font-mono">BCrypt Hash • Auto Refresh Queue Active</span>
                </div>
              </div>
            </div>

            {/* Recent Audit Activities */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Hoạt động An ninh Hệ thống mới nhất
                </h3>
                <button
                  onClick={() => setActiveTab('logs')}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Xem tất cả nhật ký
                </button>
              </div>

              <div className="space-y-2.5">
                {auditLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.action}</span>
                        <span className="text-slate-400 font-mono text-[11px]">• {log.actor}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] truncate mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{log.timestamp.split(' ')[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User Management Table */}
      {activeTab === 'users' && (
        <div className="space-y-6 w-full">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Quản lý Tài khoản & Phân quyền</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tạo tài khoản mới, phân quyền giảng viên/sinh viên và quản lý khóa tài khoản</p>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-2xs transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Người dùng mới</span>
            </button>
          </div>

          {/* Search & Role Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Tìm theo Tên, Email hoặc MSSV/Mã GV..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
              <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Vai trò:
              </span>
              <button
                onClick={() => setRoleFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  roleFilter === 'ALL' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({usersList.length})
              </button>
              <button
                onClick={() => setRoleFilter('STUDENT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  roleFilter === 'STUDENT' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Sinh viên ({usersList.filter((u) => u.role === 'STUDENT').length})
              </button>
              <button
                onClick={() => setRoleFilter('TEACHER')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  roleFilter === 'TEACHER' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Giảng viên ({usersList.filter((u) => u.role === 'TEACHER').length})
              </button>
              <button
                onClick={() => setRoleFilter('ADMIN')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  roleFilter === 'ADMIN' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Admin ({usersList.filter((u) => u.role === 'ADMIN').length})
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-extrabold uppercase tracking-wider">
                    <th className="p-4">Mã số / Code</th>
                    <th className="p-4">Họ và tên</th>
                    <th className="p-4">Email liên hệ</th>
                    <th className="p-4 text-center">Vai trò</th>
                    <th className="p-4">Đơn vị / Lớp</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-mono font-bold text-blue-700">{u.code}</td>
                      <td className="p-4 font-bold text-slate-900">{u.fullName}</td>
                      <td className="p-4 text-slate-500">{u.email}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : u.role === 'TEACHER'
                              ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{u.departmentOrClass}</td>
                      <td className="p-4 text-center">
                        {u.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            <Lock className="w-3 h-3" /> Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => toggleUserLock(u.id)}
                            title={u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-all ${
                              u.status === 'ACTIVE'
                                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleResetPassword(u)}
                            title="Đặt lại mật khẩu"
                            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Courses Oversight */}
      {activeTab === 'courses' && (
        <div className="space-y-6 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Quản lý Toàn bộ Khóa học & Lớp học</h3>
              <p className="text-xs text-slate-500 mt-0.5">Kiểm soát danh mục môn học toàn trường, phân công giảng viên và quản lý trạng thái mở lớp</p>
            </div>

            <button
              onClick={() => setShowAddCourseModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-2xs transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Mở Lớp Khóa học mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {coursesList.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 uppercase">
                      {c.courseCode}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base mt-2">{c.title}</h4>
                    <span className="text-xs text-slate-500 block mt-0.5">{c.department}</span>
                  </div>

                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    {c.status === 'ACTIVE' ? 'Đang hoạt động' : 'Lưu trữ'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 text-xs space-y-1.5 border border-slate-200 text-slate-600">
                  <div className="flex justify-between">
                    <span>Giảng viên phụ trách:</span>
                    <strong className="text-slate-900">{c.teacherName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Số lượng sinh viên:</span>
                    <strong className="text-blue-700 font-bold">{c.studentsCount} học viên</strong>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => alert(`Chỉnh sửa thông tin khóa học: ${c.courseCode}`)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => {
                      setCoursesList((prev) =>
                        prev.map((item) => (item.id === c.id ? { ...item, status: item.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE' } : item))
                      );
                    }}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold"
                  >
                    {c.status === 'ACTIVE' ? 'Lưu trữ khóa học' : 'Kích hoạt lại'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Security & Audit Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-6 w-full">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Nhật ký An ninh & Truy vết Hoạt động (Audit Trail)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Ghi lại toàn bộ hành động đăng nhập, sửa đổi phân quyền, chấm điểm và sự kiện hệ thống</p>
            </div>
            <button
              onClick={() => alert('Đã làm mới dữ liệu nhật ký hệ thống!')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm mới Logs</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-extrabold uppercase tracking-wider">
                    <th className="p-4">Thời gian</th>
                    <th className="p-4">Tài khoản thực hiện</th>
                    <th className="p-4">Hành động</th>
                    <th className="p-4">Chi tiết thao tác</th>
                    <th className="p-4">Địa chỉ IP</th>
                    <th className="p-4 text-center">Mức độ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-4 font-bold text-slate-900">{log.actor}</td>
                      <td className="p-4 font-bold text-blue-700">{log.action}</td>
                      <td className="p-4 text-slate-600 font-sans">{log.details}</td>
                      <td className="p-4 text-slate-500">{log.ipAddress}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black font-sans uppercase ${
                            log.severity === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : log.severity === 'WARNING'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {log.severity}
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

      {/* Tab 5: System Settings & Academic Calendar */}
      {activeTab === 'settings' && (
        <div className="space-y-6 w-full max-w-4xl">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Cấu hình Niên khóa & Học kỳ Hiện tại
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Thiết lập học kỳ áp dụng cho việc mở đăng ký môn và tính điểm trung bình</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Năm học hiện hành:</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Học kỳ hiện tại:</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Học kỳ I">Học kỳ I</option>
                  <option value="Học kỳ II">Học kỳ II</option>
                  <option value="Học kỳ Hè">Học kỳ Hè (Phụ)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Chế độ Bảo trì Hệ thống (Maintenance Mode)</h4>
                <p className="text-xs text-slate-500">Khi bật, sinh viên và giảng viên sẽ không thể đăng nhập trong quá trình nâng cấp cơ sở dữ liệu.</p>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  maintenanceMode ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {maintenanceMode ? 'Đang Bật Bảo trì' : 'Đang Tắt'}
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Sao lưu Toàn bộ Cơ sở Dữ liệu (.SQL Dump)</h4>
                <p className="text-xs text-slate-500">Tạo bản sao lưu lưu trữ an toàn cấu trúc bảng PostgreSQL và lịch sử điểm số.</p>
              </div>
              <button
                type="button"
                onClick={() => alert('Đang thực thi lệnh pg_dump xuất file sao lưu lms_backup.sql...')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs"
              >
                <Database className="w-4 h-4" />
                <span>Sao lưu ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl p-6 text-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Thêm Người dùng mới
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hoàng Minh T"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email:</label>
                <input
                  type="email"
                  placeholder="name@lms.edu.vn"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vai trò:</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="STUDENT">Sinh viên</option>
                    <option value="TEACHER">Giảng viên</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã định danh:</label>
                  <input
                    type="text"
                    placeholder="MSSV hoặc Mã GV"
                    value={newUserCode}
                    onChange={(e) => setNewUserCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lớp sinh hoạt hoặc Khoa:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: CNTT-K65 hoặc Khoa CNTT"
                  value={newUserClass}
                  onChange={(e) => setNewUserClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl p-6 text-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                Mở Lớp Khóa học mới
              </h3>
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã khóa học (Course Code):</label>
                <input
                  type="text"
                  placeholder="Ví dụ: CS301, AI101"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên khóa học:</label>
                <input
                  type="text"
                  placeholder="Nhập tên môn học"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khoa phụ trách:</label>
                <input
                  type="text"
                  value={newCourseDept}
                  onChange={(e) => setNewCourseDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giảng viên chỉ định:</label>
                <input
                  type="text"
                  value={newCourseTeacher}
                  onChange={(e) => setNewCourseTeacher(e.target.value)}
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
                  Mở lớp môn học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
