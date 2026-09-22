import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, LayoutDashboard, Award, Bell, Sparkles, Sun, Moon } from 'lucide-react';
import { UpcomingDeadlinesWidget } from './components/UpcomingDeadlinesWidget';
import { PostLessonQuiz } from './components/PostLessonQuiz';
import { CoursesPage } from './components/CoursesPage';
import { CourseStudyPage } from './components/CourseStudyPage';
import { LoginPage } from './components/LoginPage';
import { ProfileDropdown } from './components/ProfileDropdown';
import { ProfilePage } from './components/ProfilePage';
import { TeacherDashboard } from './components/TeacherDashboard';
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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

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
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'} flex flex-col w-full transition-colors duration-200`}>
      {/* Full-width Header / Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          
          {/* Left Section: Logo & Navigation Links */}
          <div className="flex items-center gap-6 md:gap-8 lg:gap-10 flex-1 min-w-0">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer flex-shrink-0" onClick={() => setActiveTab('dashboard')}>
              <div className="p-2 bg-blue-600 rounded-xl shadow-md">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-extrabold text-base leading-none tracking-tight">Hệ thống LMS</h1>
                <span className="text-[10px] text-blue-400 font-mono mt-0.5 inline-block">Client - Server</span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{user.role === 'TEACHER' ? 'Cổng Giảng viên' : 'Dashboard'}</span>
              </button>
              <button
                onClick={() => setActiveTab('my-courses')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'my-courses'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{user.role === 'TEACHER' ? 'Khóa học phụ trách' : 'Khóa học của tôi'}</span>
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'courses'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Tất cả khóa học</span>
              </button>
            </nav>
          </div>

          {/* Right Section: User Profile Dropdown Menu & Outside Theme Switcher */}
          <div className="flex items-center gap-3 flex-shrink-0 pl-4 border-l border-slate-800">
            {/* Profile User Dropdown */}
            <ProfileDropdown
              user={user}
              onLogout={handleLogout}
              onOpenProfilePage={() => setActiveTab('profile')}
            />

            {/* Outside Dark / Light Theme Switcher Button */}
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all shadow-xs flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng (Light Mode)' : 'Chuyển sang Giao diện Tối (Dark Mode)'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden xl:inline text-amber-300">Sáng</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-300" />
                  <span className="hidden xl:inline text-slate-200">Tối</span>
                </>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Full-width Main Content Area */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-8">
        {activeTab === 'dashboard' && (
          user.role === 'TEACHER' ? (
            <TeacherDashboard user={user} />
          ) : (
            <div className="space-y-8">
              {/* Welcome Banner for Student */}
              <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden w-full">
                <div className="relative z-10 max-w-3xl">
                  <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                    Học kỳ I • Năm học 2024 - 2025
                  </span>
                  <h2 className="text-3xl font-extrabold mt-3 leading-tight">
                    Xin chào, {user.fullName}!
                  </h2>
                  <p className="text-blue-100 text-sm mt-2 leading-relaxed">
                    Theo dõi hạn nộp bài tập và bài kiểm tra trắc nghiệm cần hoàn thành dưới đây, hoặc chọn mục "Khóa học của tôi" để tiếp tục học các bài giảng.
                  </p>
                </div>
              </div>

              {/* Full-width Responsive Grid Layout: Deadlines & Overview */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full">
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
                  {/* Quick My Courses Banner */}
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-2xl text-white space-y-3">
                    <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full uppercase">
                      Khóa học đang học
                    </span>
                    <h4 className="font-bold text-base">INT3306 - Lập trình Web C# .NET 8 & ReactJS</h4>
                    <p className="text-xs text-slate-300">Giảng viên: TS. Nguyễn Văn A • Tiến độ: 50%</p>
                    <button
                      onClick={() => handleOpenStudyPage('44444444-4444-4444-4444-444444444444')}
                      className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Vào Trang Học Bài Giảng</span>
                    </button>
                  </div>

                  {/* Announcements Card */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                        <Bell className="w-5 h-5 text-blue-600" />
                        <h3>Thông báo lớp học</h3>
                      </div>
                      <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full font-semibold">Ghim</span>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 dark:text-amber-300">📌 Lịch nộp Bài tập lớn</span>
                        <span className="text-xs text-amber-700 dark:text-amber-400">Hôm nay</span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
                        Các em sinh viên chú ý hoàn thành bài tập theo đúng hạn nộp hiển thị ở Widget.
                      </p>
                    </div>
                  </div>

                  {/* Progress Overview Card */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      Tiến độ môn học INT3306
                    </h3>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-gray-600 dark:text-slate-400">Lập trình Web C# .NET 8</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">50% Hoàn thành</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
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
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">Bài 1: Giới thiệu Clean Architecture & RESTful API</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Khóa học INT3306 • Môn Lập trình Web C# .NET 8</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">Bài học:</span>
                <button
                  onClick={() => setActiveLesson(1)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs ${
                    activeLesson === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'
                  }`}
                >
                  1
                </button>
                <button
                  onClick={() => setActiveLesson(2)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs ${
                    activeLesson === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'
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
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-6 text-center text-xs text-gray-500 dark:text-slate-400 w-full mt-auto">
        <div className="w-full px-4">
          <p>© 2026 LMS Web Application. Architecture: C# .NET 8 Web API + ReactJS Vite TypeScript + Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
