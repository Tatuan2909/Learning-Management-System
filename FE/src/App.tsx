import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, LayoutDashboard, Award, Bell, Sparkles, Menu, X } from 'lucide-react';
import { UpcomingDeadlinesWidget } from './components/UpcomingDeadlinesWidget';
import { PostLessonQuiz } from './components/PostLessonQuiz';
import { CoursesPage } from './components/CoursesPage';
import { CourseStudyPage } from './components/CourseStudyPage';
import { LoginPage } from './components/LoginPage';
import { ProfileDropdown } from './components/ProfileDropdown';
import { ProfilePage } from './components/ProfilePage';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { UpcomingDeadline, AuthUser } from './types';

export const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('user_info');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'my-courses' | 'courses' | 'quiz' | 'profile' | 'study'>('dashboard');
  const [studyCourseId, setStudyCourseId] = useState<string>('44444444-4444-4444-4444-444444444444');
  const [selectedDeadline, setSelectedDeadline] = useState<UpcomingDeadline | null>(null);
  const [activeLesson, setActiveLesson] = useState<number>(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Force permanent clean Light Mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    setUser(null);
  };

  const handleOpenStudyPage = (courseId: string) => {
    setStudyCourseId(courseId);
    setActiveTab('study');
  };

  if (!user) {
    return <LoginPage onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  // Dedicated full-page Course Player View
  if (activeTab === 'study') {
    return (
      <CourseStudyPage
        courseId={studyCourseId}
        onBack={() => setActiveTab('my-courses')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col w-full font-sans antialiased">
      {/* Calm White Header / Navbar */}
      <header className="bg-white text-slate-800 border-b border-slate-200/90 sticky top-0 z-50 shadow-2xs w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          
          {/* Left Section: Logo & Mobile Toggle */}
          <div className="flex items-center gap-3 md:gap-8 flex-1 min-w-0">
            {/* Mobile Nav Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer flex-shrink-0" onClick={() => setActiveTab('dashboard')}>
              <div className="p-2 bg-blue-600 rounded-xl shadow-xs">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-extrabold text-base leading-none tracking-tight text-slate-900">Hệ thống LMS</h1>
                <span className="text-[10px] text-blue-600 font-mono font-medium mt-0.5 inline-block">Client - Server</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>
                  {user.role === 'ADMIN'
                    ? 'Cổng Quản trị viên'
                    : user.role === 'TEACHER'
                    ? 'Cổng Giảng viên'
                    : 'Dashboard'}
                </span>
              </button>
              {user.role !== 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('my-courses')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'my-courses'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{user.role === 'TEACHER' ? 'Khóa học phụ trách' : 'Khóa học của tôi'}</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'courses'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Tất cả khóa học</span>
              </button>
            </nav>
          </div>

          {/* Right Section: User Profile Dropdown Menu */}
          <div className="flex items-center gap-3 flex-shrink-0 pl-3 border-l border-slate-200">
            <ProfileDropdown
              user={user}
              onLogout={handleLogout}
              onOpenProfilePage={() => setActiveTab('profile')}
            />
          </div>

        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1.5 shadow-md">
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
                activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>
                {user.role === 'ADMIN'
                  ? 'Cổng Quản trị viên'
                  : user.role === 'TEACHER'
                  ? 'Cổng Giảng viên'
                  : 'Dashboard'}
              </span>
            </button>
            {user.role !== 'ADMIN' && (
              <button
                onClick={() => { setActiveTab('my-courses'); setMobileMenuOpen(false); }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
                  activeTab === 'my-courses' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{user.role === 'TEACHER' ? 'Khóa học phụ trách' : 'Khóa học của tôi'}</span>
              </button>
            )}
            <button
              onClick={() => { setActiveTab('courses'); setMobileMenuOpen(false); }}
              className={`w-full p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
                activeTab === 'courses' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Tất cả khóa học</span>
            </button>
          </div>
        )}
      </header>

      {/* Full-width Main Content Area */}
      <main className="flex-1 w-full px-3 sm:px-6 lg:px-10 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          user.role === 'ADMIN' ? (
            <AdminDashboard user={user} />
          ) : user.role === 'TEACHER' ? (
            <TeacherDashboard user={user} />
          ) : (
            <div className="space-y-8">
              {/* Softer, Gentle, Eye-friendly Welcome Banner */}
              <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-slate-50 rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xs border border-blue-100/80 relative overflow-hidden w-full">
                <div className="relative z-10 max-w-3xl">
                  <span className="bg-blue-100/80 text-blue-700 text-[11px] sm:text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-block border border-blue-200/60">
                    Học kỳ I • Năm học 2024 - 2025
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 leading-tight text-slate-900">
                    Xin chào, {user.fullName}!
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                    Theo dõi hạn nộp bài tập và bài kiểm tra trắc nghiệm cần hoàn thành dưới đây, hoặc chọn mục "Khóa học của tôi" để tiếp tục học các bài giảng.
                  </p>
                </div>
              </div>

              {/* Full-width Responsive Grid Layout: Deadlines & Overview */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 w-full">
                {/* Left Column (2 Cols): Widget Deadlines */}
                <div className="xl:col-span-2 space-y-6">
                  <UpcomingDeadlinesWidget
                    onSelectDeadline={(deadline) => {
                      setSelectedDeadline(deadline);
                      setActiveTab('quiz');
                    }}
                  />
                </div>

                {/* Right Column (1 Col): Class Announcements & Progress */}
                <div className="space-y-6">
                  {/* Quick My Courses Card - Calmer Subtle Blue */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase">
                      Khóa học đang học
                    </span>
                    <h4 className="font-extrabold text-base text-slate-900">INT3306 - Lập trình Web C# .NET 8 & ReactJS</h4>
                    <p className="text-xs text-slate-500">Giảng viên: TS. Nguyễn Văn A • Tiến độ: 50%</p>
                    <button
                      onClick={() => handleOpenStudyPage('44444444-4444-4444-4444-444444444444')}
                      className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Vào Trang Học Bài Giảng</span>
                    </button>
                  </div>

                  {/* Announcements Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <Bell className="w-5 h-5 text-blue-600" />
                        <h3>Thông báo lớp học</h3>
                      </div>
                      <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-100">Ghim</span>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900">📌 Lịch nộp Bài tập lớn</span>
                        <span className="text-xs text-amber-700 font-semibold">Hôm nay</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Các em sinh viên chú ý hoàn thành bài tập theo đúng hạn nộp hiển thị ở Widget.
                      </p>
                    </div>
                  </div>

                  {/* Progress Overview Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      Tiến độ môn học INT3306
                    </h3>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600">Lập trình Web C# .NET 8</span>
                        <span className="text-blue-600 font-bold">50% Hoàn thành</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                        <div className="bg-blue-600 h-full w-1/2 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {activeTab === 'my-courses' && (
          <CoursesPage
            initialFilter="ENROLLED"
            onSelectLessonForQuiz={(lessonId, quizId) => handleOpenStudyPage('44444444-4444-4444-4444-444444444444')}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesPage
            initialFilter="ALL"
            onSelectLessonForQuiz={(lessonId, quizId) => handleOpenStudyPage('44444444-4444-4444-4444-444444444444')}
          />
        )}

        {activeTab === 'quiz' && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h2 className="font-bold text-slate-900 text-base sm:text-lg">Bài 1: Giới thiệu Clean Architecture & RESTful API</h2>
                <p className="text-xs text-slate-500 mt-0.5">Khóa học INT3306 • Môn Lập trình Web C# .NET 8</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">Bài học:</span>
                <button
                  onClick={() => setActiveLesson(1)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs ${
                    activeLesson === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  1
                </button>
                <button
                  onClick={() => setActiveLesson(2)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs ${
                    activeLesson === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  2
                </button>
              </div>
            </div>

            <PostLessonQuiz
              onNextLesson={() => {
                setActiveLesson(2);
                alert('Chúc mừng! Bạn đã mở khóa Bài học tiếp theo (Sequential Lock Unlocked).');
              }}
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <ProfilePage user={user} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 w-full mt-auto">
        <div className="w-full px-4">
          <p>© 2026 LMS Web Application. Architecture: C# .NET 8 Web API + ReactJS Vite TypeScript + Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
