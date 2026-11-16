import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Clock, Award, Megaphone, AlertCircle, Info, X } from 'lucide-react';
import api from '../api/axios';
import { signalRService, RealtimeNotification } from '../services/signalRService';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

interface NotificationBellProps {
  userId?: string;
  onNavigateToUrl?: (url: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId, onNavigateToUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [latestToast, setLatestToast] = useState<RealtimeNotification | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch initial notifications & unread count
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [listRes, countRes] = await Promise.all([
        api.get('/notifications?pageNumber=1&pageSize=10'),
        api.get('/notifications/unread-count'),
      ]);

      const items = Array.isArray(listRes.data) ? listRes.data : listRes.data?.items || [];
      setNotifications(items);
      setUnreadCount(countRes.data?.unreadCount || 0);
    } catch (err) {
      console.warn('Không thể tải thông báo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    // Start SignalR connection and register user group
    signalRService.startConnection(userId);

    // Listen for realtime push notifications
    const unsubscribe = signalRService.onNotification((newNotif) => {
      // Show realtime toast
      setLatestToast(newNotif);

      // Increment badge and prepend to list
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [
        {
          id: newNotif.id,
          title: newNotif.title,
          message: newNotif.message,
          type: newNotif.type,
          isRead: false,
          linkUrl: newNotif.linkUrl,
          createdAt: newNotif.createdAt || new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  // Auto-dismiss realtime toast after 5s
  useEffect(() => {
    if (!latestToast) return;
    const timer = setTimeout(() => {
      setLatestToast(null);
    }, 5500);
    return () => clearTimeout(timer);
  }, [latestToast]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Lỗi khi đánh dấu thông báo đã đọc:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'GRADE':
        return <Award className="w-4 h-4 text-emerald-600" />;
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-4 h-4 text-blue-600" />;
      case 'DEADLINE':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-purple-600" />;
    }
  };

  const getTypeBg = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'GRADE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'ANNOUNCEMENT':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'DEADLINE':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-100';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        title="Thông báo"
        aria-label="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-extrabold text-white shadow-xs animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Realtime Toast Notification */}
      {latestToast && (
        <div className="fixed top-20 right-6 z-50 max-w-sm bg-white border border-blue-200 rounded-2xl shadow-2xl p-4 text-slate-900 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className={`p-2 rounded-xl border ${getTypeBg(latestToast.type)}`}>
                {getTypeIcon(latestToast.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">
                    Thời gian thực
                  </span>
                  <span className="text-xs text-slate-400">Vừa xong</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 mt-1">{latestToast.title}</h4>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{latestToast.message}</p>
              </div>
            </div>
            <button
              onClick={() => setLatestToast(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đọc tất cả</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">Đang tải thông báo...</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <Bell className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                <span>Bạn không có thông báo nào.</span>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!item.isRead) markAsRead(item.id);
                    if (item.linkUrl && onNavigateToUrl) {
                      onNavigateToUrl(item.linkUrl);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-3 ${
                    !item.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className={`p-2 rounded-xl border mt-0.5 shrink-0 ${getTypeBg(item.type)}`}>
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs font-bold truncate ${
                          !item.isRead ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="Chưa đọc" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{item.message}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{item.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
            <button
              onClick={() => fetchNotifications()}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors w-full py-1"
            >
              Làm mới danh sách
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
