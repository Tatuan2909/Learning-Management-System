import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Lock, PlayCircle, FileText, Search, UserCheck, ArrowRight, Award, PlusCircle, Sparkles, Filter, CheckSquare } from 'lucide-react';
import { CourseItem, LessonItem } from '../types';

interface Props {
  initialFilter?: 'ALL' | 'ENROLLED' | 'AVAILABLE';
  onSelectLessonForQuiz?: (lessonId: string, quizId: string) => void;
}

export const CoursesPage: React.FC<Props> = ({ initialFilter = 'ALL', onSelectLessonForQuiz }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'ENROLLED' | 'AVAILABLE'>(initialFilter);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);

  useEffect(() => {
    setFilterType(initialFilter);
  }, [initialFilter]);

  // Mock list of Courses matching database structure
  const [courses, setCourses] = useState<CourseItem[]>([
    {
      id: '44444444-4444-4444-4444-444444444444',
      courseCode: 'INT3306',
      title: 'Lập trình Web C# .NET 8 & ReactJS',
      description: 'Xây dựng ứng dụng Web Fullstack chuẩn Clean Architecture, N-Tier với EF Core & PostgreSQL.',
      teacherName: 'TS. Nguyễn Văn A',
      progressPercentage: 50.0,
      isEnrolled: true,
      lessonsCount: 4,
      lessons: [
        {
          id: '55555555-5555-5555-5555-555555555555',
          title: 'Bài 1: Giới thiệu Clean Architecture & RESTful API',
          orderIndex: 1,
          contentType: 'VIDEO',
          contentUrl: 'https://www.youtube.com/embed/d95475151',
          isLocked: false,
          isCompleted: true,
          quizPassed: true
        },
        {
          id: '99999999-9999-9999-9999-999999999999',
          title: 'Bài 2: Tích hợp JWT Auth & Role Authorization',
          orderIndex: 2,
          contentType: 'PDF',
          contentUrl: 'https://example.com/slides/jwt-guide.pdf',
          isLocked: false,
          isCompleted: false,
          quizPassed: false
        },
        {
          id: 'l3',
          title: 'Bài 3: Thiết kế Database Schema PostgreSQL & EF Core',
          orderIndex: 3,
          contentType: 'TEXT',
          isLocked: true,
          isCompleted: false,
          quizPassed: false
        },
        {
          id: 'l4',
          title: 'Bài 4: Xây dựng UI Widget Deadlines với React & Tailwind',
          orderIndex: 4,
          contentType: 'VIDEO',
          isLocked: true,
          isCompleted: false,
          quizPassed: false
        }
      ]
    },
    {
      id: 'c2',
      courseCode: 'CS101',
      title: 'Nhập môn Khoa học Máy tính & Thuật toán',
      description: 'Nền tảng cấu trúc dữ liệu, thuật toán sắp xếp và tư duy giải quyết vấn đề bằng máy tính.',
      teacherName: 'PGS. TS. Lê Văn C',
      progressPercentage: 100.0,
      isEnrolled: true,
      lessonsCount: 3,
      lessons: [
        { id: 'cs1', title: 'Bài 1: Tổng quan về Khoa học Máy tính', orderIndex: 1, contentType: 'VIDEO', isLocked: false, isCompleted: true, quizPassed: true },
        { id: 'cs2', title: 'Bài 2: Thuật toán Tìm kiếm & Sắp xếp', orderIndex: 2, contentType: 'VIDEO', isLocked: false, isCompleted: true, quizPassed: true },
        { id: 'cs3', title: 'Bài 3: Độ phức tạp thuật toán O(n)', orderIndex: 3, contentType: 'PDF', isLocked: false, isCompleted: true, quizPassed: true }
      ]
    },
    {
      id: 'c3',
      courseCode: 'DB201',
      title: 'Cơ sở Dữ liệu Quan hệ & PostgreSQL Advanced',
      description: 'Thiết kế cơ sở dữ liệu chuẩn hóa 3NF, Indexing, Partitioning, SQL Query Optimization.',
      teacherName: 'ThS. Phạm Thị D',
      progressPercentage: 0.0,
      isEnrolled: false,
      lessonsCount: 5
    },
    {
      id: 'c4',
      courseCode: 'SE302',
      title: 'Kiến trúc Phần mềm & Microservices',
      description: 'Tìm hiểu các mẫu kiến trúc Microservices, Event-Driven Architecture, Docker & Kubernetes.',
      teacherName: 'TS. Nguyễn Văn A',
      progressPercentage: 25.0,
      isEnrolled: true,
      lessonsCount: 4
    }
  ]);

  const handleEnroll = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, isEnrolled: true } : c))
    );
    alert('Chúc mừng! Bạn đã ghi danh thành công vào khóa học.');
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacherName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'ENROLLED') return matchesSearch && course.isEnrolled;
    if (filterType === 'AVAILABLE') return matchesSearch && !course.isEnrolled;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 w-full text-slate-900">
      {/* Softer, Gentle Header Banner */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-slate-50 rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xs border border-blue-100/80 relative overflow-hidden w-full">
        <div className="relative z-10 max-w-3xl">
          <span className="bg-blue-100/80 text-blue-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-3 border border-blue-200/60">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            {filterType === 'ENROLLED' ? 'Khóa học của tôi' : 'Danh mục Khóa học & Môn học'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-slate-900">
            {filterType === 'ENROLLED' ? 'Danh sách các Khóa học Bạn đã Đăng ký' : 'Khám phá & Chọn Khóa học'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
            {filterType === 'ENROLLED'
              ? 'Theo dõi tiến độ học tập, vào học bài giảng và hoàn thành bài kiểm tra trắc nghiệm cho từng môn học.'
              : 'Ghi danh vào các môn học mới, xem nội dung bài giảng và tích lũy điểm số học tập.'}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar - Pure White */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 w-full">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Mã môn (INT3306), Tên môn học..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Lọc:
          </span>
          <button
            onClick={() => setFilterType('ENROLLED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'ENROLLED'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Khóa học của tôi ({courses.filter((c) => c.isEnrolled).length})
          </button>
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'ALL'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả khóa học ({courses.length})
          </button>
          <button
            onClick={() => setFilterType('AVAILABLE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'AVAILABLE'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Chưa ghi danh ({courses.filter((c) => !c.isEnrolled).length})
          </button>
        </div>
      </div>

      {/* Course Cards Grid - Pure White */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
          >
            <div className="p-6">
              {/* Card Top Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="inline-block text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 uppercase tracking-wider mb-2">
                    {course.courseCode}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors leading-snug">
                    {course.title}
                  </h3>
                </div>

                {course.isEnrolled ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 flex-shrink-0">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Đã ghi danh
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 flex-shrink-0">
                    Chưa đăng ký
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                {course.description}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mb-4">
                <span>Giảng viên: <strong className="text-slate-800">{course.teacherName}</strong></span>
                <span>{course.lessonsCount} bài học</span>
              </div>

              {/* Progress Bar (If Enrolled) */}
              {course.isEnrolled && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Tiến độ bài học</span>
                    <span className="text-blue-600 font-bold">{course.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${course.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Card Footer Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedCourse(course)}
                className="text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Xem chi tiết danh sách bài học</span>
              </button>

              {course.isEnrolled ? (
                <button
                  onClick={() => {
                    if (onSelectLessonForQuiz) {
                      onSelectLessonForQuiz(course.id, '66666666-6666-6666-6666-666666666666');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-all"
                >
                  <span>Vào Trang Học</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => handleEnroll(course.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Ghi danh học</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md uppercase">
                  {selectedCourse.courseCode}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  {selectedCourse.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Danh sách bài giảng & Trắc nghiệm môn học:
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedCourse.lessons && selectedCourse.lessons.length > 0 ? (
                  selectedCourse.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        {lesson.contentType === 'VIDEO' && <PlayCircle className="w-4 h-4 text-blue-600" />}
                        {lesson.contentType === 'PDF' && <FileText className="w-4 h-4 text-indigo-600" />}
                        {lesson.contentType === 'TEXT' && <BookOpen className="w-4 h-4 text-emerald-600" />}
                        <span className="font-semibold text-slate-800">{lesson.title}</span>
                      </div>

                      {lesson.isLocked ? (
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                          <Lock className="w-3 h-3" /> Bị khóa
                        </span>
                      ) : lesson.isCompleted ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Hoàn thành
                        </span>
                      ) : (
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                          Đang mở
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic text-center py-4">Chưa có bài học nào được đăng.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-slate-800"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
