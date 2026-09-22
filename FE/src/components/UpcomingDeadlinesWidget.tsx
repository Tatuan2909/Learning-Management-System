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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 animate-pulse border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            Còn dưới 24h
          </span>
        );
      case 'YELLOW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Còn 1 - 3 ngày
          </span>
        );
      case 'GREEN':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Còn trên 3 ngày
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Hạn nộp bài tập sắp tới</h3>
            <p className="text-xs text-blue-100 mt-0.5">Các bài tập & bài kiểm tra chưa nộp cần hoàn thành</p>
          </div>
        </div>
        <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-medium">
          {deadlines.length} bài nộp
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm">Đang tải danh sách hạn nộp...</p>
          </div>
        ) : deadlines.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <p className="font-medium text-gray-700">Tuyệt vời! Bạn không có bài tập nào sắp hết hạn.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deadlines.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectDeadline && onSelectDeadline(item)}
                className={`group cursor-pointer p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  item.urgency === 'RED'
                    ? 'border-red-200 bg-red-50/30 hover:border-red-400'
                    : item.urgency === 'YELLOW'
                    ? 'border-amber-200 bg-amber-50/20 hover:border-amber-400'
                    : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-gray-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {item.type === 'QUIZ' ? <BookOpen className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.courseCode}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{item.courseTitle}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  {getUrgencyBadge(item.urgency)}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Thời gian còn lại: </span>
                    <strong className={`font-semibold ${item.urgency === 'RED' ? 'text-red-600 font-bold' : 'text-gray-900'}`}>
                      {formatRemainingTime(item.remainingSeconds)}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1 font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
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
