import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, Wrench, ShieldAlert } from 'lucide-react';
import { AuthUser } from '../types';
import api from '../api/axios';

interface Props {
  onLoginSuccess: (user: AuthUser) => void;
  onBackToUserLogin: () => void;
}

export const AdminLoginPage: React.FC<Props> = ({ onLoginSuccess, onBackToUserLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  useEffect(() => {
    // Check system status
    api.get('/auth/system-status')
      .then((res) => {
        setIsMaintenance(res.data?.isMaintenance || false);
        setMaintenanceMessage(res.data?.message || '');
      })
      .catch((err) => {
        console.error('Lỗi kiểm tra trạng thái hệ thống:', err);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu Quản trị viên.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call dedicated admin-login endpoint
      const response = await api.post('/auth/admin-login', { email, password });
      const data = response.data;

      const user: AuthUser = {
        userId: data.userId,
        email: data.email,
        fullName: data.fullName,
        role: data.role as 'ADMIN' | 'TEACHER' | 'STUDENT',
        token: data.token,
        refreshToken: data.refreshToken,
        studentCode: data.studentCode,
        teacherCode: data.teacherCode
      };

      localStorage.setItem('access_token', user.token);
      localStorage.setItem('refresh_token', user.refreshToken);
      localStorage.setItem('user_info', JSON.stringify(user));

      onLoginSuccess(user);
    } catch (err: any) {
      console.error('Lỗi đăng nhập Quản trị viên:', err);
      const msg = err.response?.data?.message || 'Email hoặc mật khẩu Quản trị viên không chính xác.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Security Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Back Button */}
        <button
          onClick={onBackToUserLogin}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Cổng Giảng viên & Sinh viên</span>
        </button>

        <div className="flex justify-center">
          <div className="p-3.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/20 ring-1 ring-white/20">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Cổng Quản trị Hệ thống LMS
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-400 font-medium">
          Dành riêng cho Quản trị viên (Admin Portal)
        </p>

        {/* Maintenance Notice for Admin */}
        {isMaintenance && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
            <Wrench className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-amber-200">Chế độ Bảo trì: ĐANG BẬT</strong>
              <p className="text-[11px] text-amber-300/90 mt-0.5 leading-relaxed">
                Người dùng thông thường bị chặn đăng nhập. Quản trị viên đăng nhập tại đây để thao tác và quản lý hệ thống.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 py-8 px-6 shadow-2xl shadow-black/80 rounded-3xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs font-semibold">
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Email Quản trị viên
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lms.edu.vn"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Mật khẩu Quản trị viên
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-11 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xác thực bảo mật...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Đăng nhập Cổng Quản trị</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Information Footer */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Cổng quản trị được bảo vệ bởi phiên làm việc mã hóa JWT và nhật ký an ninh hệ thống.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
