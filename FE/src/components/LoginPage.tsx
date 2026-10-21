import React, { useState, useEffect } from 'react';
import { GraduationCap, Lock, Mail, Eye, EyeOff, AlertCircle, Wrench, RotateCw } from 'lucide-react';
import { AuthUser } from '../types';
import api from '../api/axios';

interface Props {
  onLoginSuccess: (user: AuthUser) => void;
  onOpenAdminLogin?: () => void;
}

export const LoginPage: React.FC<Props> = ({ onLoginSuccess, onOpenAdminLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);

  const checkStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await api.get('/auth/system-status');
      setIsMaintenance(res.data?.isMaintenance || false);
      setMaintenanceMessage(res.data?.message || '');
      if (!res.data?.isMaintenance) {
        setError(null);
      }
    } catch (err) {
      console.error('Lỗi kiểm tra trạng thái hệ thống:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

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
        studentCode: data.studentCode,
        teacherCode: data.teacherCode
      };

      localStorage.setItem('access_token', user.token);
      localStorage.setItem('refresh_token', user.refreshToken);
      localStorage.setItem('user_info', JSON.stringify(user));

      onLoginSuccess(user);
    } catch (err: any) {
      console.error('Lỗi đăng nhập backend API:', err);
      if (err.response?.status === 503 || err.response?.data?.isMaintenance) {
        setIsMaintenance(true);
        setMaintenanceMessage(err.response?.data?.message || 'Hệ thống đang trong chế độ bảo trì.');
      } else {
        setError(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác hoặc máy chủ không phản hồi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Soft Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="flex justify-center">
          <div className="p-3.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Hệ thống LMS Fullstack
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-500 font-medium">
          Cổng đăng nhập Giảng viên & Sinh viên
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white border border-slate-200/80 py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10">
          {error && !isMaintenance && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isMaintenance ? (
            /* Khi hệ thống đang bảo trì: KHÔNG HIỆN TEXT INPUT, CHỈ HIỆN THÔNG BÁO BẢO TRÌ */
            <div className="text-center py-2">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-2xl flex items-center justify-center shadow-inner relative">
                <Wrench className="w-8 h-8 text-amber-600 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                </span>
              </div>

              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 mb-3">
                Chế độ bảo trì hệ thống
              </span>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Tạm dừng tiếp nhận đăng nhập
              </h3>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-left mb-5">
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {maintenanceMessage || 'Hệ thống đang trong chế độ bảo trì định kỳ để nâng cấp cơ sở dữ liệu và hệ thống. Sinh viên và Giảng viên tạm thời không thể đăng nhập. Vui lòng quay lại sau.'}
                </p>
                <div className="mt-3 pt-3 border-t border-amber-200/80 space-y-1.5 text-[11px] text-amber-800">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>Toàn bộ dữ liệu điểm số và học tập được bảo toàn an toàn.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>Hệ thống sẽ tự động mở lại ngay sau khi hoàn tất bảo dưỡng.</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={checkStatus}
                disabled={checkingStatus}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs mb-4"
              >
                <RotateCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                <span>{checkingStatus ? 'Đang kiểm tra kết nối...' : 'Kiểm tra lại trạng thái hệ thống'}</span>
              </button>

              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAdminLogin) {
                      onOpenAdminLogin();
                    } else {
                      window.history.pushState({}, '', '/admin/login');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }}
                  className="text-xs text-slate-500 hover:text-blue-600 font-semibold transition-colors"
                >
                  Bạn là Quản trị viên? <span className="underline font-bold text-blue-600">Đăng nhập Admin</span>
                </button>
              </div>
            </div>
          ) : (
            /* Khi hệ thống hoạt động bình thường: HIỂN THỊ ĐẦY ĐỦ FORM ĐĂNG NHẬP */
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tên đăng nhập / Mã SV / Mã GV
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập Mã SV (ví dụ: SV2024001) hoặc Mã GV (ví dụ: GV001)"
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
          )}
        </div>
      </div>
    </div>
  );
};
