import React, { useState, useEffect } from 'react';
import { 
  Award, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  TrendingUp, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { AuthUser } from '../types';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

interface AssignmentGradeItem {
  id: string;
  title: string;
  dueDate: string;
  maxScore: number;
  isSubmitted: boolean;
  submittedAt: string | null;
  grade: number | null;
  feedback: string | null;
  status: string;
  submissionText: string | null;
  gitRepoUrl: string | null;
  files: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }[];
}

interface CourseTranscriptItem {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  teacherName: string;
  credits: number;
  weightAttendance: number;
  weightAssignments: number;
  weightFinalExam: number;
  attendanceScore: number;
  assignmentScore: number;
  examScore: number;
  totalScore: number;
  letterGrade: string;
  gpa4: number;
  isPassed: boolean;
  progressPercentage: number;
  isFinalized: boolean;
  finalizedAt: string | null;
  status: 'PASSED' | 'FAILED' | 'IN_PROGRESS';
  assignments: AssignmentGradeItem[];
}

interface TranscriptData {
  student: {
    id: string;
    fullName: string;
    email: string;
    studentCode: string;
    className: string;
    major: string;
  };
  summary: {
    totalCourses: number;
    passedCourses: number;
    inProgressCourses: number;
    failedCourses: number;
    totalCredits: number;
    earnedCredits: number;
    averageGpa10: number;
    averageGpa4: number;
    overallGrade: string;
  };
  courses: CourseTranscriptItem[];
}

interface Props {
  user: AuthUser;
  onOpenCourseStudy?: (courseId: string) => void;
}

