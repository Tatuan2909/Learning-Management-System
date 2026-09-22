import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Award, HelpCircle, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { QuizDetail, SubmitQuizResponse, QuestionAnswer } from '../types';
import api from '../api/axios';

interface Props {
  quizId?: string;
  onNextLesson?: () => void;
}

export const PostLessonQuiz: React.FC<Props> = ({ quizId, onNextLesson }) => {
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<SubmitQuizResponse | null>(null);

  const fetchQuizDetail = async () => {
    try {
      setLoading(true);
      const targetQuizId = quizId || '66666666-6666-6666-6666-666666666666';
      const response = await api.get<QuizDetail>(`/quiz/${targetQuizId}`);
      setQuiz(response.data);
    } catch (err) {
      console.error('Lỗi tải quiz:', err);
      // Fallback mock quiz for instant preview
      setQuiz({
        quizId: '66666666-6666-6666-6666-666666666666',
        lessonId: '55555555-5555-5555-5555-555555555555',
        title: 'Bài kiểm tra trắc nghiệm: Giới thiệu Clean Architecture',
        passingScore: 70.0,
        timeLimitMinutes: 10,
        questions: [
          {
            questionId: 'q1',
            questionText: 'Thành phần nào dưới đây thuộc tầng Domain trong Clean Architecture?',
            questionType: 'SINGLE_CHOICE',
            points: 50,
            options: [
              { optionId: 'opt1', optionText: 'Entities và Enums' },
              { optionId: 'opt2', optionText: 'DbContext và Entity Framework' },
              { optionId: 'opt3', optionText: 'Controllers và Swagger' }
            ]
          },
          {
            questionId: 'q2',
            questionText: 'HTTP Method nào được khuyến nghị để tạo mới tài nguyên?',
            questionType: 'SINGLE_CHOICE',
            points: 50,
            options: [
              { optionId: 'opt4', optionText: 'POST' },
              { optionId: 'opt5', optionText: 'GET' },
              { optionId: 'opt6', optionText: 'DELETE' }
            ]
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizDetail();
  }, [quizId]);

  const handleSelectOption = (questionId: string, optionId: string, isMultiple: boolean) => {
    if (result) return; // Prevent editing after submission

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

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    // Format answers array
    const formattedAnswers: QuestionAnswer[] = Object.entries(selectedAnswers).map(
      ([questionId, selectedOptionIds]) => ({
        questionId,
        selectedOptionIds
      })
    );

    try {
      setSubmitting(true);
      const response = await api.post<SubmitQuizResponse>('/quiz/submit', {
        quizId: quiz.quizId,
        studentId: '33333333-3333-3333-3333-333333333333',
        answers: formattedAnswers
      });
      setResult(response.data);
    } catch (err: any) {
      // Mock evaluation if server offline
      const mockEarned = formattedAnswers.reduce((acc, curr) => {
        if (curr.selectedOptionIds.includes('opt1') || curr.selectedOptionIds.includes('opt4')) {
          return acc + 50;
        }
        return acc;
      }, 0);

      const isPassed = mockEarned >= quiz.passingScore;
      setResult({
        quizAttemptId: 'attempt-123',
        score: mockEarned,
        passingScore: quiz.passingScore,
        isPassed,
        lessonProgressUpdated: isPassed,
        message: isPassed
          ? `Chúc mừng! Bạn đã ĐẠT bài trắc nghiệm với điểm số ${mockEarned}% (Yêu cầu >= ${quiz.passingScore}%). Bài học đã mở khóa tiếp theo!`
          : `Rất tiếc! Bạn đạt ${mockEarned}%, chưa đủ điểm đạt (Yêu cầu >= ${quiz.passingScore}%). Hãy thử lại!`
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setSelectedAnswers({});
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-white rounded-2xl border border-gray-200">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium">Đang tải bài trắc nghiệm...</p>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Softer, Gentle Header */}
      <div className="px-6 py-5 bg-slate-50 border-b border-slate-200 text-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">{quiz.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Thời gian làm bài: {quiz.timeLimitMinutes} phút • Điểm đạt: {quiz.passingScore}%
            </p>
          </div>
        </div>

        {result && (
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            result.isPassed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {result.isPassed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {result.isPassed ? 'ĐÃ ĐẠT' : 'CHƯA ĐẠT'}
          </div>
        )}
      </div>

      {/* Result Banner */}
      {result && (
        <div className={`p-6 border-b flex items-start gap-4 ${
          result.isPassed ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
        }`}>
          {result.isPassed ? (
            <Award className="w-10 h-10 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-10 h-10 text-red-600 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h4 className={`font-bold text-base ${result.isPassed ? 'text-emerald-900' : 'text-red-900'}`}>
              Kết quả: {result.score}% / 100%
            </h4>
            <p className="text-sm mt-1 text-gray-700">{result.message}</p>

            <div className="mt-4 flex items-center gap-3">
              {result.isPassed ? (
                <button
                  onClick={onNextLesson}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-sm transition-all"
                >
                  <span>Chuyển sang bài tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleRetake}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-sm transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Làm lại bài trắc nghiệm</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quiz Questions List */}
      <div className="p-6 space-y-6">
        {quiz.questions.map((question, index) => {
          const isMultiple = question.questionType === 'MULTIPLE_CHOICE';
          const selected = selectedAnswers[question.questionId] || [];

          return (
            <div key={question.questionId} className="p-5 rounded-xl border border-gray-200 bg-gray-50/50">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h4 className="font-semibold text-gray-900 text-base flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-md font-bold">
                    Câu {index + 1}
                  </span>
                  <span>{question.questionText}</span>
                </h4>
                <span className="text-xs text-gray-500 font-medium bg-white px-2.5 py-1 rounded-full border border-gray-200">
                  {question.points} điểm
                </span>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {question.options.map((option) => {
                  const isChecked = selected.includes(option.optionId);

                  return (
                    <label
                      key={option.optionId}
                      onClick={() => handleSelectOption(question.questionId, option.optionId, isMultiple)}
                      className={`flex items-center gap-3 p-3.5 rounded-lg border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-50 border-blue-500 text-blue-900 font-medium shadow-xs'
                          : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <input
                        type={isMultiple ? 'checkbox' : 'radio'}
                        name={`q-${question.questionId}`}
                        checked={isChecked}
                        onChange={() => {}}
                        disabled={!!result}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm">{option.optionText}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Submission Action */}
      {!result && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Hãy kiểm tra kỹ câu trả lời trước khi nhấn nộp bài.
          </span>
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting || Object.keys(selectedAnswers).length === 0}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang chấm điểm...</span>
              </>
            ) : (
              <span>Nộp bài trắc nghiệm</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
