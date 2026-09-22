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
    <div className="space-y-8 w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden w-full">
        <div className="relative z-10 max-w-3xl">
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            {filterType === 'ENROLLED' ? 'Khóa học của tôi' : 'Danh mục Khóa học & Môn học'}
          </span>
          <h2 className="text-3xl font-extrabold leading-tight">
            {filterType === 'ENROLLED' ? 'Danh sách các Khóa học Bạn đã Đăng ký' : 'Khám phá & Chọn Khóa học'}
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            {filterType === 'ENROLLED'
              ? 'Theo dõi tiến độ học tập, vào học bài giảng và hoàn thành bài kiểm tra trắc nghiệm cho từng môn học.'
              : 'Ghi danh vào các môn học mới, xem nội dung bài giảng và tích lũy điểm số học tập.'}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 w-full">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Mã môn (INT3306), Tên môn học..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            Lọc:
          </span>
          <button
            onClick={() => setFilterType('ENROLLED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'ENROLLED'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Khóa học của tôi ({courses.filter((c) => c.isEnrolled).length})
          </button>
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tất cả khóa học ({courses.length})
          </button>
          <button
            onClick={() => setFilterType('AVAILABLE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'AVAILABLE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Chưa ghi danh ({courses.filter((c) => !c.isEnrolled).length})
          </button>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
          >
            <div className="p-6">
              {/* Card Top Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="inline-block text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-wider mb-2">
                    {course.courseCode}
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors leading-snug">
                    {course.title}
                  </h3>
                </div>

                {course.isEnrolled ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 flex-shrink-0">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Đã ghi danh
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200 flex-shrink-0">
                    Chưa đăng ký
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-2">
                {course.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 mb-4">
                <span>Giảng viên: <strong className="text-gray-800">{course.teacherName}</strong></span>
                <span>{course.lessonsCount} bài học</span>
              </div>

              {/* Progress Bar (If Enrolled) */}
              {course.isEnrolled && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-600">Tiến độ bài học</span>
                    <span className="text-blue-600 font-bold">{course.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${course.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Card Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              {course.isEnrolled ? (
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Vào học & Xem danh sách bài giảng</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => handleEnroll(course.id)}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Ghi danh học môn này ngay</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Course Detail Modal (Lessons Drawer) */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
              <div>
                <span className="text-xs font-bold bg-blue-600 text-white px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {selectedCourse.courseCode}
                </span>
                <h3 className="font-bold text-xl mt-2">{selectedCourse.title}</h3>
                <p className="text-xs text-slate-400 mt-1">Giảng viên: {selectedCourse.teacherName}</p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/10 text-xs font-bold"
              >
                ✕ Đóng
              </button>
            </div>

            {/* Modal Body: Lessons List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Danh sách bài giảng & Trắc nghiệm:
              </h4>

              {selectedCourse.lessons && selectedCourse.lessons.length > 0 ? (
                <div className="space-y-3">
                  {selectedCourse.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                        lesson.isCompleted
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : lesson.isLocked
                          ? 'border-gray-200 bg-gray-50 opacity-60'
                          : 'border-blue-200 bg-blue-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg text-white font-bold ${
                          lesson.isCompleted ? 'bg-emerald-600' : lesson.isLocked ? 'bg-gray-400' : 'bg-blue-600'
                        }`}>
                          {lesson.contentType === 'VIDEO' ? (
                            <PlayCircle className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <h5 className="font-semibold text-gray-900 text-sm">{lesson.title}</h5>
                          <span className="text-xs text-gray-500">
                            Định dạng: {lesson.contentType} • Bài {lesson.orderIndex}
                          </span>
                        </div>
                      </div>

                      {/* Status / Action */}
                      <div className="flex items-center gap-2">
                        {lesson.isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Đã hoàn thành
                          </span>
                        ) : lesson.isLocked ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                            <Lock className="w-3.5 h-3.5 text-gray-500" />
                            Khóa tuần tự
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedCourse(null);
                              if (onSelectLessonForQuiz) {
                                onSelectLessonForQuiz(lesson.id, '66666666-6666-6666-6666-666666666666');
                              }
                            }}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>Học bài & Làm trắc nghiệm</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Khóa học đang được giảng viên cập nhật thêm bài học.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-xs rounded-xl transition-all"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