export const StudentGradesPage: React.FC<Props> = ({ user, onOpenCourseStudy: _onOpenCourseStudy }) => {
  const { t } = useLanguage();
  const [data, setData] = useState<TranscriptData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PASSED' | 'IN_PROGRESS' | 'FAILED'>('ALL');

  const fetchTranscript = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<TranscriptData>(`/student/transcript?studentId=${user.userId}`);
      setData(res.data);
      if (res.data.courses && res.data.courses.length > 0) {
        setExpandedCourseId(res.data.courses[0].courseId);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải bảng điểm sinh viên:', err);
      setError('Không thể tải bảng điểm từ hệ thống. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranscript();
  }, [user.userId]);

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourseId((prev) => (prev === courseId ? null : courseId));
  };

  const filteredCourses = (data?.courses || []).filter((c) => {
    const matchSearch =
      c.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      filterStatus === 'ALL'
        ? true
        : filterStatus === 'PASSED'
        ? c.isPassed
        : filterStatus === 'IN_PROGRESS'
        ? c.status === 'IN_PROGRESS'
        : c.status === 'FAILED';

    return matchSearch && matchStatus;
  });

  const handleExportCsv = () => {
    if (!data || !data.courses.length) return;

    const headers = [
      'Mã học phần',
      'Tên học phần',
      'Giảng viên',
      'Số tín chỉ',
      'Chuyên cần (10%)',
      'Bài tập (30%)',
      'Cuối kỳ (60%)',
      'Điểm tổng kết (hệ 10)',
      'Điểm hệ 4',
      'Điểm chữ',
      'Trạng thái'
    ];

    const rows = data.courses.map((c) => [
      `"${c.courseCode}"`,
      `"${c.courseTitle.replace(/"/g, '""')}"`,
      `"${c.teacherName}"`,
      c.credits,
      c.attendanceScore,
      c.assignmentScore,
      c.examScore,
      c.totalScore,
      c.gpa4,
      `"${c.letterGrade}"`,
      `"${c.isPassed ? 'Đạt' : c.status === 'IN_PROGRESS' ? 'Đang học' : 'Không đạt'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BangDiem_${data.student.studentCode || 'SinhVien'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getLetterColor = (letter: string) => {
    if (letter.startsWith('A')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (letter.startsWith('B')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (letter.startsWith('C')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (letter.startsWith('D')) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const getStatusBadge = (course: CourseTranscriptItem) => {
    if (course.isPassed) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {t('passedStatus')}
        </span>
      );
    }
    if (course.status === 'IN_PROGRESS') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Clock className="w-3.5 h-3.5" />
          {t('inProgressStatus')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3.5 h-3.5" />
        {t('failedStatus')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-12 px-4 space-y-6">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-100 rounded-2xl border border-slate-200 animate-pulse"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-3xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">{t('cannotLoadGrades')}</h3>
        <p className="text-sm text-slate-500">{error || t('queryError')}</p>
        <button
          onClick={fetchTranscript}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
        >
          {t('reloadBtn')}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Top Banner & Student Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Award className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">{t('transcriptTitle')}</h1>
              <p className="text-xs text-slate-500">
                {t('transcriptSubtitle')}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600">
            <span>
              {t('student')}: <strong className="text-slate-900">{data.student.fullName}</strong>
            </span>
            <span>•</span>
            <span>
              {t('studentIdLabel')}: <strong className="text-blue-700 font-mono">{data.student.studentCode}</strong>
            </span>
            <span>•</span>
            <span>
              {t('classLabel')}: <strong className="text-slate-900">{data.student.className}</strong>
            </span>
            <span>•</span>
            <span>
              {t('majorLabel')}: <strong className="text-slate-900">{data.student.major}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{t('exportCsv')}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* GPA 10 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{t('gpa10')}</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{data.summary.averageGpa10.toFixed(2)}</span>
            <span className="text-xs text-slate-400 font-bold">/ 10.0</span>
          </div>
          <p className="text-[11px] text-slate-500">{t('gpa10Sub')}</p>
        </div>

        {/* GPA 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{t('gpa4')}</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-700">{data.summary.averageGpa4.toFixed(2)}</span>
            <span className="text-xs text-slate-400 font-bold">/ 4.0</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">{t('classification')}:</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${getLetterColor(data.summary.overallGrade)}`}>
              {t('grade')} {data.summary.overallGrade}
            </span>
          </div>
        </div>

        {/* Credits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{t('creditsEarned')}</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{data.summary.earnedCredits}</span>
            <span className="text-xs text-slate-400 font-bold">/ {data.summary.totalCredits} {t('creditsUnit')}</span>
          </div>
          <p className="text-[11px] text-slate-500">{t('creditsEarnedSub')}</p>
        </div>

        {/* Courses stats */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{t('courseStatusStats')}</span>
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{data.summary.totalCourses}</span>
            <span className="text-xs text-slate-400 font-bold">{t('coursesUnit')}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="text-emerald-700 font-bold">{data.summary.passedCourses} {t('passedStatus')}</span>
            <span>•</span>
            <span className="text-blue-700 font-bold">{data.summary.inProgressCourses} {t('inProgressStatus')}</span>
            {data.summary.failedCourses > 0 && (
              <>
                <span>•</span>
                <span className="text-rose-700 font-bold">{data.summary.failedCourses} {t('failedStatus')}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchGradePlaceholder')}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">{t('filterStatusLabel')}</span>
          <select
            value={filterStatus}
            onChange={(e: any) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">{t('filterAll')} ({data.courses.length})</option>
            <option value="PASSED">{t('filterPassed')} ({data.summary.passedCourses})</option>
            <option value="IN_PROGRESS">{t('filterInProgress')} ({data.summary.inProgressCourses})</option>
            <option value="FAILED">{t('filterFailed')} ({data.summary.failedCourses})</option>
          </select>
        </div>
      </div>

      {/* Transcript Courses List */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">{t('noCoursesFound')}</h4>
            <p className="text-xs text-slate-500">{t('noCoursesFoundSub')}</p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const isExpanded = expandedCourseId === course.courseId;

            return (
              <div
                key={course.courseId}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
              >
                {/* Course Header Summary Row */}
                <div
                  onClick={() => toggleCourseExpand(course.courseId)}
                  className="p-5 cursor-pointer hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                        {course.courseCode}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">{course.courseTitle}</h3>
                      {getStatusBadge(course)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{t('lecturerLabel')}: <strong className="text-slate-700">{course.teacherName}</strong></span>
                      <span>•</span>
                      <span>{course.credits} {t('creditsUnit')}</span>
                      <span>•</span>
                      <span>
                        {t('courseProgressPct')}: <strong className="text-blue-600">{course.progressPercentage}%</strong>
                      </span>
                    </div>
                  </div>

                  {/* Grade Components Summary */}
                  <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-between lg:justify-end">
                    {/* Attendance Score */}
                    <div className="text-center">
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                        {t('attendanceScore')} ({course.weightAttendance}%)
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {course.attendanceScore.toFixed(1)}
                      </span>
                    </div>

                    {/* Assignment Score */}
                    <div className="text-center">
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                        {t('assignmentScore')} ({course.weightAssignments}%)
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {course.assignmentScore.toFixed(1)}
                      </span>
                    </div>

                    {/* Exam Score */}
                    <div className="text-center">
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                        {t('examScore')} ({course.weightFinalExam}%)
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {course.examScore > 0 ? course.examScore.toFixed(1) : '—'}
                      </span>
                    </div>

                    {/* Total Score */}
                    <div className="text-center pl-3 border-l border-slate-200">
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">{t('totalGrade')}</span>
                      <div className="flex items-baseline gap-1 justify-center">
                        <span className="text-base font-extrabold text-blue-700">
                          {course.totalScore.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">/10</span>
                      </div>
                    </div>

                    {/* Letter Grade */}
                    <div className="text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-black border ${getLetterColor(course.letterGrade)}`}>
                        {t('grade')} {course.letterGrade}
                      </span>
                    </div>

                    {/* Expand/Collapse Chevron */}
                    <div className="text-slate-400 p-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details: Breakdown & Practice Assignments */}
                {isExpanded && (
                  <div className="p-6 bg-slate-50/50 space-y-6">
                    {/* Assignments Breakdown Table */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        {t('assignmentsListTitle')} ({course.assignments.length})
                      </h4>

                      {course.assignments.length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-4 bg-white rounded-xl border border-slate-200">
                          {t('noAssignmentsForCourse')}
                        </p>
                      ) : (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                                  <th className="p-3.5">{t('assignmentName')}</th>
                                  <th className="p-3.5">{t('dueDate')}</th>
                                  <th className="p-3.5">{t('submissionStatus')}</th>
                                  <th className="p-3.5">{t('submissionFiles')}</th>
                                  <th className="p-3.5 text-center">{t('score')}</th>
                                  <th className="p-3.5">{t('lecturerFeedback')}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-xs">
                                {course.assignments.map((ass) => {
                                  const isGraded = ass.grade !== null && ass.grade !== undefined;

                                  return (
                                    <tr key={ass.id} className="hover:bg-slate-50/70 transition-colors">
                                      <td className="p-3.5 font-bold text-slate-900 max-w-xs">
                                        {ass.title}
                                      </td>
                                      <td className="p-3.5 text-slate-600 whitespace-nowrap">
                                        {ass.dueDate}
                                      </td>
                                      <td className="p-3.5 whitespace-nowrap">
                                        {ass.isSubmitted ? (
                                          <div className="space-y-0.5">
                                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                                              <CheckCircle2 className="w-3 h-3" />
                                              {t('submittedStatus')}
                                            </span>
                                            {ass.submittedAt && (
                                              <p className="text-[10px] text-slate-400">
                                                {ass.submittedAt}
                                              </p>
                                            )}
                                          </div>
                                        ) : ass.status === 'OVERDUE' ? (
                                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-[11px]">
                                            <AlertCircle className="w-3 h-3" />
                                            {t('overdueStatus')}
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                                            <Clock className="w-3 h-3" />
                                            {t('notSubmittedStatus')}
                                          </span>
                                        )}
                                      </td>
                                      <td className="p-3.5">
                                        {ass.files && ass.files.length > 0 ? (
                                          <div className="space-y-1">
                                            {ass.files.map((f) => (
                                              <a
                                                key={f.id}
                                                href={`http://localhost:5000${f.fileUrl}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 hover:underline text-xs flex items-center gap-1 font-semibold truncate max-w-[180px]"
                                              >
                                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                <span>{f.fileName}</span>
                                              </a>
                                            ))}
                                          </div>
                                        ) : ass.gitRepoUrl ? (
                                          <a
                                            href={ass.gitRepoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 hover:underline text-xs flex items-center gap-1 font-semibold truncate max-w-[180px]"
                                          >
                                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                            <span>Repository</span>
                                          </a>
                                        ) : (
                                          <span className="text-slate-400 italic text-[11px]">{t('noFiles')}</span>
                                        )}
                                      </td>
                                      <td className="p-3.5 text-center whitespace-nowrap">
                                        {isGraded ? (
                                          <div className="inline-flex items-baseline gap-0.5">
                                            <span className="font-extrabold text-blue-700 text-sm">
                                              {ass.grade!.toFixed(1)}
                                            </span>
                                            <span className="text-[10px] text-slate-400">/{ass.maxScore}</span>
                                          </div>
                                        ) : (
                                          <span className="text-slate-400 text-xs italic">{t('notGradedYet')}</span>
                                        )}
                                      </td>
                                      <td className="p-3.5 text-slate-700 max-w-sm">
                                        {ass.feedback ? (
                                          <div className="flex items-start gap-1.5 p-2 bg-blue-50/60 border border-blue-100 rounded-lg text-xs">
                                            <MessageSquare className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-slate-800 leading-relaxed">{ass.feedback}</p>
                                          </div>
                                        ) : (
                                          <span className="text-slate-400 italic text-[11px]">{t('noFeedbackYet')}</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
