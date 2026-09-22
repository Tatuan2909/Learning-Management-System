import React, { useState } from 'react';
import { User, Lock, Key, ShieldCheck, Mail, GraduationCap, CheckCircle2, AlertCircle, Save, Eye, EyeOff } from 'lucide-react';
import { AuthUser } from '../types';
import api from '../api/axios';

interface Props {
  user: AuthUser;
}

export const ProfilePage: React.FC<Props> = ({ user }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ thông tin mật khẩu.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới và Xác nhận mật khẩu không khớp.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      // Simulate backend API call or make real post
      await new Promise((resolve) => setTimeout(resolve, 800));
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công! Hãy sử dụng mật khẩu mới cho lần đăng nhập tiếp theo.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: 'Mật khẩu hiện tại không chính xác. Vui lòng thử lại.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden w-full">
        <div className="relative z-10 max-w-2xl">
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 mb-3">
            <User className="w-3.5 h-3.5 text-blue-400" />
            Hồ sơ Cá nhân & Bảo mật
          </span>
          <h2 className="text-3xl font-extrabold leading-tight">
            Quản lý Tài khoản của Bạn
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Xem thông tin tài khoản cá nhân, mã số sinh viên / giảng viên và đổi mật khẩu bảo mật.
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Details Card */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100 dark:border-slate-800">
            <div className="w-24 h-24 rounded-full bg-blue-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800 mb-4">
              {user.fullName.charAt(0)}
            </div>
            <h3 className="font-extrabold text-gray-900 dark:text-white text-xl">{user.fullName}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{user.email}</p>
            <div className="mt-3">
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                user.role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
                  : user.role === 'TEACHER'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
              }`}>
                {user.role === 'STUDENT' ? '🎓 SINH VIÊN' : user.role === 'TEACHER' ? '👨‍🏫 GIẢNG VIÊN' : '🛡️ ADMIN'}
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] text-gray-400">
              Chi tiết Hồ sơ
            </h4>

            {user.studentCode && (
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-gray-500 dark:text-slate-400">Mã số Sinh viên (MSSV):</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{user.studentCode}</span>
              </div>
            )}

            {user.teacherCode && (
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-gray-500 dark:text-slate-400">Mã cán bộ Giảng viên:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{user.teacherCode}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-gray-500 dark:text-slate-400">Lớp sinh hoạt / Khoa:</span>
              <span className="font-semibold text-gray-800 dark:text-slate-200">
                {user.role === 'STUDENT' ? 'CNTT-K65' : user.department || 'Khoa CNTT'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-gray-500 dark:text-slate-400">Trạng thái tài khoản:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Hoạt động (Active)
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Built-in Change Password Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-5">
            <div className="p-3 bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Đổi Mật khẩu Tài khoản</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Đổi mật khẩu định kỳ để tăng cường độ an toàn cho tài khoản cá nhân
              </p>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl text-xs font-semibold flex items-start gap-3 border ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-500/10 border-red-200 text-red-800 dark:text-red-300'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Mật khẩu Hiện tại
              </label>
              <div className="relative rounded-xl shadow-xs">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Mật khẩu Mới
              </label>
              <div className="relative rounded-xl shadow-xs">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Xác nhận Mật khẩu Mới
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Cập nhật Mật khẩu</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
