import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  FileText,
  CheckCircle,
  Lock,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  BookOpen,
  ExternalLink,
  Box,
  FileSpreadsheet,
  Check,
  Sparkles,
  HelpCircle,
  Award,
  Link as LinkIcon,
  Menu,
  X,
  List,
  RotateCcw,
  Clock,
  Send,
  Upload,
  Download
} from 'lucide-react';
import { PostLessonQuiz } from './PostLessonQuiz';

interface Props {
  courseId?: string;
  initialActivityId?: string;
  onBack: () => void;
}

export type ActivityType =
  | 'OVERVIEW'
  | 'SCORM'
  | 'PDF'
  | 'DOCX'
  | 'LINK'
  | 'ANNOUNCEMENT'
  | 'PRACTICE'
  | 'QUIZ';

export interface CurriculumItem {
  id: string;
  title: string;
  subtitle?: string;
  type: ActivityType;
  contentUrl?: string;
  isCompleted: boolean;
  isLocked: boolean;
  quizId?: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string[];
  isExpanded: boolean;
  isLocked: boolean;
  items: CurriculumItem[];
}

const defaultSections: Section[] = [
  {
    id: 'section-intro',
    title: 'Giới thiệu học phần',
    isExpanded: true,
    isLocked: false,
    description: [
      'Trình bày được khái niệm ứng dụng di động và vai trò của ứng dụng đa nền tảng.',
      'Nhận biết được các công cụ, thư viện và thành phần cơ bản trong React Native / C# .NET API.',
      'Giải thích được cách hoạt động của JavaScript runtime, bridge, props, state, hooks và APIs.',
      'Phân biệt được component, style, layout và cơ chế truy cập tài nguyên thiết bị.',
      'Vận dụng được kiến thức để cài đặt môi trường, xây dựng giao diện, gọi API, lưu trữ dữ liệu và debug ứng dụng.',
      'Cài đặt và xuất bản được ứng dụng trên Android/iOS theo quy trình chuẩn.',
      'Hình thành thái độ chủ động học tập, tuân thủ quyền riêng tư, bảo mật dữ liệu và chuẩn mực code sạch.'
    ],
    items: [
      {
        id: 'item-overview',
        title: 'Thông tin tổng quan học phần: Phát triển ứng dụng Mobile & Web đa nền tảng',
        type: 'OVERVIEW',
        isCompleted: true,
        isLocked: false
      },
      {
        id: 'item-scorm-intro',
        title: 'Scorm giới thiệu tổng quan học phần lập trình ứng dụng mobile & web đa nền tảng',
        type: 'SCORM',
        contentUrl: 'https://www.youtube.com/embed/d95475151',
        isCompleted: true,
        isLocked: false
      },
      {
        id: 'item-de-cuong-pdf',
        title: 'Đề cương chi tiết học phần',
        subtitle: 'PDF',
        type: 'PDF',
        contentUrl: 'https://example.com/docs/de-cuong.pdf',
        isCompleted: false,
        isLocked: false
      },
      {
        id: 'item-tai-lieu-pdf',
        title: 'Tài liệu học phần (file pdf)',
        type: 'PDF',
        contentUrl: 'https://example.com/docs/tai-lieu-hoc-phan.pdf',
        isCompleted: false,
        isLocked: false
      },
      {
        id: 'item-huong-dan-pdf',
        title: 'Hướng dẫn học tập',
        subtitle: 'PDF',
        type: 'PDF',
        contentUrl: 'https://example.com/docs/huong-dan.pdf',
        isCompleted: false,
        isLocked: false
      },
      {
        id: 'item-btl-docx',
        title: 'Danh sách đề tài Bài tập lớn (gợi ý)',
        subtitle: 'DOCX',
        type: 'DOCX',
        contentUrl: 'https://example.com/docs/de-tai-btl.docx',
        isCompleted: false,
        isLocked: false
      },
      {
        id: 'item-github-link',
        title: 'Mẫu phát triển bài tập lớn trên GitHub',
        type: 'LINK',
        contentUrl: 'https://github.com/Tatuan2909/Learning-Management-System',
        isCompleted: false,
        isLocked: false
      },
      {
        id: 'item-thong-bao',
        title: 'Các thông báo học tập',
        type: 'ANNOUNCEMENT',
        isCompleted: false,
        isLocked: false
      }
    ]
  },
  {
    id: 'section-week1',
    title: 'Week 1: 24 August - 30 August',
    isExpanded: true,
    isLocked: false,
    items: [
      {
        id: 'item-week1-scorm',
        title: 'Bài 1: Bài giảng SCORM Tổng quan Clean Architecture & Web API',
        type: 'SCORM',
        contentUrl: 'https://www.youtube.com/embed/d95475151',
        isCompleted: true,
        isLocked: false
      },
      {
        id: 'item-week1-pdf',
        title: 'Tài liệu (file pdf) cho bài học 1',
        type: 'PDF',
        contentUrl: 'https://example.com/docs/week1.pdf',
        isCompleted: true,
        isLocked: false
      },
      {
        id: 'item-week1-practice',
        title: 'Luyện tập 1: Xây dựng Endpoint RESTful API với C# .NET 8',
        type: 'PRACTICE',
        isCompleted: false,
        isLocked: false
      },
      {
        id: 'item-week1-quiz',
        title: 'Bài trắc nghiệm đánh giá thường xuyên Bài 1',
        type: 'QUIZ',
        quizId: '66666666-6666-6666-6666-666666666666',
        isCompleted: false,
        isLocked: false
      },
      {
        id: 'item-week1-forum',
        title: 'Diễn đàn hỏi đáp thảo luận Tuần 1',
        type: 'ANNOUNCEMENT',
        isCompleted: false,
        isLocked: false
      }
    ]
  },
  {
    id: 'section-week2',
    title: 'Week 2: 31 August - 6 September',
    isExpanded: false,
    isLocked: true, // Locked until Week 1 quiz is passed!
    items: [
      {
        id: 'item-week2-scorm',
        title: 'Bài 2: Tích hợp JWT Authentication & Role-Based Authorization',
        type: 'SCORM',
        contentUrl: 'https://www.youtube.com/embed/d95475151',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'item-week2-pdf',
        title: 'Tài liệu (file pdf) cho bài học 2',
        type: 'PDF',
        contentUrl: 'https://example.com/docs/week2.pdf',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'item-week2-practice',
        title: 'Luyện tập 2: Middleware Pipeline & Refresh Token Rotation',
        type: 'PRACTICE',
        isCompleted: false,
        isLocked: true
      },
      {
        id: 'item-week2-quiz',
        title: 'Bài trắc nghiệm đánh giá thường xuyên Bài 2',
        type: 'QUIZ',
        quizId: 'quiz-2',
        isCompleted: false,
        isLocked: true
      }
    ]
  }
];

