import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Award,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Clock,
  Send,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
  Check
} from 'lucide-react';
import { QuizDetail, SubmitQuizResponse, QuestionAnswer } from '../types';
import api from '../api/axios';

interface Props {
  quizId?: string;
  onNextLesson?: () => void;
  onBack?: () => void;
}

interface RichQuizQuestion {
  questionId: string;
  questionText: string;
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  points: number;
  options: { optionId: string; optionText: string }[];
  correctOptionId: string;
  explanation: string;
}

export const PostLessonQuiz: React.FC<Props> = ({ quizId, onNextLesson, onBack }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<SubmitQuizResponse | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Timer: 15 minutes = 900 seconds
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);

  // Rich Bank of 10 Realistic LMS Questions
  const [questions, setQuestions] = useState<RichQuizQuestion[]>([
    {
      questionId: 'q1',
      questionText: 'Thành phần nào dưới đây thuộc tầng Domain trong mô hình Clean Architecture .NET 8?',
      questionType: 'SINGLE_CHOICE',
      points: 10,
      options: [
        { optionId: 'opt1_1', optionText: 'Entities, Value Objects và Domain Exceptions' },
        { optionId: 'opt1_2', optionText: 'DbContext và Entity Framework Migrations' },
        { optionId: 'opt1_3', optionText: 'API Controllers, Filters và Swagger UI' },
        { optionId: 'opt1_4', optionText: 'Appsettings.json và Logging Middleware' }
      ],
      correctOptionId: 'opt1_1',
      explanation: 'Tầng Domain là hạt nhân trung tâm của hệ thống, chỉ chứa các Entity nghiệp vụ, Enums và Domain Exceptions thuần túy, không phụ thuộc vào công nghệ cơ sở dữ liệu hay giao diện.'
    },
    {
      questionId: 'q2',
      questionText: 'HTTP Method nào theo chuẩn RESTful được khuyến nghị sử dụng khi tạo mới một tài nguyên?',
      questionType: 'SINGLE_CHOICE',
      points: 10,
      options: [
        { optionId: 'opt2_1', optionText: 'GET' },
        { optionId: 'opt2_2', optionText: 'POST' },
        { optionId: 'opt2_3', optionText: 'PUT' },
        { optionId: 'opt2_4', optionText: 'DELETE' }
      ],
      correctOptionId: 'opt2_2',
      explanation: 'POST được sử dụng để tạo mới tài nguyên trên máy chủ và thường trả về HTTP Status Code 201 Created cùng với URL của tài nguyên mới.'
    },
    {
      questionId: 'q3',
      questionText: 'Trong Entity Framework Core, lệnh nào được dùng để thực thi và áp dụng các Migration vào database PostgreSQL?',
      questionType: 'SINGLE_CHOICE',
      points: 10,
      options: [
        { optionId: 'opt3_1', optionText: 'context.Database.MigrateAsync()' },
        { optionId: 'opt3_2', optionText: 'context.Database.EnsureCreatedAsync()' },
        { optionId: 'opt3_3', optionText: 'context.SaveChangesAsync()' },
        { optionId: 'opt3_4', optionText: 'context.Database.OpenConnection()' }
      ],
      correctOptionId: 'opt3_1',
      explanation: 'MigrateAsync() tự động kiểm tra bảng lịch sử __EFMigrationsHistory và áp dụng các file migration chưa được chạy lên máy chủ database.'
    },
    {
      questionId: 'q4',
      questionText: 'Trong ASP.NET Core, Service Lifetime nào đảm bảo mỗi HTTP Request chỉ có duy nhất một instance của service được tạo?',
      questionType: 'SINGLE_CHOICE',
      points: 10,
      options: [
        { optionId: 'opt4_1', optionText: 'Transient (AddTransient)' },
        { optionId: 'opt4_2', optionText: 'Scoped (AddScoped)' },
        { optionId: 'opt4_3', optionText: 'Singleton (AddSingleton)' },
        { optionId: 'opt4_4', optionText: 'Pooled (AddPooled)' }
      ],
      correctOptionId: 'opt4_2',
      explanation: 'Scoped Lifetime (AddScoped) tạo một đối tượng duy nhất cho toàn bộ vòng đời của một HTTP Request và chia sẻ giữa các controller/service trong request đó.'
    },
    {
      questionId: 'q5',
      questionText: 'Mã phản hồi HTTP Status Code nào biểu thị yêu cầu đã được xử lý thành công nhưng không có dữ liệu trả về trong body?',
      questionType: 'SINGLE_CHOICE',
      points: 10,
      options: [
        { optionId: 'opt5_1', optionText: '200 OK' },
        { optionId: 'opt5_2', optionText: '201 Created' },
        { optionId: 'opt5_3', optionText: '204 No Content' },
        { optionId: 'opt5_4', optionText: '400 Bad Request' }
      ],
      correctOptionId: 'opt5_3',
      explanation: '204 No Content thường được dùng trong các phương thức DELETE hoặc PUT khi thao tác thành công và không cần trả về thêm dữ liệu.'
    },
    {
      questionId: 'q6',
      questionText: 'Cơ chế nào giúp bảo vệ hệ thống xác thực JWT chống lại việc tái sử dụng token khi một Refresh Token bị rò rỉ?',
      questionType: 'SINGLE_CHOICE',
      points: 10,
      options: [
        { optionId: 'opt6_1', optionText: 'Refresh Token Rotation & Hủy toàn bộ token family khi phát hiện tái sử dụng' },
        { optionId: 'opt6_2', optionText: 'Kéo dài thời hạn sống của Access Token lên 30 ngày' },
        { optionId: 'opt6_3', optionText: 'Bỏ qua việc kiểm tra chữ ký bí mật HMAC-SHA256' },
        { optionId: 'opt6_4', optionText: 'Lưu trữ mật khẩu trực tiếp vào Payload của JWT' }
      ],
      correctOptionId: 'opt6_1',
      explanation: 'Refresh Token Rotation cấp một refresh token mới mỗi lần làm mới, và nếu một token cũ bị kẻ xấu dùng lại, hệ thống sẽ ngay lập tức thu hồi toàn bộ phiên đăng nhập.'
    },
    {
      questionId: 'q7',
      questionText: 'Mô hình xử lý Middleware Pipeline trong ASP.NET Core hoạt động theo cơ chế nào?',
      questionType: 'SINGLE_CHOICE',
      points: 10,
      options: [
        { optionId: 'opt7_1', optionText: 'Pipeline hai chiều (Request duyệt xuôi, Response duyệt ngược tuần tự)' },
        { optionId: 'opt7_2', optionText: 'Thực thi song song ngẫu nhiên không có thứ tự' },
        { optionId: 'opt7_3', optionText: 'Chỉ cho phép chạy duy nhất 1 middleware cho mỗi request' },
        { optionId: 'opt7_4', optionText: 'Chạy độc lập trên background worker' }
      ],
      correctOptionId: 'opt7_1',
      explanation: 'Middleware được tổ chức thành chuỗi liên kết (pipeline): request đi qua từng middleware theo thứ tự khai báo, và response quay ngược lại theo chiều ngược lại.'
    },
    {
      questionId: 'q8',
      questionText: 'Trong React, Hook nào được thiết kế để xử lý các side effects như gọi API, thiết lập timer hoặc tương tác DOM?',
      questionType: 'SINGLE_CHOICE',
      points: 10,
      options: [
        { optionId: 'opt8_1', optionText: 'useState' },
        { optionId: 'opt8_2', optionText: 'useEffect' },
        { optionId: 'opt8_3', optionText: 'useMemo' },
        { optionId: 'opt8_4', optionText: 'useCallback' }
      ],
      correctOptionId: 'opt8_2',
      explanation: 'useEffect cho phép thực thi các tác vụ side-effect sau khi component render, và nhận dependency array để kiểm soát thời điểm chạy lại.'
    },
    {
      questionId: 'q9',
      questionText: 'Định dạng dữ liệu nào là chuẩn giao tiếp phổ biến nhất hiện nay giữa Backend RESTful API và Frontend ReactJS?',
      questionType: 'SINGLE_CHOICE',
      points: 10,
      options: [
        { optionId: 'opt9_1', optionText: 'XML' },
        { optionId: 'opt9_2', optionText: 'JSON (JavaScript Object Notation)' },
        { optionId: 'opt9_3', optionText: 'CSV' },
        { optionId: 'opt9_4', optionText: 'SOAP Payload' }
      ],
      correctOptionId: 'opt9_2',
      explanation: 'JSON nhẹ, dễ đọc, tương thích tự nhiên với JavaScript/TypeScript và là chuẩn mực công nghiệp cho các ứng dụng web hiện đại.'
    },
    {
      questionId: 'q10',
      questionText: 'Mục đích chính của việc sử dụng DTO (Data Transfer Object) trong kiến trúc Web API là gì?',
      questionType: 'SINGLE_CHOICE',
      points: 10,
      options: [
        { optionId: 'opt10_1', optionText: 'Ẩn chi tiết cơ sở dữ liệu, lọc bỏ dữ liệu nhạy cảm và tối ưu payload gửi qua mạng' },
        { optionId: 'opt10_2', optionText: 'Bắt buộc client phải truy cập trực tiếp vào database' },
        { optionId: 'opt10_3', optionText: 'Tăng kích thước dữ liệu để kiểm thử tải mạng' },
        { optionId: 'opt10_4', optionText: 'Thay thế hoàn toàn Entity Framework Core' }
      ],
      correctOptionId: 'opt10_1',
      explanation: 'DTO giúp tách biệt mô hình cơ sở dữ liệu nội bộ khỏi hợp đồng dữ liệu công khai (API Contract), ngăn ngừa Over-Posting Attack và giảm lưu lượng mạng.'
    }
  ]);

  // Countdown Timer
  useEffect(() => {
    if (result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [result]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (result) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: [optionId]
    }));
  };

  const answeredCount = Object.keys(selectedAnswers).filter(
    (qId) => selectedAnswers[qId] && selectedAnswers[qId].length > 0
  ).length;

  const handleAutoSubmit = () => {
    alert('Hết thời gian làm bài! Hệ thống đang tự động nộp bài thi của bạn.');
    executeSubmission();
  };

  const handleFinishEarly = () => {
    setShowConfirmModal(true);
  };

  const executeSubmission = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);

    let earnedScore = 0;
    questions.forEach((q) => {
      const chosen = selectedAnswers[q.questionId]?.[0];
      if (chosen === q.correctOptionId) {
        earnedScore += q.points;
      }
    });

    const isPassed = earnedScore >= 70;

    // Simulate short network delay for smooth experience
    setTimeout(() => {
      setResult({
        quizAttemptId: `attempt-${Date.now()}`,
        score: earnedScore,
        passingScore: 70,
        isPassed,
        lessonProgressUpdated: isPassed,
        message: isPassed
          ? `Xuất sắc! Bạn đã đạt ${earnedScore}/100 điểm (Yêu cầu >= 70 điểm). Bạn đã hoàn thành xuất sắc bài kiểm tra trắc nghiệm.`
          : `Bạn đạt ${earnedScore}/100 điểm. Chưa đủ điểm đạt (Yêu cầu >= 70 điểm). Hãy xem lại phần giải thích bên dưới và thử lại!`
      });
      setSubmitting(false);
    }, 400);
  };

  const handleRetake = () => {
    setResult(null);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setTimeLeft(15 * 60);
    setTimeSpentSeconds(0);
  };

  const currentQuestion = questions[currentIndex];
  const currentAnswer = selectedAnswers[currentQuestion.questionId]?.[0];

  return (
    <div className="space-y-6 w-full text-slate-800 font-sans">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all font-bold text-xs flex items-center gap-1"
              title="Quay lại"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 font-extrabold text-xs px-2.5 py-0.5 rounded-md uppercase">
                INT3306 • Trắc nghiệm
              </span>
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Bài kiểm tra Kiến thức: Clean Architecture & RESTful API .NET 8
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              10 câu hỏi trắc nghiệm • Điểm đạt: 70/100 (70%) • Thời lượng tối đa: 15 phút
            </p>
          </div>
        </div>

        {/* Live Timer Clock */}
        {!result && (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
            <Clock className={`w-4 h-4 ${timeLeft < 180 ? 'text-rose-600 animate-pulse' : 'text-blue-600'}`} />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Thời gian còn lại</span>
              <span className={`text-base font-black font-mono ${timeLeft < 180 ? 'text-rose-600' : 'text-slate-900'}`}>
                {formatTimer(timeLeft)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* RESULT VIEW (AFTER SUBMISSION)                                            */}
      {/* ========================================================================= */}
      {result && (
        <div className="space-y-6 w-full">
          {/* Result Banner */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6 ${
              result.isPassed
                ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border-emerald-200 text-emerald-950'
                : 'bg-gradient-to-r from-rose-50 via-amber-50 to-slate-50 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-5">
              <div
                className={`p-4 rounded-2xl ${
                  result.isPassed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {result.isPassed ? <Award className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
              </div>

              <div>
                <span
                  className={`text-xs font-black uppercase px-3 py-1 rounded-full inline-block mb-1.5 ${
                    result.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {result.isPassed ? 'Kết quả: ĐẠT YÊU CẦU' : 'Kết quả: CHƯA ĐẠT'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {result.score} / 100 điểm
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
                  {result.message}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleRetake}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-200 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm lại bài thi</span>
              </button>

              {onNextLesson && result.isPassed && (
                <button
                  onClick={onNextLesson}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <span>Chuyển sang bài tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Chi tiết Lời giải & Đáp án từng câu
            </h4>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userChoice = selectedAnswers[q.questionId]?.[0];
                const isCorrect = userChoice === q.correctOptionId;

                return (
                  <div
                    key={q.questionId}
                    className={`p-5 rounded-2xl border ${
                      isCorrect ? 'bg-emerald-50/20 border-emerald-200' : 'bg-rose-50/20 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm">{q.questionText}</h5>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                          isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isCorrect ? `+${q.points} điểm` : '0 điểm'}
                      </span>
                    </div>

                    {/* Options list in review */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                      {q.options.map((opt) => {
                        const isChosen = userChoice === opt.optionId;
                        const isTheCorrectOne = q.correctOptionId === opt.optionId;

                        return (
                          <div
                            key={opt.optionId}
                            className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                              isTheCorrectOne
                                ? 'bg-emerald-100/60 border-emerald-300 font-bold text-emerald-900'
                                : isChosen && !isTheCorrectOne
                                ? 'bg-rose-100/60 border-rose-300 font-semibold text-rose-900 line-through'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border border-current">
                              {isTheCorrectOne ? '✓' : isChosen ? '✗' : '•'}
                            </span>
                            <span>{opt.optionText}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      <strong className="text-slate-900">Giải thích: </strong>
                      <span>{q.explanation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAKING QUIZ VIEW: 2-COLUMN LAYOUT                                         */}
      {/* CENTER: SINGLE SELECTED QUESTION | RIGHT: QUESTION NUMBERS PALETTE        */}
      {/* ========================================================================= */}
      {!result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
          {/* --------------------------------------------------------------------- */}
          {/* CENTER AREA (8 COLS): ĐẶC BIỆT CHỈ HIỂN THỊ CÂU HỎI ĐANG ĐƯỢC CHỌN TỚI */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-xs">
                    Câu {currentIndex + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    trên {questions.length} câu
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                    {currentQuestion.points} điểm
                  </span>
                  <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                    (Chọn 1 đáp án đúng)
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-relaxed">
                  {currentQuestion.questionText}
                </h3>
              </div>

              {/* Options List (A, B, C, D) */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                  const isSelected = currentAnswer === opt.optionId;

                  return (
                    <label
                      key={opt.optionId}
                      onClick={() => handleSelectOption(currentQuestion.questionId, opt.optionId)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-slate-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {letter}
                      </div>

                      <span className="text-xs sm:text-sm font-semibold flex-1 leading-snug">
                        {opt.optionText}
                      </span>

                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Navigation buttons: Prev / Next / Submit */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all border border-slate-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Câu trước</span>
                </button>

                <div className="text-xs text-slate-400 font-medium hidden sm:block">
                  Câu hỏi {currentIndex + 1} / {questions.length}
                </div>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <span>Câu tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishEarly}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Làm xong & Nộp bài</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT SIDEBAR (4 COLS): MENU SỐ CÂU HỎI BÊN PHẢI & TEXTLINE LÀM XONG    */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5 sticky top-20">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  Bảng câu hỏi bài thi
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bấm vào số câu để chuyển trực tiếp đến câu hỏi đó
                </p>
              </div>

              {/* Question Number Palette Grid */}
              <div className="grid grid-cols-5 gap-2.5">
                {questions.map((q, idx) => {
                  const isCurrent = currentIndex === idx;
                  const isAnswered = selectedAnswers[q.questionId] && selectedAnswers[q.questionId].length > 0;

                  return (
                    <button
                      key={q.questionId}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-11 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-0.5 relative ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-500 ring-offset-2 scale-105'
                          : isAnswered
                          ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                      title={`Câu ${idx + 1}: ${isAnswered ? 'Đã chọn đáp án' : 'Chưa trả lời'}`}
                    >
                      <span>{idx + 1}</span>
                      {isAnswered && !isCurrent && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className="w-3 h-3 rounded-md bg-blue-600"></span>
                    <span>Đang làm:</span>
                  </span>
                  <strong className="text-blue-700">Câu {currentIndex + 1}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-300"></span>
                    <span>Đã trả lời:</span>
                  </span>
                  <strong className="text-emerald-700 font-bold">
                    {answeredCount} / {questions.length} câu
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className="w-3 h-3 rounded-md bg-slate-200"></span>
                    <span>Chưa trả lời:</span>
                  </span>
                  <strong className="text-slate-600">
                    {questions.length - answeredCount} câu
                  </strong>
                </div>
              </div>

              {/* TEXTLINE LÀM XONG - ẤN VÔ KHÔNG CẦN ĐỢI HẾT THỜI GIAN */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold">Tiến độ hoàn thành:</span>
                  <span className="font-extrabold text-blue-700">
                    {Math.round((answeredCount / questions.length) * 100)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                  ></div>
                </div>

                {/* Primary Button: Nộp bài (Làm xong) */}
                <button
                  onClick={handleFinishEarly}
                  disabled={submitting}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Làm xong & Nộp bài thi</span>
                </button>

                <p className="text-[11px] text-center text-slate-500 italic leading-snug">
                  ⚡ Bạn có thể ấn nộp bài bất kỳ lúc nào, không cần phải đợi hết thời gian.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION SUBMIT MODAL                                                 */}
      {/* ========================================================================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                Xác nhận nộp bài trắc nghiệm
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              <p>
                Bạn đã trả lời được <strong className="text-slate-900">{answeredCount} / {questions.length}</strong> câu hỏi.
              </p>

              {answeredCount < questions.length ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Bạn vẫn còn <strong>{questions.length - answeredCount} câu chưa trả lời</strong>. Các câu chưa trả lời sẽ được tính là 0 điểm. Bạn có chắc chắn muốn nộp bài ngay bây giờ không?
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Bạn đã hoàn thành toàn bộ 10 câu hỏi! Điểm số sẽ được chấm và công bố ngay sau khi bạn xác nhận.
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-all"
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                onClick={executeSubmission}
                disabled={submitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang chấm điểm...</span>
                  </>
                ) : (
                  <span>Xác nhận nộp bài</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
