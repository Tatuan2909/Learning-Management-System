import React, { useState, useEffect } from 'react';
import { User, Lock, Key, ShieldCheck, Mail, GraduationCap, CheckCircle2, AlertCircle, Save, Eye, EyeOff } from 'lucide-react';
import { AuthUser } from '../types';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  user: AuthUser;
}

export const ProfilePage: React.FC<Props> = ({ user }) => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/auth/me?userId=${user.userId}`);
        setProfile(res.data);
      } catch (e) {
        console.error('Lỗi tải thông tin hồ sơ:', e);
      }
    };
    fetchProfile();
  }, [user.userId]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: t('passwordEmptyError') });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: t('passwordLengthError') });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: t('passwordMismatchError') });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await api.post('/auth/change-password', {
        userId: user.userId,
        currentPassword,
        newPassword
      });
      setMessage({ type: 'success', text: t('passwordSuccessMsg') });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Mật khẩu hiện tại không chính xác hoặc không thể cập nhật. Vui lòng thử lại.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto text-slate-900">
      {/* Softer, Gentle Page Header */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-slate-50 rounded-3xl p-8 text-slate-800 shadow-2xs border border-blue-100/80 relative overflow-hidden w-full">
        <div className="relative z-10 max-w-2xl">
          <span className="bg-blue-100/80 text-blue-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-3 border border-blue-200/60">
            <User className="w-3.5 h-3.5 text-blue-600" />
            {t('profilePageBadge')}
          </span>
          <h2 className="text-3xl font-extrabold leading-tight text-slate-900">
            {t('profilePageTitle')}
          </h2>
          <p className="text-slate-600 text-sm mt-2 leading-relaxed">
            {t('profilePageSubtitle')}
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Details Card - Pure White */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
            <div className="w-24 h-24 rounded-full bg-blue-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 border-4 border-slate-100 mb-4">
              {user.fullName.charAt(0)}
            </div>
            <h3 className="font-extrabold text-slate-900 text-xl">{user.fullName}</h3>
            <p className="text-xs text-slate-500 mt-1">{user.email}</p>
            <div className="mt-3">
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                user.role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-700'
                  : user.role === 'TEACHER'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {user.role === 'STUDENT' ? t('studentBadge') : user.role === 'TEACHER' ? t('teacherBadge') : t('adminBadge')}
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              {t('profileDetails')}
            </h4>

            {user.studentCode && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500">{t('studentCodeLabel')}</span>
                <span className="font-mono font-bold text-blue-600">{user.studentCode}</span>
              </div>
            )}

            {user.teacherCode && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500">{t('teacherCodeLabel')}</span>
                <span className="font-mono font-bold text-indigo-600">{user.teacherCode}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-500">{t('classOrDeptLabel')}</span>
              <span className="font-semibold text-slate-800">
                {user.role === 'STUDENT' ? 'CNTT-K65' : user.department || 'Khoa CNTT'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-500">{t('accountStatusLabel')}</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('activeStatus')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Built-in Change Password Form - Pure White */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">{t('changePasswordTitle')}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('changePasswordDesc')}
              </p>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl text-xs font-semibold flex items-start gap-3 border ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t('currentPasswordLabel')}
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t('currentPasswordPlaceholder')}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t('newPasswordLabel')}
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('newPasswordPlaceholder')}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t('confirmPasswordLabel')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirmPasswordPlaceholder')}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('updatingPasswordBtn')}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t('updatePasswordBtn')}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
