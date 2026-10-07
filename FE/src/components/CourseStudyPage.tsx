import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import { CourseDetail } from '../types';
import {
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  FileText,
  CheckCircle,
  CheckCircle2,
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
  Download,
  LayoutGrid,
  KeyRound,
  AlertCircle,
  Trash2,
  Paperclip,
  FolderUp,
  FileArchive,
  Github,
  Calendar,
  Maximize2,
  Minimize2,
  Eye
} from 'lucide-react';
import { PostLessonQuiz } from './PostLessonQuiz';
import { parseVideoUrl } from '../utils/videoHelper';
import { parseDocumentUrl } from '../utils/documentHelper';

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
  | 'QUIZ'
  | 'VIDEO'
  | 'LECTURE'
  | 'TEXT';

export interface CurriculumItem {
  id: string;
  title: string;
  subtitle?: string;
  type: ActivityType;
  contentUrl?: string;
  isCompleted: boolean;
  isLocked: boolean;
  quizId?: string;
  assignmentId?: string;
  password?: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string[];
  isExpanded: boolean;
  isLocked: boolean;
  items: CurriculumItem[];
}

const DEFAULT_QUIZ_PASSWORD = 'quiz123';

const getQuizAccessKey = (item: CurriculumItem) => item.quizId || item.id;

// Video và tài liệu (PDF, DOCX, TEXT, LINK...) tự động hoàn thành khi vào xem
// Luyện tập (PRACTICE) và trắc nghiệm (QUIZ) phải làm/nộp thì mới hoàn thành
const isAutoCompletedOnView = (type: ActivityType): boolean => {
  return type !== 'PRACTICE' && type !== 'QUIZ';
};

const isPracticeOrQuiz = (type: ActivityType): boolean => {
  return type === 'PRACTICE' || type === 'QUIZ';
};


export interface SubmittedFileMeta {
  name: string;
  size: number;
  type: string;
  lastModified?: number;
  url?: string;
}

export interface PracticeSubmission {
  activityId: string;
  submissionId?: string;
  status: 'SUBMITTED';
  gradingStatus: 'PENDING' | 'GRADED';
  grade?: string;
  feedback?: string;
  submittedAt: string;
  files: SubmittedFileMeta[];
  note?: string;
  gitRepoUrl?: string;
}

