import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  CheckCircle2,
  XCircle,
  Award,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Clock,
  Send,
  RotateCcw,
  Check,
  Eye,
  BookOpen
} from 'lucide-react';
import { 
  QuizDetail, 
  QuizQuestion, 
  QuizOption, 
  SubmitQuizResponse, 
  QuestionAnswer,
  QuizReview,
  QuizAttemptSummary
} from '../types';
import api from '../api/axios';

interface Props {
  quizId?: string;
  onNextLesson?: () => void;
  onBack?: () => void;
}

export const PostLessonQuiz: React.FC<Props> = ({ quizId, onNextLesson, onBack }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<SubmitQuizResponse | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Quiz Review & History states
  const [latestAttempt, setLatestAttempt] = useState<QuizAttemptSummary | null>(null);
  const [reviewData, setReviewData] = useState<QuizReview | null>(null);
  const [loadingReview, setLoadingReview] = useState<boolean>(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);

  const [quizDetail, setQuizDetail] = useState<QuizDetail | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const targetQuizId = quizId || '66666666-6666-6666-6666-666666666666';

  const getStudentId = () => {
    try {
      const userStr = localStorage.getItem('user_info');
      if (userStr) return JSON.parse(userStr).userId;
    } catch {}
    return '33333333-3333-3333-3333-333333333333';
  };

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const studentId = getStudentId();

      const res = await api.get<QuizDetail>(`/quiz/${targetQuizId}`);
      if (res.data) {
        setQuizDetail(res.data);
        const qList = res.data.questions || [];
        setQuestions(qList);
        if (res.data.timeLimitMinutes && res.data.timeLimitMinutes > 0) {
          setTimeLeft(res.data.timeLimitMinutes * 60);
        } else {
          setTimeLeft(15 * 60);
        }
      }

      // Check for existing latest attempt from database
      try {
        const attemptRes = await api.get<QuizAttemptSummary>(`/quiz/${targetQuizId}/latest-attempt?studentId=${studentId}`);
        if (attemptRes.data) {
          setLatestAttempt(attemptRes.data);
        }
      } catch {
        setLatestAttempt(null);
      }
    } catch (err: any) {
      console.error('Lỗi tải bài kiểm tra trắc nghiệm từ CSDL:', err);
      setError('Không thể tải bài trắc nghiệm từ cơ sở dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [targetQuizId]);

  // Countdown timer
  useEffect(() => {
    if (result || reviewData || loading || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [result, reviewData, loading, questions.length]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionId: string, isMultiple: boolean) => {
    if (result || reviewData) return;

    setSelectedAnswers((prev) => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...current, optionId] };
        }
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const answeredCount = Object.keys(selectedAnswers).filter(
    (qId) => selectedAnswers[qId] && selectedAnswers[qId].length > 0
  ).length;

  const handleAutoSubmit = () => {
    alert('⏰ Hết thời gian làm bài! Hệ thống đang tự động nộp bài thi của bạn.');
    executeSubmission();
  };

  const handleFinishEarly = () => {
    setShowConfirmModal(true);
  };

  const handleLoadReview = async (attemptId: string) => {
    try {
      setLoadingReview(true);
      const res = await api.get<QuizReview>(`/quiz/attempts/${attemptId}/review`);
      setReviewData(res.data);
    } catch (err: any) {
      console.error('Lỗi khi tải chi tiết bài làm:', err);
      alert('Không thể tải bài làm trắc nghiệm: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingReview(false);
    }
  };

  const executeSubmission = async () => {
    if (!quizDetail) return;
    setShowConfirmModal(false);
    setSubmitting(true);

    try {
      const studentId = getStudentId();

      const answers: QuestionAnswer[] = Object.entries(selectedAnswers).map(
        ([questionId, selectedOptionIds]) => ({
          questionId,
          selectedOptionIds
        })
      );

      const res = await api.post<SubmitQuizResponse>('/quiz/submit', {
        quizId: quizDetail.quizId,
        studentId,
        answers
      });

      setResult(res.data);

      // Tự động tải luôn chi tiết lời giải & đáp án từ CSDL
      if (res.data.quizAttemptId) {
        await handleLoadReview(res.data.quizAttemptId);
      }

      if (res.data.isPassed && onNextLesson) {
        onNextLesson();
      }
    } catch (err: any) {
      console.error('Lỗi khi nộp bài trắc nghiệm:', err);
      alert('Lỗi nộp bài trắc nghiệm: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setReviewData(null);
    setSelectedAnswers({});
    setCurrentIndex(0);
    if (quizDetail?.timeLimitMinutes) {
      setTimeLeft(quizDetail.timeLimitMinutes * 60);
    } else {
      setTimeLeft(15 * 60);
    }
    fetchQuiz();
  };

  // 1. Loading State
  if (loading || loadingReview) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-2xs">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-bold text-slate-700">
          {loadingReview ? 'Đang tải chi tiết lời giải & kết quả làm bài từ CSDL...' : 'Đang tải bài trắc nghiệm từ cơ sở dữ liệu...'}
        </p>
      </div>
    );
  }

  // 2. Error / Empty State
  if (error || !quizDetail || questions.length === 0) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-2xs">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg">
            {error ? 'Không thể tải đề thi' : 'Chưa có câu hỏi cho bài trắc nghiệm này'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {error || 'Giảng viên đang hoàn thiện ngân hàng câu hỏi. Vui lòng quay lại sau!'}
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          {onBack && (
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              Quay lại đề cương
            </button>
          )}
          <button
            onClick={fetchQuiz}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. QUIZ REVIEW VIEW (ĐÃ NỘP HOẶC BẤM XEM LẠI BÀI THI)
  // =========================================================================
  if (reviewData) {
    return (
      <div className="space-y-6 w-full text-slate-800 font-sans">
        {/* Review Top Score Banner */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6 ${
            reviewData.isPassed
              ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border-emerald-200 text-emerald-950'
              : 'bg-gradient-to-r from-rose-50 via-amber-50 to-slate-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-5">
            <div
              className={`p-4 rounded-2xl ${
                reviewData.isPassed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {reviewData.isPassed ? <Award className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
            </div>

            <div>
              <span
                className={`text-xs font-black uppercase px-3 py-1 rounded-full inline-block mb-1.5 ${
                  reviewData.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {reviewData.isPassed ? 'KẾT QUẢ: ĐẠT YÊU CẦU' : 'KẾT QUẢ: CHƯA ĐẠT'} (Lượt thi #{reviewData.attemptNumber})
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {reviewData.scoreAchieved.toFixed(1)} / {reviewData.maxScore} điểm
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
                Điểm yêu cầu để qua bài: <strong>{reviewData.passingScore} điểm</strong>.
                {reviewData.isPassed
                  ? ' Chúc mừng bạn đã hoàn thành và vượt qua bài trắc nghiệm!'
                  : ' Bạn chưa đạt số điểm tối thiểu. Hãy xem lại lời giải chi tiết bên dưới và làm lại nhé!'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleRetake}
              className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-300 shadow-2xs transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm lại bài thi</span>
            </button>

            {onNextLesson && reviewData.isPassed && (
              <button
                onClick={onNextLesson}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <span>Chuyển sang bài tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {onBack && (
              <button
                onClick={onBack}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>Quay lại bài học</span>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Question by Question Review */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Xem lại chi tiết bài làm, đáp án & lời giải
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Các phương án màu xanh là đáp án chính xác. Các phương án màu đỏ là lựa chọn sai của bạn.
              </p>
            </div>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              Tổng số {reviewData.questions.length} câu
            </span>
          </div>

          <div className="space-y-6">
            {reviewData.questions.map((q, idx) => {
              const userChoices = q.selectedOptionIds || [];

              return (
                <div
                  key={q.questionId}
                  className={`p-5 sm:p-6 rounded-2xl border space-y-4 transition-all ${
                    q.isCorrect
                      ? 'bg-slate-50/60 border-emerald-200 ring-1 ring-emerald-200/50'
                      : 'bg-rose-50/30 border-rose-200 ring-1 ring-rose-200/50'
                  }`}
                >
                  {/* Question header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          q.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                          {q.questionText}
                        </h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                              q.isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {q.isCorrect ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Trả lời đúng (+{q.pointsEarned} điểm)</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                <span>Trả lời sai (0 / {q.points} điểm)</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap bg-white border border-slate-200 text-slate-700 flex-shrink-0">
                      {q.points} điểm
                    </span>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isChosen = userChoices.includes(opt.optionId);
                      const isCorrect = opt.isCorrect;

                      let cardStyle = 'bg-white border-slate-200 text-slate-600';
                      let letterStyle = 'bg-slate-100 text-slate-600';
                      let badge = null;

                      if (isCorrect) {
                        // Đáp án đúng
                        cardStyle = 'bg-emerald-50/90 border-emerald-400 font-bold text-emerald-950 ring-1 ring-emerald-400';
                        letterStyle = 'bg-emerald-600 text-white';
                        badge = (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-extrabold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            {isChosen ? 'Bạn chọn đúng' : 'Đáp án đúng'}
                          </span>
                        );
                      } else if (isChosen && !isCorrect) {
                        // Sinh viên chọn sai
                        cardStyle = 'bg-rose-50/90 border-rose-400 font-bold text-rose-950 ring-1 ring-rose-400';
                        letterStyle = 'bg-rose-600 text-white';
                        badge = (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[10px] font-extrabold">
                            <XCircle className="w-3 h-3 text-rose-700" />
                            Bạn đã chọn sai
                          </span>
                        );
                      }

                      return (
                        <div
                          key={opt.optionId}
                          className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition-all ${cardStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black flex-shrink-0 ${letterStyle}`}
                          >
                            {letter}
                          </span>
                          <span className="flex-1 leading-snug">{opt.optionText}</span>
                          {badge}
                        </div>
                      );
                    })}
                  </div>

                  {/* Question Explanation Box */}
                  {q.explanation && (
                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 leading-relaxed space-y-1">
                      <div className="font-extrabold flex items-center gap-1 text-blue-900">
                        <span>💡 Lời giải & Giải thích chi tiết:</span>
                      </div>
                      <p className="text-slate-700">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. TAKING QUIZ VIEW (HOẶC LỰA CHỌN XEM LẠI BÀI CŨ)
  // =========================================================================
  const safeIndex = Math.min(Math.max(0, currentIndex), questions.length - 1);
  const currentQuestion = questions[safeIndex];
  const isMultiple = currentQuestion.questionType === 'MULTIPLE_CHOICE';
  const currentSelectedOptions = selectedAnswers[currentQuestion.questionId] || [];

  return (
    <div className="space-y-6 w-full text-slate-800 font-sans">
      {/* Existing Attempt Alert Banner (If student has previous attempt) */}
      {latestAttempt && Object.keys(selectedAnswers).length === 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-blue-600 text-white rounded-xl">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Lần làm bài gần nhất: {latestAttempt.scoreAchieved.toFixed(1)}/{latestAttempt.maxScore} điểm
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    latestAttempt.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {latestAttempt.isPassed ? 'ĐÃ ĐẠT' : 'CHƯA ĐẠT'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Bạn có thể xem lại chi tiết bài làm hoặc làm lại bài thi bên dưới.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleLoadReview(latestAttempt.attemptId)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem lại chi tiết bài thi</span>
            </button>
          </div>
        </div>
      )}

      {/* 2-COLUMN TAKING QUIZ LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        {/* LEFT AREA (8 COLS): 1 QUESTION */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-xs">
                  Câu {safeIndex + 1}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  trên tổng số {questions.length} câu
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                  {currentQuestion.points} điểm
                </span>
                <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                  ({isMultiple ? 'Chọn nhiều đáp án' : 'Chọn 1 đáp án đúng'})
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-relaxed">
                {currentQuestion.questionText}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt: QuizOption, optIdx: number) => {
                const letter = String.fromCharCode(65 + optIdx);
                const isSelected = currentSelectedOptions.includes(opt.optionId);

                return (
                  <label
                    key={opt.optionId}
                    onClick={() => handleSelectOption(currentQuestion.questionId, opt.optionId, isMultiple)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${
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
                disabled={safeIndex === 0}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all border border-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              <div className="text-xs text-slate-400 font-medium hidden sm:block">
                Câu hỏi {safeIndex + 1} / {questions.length}
              </div>

              {safeIndex < questions.length - 1 ? (
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

        {/* RIGHT SIDEBAR (4 COLS): TIMER & PALETTE */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5 sticky top-20">
            {/* 1. Timer Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    timeLeft < 180 ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  <Clock className={`w-5 h-5 ${timeLeft < 180 ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">
                    Thời gian còn lại
                  </span>
                  <span
                    className={`text-lg font-black font-mono leading-tight ${
                      timeLeft < 180 ? 'text-rose-600 animate-pulse' : 'text-slate-900'
                    }`}
                  >
                    {formatTimer(timeLeft)}
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {quizDetail.timeLimitMinutes || 15} phút
              </span>
            </div>

            {/* 2. Question Navigation Tabs Header */}
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  Bảng câu hỏi
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Chọn câu để chuyển trực tiếp
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                {answeredCount}/{questions.length} đã làm
              </span>
            </div>

            {/* 3. Question Number Buttons Grid */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = safeIndex === idx;
                const isAnswered = selectedAnswers[q.questionId] && selectedAnswers[q.questionId].length > 0;

                return (
                  <button
                    key={q.questionId}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-11 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-0.5 relative cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-500 ring-offset-2 scale-105'
                        : isAnswered
                        ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isAnswered && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 4. Action Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinishEarly}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Nộp bài thi</span>
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Hệ thống sẽ tự động tính điểm và hoàn thành bài học khi bạn đạt yêu cầu.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h4 className="text-lg font-extrabold text-slate-900">
                Xác nhận nộp bài trắc nghiệm?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bạn đã trả lời <strong className="text-blue-600 font-bold">{answeredCount}</strong> / {questions.length} câu hỏi.
                {answeredCount < questions.length && (
                  <span className="text-amber-600 block mt-1 font-semibold">
                    ⚠️ Vẫn còn {questions.length - answeredCount} câu chưa làm!
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                onClick={executeSubmission}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Nộp bài ngay</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
