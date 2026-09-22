import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Globe, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { AuthUser } from '../types';

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
  const [language, setLanguage] = useState<'VI' | 'EN'>('VI');
  const [showSubmenu, setShowSubmenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSubmenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                      {user.role === 'STUDENT' ? `MSSV: ${user.studentCode}` : `Mã GV: ${user.teacherCode}`}
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
                  <span className="font-semibold text-slate-900">Thông tin tài khoản</span>
                  <span className="text-[10px] text-slate-500">Xem hồ sơ & Đổi mật khẩu</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* 2. Menu Item with Submenu for Language (Flyout Submenu) */}
            <div
              className="relative group"
              onMouseEnter={() => setShowSubmenu(true)}
              onMouseLeave={() => setShowSubmenu(false)}
            >
              <button
                type="button"
                onClick={() => setShowSubmenu(!showSubmenu)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-900">Ngôn ngữ / Language</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                    {language === 'VI' ? 'Tiếng Việt' : 'English'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>

              {/* Flyout Submenu Panel */}
              {showSubmenu && (
                <div className="absolute right-full top-0 mr-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-right-2 duration-150 space-y-1">
                  <span className="block px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Chọn ngôn ngữ
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('VI');
                      setShowSubmenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      language === 'VI'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>🇻🇳 Tiếng Việt</span>
                    {language === 'VI' && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('EN');
                      setShowSubmenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      language === 'EN'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>🇬🇧 English</span>
                    {language === 'EN' && <Check className="w-3.5 h-3.5 text-white" />}
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
              <span>Đăng xuất khỏi hệ thống</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