const renderDocumentReaderContent = (title: string, type: ActivityType) => {
  const isSyllabus = title.toLowerCase().includes('đề cương') || title.toLowerCase().includes('de-cuong');
  const isTopics = title.toLowerCase().includes('đề tài') || title.toLowerCase().includes('de-tai') || title.toLowerCase().includes('btl');

  if (isSyllabus) {
    return (
      <div className="space-y-6 text-left">
        <div className="border-b border-slate-200 pb-5 text-center">
          <p className="text-xs uppercase font-extrabold text-blue-700 tracking-wider">Đại học Quốc gia Hà Nội • Khoa Công nghệ Thông tin</p>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 uppercase">Đề cương chi tiết học phần</h2>
          <p className="text-sm font-bold text-slate-700 mt-1">Phát triển ứng dụng Mobile & Web đa nền tảng (INT3306)</p>
          <p className="text-xs text-slate-500 mt-0.5">Số tín chỉ: 3 (2 lý thuyết + 1 thực hành) • Giảng viên: TS. Nguyễn Văn A</p>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block"></span>
            1. Mục tiêu học phần & Chuẩn đầu ra (CLO)
          </h3>
          <ul className="text-xs sm:text-sm text-slate-700 space-y-1.5 list-disc list-inside leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
            <li><strong>CLO 1:</strong> Nắm vững nguyên lý kiến trúc phần mềm Clean Architecture, Dependency Inversion và Separation of Concerns.</li>
            <li><strong>CLO 2:</strong> Thiết kế và xây dựng hệ thống RESTful API chuẩn hóa với ASP.NET Core (.NET 8) kết nối Microsoft SQL Server.</li>
            <li><strong>CLO 3:</strong> Xây dựng giao diện ứng dụng web hiện đại với ReactJS, TypeScript và Tailwind CSS kết nối Web API.</li>
            <li><strong>CLO 4:</strong> Làm việc nhóm hiệu quả, quản lý mã nguồn bằng Git/GitHub, thực hiện kiểm thử và báo cáo dự án.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block"></span>
            2. Kế hoạch giảng dạy chi tiết 15 tuần
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Tuần</th>
                  <th className="p-3">Nội dung bài học</th>
                  <th className="p-3">Hoạt động & Bài tập</th>
                  <th className="p-3">Yêu cầu chuẩn bị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-blue-50/30">
                  <td className="p-3 font-bold text-blue-700">Tuần 1</td>
                  <td className="p-3">Tổng quan Clean Architecture, .NET 8 Web API & RESTful Principles</td>
                  <td className="p-3">Bài giảng SCORM, Luyện tập tạo Controller & Test Swagger</td>
                  <td className="p-3">Cài đặt .NET 8 SDK, VS Code/Visual Studio</td>
                </tr>
                <tr className="hover:bg-blue-50/30">
                  <td className="p-3 font-bold text-blue-700">Tuần 2</td>
                  <td className="p-3">Entity Framework Core, Code-First & CSDL SQL Server</td>
                  <td className="p-3">Thiết kế bảng Database, Migration, Seed Data bài học</td>
                  <td className="p-3">Cài đặt Microsoft SQL Server Express</td>
                </tr>
                <tr className="hover:bg-blue-50/30">
                  <td className="p-3 font-bold text-blue-700">Tuần 3</td>
                  <td className="p-3">Xác thực người dùng: JWT Token & Phân quyền Role-based</td>
                  <td className="p-3">Bài trắc nghiệm Đánh giá Tuần 1-3, Mở khóa đề tài BTL</td>
                  <td className="p-3">Đăng ký nhóm Bài tập lớn (3-4 sinh viên)</td>
                </tr>
                <tr className="hover:bg-blue-50/30">
                  <td className="p-3 font-bold text-blue-700">Tuần 4-6</td>
                  <td className="p-3">Repository Pattern, Unit of Work & Validation với FluentValidation</td>
                  <td className="p-3">Báo cáo đề cương kiến trúc dự án BTL</td>
                  <td className="p-3">Khởi tạo Git Repository nhóm</td>
                </tr>
                <tr className="hover:bg-blue-50/30">
                  <td className="p-3 font-bold text-blue-700">Tuần 7-10</td>
                  <td className="p-3">Phát triển Frontend ReactJS, TypeScript & Gọi API qua Axios</td>
                  <td className="p-3">Nộp bài tập tiến độ giữa kỳ</td>
                  <td className="p-3">Ghép nối giao diện với Backend API</td>
                </tr>
                <tr className="hover:bg-blue-50/30">
                  <td className="p-3 font-bold text-blue-700">Tuần 11-14</td>
                  <td className="p-3">Tối ưu hiệu năng, Bảo mật, Viết Unit Test & Triển khai</td>
                  <td className="p-3">Hoàn thiện mã nguồn & Viết tài liệu báo cáo</td>
                  <td className="p-3">Chuẩn bị Slide thuyết trình</td>
                </tr>
                <tr className="hover:bg-blue-50/30">
                  <td className="p-3 font-bold text-blue-700">Tuần 15</td>
                  <td className="p-3">Bảo vệ Bài tập lớn & Tổng kết học phần</td>
                  <td className="p-3">Vấn đáp nhóm & Chấm điểm cuối kỳ</td>
                  <td className="p-3">Nộp toàn bộ source code + tài liệu</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block"></span>
            3. Phương pháp đánh giá học phần
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-xs text-slate-500 block">Chuyên cần</span>
              <span className="text-lg font-black text-blue-600">10%</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-xs text-slate-500 block">Trắc nghiệm & Luyện tập</span>
              <span className="text-lg font-black text-indigo-600">20%</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-xs text-slate-500 block">Bài tập lớn (BTL)</span>
              <span className="text-lg font-black text-emerald-600">30%</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-xs text-slate-500 block">Thi cuối kỳ</span>
              <span className="text-lg font-black text-rose-600">40%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isTopics) {
    return (
      <div className="space-y-6 text-left">
        <div className="border-b border-slate-200 pb-5 text-center">
          <p className="text-xs uppercase font-extrabold text-indigo-700 tracking-wider">Học phần: INT3306 - Học kỳ I (2024 - 2025)</p>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 uppercase">Danh sách đề tài gợi ý Bài tập lớn</h2>
          <p className="text-xs text-slate-500 mt-1">Quy định: Nhóm từ 3 - 4 thành viên • Quản lý source code trên GitHub</p>
        </div>

        <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl text-xs text-indigo-900 space-y-1.5">
          <strong className="block text-sm font-bold text-indigo-950">Yêu cầu công nghệ bắt buộc đối với tất cả các đề tài:</strong>
          <ul className="list-disc list-inside space-y-1 leading-relaxed">
            <li><strong>Backend:</strong> C# .NET 8 Web API, thiết kế theo chuẩn Clean Architecture (Domain, Application, Infrastructure, Presentation).</li>
            <li><strong>Database:</strong> Microsoft SQL Server, quản lý bảng và truy vấn bằng Entity Framework Core (Code-First Migration).</li>
            <li><strong>Frontend:</strong> ReactJS với TypeScript, Tailwind CSS, gọi API qua Axios và có giao diện Responsive (Mobile + Desktop).</li>
            <li><strong>Quản lý tiến độ:</strong> Tạo Git repository công khai, phân chia commit rõ ràng theo từng thành viên trong nhóm.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
            Danh mục các đề tài được phê duyệt
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all space-y-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-extrabold text-[10px]">Đề tài 01</span>
              <h4 className="font-extrabold text-sm text-slate-900">Hệ thống Quản lý Học tập Trực tuyến (LMS)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Quản lý khóa học, đề cương tuần học, phát bài giảng video YouTube, đính kèm tài liệu PDF/Word, nộp bài thực hành và tổ chức thi trắc nghiệm trực tuyến có tính thời gian & tự động chấm điểm.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all space-y-2">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-extrabold text-[10px]">Đề tài 02</span>
              <h4 className="font-extrabold text-sm text-slate-900">Hệ thống Đặt lịch Khám & Bệnh án Điện tử</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Phân quyền Bác sĩ / Bệnh nhân, quản lý chuyên khoa, đặt lịch hẹn theo khung giờ, kê đơn thuốc điện tử, theo dõi lịch sử khám chữa bệnh và xuất báo cáo PDF.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all space-y-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">Đề tài 03</span>
              <h4 className="font-extrabold text-sm text-slate-900">Sàn Thương mại Điện tử E-Commerce Đa kênh</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Quản lý danh mục hàng hóa, giỏ hàng, đặt hàng trực tuyến, thanh toán giả lập với mã QR/VNPAY, phân hệ quản lý kho và bảng thống kê doanh thu thời gian thực.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all space-y-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-extrabold text-[10px]">Đề tài 04</span>
              <h4 className="font-extrabold text-sm text-slate-900">Nền tảng Tuyển dụng & Kết nối Thực tập sinh CNTT</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Doanh nghiệp đăng tin tuyển dụng, sinh viên nộp CV (định dạng PDF/Word), bộ lọc kỹ năng ứng viên, theo dõi trạng thái hồ sơ (Chờ duyệt, Phỏng vấn, Trúng tuyển).
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // General Lesson 1 or default lecture document
  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-slate-200 pb-5 text-center">
        <p className="text-xs uppercase font-extrabold text-rose-700 tracking-wider">Học phần INT3306 • Tài liệu nghiên cứu chuyên đề</p>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 uppercase">{title}</h2>
        <p className="text-xs text-slate-500 mt-1">Định dạng: {type} • Biên soạn: TS. Nguyễn Văn A</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <span className="w-1.5 h-4 bg-rose-600 rounded-full inline-block"></span>
          1. Tổng quan kiến trúc Clean Architecture trong C# .NET 8
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Clean Architecture là mẫu kiến trúc phần mềm nhấn mạnh vào nguyên tắc <strong>Tách biệt mối quan tâm (Separation of Concerns)</strong> và <strong>Đảo ngược phụ thuộc (Dependency Inversion)</strong>. Trọng tâm của hệ thống là mô hình miền (Domain Model), các thành phần công nghệ như Cơ sở dữ liệu, Framework, Giao diện người dùng đều là các phụ thuộc bên ngoài và có thể dễ dàng thay thế hoặc bảo trì mà không làm ảnh hưởng đến lõi nghiệp vụ.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <span className="w-1.5 h-4 bg-rose-600 rounded-full inline-block"></span>
          2. Các tầng chính trong hệ thống
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <strong className="text-blue-700 font-bold block text-sm">Tầng Domain (Lõi)</strong>
            <p className="text-slate-600 leading-relaxed">Chứa các Entities (User, Course, Lesson), Value Objects, Domain Exceptions và quy tắc nghiệp vụ cốt lõi không phụ thuộc vào bất kỳ thư viện bên ngoài nào.</p>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <strong className="text-indigo-700 font-bold block text-sm">Tầng Application</strong>
            <p className="text-slate-600 leading-relaxed">Chứa các Use Cases, Interfaces (IRepository, IJwtProvider), Data Transfer Objects (DTOs), và logic điều phối quy trình xử lý.</p>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <strong className="text-emerald-700 font-bold block text-sm">Tầng Infrastructure</strong>
            <p className="text-slate-600 leading-relaxed">Cài đặt kết nối SQL Server (AppDbContext), cấu hình Entity Framework Core, lưu trữ file và tích hợp các dịch vụ bên thứ ba.</p>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <strong className="text-purple-700 font-bold block text-sm">Tầng Presentation (Web API)</strong>
            <p className="text-slate-600 leading-relaxed">Xây dựng Controllers (CoursesController, LessonsController), Middleware xử lý lỗi, Dependency Injection container và Swagger documentation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CourseStudyPage: React.FC<Props> = ({ courseId, initialActivityId, onBack }) => {
  const [quizPasswordInput, setQuizPasswordInput] = useState('');
  const [quizPasswordError, setQuizPasswordError] = useState('');
  const [unlockedQuizKeys, setUnlockedQuizKeys] = useState<Record<string, boolean>>({});

  // Mobile sidebar drawer open state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Collapse all state for outline view
  const [allCollapsed, setAllCollapsed] = useState(false);

  // Sections data
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sections, setSections] = useState<Section[]>([]);
  // Selected Activity State: null = viewing course outline, non-null = viewing dedicated page of that activity
  const [selectedActivity, setSelectedActivity] = useState<CurriculumItem | null>(null);

  const getStudentId = () => {
    try {
      const userStr = localStorage.getItem('user_info');
      if (userStr) return JSON.parse(userStr).userId;
    } catch { }
    return '33333333-3333-3333-3333-333333333333';
  };

  const targetCourseId = courseId || '44444444-4444-4444-4444-444444444444';

  // Toggle item completion state (To do <-> Done) with optimistic local state update
  const toggleItemCompletion = async (itemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Optimistically update sections and current activity
    setSections((prevSections) =>
      prevSections.map((sec) => {
        let hasChanges = false;
        const newItems = sec.items.map((item) => {
          if (item.id === itemId) {
            hasChanges = true;
            return { ...item, isCompleted: true };
          }
          return item;
        });

        return hasChanges ? { ...sec, items: newItems } : sec;
      })
    );

    setSelectedActivity((prev) => (prev && prev.id === itemId ? { ...prev, isCompleted: true } : prev));

    try {
      const studentId = getStudentId();
      await api.post(`/lessons/${itemId}/complete`, { studentId });
    } catch (err: any) {
      console.error('Lỗi cập nhật hoàn thành bài học:', err);
    }
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const studentId = getStudentId();
      const res = await api.get<CourseDetail>(`/courses/${targetCourseId}?studentId=${studentId}`);
      setCourse(res.data);

      const mappedSections: Section[] = (res.data.sections || []).map((s) => ({
        id: s.id,
        title: s.title,
        isExpanded: s.isExpanded,
        isLocked: s.isLocked,
        items: (s.items || []).map((i) => ({
          id: i.id,
          title: i.title,
          subtitle: i.subtitle,
          type: i.contentType,
          contentUrl: i.contentUrl,
          isCompleted: i.isCompleted,
          isLocked: i.isLocked,
          quizId: i.quizId,
          assignmentId: i.assignmentId
        }))
      }));

      setSections(mappedSections);

      if (initialActivityId) {
        for (const sec of mappedSections) {
          const found = sec.items.find((item) => item.id === initialActivityId);
          if (found) {
            if (found.type === 'DOCX') {
              setDocViewMode('reader');
            } else if (found.type === 'PDF') {
              setDocViewMode('embed');
            }
            const shouldAutoComplete = isAutoCompletedOnView(found.type) && !found.isCompleted;
            setSelectedActivity(shouldAutoComplete ? { ...found, isCompleted: true } : found);
            if (shouldAutoComplete) {
              toggleItemCompletion(found.id);
            }
            break;
          }
        }
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu khóa học từ CSDL:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [targetCourseId]);

  // Practice Submissions State (persisted to localStorage & synced with backend)
  const [practiceSubmissions, setPracticeSubmissions] = useState<Record<string, PracticeSubmission>>(() => {
    try {
      const saved = localStorage.getItem('lms_practice_submissions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading submissions from localStorage', e);
    }
    return {};
  });

  const [isSubmittingPractice, setIsSubmittingPractice] = useState(false);

  // Load assignment submission from backend if viewing a PRACTICE activity
  useEffect(() => {
    if (!selectedActivity || selectedActivity.type !== 'PRACTICE') return;

    const fetchPracticeSubmission = async () => {
      try {
        const studentId = getStudentId();
        const res = await api.get(`/assignments/by-lesson/${selectedActivity.id}?studentId=${studentId}`);
        if (res.data && res.data.mySubmission) {
          const sub = res.data.mySubmission;
          const record: PracticeSubmission = {
            activityId: selectedActivity.id,
            submissionId: sub.id,
            status: 'SUBMITTED',
            gradingStatus: (sub.grade !== null && sub.grade !== undefined) ? 'GRADED' : 'PENDING',
            grade: (sub.grade !== null && sub.grade !== undefined) ? `${sub.grade}/${res.data.maxScore || 10}` : undefined,
            feedback: sub.feedback,
            submittedAt: sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('vi-VN') : '',
            files: (sub.files && sub.files.length > 0)
              ? sub.files.map((f: any) => ({
                  name: f.fileName,
                  size: f.fileSize || 0,
                  type: f.fileType || 'application/octet-stream',
                  url: f.fileUrl
                }))
              : (sub.fileUrl ? [{
                  name: sub.fileUrl.split('/').pop() || 'bai-nop.zip',
                  size: 0,
                  type: 'application/octet-stream',
                  url: sub.fileUrl
                }] : []),
            note: sub.submissionText || '',
            gitRepoUrl: sub.gitRepoUrl || ''
          };
          setPracticeSubmissions((prev) => ({ ...prev, [selectedActivity.id]: record }));
        }
      } catch (err) {
        // Practice assignment might not exist yet or student hasn't submitted
      }
    };

    fetchPracticeSubmission();
  }, [selectedActivity?.id]);

  // Staging state for practice file submissions
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [stagedGitUrl, setStagedGitUrl] = useState('');
  const [stagedNote, setStagedNote] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditingPractice, setIsEditingPractice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document Viewer State
  const [docFullscreen, setDocFullscreen] = useState<boolean>(false);
  const [docViewMode, setDocViewMode] = useState<'embed' | 'reader'>('embed');

  // Calculate total completed items
  const allItems = sections.flatMap((s) => s.items);
  const completedCount = allItems.filter((i) => i.isCompleted).length;
  const progressPercent = allItems.length > 0 ? Math.round((completedCount / allItems.length) * 100) : 0;

  // Find current activity index for next/previous navigation
  const currentIndex = selectedActivity ? allItems.findIndex((i) => i.id === selectedActivity.id) : -1;
  const prevActivity = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextActivity = currentIndex >= 0 && currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

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

  // Open dedicated page for an activity while keeping sidebar
  const handleOpenActivity = (item: CurriculumItem) => {
    if (item.isLocked) return;
    if (item.type === 'QUIZ') {
      setQuizPasswordInput('');
      setQuizPasswordError('');
    }

    if (item.type === 'DOCX') {
      setDocViewMode('reader');
    } else if (item.type === 'PDF') {
      setDocViewMode('embed');
    }
    setDocFullscreen(false);

    const shouldAutoComplete = isAutoCompletedOnView(item.type) && !item.isCompleted;
    setSelectedActivity(shouldAutoComplete ? { ...item, isCompleted: true } : item);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Video, bài giảng, tài liệu (PDF, DOCX...) tự động hoàn thành khi mở xem
    // Luyện tập (PRACTICE) và trắc nghiệm (QUIZ) phải làm/nộp thì mới đánh dấu hoàn thành
    if (shouldAutoComplete) {
      toggleItemCompletion(item.id);
    }
  };


  const handleUnlockQuiz = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedActivity || selectedActivity.type !== 'QUIZ') return;

    const expectedPassword = selectedActivity.password || DEFAULT_QUIZ_PASSWORD;
    if (quizPasswordInput.trim() !== expectedPassword) {
      setQuizPasswordError('Mật khẩu bài trắc nghiệm chưa đúng. Vui lòng kiểm tra lại.');
      return;
    }

    setUnlockedQuizKeys((prev) => ({
      ...prev,
      [getQuizAccessKey(selectedActivity)]: true
    }));
    setQuizPasswordInput('');
    setQuizPasswordError('');
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

  // Practice helper functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFilesAdded = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    const newFiles = Array.from(filesList);
    setStagedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const filtered = newFiles.filter((f) => !existingNames.has(f.name));
      return [...prev, ...filtered];
    });
  };

  const handleRemoveStagedFile = (fileName: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const handleSubmitPractice = async (activityId: string) => {
    const existing = practiceSubmissions[activityId];
    if (stagedFiles.length === 0 && !stagedGitUrl.trim() && (!existing || existing.files.length === 0)) {
      alert('Vui lòng tải lên ít nhất 1 tệp tin bài làm hoặc điền đường dẫn Git repository!');
      return;
    }

    try {
      setIsSubmittingPractice(true);
      const studentId = getStudentId();
      const formData = new FormData();
      formData.append('studentId', studentId);
      formData.append('submissionText', stagedNote.trim());
      formData.append('gitRepoUrl', stagedGitUrl.trim());
      stagedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const shouldUpdateExisting = Boolean(existing?.submissionId);
      const shouldReplaceFiles = Boolean(isEditingPractice && stagedFiles.length > 0);
      formData.append('replaceFiles', shouldReplaceFiles ? 'true' : 'false');

      const requestConfig = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      const res = shouldUpdateExisting
        ? await api.put(`/assignments/submissions/${existing?.submissionId}/submit-files`, formData, requestConfig)
        : await api.post(`/assignments/by-lesson/${activityId}/submit-files`, formData, requestConfig);

      const newFilesMeta: SubmittedFileMeta[] = stagedFiles.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        lastModified: f.lastModified,
        url: res.data?.fileUrl || undefined
      }));

      const responseFiles: SubmittedFileMeta[] = Array.isArray(res.data?.files)
        ? res.data.files.map((f: any) => ({
            name: f.fileName,
            size: f.fileSize || 0,
            type: f.fileType || 'application/octet-stream',
            url: f.fileUrl
          }))
        : [];

      const finalFiles = responseFiles.length > 0
        ? responseFiles
        : shouldReplaceFiles
          ? newFilesMeta
          : existing && stagedFiles.length === 0
            ? existing.files
            : [...(existing?.files || []), ...newFilesMeta];

      const submittedAt = res.data?.submittedAt
        ? new Date(res.data.submittedAt).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : new Date().toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });

      const record: PracticeSubmission = {
        activityId,
        submissionId: res.data?.submissionId || existing?.submissionId,
        status: 'SUBMITTED',
        gradingStatus: existing?.gradingStatus || 'PENDING',
        submittedAt,
        files: finalFiles,
        note: stagedNote.trim(),
        gitRepoUrl: stagedGitUrl.trim()
      };

      const updated = { ...practiceSubmissions, [activityId]: record };
      setPracticeSubmissions(updated);
      try {
        localStorage.setItem('lms_practice_submissions', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }

      // Automatically mark the activity as completed if not yet completed
      if (selectedActivity && !selectedActivity.isCompleted) {
        toggleItemCompletion(activityId);
      }

      setStagedFiles([]);
      setIsEditingPractice(false);
      alert('🎉 Chúc mừng! Bạn đã nộp bài tập thực hành thành công lên hệ thống và đã lưu vào CSDL.');
    } catch (err) {
      console.error('Lỗi khi nộp bài tập:', err);
      if ((err as any)?.response) {
        alert((err as any).response.data?.message || 'Khong the luu bai nop tren may chu. Vui long thu lai.');
        return;
      }
      // Fallback
      const newFilesMeta: SubmittedFileMeta[] = stagedFiles.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        lastModified: f.lastModified
      }));
      const finalFiles = existing && stagedFiles.length === 0
        ? existing.files
        : [...(existing?.files || []), ...newFilesMeta];

      const record: PracticeSubmission = {
        activityId,
        submissionId: existing?.submissionId,
        status: 'SUBMITTED',
        gradingStatus: existing?.gradingStatus || 'PENDING',
        submittedAt: new Date().toLocaleString('vi-VN'),
        files: finalFiles,
        note: stagedNote.trim() || existing?.note || '',
        gitRepoUrl: stagedGitUrl.trim() || existing?.gitRepoUrl || ''
      };

      const updated = { ...practiceSubmissions, [activityId]: record };
      setPracticeSubmissions(updated);
      try {
        localStorage.setItem('lms_practice_submissions', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      if (selectedActivity && !selectedActivity.isCompleted) {
        toggleItemCompletion(activityId);
      }
      setStagedFiles([]);
      setIsEditingPractice(false);
      alert('🎉 Đã ghi nhận bài nộp!');
    } finally {
      setIsSubmittingPractice(false);
    }
  };

  const handleDeleteSubmission = async (activityId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy / xóa bài nộp này? Trạng thái sẽ quay về Chưa nộp bài.')) {
      return;
    }
    const existing = practiceSubmissions[activityId];
    try {
      const studentId = getStudentId();
      if (existing?.submissionId) {
        await api.delete(`/assignments/submissions/${existing.submissionId}`, { params: { studentId } });
      } else {
        await api.delete(`/assignments/by-lesson/${activityId}/submission`, { params: { studentId } });
      }
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        console.error('Loi xoa bai nop:', err);
        alert('Khong the xoa bai nop tren may chu. Vui long thu lai.');
        return;
      }
    }

    const updated = { ...practiceSubmissions };
    delete updated[activityId];
    setPracticeSubmissions(updated);
    try {
      localStorage.setItem('lms_practice_submissions', JSON.stringify(updated));
    } catch (e) {}
    setStagedFiles([]);
    setStagedGitUrl('');
    setStagedNote('');
    setIsEditingPractice(false);
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        items: section.items.map((item) =>
          item.id === activityId ? { ...item, isCompleted: false } : item
        )
      }))
    );
    setSelectedActivity((prev) => (prev && prev.id === activityId ? { ...prev, isCompleted: false } : prev));
  };

  const handleStartEditSubmission = (submission: PracticeSubmission) => {
    setStagedGitUrl(submission.gitRepoUrl || '');
    setStagedNote(submission.note || '');
    setStagedFiles([]);
    setIsEditingPractice(true);
  };

  const handleDownloadFile = (fileName: string, fileUrl?: string) => {
    if (fileUrl) {
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `http://localhost:5000${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
      window.open(fullUrl, '_blank');
      return;
    }
    const content = `Mã nguồn bài tập LMS: ${fileName}\nĐược nộp bởi sinh viên ngày ${new Date().toLocaleDateString('vi-VN')}\nHọc phần: ${course?.title || 'Đang tải thông tin học phần...'}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      case 'VIDEO':
      case 'LECTURE':
        return (
          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-2xs">
            <PlayCircle className="w-4.5 h-4.5" />
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

  // Dedicated Practice Activity View with Assignment File Upload & Status
  const renderPracticeSection = (activity: CurriculumItem) => {
    const submission = practiceSubmissions[activity.id];

    return (
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
        {/* Practice Title and Badges */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-wider">
              Bài luyện tập thực hành & Nộp bài
            </span>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-slate-200">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Hạn chót: 23:59 Chủ Nhật (Tuần này)</span>
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            {activity.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Thực hành viết mã nguồn và đóng gói mã nguồn (.zip, .rar...) hoặc gửi liên kết Git repository để nộp bài đánh giá.
          </p>
        </div>

        {/* Requirements Card */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs leading-relaxed text-slate-700">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <FileText className="w-4 h-4 text-blue-600" />
            <h4>Yêu cầu thực hành:</h4>
          </div>
          <ul className="list-disc list-inside space-y-1.5 pl-1">
            <li>Khởi tạo Web API project với .NET 8 SDK sử dụng kiến trúc Clean Architecture.</li>
            <li>Triển khai tầng Domain với Entity Course, Student và Lesson.</li>
            <li>Sử dụng Entity Framework Core với PostgreSQL Migration.</li>
            <li>Đảm bảo các Endpoint tuân thủ quy chuẩn RESTful và phản hồi đúng HTTP Status Code.</li>
            <li>Đóng gói mã nguồn thành tệp nén (.ZIP / .RAR) hoặc đính kèm link GitHub / GitLab cá nhân.</li>
          </ul>
        </div>

        {/* Submission Status Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Bảng trạng thái bài nộp</span>
            </h4>
            {submission && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Đã ghi nhận bài nộp
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Status row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2 bg-white">
              <span className="font-bold text-slate-600 sm:col-span-1">Trạng thái nộp bài:</span>
              <div className="sm:col-span-2">
                {submission ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Đã nộp bài để chấm điểm
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Chưa nộp bài
                  </span>
                )}
              </div>
            </div>

            {/* Grading row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2 bg-slate-50/50">
              <span className="font-bold text-slate-600 sm:col-span-1">Trạng thái chấm điểm:</span>
              <div className="sm:col-span-2">
                {submission?.gradingStatus === 'GRADED' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    <Award className="w-3.5 h-3.5" />
                    Đã chấm: {submission.grade || '10/10'}
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium">Chưa chấm điểm (Đang chờ giảng viên chấm)</span>
                )}
              </div>
            </div>

            {/* Submission Time row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2 bg-white">
              <span className="font-bold text-slate-600 sm:col-span-1">Thời gian nộp lần cuối:</span>
              <span className="sm:col-span-2 text-slate-800 font-medium">
                {submission ? submission.submittedAt : '—'}
              </span>
            </div>

            {/* Submitted Files row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2 bg-slate-50/50">
              <span className="font-bold text-slate-600 sm:col-span-1">Tệp bài nộp đã gửi:</span>
              <div className="sm:col-span-2">
                {submission && submission.files && submission.files.length > 0 ? (
                  <div className="space-y-2">
                    {submission.files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                            <FileArchive className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate text-xs">{file.name}</p>
                            <span className="text-[10px] text-slate-400">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadFile(file.name, file.url)}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 border border-blue-200"
                          title="Tải tệp này về máy"
                        >
                          <Download className="w-3 h-3" />
                          <span>Tải xuống</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Chưa có tệp tin nào được gửi</span>
                )}
              </div>
            </div>

            {/* Git Repository link row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2 bg-white">
              <span className="font-bold text-slate-600 sm:col-span-1">Kho lưu trữ Git:</span>
              <div className="sm:col-span-2">
                {submission?.gitRepoUrl ? (
                  <a
                    href={submission.gitRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline bg-blue-50/60 px-3 py-1.5 rounded-xl border border-blue-200"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span className="truncate max-w-xs">{submission.gitRepoUrl}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-400 italic">—</span>
                )}
              </div>
            </div>

            {/* Student Note row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2 bg-slate-50/50">
              <span className="font-bold text-slate-600 sm:col-span-1">Ghi chú của sinh viên:</span>
              <div className="sm:col-span-2">
                {submission?.note ? (
                  <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 italic">
                    "{submission.note}"
                  </p>
                ) : (
                  <span className="text-slate-400 italic">—</span>
                )}
              </div>
            </div>

            {/* Teacher Feedback row */}
            {submission?.feedback && (
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2 bg-indigo-50/60 border-t border-indigo-100">
                <span className="font-bold text-indigo-900 sm:col-span-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Lời nhận xét của giảng viên:</span>
                </span>
                <div className="sm:col-span-2">
                  <p className="text-slate-800 bg-white p-3 rounded-xl border border-indigo-200 text-xs leading-relaxed font-medium">
                    {submission.feedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Existing Submission Action Buttons (When already submitted and not in edit mode) */}
        {submission && !isEditingPractice && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStartEditSubmission(submission)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Chỉnh sửa bài nộp</span>
              </button>
              <button
                onClick={() => handleDeleteSubmission(activity.id)}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hủy / Xóa bài nộp</span>
              </button>
            </div>

            <div className="px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border-emerald-300">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đã nộp & Hoàn thành</span>
            </div>
          </div>
        )}

        {/* Upload / Submission Form (When not submitted OR in editing mode) */}
        {(!submission || isEditingPractice) && (
          <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderUp className="w-4.5 h-4.5 text-blue-600" />
                <span>{isEditingPractice ? 'Chỉnh sửa và cập nhật bài nộp' : 'Tải lên bài tập thực hành'}</span>
              </h4>
              {isEditingPractice && (
                <button
                  onClick={() => {
                    setIsEditingPractice(false);
                    setStagedFiles([]);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Hủy chỉnh sửa
                </button>
              )}
            </div>

            {/* Drag & Drop File Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                handleFilesAdded(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
                  : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-blue-50/20'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  handleFilesAdded(e.target.files);
                  if (e.target) e.target.value = '';
                }}
                multiple
                className="hidden"
                accept=".zip,.rar,.7z,.pdf,.docx,.doc,.txt,.tar,.gz,.cs,.ts,.js,.json,.png,.jpg"
              />
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <Upload className="w-6 h-6" />
              </div>
              <h5 className="font-bold text-sm text-slate-800">
                Kéo và thả tệp tin bài làm vào đây, hoặc <span className="text-blue-600 underline">chọn từ máy tính</span>
              </h5>
              <p className="text-[11px] text-slate-400 mt-1">
                Hỗ trợ tệp nén mã nguồn (.ZIP, .RAR, .7Z), tài liệu (.PDF, .DOCX) - Tối đa 50MB/file
              </p>
            </div>

            {/* Staged Files Preview List */}
            {stagedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Tệp mới đã chọn để tải lên ({stagedFiles.length}):</span>
                  <button
                    onClick={() => setStagedFiles([])}
                    className="text-[11px] text-rose-600 hover:underline font-semibold"
                  >
                    Xóa tất cả tệp đã chọn
                  </button>
                </div>
                <div className="space-y-1.5">
                  {stagedFiles.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                          <Paperclip className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate max-w-xs">{file.name}</p>
                          <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveStagedFile(file.name)}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Gỡ tệp này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Git Repository Link Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-slate-700" />
                <span>Liên kết Git Repository (Tùy chọn)</span>
              </label>
              <input
                type="url"
                value={stagedGitUrl}
                onChange={(e) => setStagedGitUrl(e.target.value)}
                placeholder="https://github.com/username/project-dotnet-api"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            {/* Student Notes / Ghi chú */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-700" />
                <span>Ghi chú / Nhận xét thêm của sinh viên (Tùy chọn)</span>
              </label>
              <textarea
                rows={3}
                value={stagedNote}
                onChange={(e) => setStagedNote(e.target.value)}
                placeholder="Mô tả tóm tắt quá trình thực hiện bài tập, cấu hình chạy thử hoặc lưu ý cho giảng viên..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white resize-none"
              />
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              {isEditingPractice && (
                <button
                  onClick={() => {
                    setIsEditingPractice(false);
                    setStagedFiles([]);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
              )}
              <button
                disabled={isSubmittingPractice}
                onClick={() => handleSubmitPractice(activity.id)}
                className={`px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 ${
                  isSubmittingPractice ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmittingPractice
                    ? 'Đang gửi bài lên hệ thống...'
                    : isEditingPractice
                    ? 'Lưu thay đổi bài nộp'
                    : 'Nộp bài & Hoàn thành'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Reusable Sidebar Tree Component - Always available both on outline and on dedicated activity page!
  const renderSidebarTree = () => (
    <div className="space-y-3">
      {/* Sidebar Header */}
      <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 leading-none">
              Danh mục học phần
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">Curriculum Outline</span>
          </div>
        </div>

        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          {completedCount}/{allItems.length}
        </span>
      </div>

      {/* Sections and Items List */}
      <div className="space-y-2">
        {sections.map((section) => {
          const hasCurrentItem = section.items.some((i) => i.id === selectedActivity?.id);

          return (
            <div key={section.id} className="space-y-1">
              {/* Section Header Button */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 ${
                  hasCurrentItem
                    ? 'bg-blue-50/80 text-blue-900 border border-blue-200'
                    : section.isLocked
                    ? 'bg-slate-100/70 text-slate-400'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  {section.isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                  )}
                  <span className="truncate">{section.title}</span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {section.isLocked ? (
                    <Lock className="w-3 h-3 text-slate-400" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {section.items.filter((i) => i.isCompleted).length}/{section.items.length}
                    </span>
                  )}
                </div>
              </button>

              {/* Sub-items list */}
              {section.isExpanded && (
                <div className="pl-2 space-y-1 mt-1 border-l-2 border-slate-200/80 ml-2">
                  {section.items.map((item) => {
                    const isCurrent = selectedActivity?.id === item.id;

                    return (
                      <button
                        key={item.id}
                        disabled={section.isLocked || item.isLocked}
                        onClick={() => handleOpenActivity(item)}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-all duration-150 group ${
                          isCurrent
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : item.isLocked || section.isLocked
                            ? 'opacity-40 cursor-not-allowed text-slate-400'
                            : 'hover:bg-slate-100/90 text-slate-700 bg-transparent'
                        }`}
                        title={item.title}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {/* Dot / Status Indicator */}
                          {item.isCompleted ? (
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 shadow-2xs ${
                                isCurrent ? 'bg-white' : 'bg-emerald-500'
                              }`}
                              title="Hoàn thành"
                            ></span>
                          ) : (
                            <span
                              className={`w-2 h-2 rounded-full border-2 flex-shrink-0 ${
                                isCurrent ? 'border-white' : 'border-slate-400'
                              }`}
                              title="Chưa xong"
                            ></span>
                          )}

                          <span className="truncate text-[11.5px] leading-snug">
                            {item.title}
                          </span>
                        </div>

                        {item.isLocked && (
                          <Lock className="w-3 h-3 flex-shrink-0 text-slate-400" />
                        )}
                        {item.type === 'QUIZ' && !item.isLocked && !unlockedQuizKeys[getQuizAccessKey(item)] && (
                          <KeyRound className={`w-3 h-3 flex-shrink-0 ${isCurrent ? 'text-white' : 'text-indigo-500'}`} />
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
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col w-full text-slate-900 font-sans antialiased">
      {/* Top Header Navbar */}
      <header className="bg-white text-slate-900 border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs sticky top-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button */}
          <button
            onClick={onBack}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-800 transition-all flex items-center gap-1.5 text-xs font-bold border border-slate-200 flex-shrink-0"
            title="Quay lại danh sách Khóa học"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại Khóa học</span>
          </button>

          {/* Mobile Drawer Trigger Button */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-blue-200"
          >
            <List className="w-4 h-4" />
            <span>Danh mục học phần ({completedCount}/{allItems.length})</span>
          </button>

          {/* Course Title Navbar Header (Permanent Course Name, does NOT change by category) */}
          <div className="min-w-0 border-l border-slate-200 pl-3">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                INT3306
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline truncate">
                Lập trình Web C# .NET 8 & ReactJS
              </span>
            </div>

            <h1 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight truncate max-w-[200px] sm:max-w-md lg:max-w-lg mt-0.5">
              20241_Phát triển ứng dụng Mobile đa nền tảng (2+1)_12626W.1
            </h1>
          </div>
        </div>

        {/* Right Section: Progress Indicator & Quick Nav Controls */}
        <div className="flex items-center gap-3">
          {selectedActivity ? (
            <div className="flex items-center gap-2">
              {/* Mark Completed Toggle Button */}
              {isPracticeOrQuiz(selectedActivity.type) ? (
                selectedActivity.isCompleted ? (
                  <div className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">
                      {selectedActivity.type === 'PRACTICE' ? 'Đã nộp bài tập' : 'Đã đạt bài kiểm tra'}
                    </span>
                    <span className="sm:hidden">Đã xong</span>
                  </div>
                ) : (
                  <div
                    className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 cursor-default"
                    title={
                      selectedActivity.type === 'PRACTICE'
                        ? 'Cần nộp bài tập thực hành để đánh dấu hoàn thành'
                        : 'Cần làm bài trắc nghiệm để đánh dấu hoàn thành'
                    }
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">
                      {selectedActivity.type === 'PRACTICE' ? 'Cần nộp bài' : 'Cần làm kiểm tra'}
                    </span>
                    <span className="sm:hidden">Chưa làm</span>
                  </div>
                )
              ) : (
                <button
                  onClick={() => toggleItemCompletion(selectedActivity.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    selectedActivity.isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${selectedActivity.isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="hidden sm:inline">{selectedActivity.isCompleted ? 'Đã hoàn thành' : 'Đánh dấu Hoàn thành'}</span>
                </button>
              )}

              {/* Prev / Next activity buttons */}
              <div className="flex items-center gap-1">
                <button
                  disabled={!prevActivity || prevActivity.isLocked}
                  onClick={() => prevActivity && handleOpenActivity(prevActivity)}
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 border border-slate-200 text-xs font-bold transition-all"
                  title={prevActivity ? `Bài trước: ${prevActivity.title}` : 'Không có bài trước'}
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  disabled={!nextActivity || nextActivity.isLocked}
                  onClick={() => nextActivity && handleOpenActivity(nextActivity)}
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 border border-slate-200 text-xs font-bold transition-all"
                  title={nextActivity ? `Bài tiếp theo: ${nextActivity.title}` : 'Không có bài tiếp theo'}
                >
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          ) : (
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
          )}
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

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN LAYOUT: SIDEBAR ON LEFT ALWAYS VISIBLE!                   */}
      {/* RIGHT COLUMN: EITHER DEDICATED ACTIVITY PAGE OR COURSE OUTLINE            */}
      {/* ========================================================================= */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 w-full gap-0 min-h-[calc(100vh-60px)]">
        {/* Desktop Left Navigation Tree Sidebar - ALWAYS RENDERED ON LEFT! */}
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-3 bg-slate-50/80 border-r border-slate-200 p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-60px)] sticky top-[60px]">
          {renderSidebarTree()}
        </aside>

        {/* Right Main Content Area */}
        <main className="col-span-1 lg:col-span-9 xl:col-span-9 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* ------------------------------------------------------------------- */}
          {/* CASE 1: DEDICATED ACTIVITY PAGE (KHI BẤM VÀO BẤT KỲ HOẠT ĐỘNG NÀO)  */}
          {/* ------------------------------------------------------------------- */}
          {selectedActivity ? (
            <div className="space-y-6">
              {/* Activity Top Navigation Breadcrumb Card */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {renderActivityIcon(selectedActivity.type, selectedActivity.subtitle)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        {selectedActivity.type}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Hoạt động trong học phần</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 truncate mt-0.5">
                      {selectedActivity.title}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                      selectedActivity.isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {selectedActivity.isCompleted ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {selectedActivity.type === 'PRACTICE'
                            ? 'Đã nộp bài tập'
                            : selectedActivity.type === 'QUIZ'
                            ? 'Đã vượt qua bài kiểm tra'
                            : 'Đã hoàn thành'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          {selectedActivity.type === 'PRACTICE'
                            ? 'Chưa nộp bài'
                            : selectedActivity.type === 'QUIZ'
                            ? 'Chưa làm bài'
                            : 'Chưa hoàn thành'}
                        </span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* 1. QUIZ DEDICATED PAGE */}
              {selectedActivity.type === 'QUIZ' && (
                <div className="w-full space-y-6">
                  {unlockedQuizKeys[getQuizAccessKey(selectedActivity)] ? (
                    <PostLessonQuiz
                      quizId={selectedActivity.quizId}
                      onBack={() => setSelectedActivity(null)}
                      onNextLesson={handleQuizPassed}
                    />
                  ) : (
                    <form
                      onSubmit={handleUnlockQuiz}
                      className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-700">
                          <KeyRound className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700">
                            Bảo vệ bài trắc nghiệm
                          </span>
                          <h3 className="mt-1 text-xl sm:text-2xl font-extrabold leading-tight text-slate-900">
                            Nhập mật khẩu để bắt đầu làm bài
                          </h3>
                          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500">
                            Bài kiểm tra này chỉ mở sau khi bạn xác nhận đúng mật khẩu được cấp riêng cho bài trắc nghiệm.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="quiz-access-password" className="text-xs font-bold text-slate-700">
                          Mật khẩu bài trắc nghiệm
                        </label>
                        <div className="relative">
                          <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            id="quiz-access-password"
                            type="password"
                            value={quizPasswordInput}
                            onChange={(event) => {
                              setQuizPasswordInput(event.target.value);
                              setQuizPasswordError('');
                            }}
                            autoFocus
                            placeholder="Nhập mật khẩu bài trắc nghiệm"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                          />
                        </div>

                        {quizPasswordError && (
                          <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>{quizPasswordError}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedActivity(null)}
                          className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-200"
                        >
                          Quay lại đề cương
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs transition-all hover:bg-indigo-700"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          <span>Bắt đầu làm bài</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* 2. SCORM / VIDEO / LECTURE DEDICATED PAGE */}
              {(selectedActivity.type === 'SCORM' || selectedActivity.type === 'VIDEO' || (selectedActivity.type as string) === 'LECTURE') && (() => {
                const videoInfo = parseVideoUrl(selectedActivity.contentUrl);

                return (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
                    <div>
                      <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full uppercase">
                        Bài giảng Video
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                        {selectedActivity.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Xem hết nội dung bài giảng video để nắm chắc kiến thức trước khi làm bài tập và bài trắc nghiệm.
                      </p>
                    </div>

                    {/* Theater Video Player */}
                    <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-video w-full shadow-lg border border-slate-800 relative group flex items-center justify-center">
                      {videoInfo.embedUrl ? (
                        videoInfo.isDirectVideo ? (
                          <video
                            className="w-full h-full"
                            controls
                            playsInline
                            src={videoInfo.embedUrl}
                          >
                            Trình duyệt của bạn không hỗ trợ phát thẻ video trực tiếp.
                          </video>
                        ) : (
                          <iframe
                            className="w-full h-full"
                            src={videoInfo.embedUrl}
                            title={selectedActivity.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          ></iframe>
                        )
                      ) : (
                        <div className="text-center p-8 text-slate-400 space-y-3">
                          <PlayCircle className="w-16 h-16 mx-auto text-slate-600 opacity-60" />
                          <p className="text-sm font-semibold">Chưa có liên kết video hoặc URL không khả dụng.</p>
                          <p className="text-xs text-slate-500">Giảng viên có thể cập nhật đường link video trong Bảng điều khiển giảng viên.</p>
                        </div>
                      )}
                    </div>

                    {/* Study Notes & Completion Action */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm">Hướng dẫn học tập:</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Hệ thống đã tự động ghi nhận hoàn thành bài học này khi bạn vào xem bài giảng.
                        </p>
                      </div>

                      {nextActivity && !nextActivity.isLocked ? (
                        <button
                          onClick={() => handleOpenActivity(nextActivity)}
                          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer"
                        >
                          <span>Chuyển sang bài tiếp theo</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="px-4 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Đã hoàn thành</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 3. PDF / DOCX DOCUMENT DEDICATED PAGE */}
              {(selectedActivity.type === 'PDF' || selectedActivity.type === 'DOCX') && (() => {
                const docEmbedInfo = parseDocumentUrl(selectedActivity.contentUrl, selectedActivity.type);

                return (
                  <div className={`space-y-5 transition-all ${docFullscreen ? 'fixed inset-0 z-50 p-4 sm:p-6 bg-slate-900/95 backdrop-blur-md flex flex-col overflow-y-auto' : ''}`}>
                    {/* Document Header & Controls Toolbar */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          selectedActivity.type === 'PDF' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              selectedActivity.type === 'PDF' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {selectedActivity.type}
                            </span>
                            <span className="text-xs text-slate-400 font-medium truncate">Tài liệu học tập trực tuyến</span>
                          </div>
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate mt-0.5">
                            {selectedActivity.title}
                          </h3>
                        </div>
                      </div>

                      {/* Right action controls */}
                      <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
                        {/* Switch View Modes */}
                        <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setDocViewMode('embed')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                              docViewMode === 'embed'
                                ? 'bg-white text-blue-700 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Mở trong khung nhúng trực tiếp"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Khung nhúng</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDocViewMode('reader')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                              docViewMode === 'reader'
                                ? 'bg-white text-blue-700 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Mở bản đọc chi tiết"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Bản đọc chi tiết</span>
                          </button>
                        </div>

                        {/* Fullscreen button */}
                        <button
                          type="button"
                          onClick={() => setDocFullscreen((prev) => !prev)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all text-xs font-bold flex items-center gap-1.5"
                          title={docFullscreen ? 'Thu nhỏ cửa sổ' : 'Phóng to toàn màn hình'}
                        >
                          {docFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                          <span className="hidden sm:inline">{docFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
                        </button>

                        {/* Open in new tab */}
                        {selectedActivity.contentUrl && (
                          <a
                            href={selectedActivity.contentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all text-xs font-bold flex items-center gap-1.5"
                            title="Mở tài liệu ở tab mới"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span className="hidden sm:inline">Mở tab mới</span>
                          </a>
                        )}

                        {/* Download button */}
                        {selectedActivity.contentUrl && (
                          <a
                            href={selectedActivity.contentUrl}
                            download
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all text-xs font-bold flex items-center gap-1.5"
                            title="Tải tệp tài liệu về máy"
                          >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Tải về</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Main Embedded Viewer Area */}
                    <div className={`w-full bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden ${
                      docFullscreen ? 'flex-1 min-h-[600px]' : 'min-h-[750px] lg:min-h-[850px]'
                    }`}>
                      {docViewMode === 'embed' && docEmbedInfo.embedUrl ? (
                        <div className="w-full h-full flex flex-col relative bg-slate-50">
                          <iframe
                            src={docEmbedInfo.embedUrl}
                            title={selectedActivity.title}
                            className="w-full flex-1 border-0 min-h-[750px] lg:min-h-[850px] bg-white"
                            allow="fullscreen"
                          />
                        </div>
                      ) : (
                        /* Reader View */
                        <div className="p-6 sm:p-10 max-w-4xl mx-auto overflow-y-auto">
                          {renderDocumentReaderContent(selectedActivity.title, selectedActivity.type)}
                        </div>
                      )}
                    </div>

                    {/* Bottom Guidance and Next Lesson Navigation */}
                    {!docFullscreen && (
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Đã tự động ghi nhận hoàn thành bài học</h4>
                            <p className="text-xs text-slate-500">
                              Hệ thống đã tự động mở xem tài liệu và cập nhật tiến độ học phần cho bạn.
                            </p>
                          </div>
                        </div>

                        {nextActivity && !nextActivity.isLocked ? (
                          <button
                            onClick={() => handleOpenActivity(nextActivity)}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer"
                          >
                            <span>Chuyển sang bài tiếp theo</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đã hoàn thành nội dung</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 4. PRACTICE DEDICATED PAGE */}
              {selectedActivity.type === 'PRACTICE' && renderPracticeSection(selectedActivity)}

              {/* 5. ANNOUNCEMENT DEDICATED PAGE */}
              {selectedActivity.type === 'ANNOUNCEMENT' && (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
                  <div>
                    <span className="text-xs font-bold bg-purple-100 text-purple-800 px-3 py-1 rounded-full uppercase">
                      Bảng tin & Diễn đàn trao đổi
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                      {selectedActivity.title}
                    </h3>
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
              )}

              {/* 6. LINK / OVERVIEW DEDICATED PAGE */}
              {(selectedActivity.type === 'LINK' || selectedActivity.type === 'OVERVIEW') && (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
                  <div>
                    <span className="text-xs font-bold bg-teal-100 text-teal-800 px-3 py-1 rounded-full uppercase">
                      Liên kết & Tài nguyên ngoài
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                      {selectedActivity.title}
                    </h3>
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
              )}
            </div>
          ) : (
            /* ------------------------------------------------------------------- */
            /* CASE 2: COURSE OUTLINE PAGE (KHI CHƯA CHỌN HOẠT ĐỘNG HOẶC ẤN VỀ ĐỀ CƯƠNG) */
            /* ------------------------------------------------------------------- */
            <div className="space-y-6">
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
                  Mã học phần: <strong>INT3306</strong> • Giảng viên: <strong>TS. Nguyễn Văn A</strong> • Chọn từng bài học ở danh mục bên trái hoặc bên dưới để mở giao diện học tập hoặc làm bài trắc nghiệm riêng.
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
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                      <span className="text-[11px] text-slate-400">
                                        Loại: {item.type} {item.subtitle ? `• ${item.subtitle}` : ''}
                                      </span>
                                      {item.type === 'QUIZ' && !unlockedQuizKeys[getQuizAccessKey(item)] && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                                          <KeyRound className="h-3 w-3" />
                                          Cần mật khẩu
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {/* Status Badge */}
                                  {item.isCompleted ? (
                                    <div
                                      className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                                      title="Đã hoàn thành"
                                    >
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Done</span>
                                    </div>
                                  ) : isPracticeOrQuiz(item.type) ? (
                                    <div
                                      className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-default"
                                      title={
                                        item.type === 'PRACTICE'
                                          ? 'Cần nộp bài thực hành để đánh dấu hoàn thành'
                                          : 'Cần vượt qua bài trắc nghiệm để đánh dấu hoàn thành'
                                      }
                                    >
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      <span>{item.type === 'PRACTICE' ? 'Chưa nộp' : 'Chưa làm'}</span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={(e) => toggleItemCompletion(item.id, e)}
                                      className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-slate-100"
                                      title="Bấm để đánh dấu hoàn thành"
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
          )}
        </main>
      </div>
    </div>
  );
};