export const CourseStudyPage: React.FC<Props> = ({ courseId, initialActivityId, onBack }) => {
  // Mobile sidebar drawer open state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Collapse all state for main view
  const [allCollapsed, setAllCollapsed] = useState(false);

  // Sections data
  const [sections, setSections] = useState<Section[]>(defaultSections);

  // Dedicated Activity Page State: null = viewing course outline, non-null = viewing dedicated page of that activity
  const [selectedActivity, setSelectedActivity] = useState<CurriculumItem | null>(() => {
    if (initialActivityId) {
      for (const sec of defaultSections) {
        const found = sec.items.find((i) => i.id === initialActivityId);
        if (found) return found;
      }
    }
    return null;
  });

  // Calculate total completed items
  const allItems = sections.flatMap((s) => s.items);
  const completedCount = allItems.filter((i) => i.isCompleted).length;
  const progressPercent = Math.round((completedCount / allItems.length) * 100);

  // Find current activity index for next/previous navigation
  const currentIndex = selectedActivity ? allItems.findIndex((i) => i.id === selectedActivity.id) : -1;
  const prevActivity = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextActivity = currentIndex >= 0 && currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  // Toggle item completion state (To do <-> Done)
  const toggleItemCompletion = (itemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setSections((prevSections) =>
      prevSections.map((sec) => {
        let hasChanges = false;
        const newItems = sec.items.map((item) => {
          if (item.id === itemId) {
            hasChanges = true;
            return { ...item, isCompleted: !item.isCompleted };
          }
          return item;
        });

        return hasChanges ? { ...sec, items: newItems } : sec;
      })
    );

    // Update selectedActivity if active
    if (selectedActivity && selectedActivity.id === itemId) {
      setSelectedActivity((prev) => prev ? { ...prev, isCompleted: !prev.isCompleted } : null);
    }
  };

  // Toggle Section Collapse/Expand
  const toggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === sectionId ? { ...sec, isExpanded: !sec.isExpanded } : sec))
    );
  };

  // Toggle Collapse All / Expand All
  const handleToggleCollapseAll = () => {
    const nextState = !allCollapsed;
    setAllCollapsed(nextState);
    setSections((prev) => prev.map((sec) => ({ ...sec, isExpanded: !nextState })));
  };

  // Open dedicated page for an activity
  const handleOpenActivity = (item: CurriculumItem) => {
    if (item.isLocked) return;
    setSelectedActivity(item);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Quiz Passed callback -> Unlocks Week 2 & Marks completed
  const handleQuizPassed = () => {
    if (selectedActivity) {
      toggleItemCompletion(selectedActivity.id);
    }

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === 'section-week2') {
          return {
            ...sec,
            isLocked: false,
            isExpanded: true,
            items: sec.items.map((item) => ({ ...item, isLocked: false }))
          };
        }
        return sec;
      })
    );
    alert('🎉 Chúc mừng! Bạn đã hoàn thành xuất sắc bài trắc nghiệm. Tuần 2 (Week 2) đã được mở khóa thành công!');
  };

  // Helper to render activity icon
  const renderActivityIcon = (type: ActivityType, subtitle?: string) => {
    switch (type) {
      case 'OVERVIEW':
      case 'PDF':
        if (subtitle === 'PDF') {
          return (
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-extrabold text-[10px] shadow-2xs">
              PDF
            </div>
          );
        }
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
            <FileText className="w-4 h-4" />
          </div>
        );
      case 'SCORM':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
            <Box className="w-4.5 h-4.5" />
          </div>
        );
      case 'DOCX':
        return (
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 font-extrabold text-[9px] shadow-2xs">
            DOCX
          </div>
        );
      case 'LINK':
        return (
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-2xs">
            <LinkIcon className="w-4 h-4" />
          </div>
        );
      case 'ANNOUNCEMENT':
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-2xs">
            <MessageSquare className="w-4 h-4" />
          </div>
        );
      case 'PRACTICE':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
            <Award className="w-4 h-4" />
          </div>
        );
      case 'QUIZ':
        return (
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
            <HelpCircle className="w-4 h-4" />
          </div>
        );
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  // Reusable Sidebar Tree Component
  const renderSidebarTree = () => (
    <div className="space-y-2">
      <div className="pb-2.5 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Danh mục học phần</span>
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
          {sections.length} Chương
        </span>
      </div>

      {sections.map((section) => {
        return (
          <div key={section.id} className="space-y-1">
            {/* Section Header Item */}
            <button
              onClick={() => toggleSection(section.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 ${
                section.isLocked
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                {section.isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                )}
                <span className="truncate">{section.title}</span>
              </div>

              {section.isLocked && (
                <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              )}
            </button>

            {/* Sub-items tree list */}
            {section.isExpanded && (
              <div className="pl-3 sm:pl-4 space-y-1 mt-1">
                {section.items.map((item) => {
                  const isCurrent = selectedActivity?.id === item.id;

                  return (
                    <button
                      key={item.id}
                      disabled={section.isLocked || item.isLocked}
                      onClick={() => handleOpenActivity(item)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-all duration-150 ${
                        isCurrent
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : item.isLocked || section.isLocked
                          ? 'opacity-40 cursor-not-allowed text-slate-400'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {item.isCompleted ? (
                          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-2xs ${isCurrent ? 'bg-white' : 'bg-emerald-500'}`} title="Hoàn thành"></span>
                        ) : (
                          <span className={`w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 ${isCurrent ? 'border-white' : 'border-slate-400'}`} title="Chưa xong"></span>
                        )}
                        <span className="truncate text-[11.5px]">{item.title}</span>
                      </div>

                      {item.isLocked && (
                        <Lock className="w-3 h-3 flex-shrink-0 text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // =========================================================================
  // VIEW MODE 1: DEDICATED ACTIVITY PAGE (MỖI PHẦN LÀ 1 PAGE RIÊNG BIỆT)
  // =========================================================================
  if (selectedActivity) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col w-full text-slate-900 font-sans antialiased">
        {/* Dedicated Activity Header & Breadcrumb Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs px-4 sm:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Back to Course Outline Button */}
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all border border-slate-200 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại Khóa học</span>
              </button>

              <div className="min-w-0 border-l border-slate-200 pl-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                    {selectedActivity.type}
                  </span>
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline truncate">
                    INT3306 • Lập trình Web C# .NET 8 & ReactJS
                  </span>
                </div>
                <h1 className="font-extrabold text-sm sm:text-base text-slate-900 truncate mt-0.5 max-w-xl">
                  {selectedActivity.title}
                </h1>
              </div>
            </div>

            {/* Quick Actions & Navigation Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              {/* Mark Completed Toggle */}
              <button
                onClick={() => toggleItemCompletion(selectedActivity.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  selectedActivity.isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${selectedActivity.isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{selectedActivity.isCompleted ? 'Đã hoàn thành' : 'Đánh dấu Hoàn thành'}</span>
              </button>

              {/* Prev / Next activity buttons */}
              <div className="flex items-center gap-1">
                <button
                  disabled={!prevActivity || prevActivity.isLocked}
                  onClick={() => prevActivity && handleOpenActivity(prevActivity)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 border border-slate-200 text-xs font-bold transition-all"
                  title={prevActivity ? `Bài trước: ${prevActivity.title}` : 'Không có bài trước'}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={!nextActivity || nextActivity.isLocked}
                  onClick={() => nextActivity && handleOpenActivity(nextActivity)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 border border-slate-200 text-xs font-bold transition-all"
                  title={nextActivity ? `Bài tiếp theo: ${nextActivity.title}` : 'Không có bài tiếp theo'}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dedicated Activity Body Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {/* ================================================================= */}
          {/* 1. QUIZ DEDICATED PAGE                                            */}
          {/* ================================================================= */}
          {selectedActivity.type === 'QUIZ' && (
            <div className="space-y-6">
              <PostLessonQuiz
                quizId={selectedActivity.quizId}
                onBack={() => setSelectedActivity(null)}
                onNextLesson={handleQuizPassed}
              />
            </div>
          )}

          {/* ================================================================= */}
          {/* 2. SCORM / VIDEO DEDICATED PAGE                                   */}
          {/* ================================================================= */}
          {selectedActivity.type === 'SCORM' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
                <div>
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full uppercase">
                    Bài giảng SCORM Video tương tác
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                    {selectedActivity.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Xem hết nội dung bài giảng để nắm chắc kiến thức trước khi làm bài tập và bài trắc nghiệm.
                  </p>
                </div>

                {/* Theater Video Player */}
                <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-video w-full shadow-lg border border-slate-800">
                  <iframe
                    className="w-full h-full"
                    src={selectedActivity.contentUrl || 'https://www.youtube.com/embed/d95475151'}
                    title={selectedActivity.title}
                    allowFullScreen
                  ></iframe>
                </div>

                {/* Study Notes & Completion Action */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">Hướng dẫn học tập:</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Bạn có thể ghi chú bài giảng và xem lại bất kỳ lúc nào. Sau khi học xong, nhấn nút xác nhận hoàn thành bên cạnh.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      toggleItemCompletion(selectedActivity.id);
                      if (nextActivity && !nextActivity.isLocked) {
                        handleOpenActivity(nextActivity);
                      }
                    }}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Hoàn thành & Sang bài tiếp</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 3. PDF / DOCX DOCUMENT DEDICATED PAGE                             */}
          {/* ================================================================= */}
          {(selectedActivity.type === 'PDF' || selectedActivity.type === 'DOCX') && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
                  <FileText className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-xs font-bold bg-rose-100 text-rose-800 px-3 py-1 rounded-full uppercase">
                    Tài liệu học tập ({selectedActivity.type})
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3">
                    {selectedActivity.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
                    Tài liệu phục vụ bài học và ôn tập kiến thức chuyên môn. Bạn có thể xem trực tuyến hoặc tải về máy cá nhân.
                  </p>
                </div>

                {/* PDF Viewer / Download actions */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 max-w-lg mx-auto space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-200 pb-3">
                    <span>Định dạng: <strong>{selectedActivity.type}</strong></span>
                    <span>Dung lượng: <strong>2.4 MB</strong></span>
                    <span>Số trang: <strong>28 trang</strong></span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href={selectedActivity.contentUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Xem trực tuyến</span>
                    </a>
                    <a
                      href={selectedActivity.contentUrl || '#'}
                      download
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-2 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Tải về máy (.pdf)</span>
                    </a>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => toggleItemCompletion(selectedActivity.id)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Đánh dấu đã đọc & nghiên cứu xong</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 4. PRACTICE / ASSIGNMENT DEDICATED PAGE                           */}
          {/* ================================================================= */}
          {selectedActivity.type === 'PRACTICE' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
                <div>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase">
                    Bài luyện tập thực hành & Nộp bài
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                    {selectedActivity.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Thực hành viết mã nguồn và đóng gói mã nguồn (.zip) hoặc link Git repository để nộp bài đánh giá.
                  </p>
                </div>

                {/* Requirements Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs leading-relaxed text-slate-700">
                  <h4 className="font-bold text-slate-900 text-sm">Yêu cầu thực hành:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Khởi tạo Web API project với .NET 8 SDK sử dụng kiến trúc Clean Architecture.</li>
                    <li>Triển khai tầng Domain với Entity Course, Student và Lesson.</li>
                    <li>Sử dụng Entity Framework Core với PostgreSQL Migration.</li>
                    <li>Đảm bảo các Endpoint tuân thủ quy chuẩn RESTful và phản hồi đúng HTTP Status Code.</li>
                  </ul>
                </div>

                {/* Submission Dropzone */}
                <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center space-y-3 hover:border-blue-500 transition-colors bg-slate-50/50">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                  <div>
                    <h5 className="font-bold text-sm text-slate-800">Kéo thả file bài làm tại đây hoặc duyệt file</h5>
                    <p className="text-xs text-slate-400 mt-0.5">Hỗ trợ file nén .ZIP, .RAR hoặc .PDF (tối đa 25MB)</p>
                  </div>
                  <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all">
                    Chọn file bài nộp
                  </button>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      toggleItemCompletion(selectedActivity.id);
                      alert('Bạn đã nộp bài tập thực hành thành công!');
                    }}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Nộp bài & Hoàn thành</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 5. ANNOUNCEMENT / FORUM DEDICATED PAGE                            */}
          {/* ================================================================= */}
          {selectedActivity.type === 'ANNOUNCEMENT' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
                <div>
                  <span className="text-xs font-bold bg-purple-100 text-purple-800 px-3 py-1 rounded-full uppercase">
                    Bảng tin & Diễn đàn trao đổi
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                    {selectedActivity.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Không gian thảo luận, đặt câu hỏi cho Giảng viên và bạn cùng lớp.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200 text-xs text-purple-900 space-y-2">
                  <strong className="block text-sm font-bold">Thông báo từ Giảng viên (TS. Nguyễn Văn A):</strong>
                  <p className="leading-relaxed">
                    Chào các em, tuần này chúng ta học về Clean Architecture và RESTful API. Hãy xem trước slide PDF và làm bài trắc nghiệm cuối tuần 1 để kịp mở khóa nội dung tuần 2 nhé!
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm">Gửi câu hỏi hoặc ý kiến thảo luận:</h4>
                  <textarea
                    rows={3}
                    placeholder="Nhập nội dung câu hỏi của bạn..."
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-blue-600"
                  ></textarea>
                  <button className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi thảo luận</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 6. LINK / OVERVIEW DEDICATED PAGE                                 */}
          {/* ================================================================= */}
          {(selectedActivity.type === 'LINK' || selectedActivity.type === 'OVERVIEW') && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
                <div>
                  <span className="text-xs font-bold bg-teal-100 text-teal-800 px-3 py-1 rounded-full uppercase">
                    Liên kết & Tài nguyên ngoài
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                    {selectedActivity.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Tài nguyên mã nguồn tham khảo được lưu trữ trên kho lưu trữ trực tuyến.
                  </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Kho mã nguồn mẫu: <strong>{selectedActivity.contentUrl || 'https://github.com/Tatuan2909/Learning-Management-System'}</strong>
                  </p>
                  <a
                    href={selectedActivity.contentUrl || 'https://github.com/Tatuan2909/Learning-Management-System'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Mở kho lưu trữ GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 2: COURSE OUTLINE PAGE (GIAO DIỆN TỔNG QUAN KHÓA HỌC)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col w-full text-slate-900 font-sans transition-colors duration-200">
      {/* Top Header Navbar - Course Outline View */}
      <header className="bg-white text-slate-900 border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs sticky top-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 hover:text-slate-900 transition-all flex items-center gap-1.5 text-xs font-bold border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại danh sách Khóa học</span>
          </button>

          {/* Mobile Drawer Trigger Button */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-blue-200"
          >
            <List className="w-4 h-4" />
            <span>Nội dung ({completedCount}/{allItems.length})</span>
          </button>

          <div className="min-w-0 border-l border-slate-200 pl-3">
            <h1 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight truncate max-w-[240px] sm:max-w-md lg:max-w-xl">
              20241_Phát triển ứng dụng Mobile đa nền tảng (2+1)_12626W.1
            </h1>
            <p className="text-[11px] text-blue-600 font-mono font-semibold hidden sm:block">
              Hệ thống Học tập & Quản lý Học phần LMS
            </p>
          </div>
        </div>

        {/* Dynamic Progress Indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-500 block">Tiến độ khóa học</span>
            <span className="text-xs font-bold text-emerald-600">{progressPercent}% Hoàn thành ({completedCount}/{allItems.length})</span>
          </div>
          <div className="w-20 sm:w-28 bg-slate-100 border border-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full shadow-2xs transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Drawer (< lg screens) */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>

          <div className="relative w-5/6 max-w-xs bg-white h-full p-4 overflow-y-auto shadow-2xl flex flex-col z-10 border-r border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Danh mục học phần
              </span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarTree()}
          </div>
        </div>
      )}

      {/* Main Responsive Two-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 w-full gap-0 min-h-[calc(100vh-60px)]">
        {/* Desktop Left Navigation Tree Sidebar */}
        <div className="hidden lg:block lg:col-span-3 bg-slate-50/80 border-r border-slate-200 p-3.5 space-y-2 overflow-y-auto max-h-[calc(100vh-60px)] sticky top-[60px]">
          {renderSidebarTree()}
        </div>

        {/* Right Main Course Outline Area */}
        <div className="col-span-1 lg:col-span-9 p-3 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Course Banner Card */}
          <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 p-6 sm:p-8 rounded-3xl border border-blue-100 text-slate-900 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase px-3 py-1 bg-blue-600 text-white rounded-full shadow-2xs">
                Môn học chính quy
              </span>
              <span className="text-xs text-blue-700 font-bold">Học kỳ I • Năm học 2024 - 2025</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              Phát triển ứng dụng Mobile & Web đa nền tảng
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Mã học phần: <strong>INT3306</strong> • Giảng viên: <strong>TS. Nguyễn Văn A</strong> • Chọn từng bài học bên dưới để mở giao diện học tập hoặc làm bài trắc nghiệm riêng.
            </p>
          </div>

          {/* Section Accordion Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Nội dung chương trình học theo tuần</span>
              </h3>
              <button
                onClick={handleToggleCollapseAll}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                {allCollapsed ? 'Mở rộng tất cả' : 'Thu gọn tất cả'}
              </button>
            </div>

            {sections.map((section) => (
              <div
                key={section.id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-2xs transition-colors ${
                  section.isLocked ? 'border-slate-200 opacity-75' : 'border-slate-200'
                }`}
              >
                {/* Section Header */}
                <div className="p-4 bg-white flex items-center justify-between border-b border-slate-100">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center gap-2.5 text-left font-extrabold text-base text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      {section.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                    <span className="truncate">{section.title}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {section.isLocked && (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Đang khóa (Yêu cầu qua bài trắc nghiệm Tuần 1)
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-medium">
                      {section.items.filter((i) => i.isCompleted).length} / {section.items.length} xong
                    </span>
                  </div>
                </div>

                {/* Section Body */}
                {section.isExpanded && (
                  <div className="p-4 sm:p-5 space-y-4">
                    {section.description && (
                      <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 text-xs text-slate-700 border border-slate-200">
                        <ul className="space-y-1.5 list-disc list-inside leading-relaxed">
                          {section.description.map((desc, idx) => (
                            <li key={idx}>{desc}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Activities List */}
                    <div className="space-y-2">
                      {section.items.map((item) => {
                        const isLocked = section.isLocked || item.isLocked;

                        return (
                          <div
                            key={item.id}
                            onClick={() => !isLocked && handleOpenActivity(item)}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                              isLocked
                                ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                                : 'bg-white hover:bg-blue-50/40 border-slate-200 hover:border-blue-300 cursor-pointer shadow-2xs group'
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              {renderActivityIcon(item.type, item.subtitle)}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className={`font-bold text-xs sm:text-sm truncate ${
                                    isLocked ? 'text-slate-500' : 'text-slate-900 group-hover:text-blue-700'
                                  }`}>
                                    {item.title}
                                  </h4>
                                </div>
                                <span className="text-[11px] text-slate-400">
                                  Loại: {item.type} {item.subtitle ? `• ${item.subtitle}` : ''}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Status Badge */}
                              {item.isCompleted ? (
                                <button
                                  onClick={(e) => toggleItemCompletion(item.id, e)}
                                  className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs hover:bg-emerald-100"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Done</span>
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => toggleItemCompletion(item.id, e)}
                                  className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-slate-100"
                                >
                                  <span>To do</span>
                                </button>
                              )}

                              {/* Action to Open Separate Page */}
                              {isLocked ? (
                                <div className="p-2 text-slate-400">
                                  <Lock className="w-4 h-4" />
                                </div>
                              ) : item.type === 'QUIZ' ? (
                                <button
                                  onClick={() => handleOpenActivity(item)}
                                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                                >
                                  <HelpCircle className="w-3.5 h-3.5" />
                                  <span>Làm bài trắc nghiệm</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenActivity(item)}
                                  className="p-2 text-slate-400 group-hover:text-blue-600 transition-colors"
                                  title="Mở bài học"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
