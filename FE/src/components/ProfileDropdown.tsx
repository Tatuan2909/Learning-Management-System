import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Globe, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { AuthUser } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  user: AuthUser;
  onLogout: () => void;
  onOpenProfilePage: () => void;
}

export const ProfileDropdown: React.FC<Props> = ({
  user,
  onLogout,
  onOpenProfilePage
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowLanguageOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (lang: 'VI' | 'EN') => {
    setLanguage(lang);
    setShowLanguageOptions(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all focus:outline-none"
      >
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/20">
          {user.fullName.charAt(0)}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold leading-none text-slate-900 whitespace-nowrap">{user.fullName}</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full leading-none ${
                user.role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : user.role === 'TEACHER'
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}
            >
              {user.role}
            </span>
            {(user.studentCode || user.teacherCode) && (
              <span className="text-[11px] text-slate-500 font-mono leading-none whitespace-nowrap">
                • {user.studentCode || user.teacherCode}
              </span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Profile Dropdown Menu Panel (Clean Light Theme) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-visible text-slate-900 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Info Header */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
                {user.fullName.charAt(0)}
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-sm font-extrabold leading-tight text-slate-900 truncate">{user.fullName}</span>
                <span className="text-xs text-slate-500 truncate mt-0.5">{user.email}</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                    {user.role}
                  </span>
                  {(user.studentCode || user.teacherCode) && (
                    <span className="text-xs text-slate-500 font-mono">
                      {user.role === 'STUDENT' ? `${t('studentCode')}: ${user.studentCode}` : `${t('teacherCode')}: ${user.teacherCode}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Action Items */}
          <div className="p-2 space-y-1 text-xs">
            {/* 1. Thông tin tài khoản & Đổi mật khẩu -> Opens Profile Page */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenProfilePage();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">{t('accountInfo')}</span>
                  <span className="text-[10px] text-slate-500">{t('viewProfileAndChangePassword')}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* 2. Menu Item: Ngôn ngữ / Language (Inline Accordion) */}
            <div className="rounded-xl overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setShowLanguageOptions(!showLanguageOptions)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left ${
                  showLanguageOptions ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-900">{t('language')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {language === 'VI' ? 'Tiếng Việt' : 'English'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      showLanguageOptions ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Inline expandable language options - Click to select without any hover/hold issues */}
              {showLanguageOptions && (
                <div className="mt-1 ml-4 mr-1 pl-3 py-2 border-l-2 border-indigo-200 space-y-1 bg-slate-50/80 rounded-r-xl animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    type="button"
                    onClick={() => handleSelectLanguage('VI')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      language === 'VI'
                        ? 'bg-blue-600 text-white shadow-2xs font-bold'
                        : 'text-slate-700 hover:bg-slate-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">🇻🇳</span>
                      <span>Tiếng Việt</span>
                    </div>
                    {language === 'VI' && <Check className="w-4 h-4 text-white" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectLanguage('EN')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      language === 'EN'
                        ? 'bg-blue-600 text-white shadow-2xs font-bold'
                        : 'text-slate-700 hover:bg-slate-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">🇬🇧</span>
                      <span>English</span>
                    </div>
                    {language === 'EN' && <Check className="w-4 h-4 text-white" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Divider & Logout */}
          <div className="border-t border-slate-200 p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left text-xs font-bold"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
