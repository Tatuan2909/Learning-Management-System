import React, { useState } from 'react';
import { BookOpen, GraduationCap, LayoutDashboard, Clock, CheckSquare, Award, FileText, Bell, UserCheck } from 'lucide-react';
import { UpcomingDeadlinesWidget } from './components/UpcomingDeadlinesWidget';
import { PostLessonQuiz } from './components/PostLessonQuiz';
import { UpcomingDeadline } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'quiz' | 'modules'>('dashboard');
  const [selectedDeadline, setSelectedDeadline] = useState<UpcomingDeadline | null>(null);
  const [activeLesson, setActiveLesson] = useState<number>(1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header / Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Hệ thống LMS Fullstack</h1>
              <span className="text-xs text-blue-400 font-mono mt-1 inline-block">C# .NET 8 & ReactJS</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Sinh viên</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'quiz' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Trắc nghiệm Bài học</span>
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'modules' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>8 Module Nghiệp vụ</span>
            </button>
          </nav>

          {/* User Profile Info */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              TB
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold leading-tight">Trần Thị B</p>
              <span className="text-xs text-slate-400">SV2024001 • Sinh viên</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                  Học kỳ I • Năm học 2024 - 2025
                </span>
                <h2 className="text-3xl font-extrabold mt-3 leading-tight">
                  Chào mừng trở lại, Trần Thị B!
                </h2>
                <p className="text-blue-100 text-sm mt-2 leading-relaxed">
                  Bạn có bài tập cần nộp và trắc nghiệm chưa làm. Hãy theo dõi các widget deadline dưới đây để không bỏ lỡ hạn nộp bài.
                </p>
              </div>
            </div>

            {/* Grid Layout: Widget Deadlines & Learning Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column (2 Cols): Widget Deadlines */}
              <div className="lg:col-span-2 space-y-6">
                <UpcomingDeadlinesWidget
                  onSelectDeadline={(deadline) => {
                    setSelectedDeadline(deadline);
                    setActiveTab('quiz');
                  }}
                />
              </div>

              {/* Right Column (1 Col): Class Announcements & Progress */}
              <div className="space-y-6">
                {/* Announcements Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <h3>Thông báo lớp học</h3>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-semibold">Ghim</span>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900">📌 Lịch nộp Bài tập lớn</span>
                      <span className="text-xs text-amber-700">Hôm nay</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Các em sinh viên chú ý hoàn thành bài tập theo đúng hạn nộp hiển thị ở Widget.
                    </p>
                  </div>
                </div>

                {/* Progress Overview Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    Tiến độ môn học
                  </h3>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-600">Lập trình Web C# .NET 8</span>
                      <span className="text-blue-600">50% Hoàn thành</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full w-1/2 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Bài 1: Giới thiệu Clean Architecture & RESTful API</h2>
                <p className="text-xs text-gray-500">Khóa học INT3306 • Môn Lập trình Web C# .NET 8</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Bài học:</span>
                <button
                  onClick={() => setActiveLesson(1)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs ${
                    activeLesson === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  1
                </button>
                <button
                  onClick={() => setActiveLesson(2)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs ${
                    activeLesson === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
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

        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Cấu trúc 8 Module Nghiệp vụ của Hệ thống LMS</h2>
              <p className="text-sm text-gray-600">
                Hệ thống LMS được lập trình hoàn chỉnh với các module nghiệp vụ đáp ứng đầy đủ yêu cầu:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Module 1: Auth & User', desc: 'Mã hóa mật khẩu, JWT Token & Refresh Token, phân quyền Admin, Teacher, Student.' },
                { title: 'Module 2: Khóa học & Bài giảng', desc: 'Course -> Section -> Lesson, Video/PDF, order_index & cờ mở khóa bài tuần tự.' },
                { title: 'Module 3: Trắc nghiệm Bài học', desc: 'Chấm điểm tự động, đạt >= 70% tự động kích hoạt cập nhật LessonProgress.' },
                { title: 'Module 4: Bài tập về nhà', desc: 'Tạo bài tập, due_date, sinh viên nộp bài đính kèm file, giảng viên chấm điểm & feedback.' },
                { title: 'Module 5: Tiến trình Học tập', desc: 'Tính % tiến độ hoàn thành dựa trên is_completed, xem báo cáo toàn lớp.' },
                { title: 'Module 6: Quản lý Điểm', desc: 'Sổ điểm theo trọng số (Chuyên cần % + Bài tập % + Thi %), xuất file Excel.' },
                { title: 'Module 7: Bảng tin Lớp học', desc: 'Đăng thông báo, ghim bài lên đầu trang tin, tải tài liệu đính kèm.' },
                { title: 'Module 8: Widget Deadlines', desc: 'Lọc bài chưa nộp, badge phân màu theo thời gian còn lại (Red/Yellow/Green).' }
              ].map((mod, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-blue-300 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm mb-3">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">{mod.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{mod.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 LMS Web Application. Architecture: C# .NET 8 Web API + ReactJS Vite TypeScript + Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
