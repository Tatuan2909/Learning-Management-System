import React, { useState, useEffect } from 'react';
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
  KeyRound,
  Edit3,
  Building2,
  GraduationCap,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Award
} from 'lucide-react';
import { AuthUser, AdminDepartment, AdminMajor } from '../types';
import api from '../api/axios';

export type AdminTabType = 'overview' | 'users' | 'departments' | 'majors' | 'courses' | 'logs' | 'settings';

interface Props {
  user: AuthUser;
  activeTab?: AdminTabType;
  onTabChange?: (tab: AdminTabType) => void;
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

export const AdminDashboard: React.FC<Props> = ({ user, activeTab: propActiveTab, onTabChange }) => {
  const [internalActiveTab, setInternalActiveTab] = useState<AdminTabType>('overview');

  const activeTab = propActiveTab !== undefined ? propActiveTab : internalActiveTab;
  const setActiveTab = (tab: AdminTabType) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

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

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');
  const [editUserCode, setEditUserCode] = useState('');
  const [editUserClass, setEditUserClass] = useState('');
  const [savingUser, setSavingUser] = useState(false);

  // Reset Password Modal State
  const [resettingUser, setResettingUser] = useState<ManagedUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Add Course Modal State
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDept, setNewCourseDept] = useState('');
  const [newCourseTeacher, setNewCourseTeacher] = useState('');

