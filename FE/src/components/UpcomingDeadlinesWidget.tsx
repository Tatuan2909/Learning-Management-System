import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, ArrowRight, BookOpen, FileText } from 'lucide-react';
import { UpcomingDeadline } from '../types';
import api from '../api/axios';

interface Props {
  onSelectDeadline?: (deadline: UpcomingDeadline) => void;
}

export const UpcomingDeadlinesWidget: React.FC<Props> = ({ onSelectDeadline }) => {
  const [deadlines, setDeadlines] = useState<UpcomingDeadline[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeadlines = async () => {
    try {
      setLoading(true);
      // Demo Student ID
      const response = await api.get<UpcomingDeadline[]>('/student/upcoming-deadlines?studentId=33333333-3333-3333-3333-333333333333');
      setDeadlines(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Lỗi tải danh sách deadline:', err);
      // Fallback mock data if server isn't running yet
      setDeadlines([
        {
          id: 'a1',
          title: 'Bài tập 1: Lập trình API Đăng nhập JWT (Gấp)',
          courseCode: 'INT3306',
          courseTitle: 'Lập trình Web C# .NET 8 & ReactJS',
          type: 'ASSIGNMENT',
          dueDate: new Date(Date.now() + 14 * 3600 * 1000).toISOString(),
          remainingSeconds: 14 * 3600,
          urgency: 'RED',
          maxScore: 100,
          targetUrl: '/assignments/1'
        },
        {
          id: 'a2',
          title: 'Bài tập 2: Thiết kế Database Schema EF Core',
          courseCode: 'INT3306',
          courseTitle: 'Lập trình Web C# .NET 8 & ReactJS',
          type: 'ASSIGNMENT',
          dueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
          remainingSeconds: 48 * 3600,
          urgency: 'YELLOW',
          maxScore: 100,
          targetUrl: '/assignments/2'
        },
        {
          id: 'a3',
          title: 'Bài tập 3: Xây dựng UI Widget Deadlines với React & Tailwind',
          courseCode: 'INT3306',
          courseTitle: 'Lập trình Web C# .NET 8 & ReactJS',
          type: 'ASSIGNMENT',
          dueDate: new Date(Date.now() + 120 * 3600 * 1000).toISOString(),
          remainingSeconds: 120 * 3600,
          urgency: 'GREEN',
          maxScore: 100,
          targetUrl: '/assignments/3'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadlines();

    // Timer interval to tick down remaining seconds in real-time
    const timer = setInterval(() => {
      setDeadlines((prevDeadlines) =>
        prevDeadlines
          .map((item) => {
            const nextSeconds = item.remainingSeconds - 1;
            let urgency: 'RED' | 'YELLOW' | 'GREEN' = item.urgency;
            if (nextSeconds < 24 * 3600) urgency = 'RED';
            else if (nextSeconds <= 72 * 3600) urgency = 'YELLOW';
            else urgency = 'GREEN';

            return {
              ...item,
              remainingSeconds: Math.max(0, nextSeconds),
              urgency
            };
          })
          .filter((item) => item.remainingSeconds > 0)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatRemainingTime = (totalSeconds: number) => {
    if (totalSeconds <= 0) return 'Đã hết hạn';
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (days > 0) return `${days} ngày ${hours} giờ`;
    if (hours > 0) return `${hours} giờ ${minutes} phút`;
    return `${minutes} phút ${seconds} giây`;
  };

  const getUrgencyBadge = (urgency: 'RED' | 'YELLOW' | 'GREEN') => {
    switch (urgency) {
      case 'RED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Còn dưới 24h
          </span>
        );
      case 'YELLOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Còn 1 - 3 ngày
          </span>
        );
      case 'GREEN':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Còn trên 3 ngày
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xs border border-slate-200 overflow-hidden">
      {/* Soothing, Calm Header (Non-glaring) */}
      <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100/70 text-blue-700 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base leading-tight text-slate-900">Hạn nộp bài tập sắp tới</h3>
            <p className="text-xs text-slate-500 mt-0.5">Các bài tập & bài kiểm tra chưa nộp cần hoàn thành</p>
          </div>
        </div>
        <span className="bg-slate-200/80 text-slate-700 text-xs px-3 py-1 rounded-full font-bold">
          {deadlines.length} bài nộp
        </span>
      </div>

      {/* Content */}
      <div className="p-6 bg-white">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-xs font-semibold">Đang tải danh sách hạn nộp...</p>
          </div>
        ) : deadlines.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">Tuyệt vời! Bạn không có bài tập nào sắp hết hạn.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {deadlines.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectDeadline && onSelectDeadline(item)}
                className={`group cursor-pointer p-4 rounded-xl border transition-all duration-150 hover:shadow-xs ${
                  item.urgency === 'RED'
                    ? 'border-rose-200/80 bg-rose-50/30 hover:bg-rose-50/60'
                    : item.urgency === 'YELLOW'
                    ? 'border-amber-200/80 bg-amber-50/30 hover:bg-amber-50/60'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                      {item.type === 'QUIZ' ? <BookOpen className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 truncate">
                        <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">{item.courseCode}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 truncate">{item.courseTitle}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex-shrink-0 self-start sm:self-center">
                    {getUrgencyBadge(item.urgency)}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Thời gian còn lại: </span>
                    <strong className={`font-bold ${item.urgency === 'RED' ? 'text-rose-600' : 'text-slate-800'}`}>
                      {formatRemainingTime(item.remainingSeconds)}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                    <span>Nộp bài ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
