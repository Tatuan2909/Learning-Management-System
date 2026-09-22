import React, { useState } from 'react';
import {
  ArrowLeft,
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
  List
} from 'lucide-react';
import { PostLessonQuiz } from './PostLessonQuiz';

interface Props {
  courseId?: string;
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

export const CourseStudyPage: React.FC<Props> = ({ courseId, onBack }) => {
  // Mobile sidebar drawer open state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Collapse all state for main view
  const [allCollapsed, setAllCollapsed] = useState(false);

  // Sections data modeled after user screenshot
  const [sections, setSections] = useState<Section[]>([
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
          isCompleted: false,
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
          title: 'Các thông báo',
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
          title: 'Luyện tập 1',
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
          title: 'Diễn đàn hỏi đáp',
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
      isLocked: true, // Locked until Week 1 quiz is completed!
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
          title: 'Luyện tập 2',
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
  ]);

  // Currently active selected item to view in viewer mode
  const [activeItem, setActiveItem] = useState<CurriculumItem>(sections[0].items[0]);

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

  // Handle Quiz Passed callback -> Unlocks Week 2!
  const handleQuizPassed = () => {
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
    alert('🎉 Chúc mừng! Bạn đã hoàn thành bài trắc nghiệm. Tuần 2 (Week 2) đã được mở khóa!');
  };

  // Render Activity Icon helper with harmonious pastel contrast colors
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

  // Reusable Sidebar Tree Component (Clean Light Theme)
  const renderSidebarTree = () => (
    <div className="space-y-2">
      <div className="pb-2.5 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Nội dung chương trình học</span>
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
          Curriculum Tree
        </span>
      </div>

      {sections.map((section) => {
        const isSectionActive = section.id === 'section-intro';

        return (
          <div key={section.id} className="space-y-1">
            {/* Section Header Item */}
            <button
              onClick={() => toggleSection(section.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 ${
                isSectionActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : section.isLocked
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                {section.isExpanded ? (
                  <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 ${isSectionActive ? 'text-white' : 'text-slate-500'}`} />
                ) : (
                  <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isSectionActive ? 'text-white' : 'text-slate-500'}`} />
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
                  const isActive = activeItem.id === item.id;

                  return (
                    <button
                      key={item.id}
                      disabled={section.isLocked || item.isLocked}
                      onClick={() => {
                        setActiveItem(item);
                        setMobileSidebarOpen(false); // Close mobile drawer when selected
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 shadow-2xs'
                          : item.isLocked || section.isLocked
                          ? 'opacity-40 cursor-not-allowed text-slate-400'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Dot indicator: Filled green dot if completed, hollow dot if todo */}
                        {item.isCompleted ? (
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-2xs bg-emerald-500" title="Hoàn thành"></span>
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full border-2 border-slate-400 flex-shrink-0" title="Chưa xong"></span>
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

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col w-full text-slate-900 font-sans transition-colors duration-200">
      {/* Top Header Navbar - Bright White */}
      <div className="bg-white text-slate-900 border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs sticky top-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 hover:text-slate-900 transition-all flex items-center gap-1.5 text-xs font-bold border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại Khóa học</span>
          </button>

          {/* Mobile Drawer Trigger Button */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-blue-200"
          >
            <List className="w-4 h-4" />
            <span>Nội dung ({sections.reduce((acc, s) => acc + s.items.filter(i => i.isCompleted).length, 0)}/10)</span>
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
            <span className="text-xs font-bold text-emerald-600">40% Hoàn thành</span>
          </div>
          <div className="w-20 sm:w-28 bg-slate-100 border border-slate-200 h-2.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[40%] rounded-full shadow-2xs"></div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer (< lg screens) */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>

          {/* Drawer content panel */}
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

        {/* Right Main Content Area */}
        <div className="col-span-1 lg:col-span-9 p-3 sm:p-6 space-y-6 overflow-y-auto">
          {/* Active Item Workspace Viewer Card */}
          {activeItem && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  {renderActivityIcon(activeItem.type, activeItem.subtitle)}
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 inline-block">
                      {activeItem.type}
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mt-1 leading-snug">
                      {activeItem.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => toggleItemCompletion(activeItem.id)}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 shadow-2xs ${
                    activeItem.isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white border border-slate-200'
                  }`}
                >
                  {activeItem.isCompleted ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Đã hoàn thành (Done)</span>
                    </>
                  ) : (
                    <span>Đánh dấu Hoàn thành</span>
                  )}
                </button>
              </div>

              {/* Dynamic Content Viewer */}
              {activeItem.type === 'SCORM' && (
                <div className="space-y-4">
                  <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video w-full shadow-lg">
                    <iframe
                      className="w-full h-full"
                      src={activeItem.contentUrl || 'https://www.youtube.com/embed/d95475151'}
                      title={activeItem.title}
                      allowFullScreen
                    ></iframe>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    💡 <strong>Bài giảng SCORM</strong>: Xem hết bài giảng video ở trên rồi bấm nút <strong>"Đánh dấu Hoàn thành"</strong> ở góc phải để mở khóa phần Bài trắc nghiệm.
                  </p>
                </div>
              )}

              {activeItem.type === 'PDF' && (
                <div className="p-6 sm:p-8 bg-slate-50 rounded-2xl text-center space-y-3 border border-slate-200">
                  <FileText className="w-12 h-12 text-rose-500 mx-auto" />
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    Tài liệu PDF: {activeItem.title}
                  </p>
                  <a
                    href={activeItem.contentUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Mở / Tải tài liệu PDF</span>
                  </a>
                </div>
              )}

              {activeItem.type === 'QUIZ' && (
                <div className="pt-2">
                  <PostLessonQuiz onNextLesson={handleQuizPassed} />
                </div>
              )}
            </div>
          )}

          {/* Section Accordion Cards Matching Moodle Layout */}
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition-colors"
            >
              {/* Card Section Header */}
              <div className="p-3.5 sm:p-4 bg-white flex items-center justify-between border-b border-slate-100">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center gap-2.5 text-left font-extrabold text-base sm:text-lg text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    {section.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <span className="truncate">{section.title}</span>
                </button>

                {section.id === 'section-intro' && (
                  <button
                    onClick={handleToggleCollapseAll}
                    className="text-xs text-blue-600 hover:underline font-bold whitespace-nowrap pl-2"
                  >
                    {allCollapsed ? 'Expand all' : 'Collapse all'}
                  </button>
                )}
              </div>

              {/* Card Section Body */}
              {section.isExpanded && (
                <div className="p-4 sm:p-5 space-y-5">
                  {/* Learning Outcome Bullet Points if available */}
                  {section.description && (
                    <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs text-slate-700 border border-slate-200">
                      <ul className="space-y-1.5 list-disc list-inside leading-relaxed">
                        {section.description.map((desc, idx) => (
                          <li key={idx}>{desc}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Section Activity List Items */}
                  <div className="space-y-1.5 divide-y divide-slate-100">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setActiveItem(item)}
                        className={`pt-2.5 first:pt-0 pb-1 flex items-center justify-between gap-3 group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all ${
                          activeItem.id === item.id ? 'bg-blue-50/70' : ''
                        }`}
                      >
                        {/* Left Activity Type Icon & Title */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {renderActivityIcon(item.type, item.subtitle)}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-xs text-blue-700 group-hover:underline truncate">
                              {item.title}
                            </h4>
                          </div>
                        </div>

                        {/* Right Status Badge Toggle: "To do ⌄" or "✓ Done ⌄" */}
                        <div className="flex-shrink-0">
                          {item.isCompleted ? (
                            <button
                              onClick={(e) => toggleItemCompletion(item.id, e)}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-2xs hover:bg-emerald-100"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Done</span>
                              <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => toggleItemCompletion(item.id, e)}
                              className="px-2.5 py-1 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs hover:bg-slate-100"
                            >
                              <span>To do</span>
                              <ChevronDown className="w-3 h-3 ml-0.5 text-slate-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