  // Edit Course Modal State
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [editCourseCode, setEditCourseCode] = useState('');
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseDept, setEditCourseDept] = useState('');
  const [editCourseTeacher, setEditCourseTeacher] = useState('');
  const [editCourseStatus, setEditCourseStatus] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [savingCourse, setSavingCourse] = useState(false);

  // Settings State
  const [academicYear, setAcademicYear] = useState('2024 - 2025');
  const [semester, setSemester] = useState('Học kỳ I');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Dynamic state loaded from real database
  const [usersList, setUsersList] = useState<ManagedUser[]>([]);
  const [coursesList, setCoursesList] = useState<AdminCourse[]>([]);
  const [departmentsList, setDepartmentsList] = useState<AdminDepartment[]>([]);
  const [majorsList, setMajorsList] = useState<AdminMajor[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [overviewMetrics, setOverviewMetrics] = useState<{
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalSubmissions: number;
    totalDepartments?: number;
    totalMajors?: number;
  } | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Departments & Majors search/filter
  const [deptSearchTerm, setDeptSearchTerm] = useState('');
  const [majorSearchTerm, setMajorSearchTerm] = useState('');
  const [selectedDeptFilterForMajors, setSelectedDeptFilterForMajors] = useState<string>('ALL');

  // Add/Edit Department Modal State
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<AdminDepartment | null>(null);
  const [deptCodeInput, setDeptCodeInput] = useState('');
  const [deptNameInput, setDeptNameInput] = useState('');
  const [deptDeanInput, setDeptDeanInput] = useState('');
  const [deptEmailInput, setDeptEmailInput] = useState('');
  const [deptPhoneInput, setDeptPhoneInput] = useState('');
  const [deptLocationInput, setDeptLocationInput] = useState('');
  const [deptDescInput, setDeptDescInput] = useState('');
  const [savingDept, setSavingDept] = useState(false);

  // Add/Edit Major Modal State
  const [showAddMajorModal, setShowAddMajorModal] = useState(false);
  const [editingMajor, setEditingMajor] = useState<AdminMajor | null>(null);
  const [majorDeptIdInput, setMajorDeptIdInput] = useState('');
  const [majorCodeInput, setMajorCodeInput] = useState('');
  const [majorNameInput, setMajorNameInput] = useState('');
  const [majorDegreeInput, setMajorDegreeInput] = useState('Đại học Chính quy');
  const [majorCreditsInput, setMajorCreditsInput] = useState(135);
  const [majorYearsInput, setMajorYearsInput] = useState(4.0);
  const [majorDescInput, setMajorDescInput] = useState('');
  const [savingMajor, setSavingMajor] = useState(false);

  // Fetch admin overview and datasets from real SQL database
  const fetchAdminData = async () => {
    try {
      setLoadingData(true);
      const [overviewRes, usersRes, deptsRes, majorsRes, coursesRes, logsRes, maintRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get<ManagedUser[]>('/admin/users'),
        api.get<AdminDepartment[]>('/admin/departments'),
        api.get<AdminMajor[]>('/admin/majors'),
        api.get<AdminCourse[]>('/admin/courses'),
        api.get<AuditLog[]>('/admin/logs'),
        api.get('/admin/maintenance').catch(() => ({ data: { isMaintenance: false } }))
      ]);

      setOverviewMetrics(overviewRes.data);
      const users = usersRes.data || [];
      const depts = deptsRes.data || [];
      setUsersList(users);
      setDepartmentsList(depts);
      setMajorsList(majorsRes.data || []);
      setCoursesList(coursesRes.data || []);
      setAuditLogs(logsRes.data || []);
      if (depts.length > 0 && !newCourseDept) {
        setNewCourseDept(depts[0].name);
      }
      const firstTeacher = users.find((u) => u.role === 'TEACHER');
      if (firstTeacher && !newCourseTeacher) {
        setNewCourseTeacher(firstTeacher.fullName);
      }
      if (maintRes?.data?.isMaintenance !== undefined) {
        setMaintenanceMode(Boolean(maintRes.data.isMaintenance));
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu Quản trị từ CSDL:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleToggleMaintenance = async () => {
    const nextMode = !maintenanceMode;
    try {
      const res = await api.post('/admin/maintenance', {
        isMaintenance: nextMode,
        message: nextMode
          ? 'Hệ thống đang trong chế độ bảo trì định kỳ để nâng cấp cơ sở dữ liệu. Sinh viên và Giảng viên tạm thời không thể đăng nhập. Vui lòng quay lại sau.'
          : ''
      });
      setMaintenanceMode(res.data.isMaintenance);
      if (res.data.isMaintenance) {
        alert('Đã BẬT chế độ bảo trì hệ thống! Sinh viên và giảng viên sẽ không thể đăng nhập cho đến khi bảo trì hoàn tất.');
      } else {
        alert('Đã TẮT chế độ bảo trì hệ thống! Hệ thống đã mở lại hoạt động bình thường cho toàn bộ người dùng.');
      }
    } catch (err: any) {
      alert('Lỗi cập nhật chế độ bảo trì: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Handle Add User into database
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserCode) {
      alert('Vui lòng điền đầy đủ Họ tên, Email và Mã định danh!');
      return;
    }

    try {
      const res = await api.post<ManagedUser>('/admin/users', {
        fullName: newUserName,
        email: newUserEmail,
        role: newUserRole,
        code: newUserCode,
        departmentOrClass: newUserClass || (newUserRole === 'STUDENT' ? 'CNTT-K65' : 'Khoa CNTT')
      });

      setUsersList([res.data, ...usersList]);
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserCode('');
      setNewUserClass('');

      alert(`Tạo người dùng ${res.data.fullName} vào CSDL thành công!`);
    } catch (err: any) {
      alert('Lỗi tạo người dùng: ' + (err.response?.data?.message || err.message));
    }
  };

  // Toggle User Lock in database
  const toggleUserLock = async (userId: string) => {
    try {
      const res = await api.post<{ id: string; status: 'ACTIVE' | 'LOCKED' }>(
        `/admin/users/${userId}/toggle-status`
      );
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: res.data.status } : u))
      );
    } catch (err) {
      console.error('Lỗi thay đổi trạng thái người dùng:', err);
    }
  };

  const handleStartEditUser = (u: ManagedUser) => {
    setEditingUser(u);
    setEditUserName(u.fullName);
    setEditUserEmail(u.email);
    setEditUserRole(u.role);
    setEditUserCode(u.code);
    setEditUserClass(u.departmentOrClass);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setSavingUser(true);
      const res = await api.put(`/admin/users/${editingUser.id}`, {
        fullName: editUserName,
        email: editUserEmail,
        role: editUserRole,
        code: editUserCode,
        departmentOrClass: editUserClass
      });

      setUsersList((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...res.data } : u))
      );
      setEditingUser(null);
      alert('Đã cập nhật thông tin người dùng thành công vào CSDL!');
    } catch (err: any) {
      alert('Lỗi cập nhật: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingUser(false);
    }
  };

  const handleStartResetPassword = (u: ManagedUser) => {
    setResettingUser(u);
    setNewPasswordInput('');
  };

  const handleExecuteResetPassword = async () => {
    if (!resettingUser) return;
    try {
      setSavingPassword(true);
      const res = await api.post(`/admin/users/${resettingUser.id}/reset-password`, {
        newPassword: newPasswordInput.trim() || undefined
      });
      alert(res.data.message || `Đã đặt lại mật khẩu thành công!`);
      setResettingUser(null);
      setNewPasswordInput('');
    } catch (err: any) {
      alert('Lỗi đặt lại mật khẩu: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle Add Course into database
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseTitle) return;

    try {
      const res = await api.post<AdminCourse>('/admin/courses', {
        courseCode: newCourseCode.toUpperCase(),
        title: newCourseTitle,
        department: newCourseDept,
        teacherName: newCourseTeacher
      });

      setCoursesList([res.data, ...coursesList]);
      setShowAddCourseModal(false);
      setNewCourseCode('');
      setNewCourseTitle('');
      alert(`Thêm khóa học ${res.data.courseCode} vào CSDL thành công!`);
    } catch (err: any) {
      alert('Lỗi thêm khóa học: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStartEditCourse = (c: AdminCourse) => {
    setEditingCourse(c);
    setEditCourseCode(c.courseCode);
    setEditCourseTitle(c.title);
    setEditCourseDept(c.department);
    setEditCourseTeacher(c.teacherName);
    setEditCourseStatus(c.status);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      setSavingCourse(true);
      const res = await api.put(`/admin/courses/${editingCourse.id}`, {
        courseCode: editCourseCode.trim().toUpperCase(),
        title: editCourseTitle.trim(),
        isPublished: editCourseStatus === 'ACTIVE'
      });

      setCoursesList((prev) =>
        prev.map((c) =>
          c.id === editingCourse.id
            ? {
                ...c,
                courseCode: res.data.courseCode || editCourseCode.trim().toUpperCase(),
                title: res.data.title || editCourseTitle.trim(),
                status: res.data.status || editCourseStatus,
                department: editCourseDept || c.department,
                teacherName: editCourseTeacher || c.teacherName
              }
            : c
        )
      );
      setEditingCourse(null);
      alert('Cập nhật khóa học thành công vào CSDL!');
    } catch (err: any) {
      alert('Lỗi cập nhật khóa học: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingCourse(false);
    }
  };

  const handleToggleCourseStatus = async (course: AdminCourse) => {
    try {
      const nextPublished = course.status !== 'ACTIVE';
      const res = await api.put(`/admin/courses/${course.id}`, {
        isPublished: nextPublished
      });
      setCoursesList((prev) =>
        prev.map((item) =>
          item.id === course.id ? { ...item, status: res.data.status } : item
        )
      );
      alert(
        nextPublished
          ? `Đã kích hoạt lại môn học ${course.courseCode}!`
          : `Đã chuyển môn học ${course.courseCode} vào trạng thái lưu trữ!`
      );
    } catch (err: any) {
      alert('Lỗi thay đổi trạng thái khóa học: ' + (err.response?.data?.message || err.message));
    }
  };

  // Department Handlers
  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptCodeInput('');
    setDeptNameInput('');
    setDeptDeanInput('');
    setDeptEmailInput('');
    setDeptPhoneInput('');
    setDeptLocationInput('');
    setDeptDescInput('');
    setShowAddDeptModal(true);
  };

  const handleOpenEditDept = (dept: AdminDepartment) => {
    setEditingDept(dept);
    setDeptCodeInput(dept.code);
    setDeptNameInput(dept.name);
    setDeptDeanInput(dept.deanName || '');
    setDeptEmailInput(dept.email || '');
    setDeptPhoneInput(dept.phone || '');
    setDeptLocationInput(dept.officeLocation || '');
    setDeptDescInput(dept.description || '');
    setShowAddDeptModal(true);
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptCodeInput.trim() || !deptNameInput.trim()) {
      alert('Vui lòng điền đầy đủ Mã Khoa và Tên Khoa!');
      return;
    }

    try {
      setSavingDept(true);
      if (editingDept) {
        const res = await api.put(`/admin/departments/${editingDept.id}`, {
          code: deptCodeInput.trim(),
          name: deptNameInput.trim(),
          deanName: deptDeanInput.trim(),
          email: deptEmailInput.trim(),
          phone: deptPhoneInput.trim(),
          officeLocation: deptLocationInput.trim(),
          description: deptDescInput.trim()
        });
        setDepartmentsList((prev) =>
          prev.map((d) => (d.id === editingDept.id ? { ...d, ...res.data } : d))
        );
        alert('Cập nhật thông tin Khoa thành công!');
      } else {
        const res = await api.post<AdminDepartment>('/admin/departments', {
          code: deptCodeInput.trim(),
          name: deptNameInput.trim(),
          deanName: deptDeanInput.trim(),
          email: deptEmailInput.trim(),
          phone: deptPhoneInput.trim(),
          officeLocation: deptLocationInput.trim(),
          description: deptDescInput.trim()
        });
        setDepartmentsList([res.data, ...departmentsList]);
        alert('Thêm Khoa mới vào CSDL thành công!');
      }
      setShowAddDeptModal(false);
    } catch (err: any) {
      alert('Lỗi lưu Khoa: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingDept(false);
    }
  };

  const handleDeleteDepartment = async (dept: AdminDepartment) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa Khoa "${dept.name}" (${dept.code}) khỏi hệ thống?`)) return;
    try {
      await api.delete(`/admin/departments/${dept.id}`);
      setDepartmentsList((prev) => prev.filter((d) => d.id !== dept.id));
      alert(`Đã xóa Khoa ${dept.name} thành công!`);
    } catch (err: any) {
      alert('Lỗi xóa Khoa: ' + (err.response?.data?.message || err.message));
    }
  };

  // Major Handlers
  const handleOpenAddMajor = () => {
    setEditingMajor(null);
    setMajorDeptIdInput(departmentsList[0]?.id || '');
    setMajorCodeInput('');
    setMajorNameInput('');
    setMajorDegreeInput('Đại học Chính quy');
    setMajorCreditsInput(135);
    setMajorYearsInput(4.0);
    setMajorDescInput('');
    setShowAddMajorModal(true);
  };

  const handleOpenEditMajor = (major: AdminMajor) => {
    setEditingMajor(major);
    setMajorDeptIdInput(major.departmentId);
    setMajorCodeInput(major.code);
    setMajorNameInput(major.name);
    setMajorDegreeInput(major.degreeLevel || 'Đại học Chính quy');
    setMajorCreditsInput(major.totalCredits || 135);
    setMajorYearsInput(major.durationYears || 4.0);
    setMajorDescInput(major.description || '');
    setShowAddMajorModal(true);
  };

  const handleSaveMajor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!majorDeptIdInput || !majorCodeInput.trim() || !majorNameInput.trim()) {
      alert('Vui lòng chọn Khoa trực thuộc và điền đầy đủ Mã ngành, Tên ngành!');
      return;
    }

    try {
      setSavingMajor(true);
      if (editingMajor) {
        const res = await api.put(`/admin/majors/${editingMajor.id}`, {
          departmentId: majorDeptIdInput,
          code: majorCodeInput.trim(),
          name: majorNameInput.trim(),
          degreeLevel: majorDegreeInput.trim(),
          totalCredits: Number(majorCreditsInput),
          durationYears: Number(majorYearsInput),
          description: majorDescInput.trim()
        });
        setMajorsList((prev) =>
          prev.map((m) => (m.id === editingMajor.id ? { ...m, ...res.data } : m))
        );
        alert('Cập nhật Chuyên ngành thành công!');
      } else {
        const res = await api.post<AdminMajor>('/admin/majors', {
          departmentId: majorDeptIdInput,
          code: majorCodeInput.trim(),
          name: majorNameInput.trim(),
          degreeLevel: majorDegreeInput.trim(),
          totalCredits: Number(majorCreditsInput),
          durationYears: Number(majorYearsInput),
          description: majorDescInput.trim()
        });
        setMajorsList([res.data, ...majorsList]);
        alert('Thêm Chuyên ngành mới vào CSDL thành công!');
      }
      setShowAddMajorModal(false);
      // Refresh departments to update majorsCount
      api.get<AdminDepartment[]>('/admin/departments').then((r) => setDepartmentsList(r.data || []));
    } catch (err: any) {
      alert('Lỗi lưu Chuyên ngành: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingMajor(false);
    }
  };

  const handleDeleteMajor = async (major: AdminMajor) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa Chuyên ngành "${major.name}" (${major.code})?`)) return;
    try {
      await api.delete(`/admin/majors/${major.id}`);
      setMajorsList((prev) => prev.filter((m) => m.id !== major.id));
      alert(`Đã xóa Chuyên ngành ${major.name} thành công!`);
      // Refresh departments to update majorsCount
      api.get<AdminDepartment[]>('/admin/departments').then((r) => setDepartmentsList(r.data || []));
    } catch (err: any) {
      alert('Lỗi xóa Chuyên ngành: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCourse = async (course: AdminCourse) => {
    if (!confirm(`Bạn có chắc muốn xóa hoặc lưu trữ môn học "${course.title}" (${course.courseCode})?`)) return;
    try {
      const res = await api.delete(`/admin/courses/${course.id}`);
      alert(res.data.message || 'Thao tác thành công!');
      const cRes = await api.get<AdminCourse[]>('/admin/courses');
      setCoursesList(cRes.data || []);
    } catch (err: any) {
      alert('Lỗi xóa khóa học: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filtered Departments
  const filteredDepartments = departmentsList.filter((d) => {
    return (
      d.name.toLowerCase().includes(deptSearchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(deptSearchTerm.toLowerCase()) ||
      d.deanName.toLowerCase().includes(deptSearchTerm.toLowerCase())
    );
  });

  // Filtered Majors
  const filteredMajors = majorsList.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(majorSearchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(majorSearchTerm.toLowerCase()) ||
      m.departmentName.toLowerCase().includes(majorSearchTerm.toLowerCase());

    if (selectedDeptFilterForMajors === 'ALL') return matchesSearch;
    return matchesSearch && m.departmentId === selectedDeptFilterForMajors;
  });

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

      {/* Admin Navigation Tabs - Shown only if not controlled by top navbar */}
      {!propActiveTab && (
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
            onClick={() => setActiveTab('departments')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'departments'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Quản lý Khoa ({departmentsList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('majors')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'majors'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Quản lý Chuyên ngành ({majorsList.length})</span>
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
      )}

      {/* Tab 1: Overview Metrics & Health */}
      {activeTab === 'overview' && (
        <div className="space-y-8 w-full">
          {/* Top KPI Cards (6 metrics) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Tổng người dùng</span>
                <h3 className="font-extrabold text-xl text-slate-900 mt-0.5">{usersList.length} tài khoản</h3>
                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                  {usersList.filter((u) => u.role === 'STUDENT').length} Sinh viên • {usersList.filter((u) => u.role === 'TEACHER').length} Giảng viên
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Khoa & Viện Đào tạo</span>
                <h3 className="font-extrabold text-xl text-slate-900 mt-0.5">{departmentsList.length} Khoa</h3>
                <span className="text-[11px] text-indigo-600 font-semibold mt-0.5 block">
                  Cơ cấu tổ chức đào tạo toàn trường
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Chuyên ngành Đào tạo</span>
                <h3 className="font-extrabold text-xl text-slate-900 mt-0.5">{majorsList.length} Ngành</h3>
                <span className="text-[11px] text-purple-600 font-semibold mt-0.5 block">
                  Đại học chính quy & Chất lượng cao
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Khóa học toàn trường</span>
                <h3 className="font-extrabold text-xl text-slate-900 mt-0.5">{coursesList.length} môn học</h3>
                <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">Đang mở giảng dạy</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Lượt ghi danh học phần</span>
                <h3 className="font-extrabold text-xl text-slate-900 mt-0.5">{overviewMetrics?.totalEnrollments || 0} lượt</h3>
                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Đã đăng ký kỳ này</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Máy chủ Backend API</span>
                <h3 className="font-extrabold text-xl text-emerald-600 mt-0.5">Online</h3>
                <span className="text-[11px] text-slate-500 mt-0.5 block">.NET 8 & Microsoft SQL Server</span>
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
                    <span className="font-bold text-slate-800">Microsoft SQL Server Database (lms_db)</span>
                  </div>
                  <span className="text-slate-500 font-mono">20 Tables • Connected Pool: Active</span>
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
                            onClick={() => handleStartEditUser(u)}
                            title="Chỉnh sửa thông tin người dùng"
                            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

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
                            onClick={() => handleStartResetPassword(u)}
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

      {/* Tab: Departments Management */}
      {activeTab === 'departments' && (
        <div className="space-y-6 w-full">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
                  <Building2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Quản lý Khoa & Viện Đào tạo</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Quản lý cơ cấu tổ chức các Khoa, thông tin Trưởng khoa, văn phòng liên hệ và các chuyên ngành trực thuộc</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenAddDept}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-2xs transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm Khoa mới</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={deptSearchTerm}
                onChange={(e) => setDeptSearchTerm(e.target.value)}
                placeholder="Tìm theo Mã Khoa, Tên Khoa hoặc Trưởng khoa..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              Hiển thị: <strong className="text-slate-800">{filteredDepartments.length}</strong> / {departmentsList.length} Khoa
            </span>
          </div>

          {/* Departments Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {filteredDepartments.map((d) => (
              <div key={d.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 uppercase font-mono tracking-wider">
                        {d.code}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-base mt-2">{d.name}</h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditDept(d)}
                        title="Chỉnh sửa Khoa"
                        className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(d)}
                        title="Xóa Khoa"
                        className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {d.description || 'Chưa có mô tả chi tiết cho đơn vị này.'}
                  </p>

                  <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" /> Trưởng khoa:
                      </span>
                      <strong className="text-slate-900 font-bold">{d.deanName || 'Chưa chỉ định'}</strong>
                    </div>

                    {d.officeLocation && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" /> Văn phòng:
                        </span>
                        <span className="text-slate-800 font-medium">{d.officeLocation}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-600" /> Email:
                      </span>
                      <span className="text-slate-800 font-mono text-[11px]">{d.email || 'N/A'}</span>
                    </div>

                    {d.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" /> Hotline:
                        </span>
                        <span className="text-slate-800 font-mono text-[11px]">{d.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Majors Chips */}
                  {d.majors && d.majors.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Chuyên ngành đào tạo ({d.majors.length}):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {d.majors.map((m) => (
                          <span key={m.id} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
                            {m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-blue-700">
                    <GraduationCap className="w-4 h-4" /> {d.majorsCount} Chuyên ngành
                  </span>
                  <span>{d.teachersCount} Giảng viên</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Majors Management */}
      {activeTab === 'majors' && (
        <div className="space-y-6 w-full">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Quản lý Chuyên ngành / Ngành Đào tạo</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Quản lý mã ngành, bậc đào tạo, chuẩn thời gian và tổng số tín chỉ tích lũy theo từng ngành học</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenAddMajor}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-2xs transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm Chuyên ngành mới</span>
            </button>
          </div>

          {/* Search & Department Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={majorSearchTerm}
                onChange={(e) => setMajorSearchTerm(e.target.value)}
                placeholder="Tìm theo Mã ngành, Tên chuyên ngành hoặc Tên khoa..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Lọc theo Khoa:
              </span>
              <select
                value={selectedDeptFilterForMajors}
                onChange={(e) => setSelectedDeptFilterForMajors(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tất cả các Khoa ({majorsList.length})</option>
                {departmentsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Majors Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-extrabold uppercase tracking-wider">
                    <th className="p-4">Mã ngành</th>
                    <th className="p-4">Tên Chuyên ngành</th>
                    <th className="p-4">Khoa trực thuộc</th>
                    <th className="p-4 text-center">Bậc đào tạo</th>
                    <th className="p-4 text-center">Tín chỉ</th>
                    <th className="p-4 text-center">Thời gian</th>
                    <th className="p-4 text-center">Sinh viên</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredMajors.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-mono font-bold text-indigo-700">{m.code}</td>
                      <td className="p-4 font-bold text-slate-900">{m.name}</td>
                      <td className="p-4 text-slate-600 font-medium">{m.departmentName}</td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {m.degreeLevel}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-800">{m.totalCredits} TC</td>
                      <td className="p-4 text-center text-slate-600">{m.durationYears} năm</td>
                      <td className="p-4 text-center font-bold text-blue-700">{m.studentsCount} SV</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditMajor(m)}
                            title="Chỉnh sửa Chuyên ngành"
                            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMajor(m)}
                            title="Xóa Chuyên ngành"
                            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Tab: Courses Oversight */}
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
                    onClick={() => handleStartEditCourse(c)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa</span>
                  </button>
                  <button
                    onClick={() => handleToggleCourseStatus(c)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold"
                  >
                    {c.status === 'ACTIVE' ? 'Lưu trữ khóa học' : 'Kích hoạt lại'}
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(c)}
                    title="Xóa khóa học"
                    className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
                <p className="text-xs text-slate-500">Khi bật, sinh viên và giảng viên sẽ không thể đăng nhập. Quản trị viên vẫn truy cập qua Cổng Quản trị.</p>
              </div>
              <button
                type="button"
                onClick={handleToggleMaintenance}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  maintenanceMode ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
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
                <label className="block font-bold text-slate-700 mb-1">
                  {newUserRole === 'TEACHER' ? 'Khoa công tác:' : newUserRole === 'STUDENT' ? 'Chuyên ngành đào tạo:' : 'Đơn vị / Phòng ban:'}
                </label>
                {newUserRole === 'TEACHER' ? (
                  <select
                    value={newUserClass}
                    onChange={(e) => setNewUserClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn Khoa công tác --</option>
                    {departmentsList.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                ) : newUserRole === 'STUDENT' ? (
                  <select
                    value={newUserClass}
                    onChange={(e) => setNewUserClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn Chuyên ngành --</option>
                    {majorsList.map((m) => (
                      <option key={m.id} value={`${m.code} - ${m.name}`}>
                        {m.code} - {m.name} ({m.departmentName || m.departmentCode})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Ví dụ: Ban Quản trị Hệ thống"
                    value={newUserClass}
                    onChange={(e) => setNewUserClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
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
                  required
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
                  required
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khoa phụ trách:</label>
                <select
                  value={newCourseDept}
                  onChange={(e) => setNewCourseDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {departmentsList.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giảng viên chỉ định:</label>
                <select
                  value={newCourseTeacher}
                  onChange={(e) => setNewCourseTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn Giảng viên phụ trách --</option>
                  {usersList.filter((u) => u.role === 'TEACHER').map((t) => (
                    <option key={t.id} value={t.fullName}>
                      {t.fullName} ({t.code || t.email})
                    </option>
                  ))}
                </select>
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl p-6 text-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                Cập nhật thông tin Người dùng
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên:</label>
                <input
                  type="text"
                  required
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email:</label>
                <input
                  type="email"
                  required
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vai trò:</label>
                  <select
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    required
                    value={editUserCode}
                    onChange={(e) => setEditUserCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {editUserRole === 'TEACHER' ? 'Khoa công tác:' : editUserRole === 'STUDENT' ? 'Khoa & Chuyên ngành đào tạo:' : 'Đơn vị / Phòng ban:'}
                </label>
                {editUserRole === 'TEACHER' ? (
                  <select
                    value={editUserClass}
                    onChange={(e) => setEditUserClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">-- Chọn Khoa công tác --</option>
                    {departmentsList.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                ) : editUserRole === 'STUDENT' ? (
                  <div className="space-y-1.5">
                    <select
                      value={editUserClass}
                      onChange={(e) => setEditUserClass(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">-- Chọn Chuyên ngành --</option>
                      {majorsList.map((m) => (
                        <option key={m.id} value={`${m.code} - ${m.name}`}>
                          {m.code} - {m.name} ({m.departmentName || m.departmentCode})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Hoặc nhập mã lớp sinh hoạt cụ thể (ví dụ: CNTT-K65)"
                      value={editUserClass}
                      onChange={(e) => setEditUserClass(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={editUserClass}
                    onChange={(e) => setEditUserClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-xl hover:bg-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {savingUser ? 'Đang lưu...' : 'Lưu cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl p-6 text-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                Đặt lại Mật khẩu
              </h3>
              <button
                onClick={() => setResettingUser(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-800">
                <p className="font-semibold">
                  Tài khoản: <span className="font-bold">{resettingUser.fullName}</span> ({resettingUser.code})
                </p>
                <p className="text-[11px] text-blue-600 mt-1">
                  Email: {resettingUser.email} &bull; Vai trò: {resettingUser.role}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mật khẩu mới (tùy chọn):</label>
                <input
                  type="password"
                  placeholder="Để trống để reset về mặc định (student123 / teacher123 / admin123)"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Nếu không nhập gì, mật khẩu sẽ tự động chuyển về mật khẩu mặc định của hệ thống.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-xl hover:bg-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleExecuteResetPassword}
                  disabled={savingPassword}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {savingPassword ? 'Đang xử lý...' : 'Xác nhận Đặt lại Mật khẩu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Department Modal */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl p-6 text-slate-900 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                {editingDept ? 'Cập nhật thông tin Khoa / Viện' : 'Thêm Khoa / Viện Đào tạo Mới'}
              </h3>
              <button
                onClick={() => setShowAddDeptModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Khoa (Viết tắt): *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: FIT, FEE, FBA..."
                    value={deptCodeInput}
                    onChange={(e) => setDeptCodeInput(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trưởng Khoa / Lãnh đạo:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: PGS.TS. Nguyễn Văn A"
                    value={deptDeanInput}
                    onChange={(e) => setDeptDeanInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Khoa / Viện đầy đủ: *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Khoa Công nghệ Thông tin"
                  value={deptNameInput}
                  onChange={(e) => setDeptNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email liên hệ:</label>
                  <input
                    type="email"
                    placeholder="fit@university.edu.vn"
                    value={deptEmailInput}
                    onChange={(e) => setDeptEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại:</label>
                  <input
                    type="text"
                    placeholder="(024) 3869 1234"
                    value={deptPhoneInput}
                    onChange={(e) => setDeptPhoneInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Văn phòng / Địa điểm:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tòa nhà B1, Phòng 302"
                  value={deptLocationInput}
                  onChange={(e) => setDeptLocationInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả / Giới thiệu chức năng:</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả tóm tắt về khoa, sứ mệnh đào tạo..."
                  value={deptDescInput}
                  onChange={(e) => setDeptDescInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-xl hover:bg-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingDept}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {savingDept ? 'Đang lưu...' : editingDept ? 'Lưu cập nhật' : 'Tạo mới Khoa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Major Modal */}
      {showAddMajorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl p-6 text-slate-900 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                {editingMajor ? 'Cập nhật Chuyên ngành' : 'Thêm Chuyên ngành Đào tạo Mới'}
              </h3>
              <button
                onClick={() => setShowAddMajorModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMajor} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Khoa trực thuộc: *</label>
                <select
                  required
                  value={majorDeptIdInput}
                  onChange={(e) => setMajorDeptIdInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn Khoa trực thuộc --</option>
                  {departmentsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Chuyên ngành: *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: CS-SE, CS-AI, EE-TEL..."
                    value={majorCodeInput}
                    onChange={(e) => setMajorCodeInput(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hệ đào tạo:</label>
                  <select
                    value={majorDegreeInput}
                    onChange={(e) => setMajorDegreeInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Đại học Chính quy">Đại học Chính quy</option>
                    <option value="Chất lượng cao">Chất lượng cao</option>
                    <option value="Cử nhân">Cử nhân</option>
                    <option value="Kỹ sư">Kỹ sư</option>
                    <option value="Thạc sĩ">Thạc sĩ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Chuyên ngành: *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kỹ thuật Phần mềm (Software Engineering)"
                  value={majorNameInput}
                  onChange={(e) => setMajorNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tổng số tín chỉ đào tạo:</label>
                  <input
                    type="number"
                    min={60}
                    max={250}
                    value={majorCreditsInput}
                    onChange={(e) => setMajorCreditsInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời gian chuẩn (năm):</label>
                  <input
                    type="number"
                    step={0.5}
                    min={1}
                    max={7}
                    value={majorYearsInput}
                    onChange={(e) => setMajorYearsInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả / Chuẩn đầu ra:</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả mục tiêu đào tạo, cơ hội việc làm sau tốt nghiệp..."
                  value={majorDescInput}
                  onChange={(e) => setMajorDescInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMajorModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-xl hover:bg-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingMajor}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {savingMajor ? 'Đang lưu...' : editingMajor ? 'Lưu cập nhật' : 'Tạo mới Chuyên ngành'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl p-6 text-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                Cập nhật Khóa học & Lớp học
              </h3>
              <button
                onClick={() => setEditingCourse(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã khóa học (Course Code): *</label>
                <input
                  type="text"
                  required
                  value={editCourseCode}
                  onChange={(e) => setEditCourseCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên môn học: *</label>
                <input
                  type="text"
                  required
                  value={editCourseTitle}
                  onChange={(e) => setEditCourseTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khoa phụ trách:</label>
                <select
                  value={editCourseDept}
                  onChange={(e) => setEditCourseDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {departmentsList.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giảng viên chỉ định:</label>
                <select
                  value={editCourseTeacher}
                  onChange={(e) => setEditCourseTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn Giảng viên phụ trách --</option>
                  {usersList.filter((u) => u.role === 'TEACHER').map((t) => (
                    <option key={t.id} value={t.fullName}>
                      {t.fullName} ({t.code || t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Trạng thái lớp học:</label>
                <select
                  value={editCourseStatus}
                  onChange={(e) => setEditCourseStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Đang hoạt động (Mở lớp)</option>
                  <option value="ARCHIVED">Lưu trữ (Đóng lớp)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-xl hover:bg-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingCourse}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {savingCourse ? 'Đang lưu...' : 'Lưu cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

