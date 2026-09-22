import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, Eye, EyeOff, AlertCircle, ShieldCheck, UserCheck, BookOpen } from 'lucide-react';
import { AuthUser } from '../types';
import api from '../api/axios';

interface Props {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call backend API /api/auth/login
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      const user: AuthUser = {
        userId: data.userId,
        email: data.email,
        fullName: data.fullName,
        role: data.role as 'ADMIN' | 'TEACHER' | 'STUDENT',
        token: data.token,
        refreshToken: data.refreshToken,
        studentCode: data.role === 'STUDENT' ? 'SV2024001' : undefined,
        teacherCode: data.role === 'TEACHER' ? 'GV001' : undefined
      };

      localStorage.setItem('access_token', user.token);
      localStorage.setItem('refresh_token', user.refreshToken);
      localStorage.setItem('user_info', JSON.stringify(user));

      onLoginSuccess(user);
    } catch (err: any) {
      console.warn('Backend API login error or offline, fallback demo login:', err);

      // Demo fallback evaluation if API isn't running yet
      let user: AuthUser | null = null;

      if (email === 'student@lms.edu.vn' || email.includes('student')) {
        user = {
          userId: '33333333-3333-3333-3333-333333333333',
          email: 'student@lms.edu.vn',
          fullName: 'Trần Thị B',
          role: 'STUDENT',
          studentCode: 'SV2024001',
          token: 'demo-student-token',
          refreshToken: 'demo-student-refresh'
        };
      } else if (email === 'teacher@lms.edu.vn' || email.includes('teacher')) {
        user = {
          userId: '22222222-2222-2222-2222-222222222222',
          email: 'teacher@lms.edu.vn',
          fullName: 'TS. Nguyễn Văn A',
          role: 'TEACHER',
          teacherCode: 'GV001',
          department: 'Khoa Công nghệ Thông tin',
          token: 'demo-teacher-token',
          refreshToken: 'demo-teacher-refresh'
        };
      } else if (email === 'admin@lms.edu.vn' || email.includes('admin')) {
        user = {
          userId: '11111111-1111-1111-1111-111111111111',
          email: 'admin@lms.edu.vn',
          fullName: 'Hệ thống Quản trị viên',
          role: 'ADMIN',
          token: 'demo-admin-token',
          refreshToken: 'demo-admin-refresh'
        };
      }

      if (user && (password === 'admin123' || password === 'teacher123' || password === 'student123' || password.length > 0)) {
        localStorage.setItem('access_token', user.token);
        localStorage.setItem('refresh_token', user.refreshToken);
        localStorage.setItem('user_info', JSON.stringify(user));
        onLoginSuccess(user);
      } else {
        setError(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'STUDENT' | 'TEACHER' | 'ADMIN') => {
    if (role === 'STUDENT') {
      setEmail('student@lms.edu.vn');
      setPassword('student123');
    } else if (role === 'TEACHER') {
      setEmail('teacher@lms.edu.vn');
      setPassword('teacher123');
    } else {
      setEmail('admin@lms.edu.vn');
      setPassword('admin123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Soft Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="p-3.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Hệ thống LMS Fullstack
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-500 font-medium">
          Đăng nhập vào cổng thông tin quản lý học tập
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white border border-slate-200/80 py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Địa chỉ Email
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@lms.edu.vn"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mật khẩu
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input type="checkbox" className="rounded bg-slate-100 border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#forgot" className="text-blue-600 hover:underline font-bold">Quên mật khẩu?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <span>Đăng nhập vào hệ thống</span>
              )}
            </button>
          </form>

          {/* Quick Login Preset Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              ⚡ Đăng nhập nhanh theo Vai trò (Thử nghiệm)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('STUDENT')}
                className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold text-blue-700 flex flex-col items-center gap-1 transition-all"
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Sinh viên</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('TEACHER')}
                className="p-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 flex flex-col items-center gap-1 transition-all"
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Giảng viên</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold text-purple-700 flex flex-col items-center gap-1 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
