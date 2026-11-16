import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Linking,
  Dimensions,
  Platform
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  ActivityType,
  CurriculumItem,
  SectionSummary,
  CourseDetail,
  QuizDetail,
  QuizQuestion,
  SubmitQuizResponse,
  QuizReview,
  QuizAttemptSummary,
  AssignmentDetail
} from '../types';
import { parseVideoUrl, parseDocumentUrl } from '../utils/mediaHelper';

interface CourseStudyScreenProps {
  courseId: string;
  initialActivityId?: string;
  onBack: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CourseStudyScreen: React.FC<CourseStudyScreenProps> = ({
  courseId,
  initialActivityId,
  onBack
}) => {
  const { user } = useAuth();
  const studentId = user?.userId || '';

  // Main Course Data
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedActivity, setSelectedActivity] = useState<CurriculumItem | null>(null);

  // Outline / Drawer State
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);

  // ==========================================
  // PRACTICE (Assignment) States
  // ==========================================
  const [assignmentDetail, setAssignmentDetail] = useState<AssignmentDetail | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState<boolean>(false);
  const [stagedNote, setStagedNote] = useState<string>('');
  const [stagedGitUrl, setStagedGitUrl] = useState<string>('');
  const [stagedFileUrl, setStagedFileUrl] = useState<string>('');
  const [submittingAssignment, setSubmittingAssignment] = useState<boolean>(false);
  const [isEditingSubmission, setIsEditingSubmission] = useState<boolean>(false);

  // ==========================================
  // QUIZ States
  // ==========================================
  const [quizDetail, setQuizDetail] = useState<QuizDetail | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);
  const [quizPasswordInput, setQuizPasswordInput] = useState<string>('');
  const [unlockedQuizKeys, setUnlockedQuizKeys] = useState<Record<string, boolean>>({});
  const [verifyingPassword, setVerifyingPassword] = useState<boolean>(false);
  const [quizPasswordError, setQuizPasswordError] = useState<string>('');

  // Active Quiz Runner
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [quizTimeLeft, setQuizTimeLeft] = useState<number>(15 * 60);
  const [submittingQuiz, setSubmittingQuiz] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<SubmitQuizResponse | null>(null);
  const [latestAttempt, setLatestAttempt] = useState<QuizAttemptSummary | null>(null);
  const [quizReview, setQuizReview] = useState<QuizReview | null>(null);
  const [loadingReview, setLoadingReview] = useState<boolean>(false);
  const [showReviewMode, setShowReviewMode] = useState<boolean>(false);
  const quizStartTimeRef = useRef<string>(new Date().toISOString());

  // ----------------------------------------------------
  // Load Course Curriculum with Normalization
  // ----------------------------------------------------
  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await api.get<any>(`/courses/${courseId}?studentId=${studentId}`);
      if (res) {
        setCourse(res);

        // Normalize raw items to always have uppercase `type` and proper IDs
        const normalizedSections: SectionSummary[] = (res.sections || []).map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          isExpanded: s.isExpanded ?? true,
          isLocked: Boolean(s.isLocked),
          items: (s.items || []).map((i: any) => {
            const rawType = (i.contentType || i.type || 'TEXT').toString().toUpperCase() as ActivityType;
            return {
              id: i.id,
              title: i.title,
              subtitle: i.subtitle,
              type: rawType,
              contentUrl: i.contentUrl,
              isCompleted: Boolean(i.isCompleted),
              isLocked: Boolean(i.isLocked),
              quizId: i.quizId || (rawType === 'QUIZ' ? i.id : undefined),
              assignmentId: i.assignmentId || (rawType === 'PRACTICE' ? i.id : undefined),
              hasPassword: Boolean(i.hasPassword),
              password: i.password,
              bodyMarkdown: i.bodyMarkdown
            };
          })
        }));

        setSections(normalizedSections);

        // Expand all sections by default
        const expMap: Record<string, boolean> = {};
        normalizedSections.forEach((s) => {
          expMap[s.id] = true;
        });
        setExpandedSections(expMap);

        // Select initial activity if provided
        if (initialActivityId) {
          for (const s of normalizedSections) {
            const found = s.items?.find((i) => i.id === initialActivityId);
            if (found) {
              selectActivity(found);
              break;
            }
          }
        }
      }
    } catch (err: any) {
      console.log('Lỗi tải khóa học:', err.message);
      Alert.alert('Lỗi', 'Không thể tải nội dung khóa học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [courseId, studentId, initialActivityId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // ----------------------------------------------------
  // Toggle Section Collapse
  // ----------------------------------------------------
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // ----------------------------------------------------
  // Select Activity Handler
  // ----------------------------------------------------
  const selectActivity = (item: CurriculumItem) => {
    if (item.isLocked) {
      Alert.alert('Bài học đang khóa', 'Bạn cần hoàn thành các bài học trước đó để mở khóa nội dung này.');
      return;
    }

    setSelectedActivity(item);
    setDrawerVisible(false);

    // Reset sub-states
    setQuizResult(null);
    setQuizReview(null);
    setShowReviewMode(false);
    setIsEditingSubmission(false);
    setQuizPasswordError('');

    // Auto complete for reading/video if not yet completed
    if (item.type !== 'PRACTICE' && item.type !== 'QUIZ' && !item.isCompleted) {
      markActivityComplete(item.id);
    }

    // If Practice, fetch assignment info
    if (item.type === 'PRACTICE') {
      loadAssignmentData(item.id);
    }

    // If Quiz, fetch quiz details and start quiz session
    if (item.type === 'QUIZ') {
      const qId = item.quizId || item.id;
      loadQuizData(qId, item);
    }
  };

  // ----------------------------------------------------
  // Toggle / Complete Lesson API
  // ----------------------------------------------------
  const markActivityComplete = async (itemId: string) => {
    // Optimistic UI update
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        items: s.items.map((i) => (i.id === itemId ? { ...i, isCompleted: true } : i))
      }))
    );
    if (selectedActivity?.id === itemId) {
      setSelectedActivity((prev) => (prev ? { ...prev, isCompleted: true } : null));
    }

    try {
      await api.post(`/courses/lessons/${itemId}/complete`, { studentId });
    } catch {
      // ignore
    }
  };

  // ----------------------------------------------------
  // PRACTICE: Load Assignment Details & Submissions
  // ----------------------------------------------------
  const loadAssignmentData = async (lessonId: string) => {
    try {
      setLoadingAssignment(true);
      const res = await api.get<AssignmentDetail>(`/assignments/by-lesson/${lessonId}?studentId=${studentId}`);
      if (res) {
        setAssignmentDetail(res);
        if (res.mySubmission) {
          setStagedNote(res.mySubmission.submissionText || '');
          setStagedGitUrl(res.mySubmission.gitRepoUrl || '');
          setStagedFileUrl(res.mySubmission.fileUrl || '');
        } else {
          setStagedNote('');
          setStagedGitUrl('');
          setStagedFileUrl('');
        }
      }
    } catch (err: any) {
      console.log('Lỗi tải bài tập:', err.message);
    } finally {
      setLoadingAssignment(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedActivity) return;
    if (!stagedNote.trim() && !stagedGitUrl.trim() && !stagedFileUrl.trim()) {
      Alert.alert('Chưa nhập nội dung', 'Vui lòng nhập ghi chú, đường dẫn GitHub hoặc link bài làm để nộp.');
      return;
    }

    try {
      setSubmittingAssignment(true);
      await api.post(`/assignments/by-lesson/${selectedActivity.id}/submit`, {
        studentId,
        fileUrl: stagedFileUrl.trim(),
        submissionText: stagedNote.trim(),
        gitRepoUrl: stagedGitUrl.trim()
      });

      Alert.alert('Thành công', 'Bài tập thực hành của bạn đã được nộp thành công!');
      setIsEditingSubmission(false);
      markActivityComplete(selectedActivity.id);
      loadAssignmentData(selectedActivity.id);
    } catch (err: any) {
      Alert.alert('Lỗi nộp bài', err.response?.data?.message || err.message || 'Không thể gửi bài làm.');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  // ----------------------------------------------------
  // QUIZ: Load Quiz & History
  // ----------------------------------------------------
  const loadQuizData = async (quizId: string, item: CurriculumItem) => {
    try {
      setLoadingQuiz(true);
      const res = await api.get<QuizDetail>(`/quiz/${quizId}`);
      if (res) {
        setQuizDetail(res);
        if (res.timeLimitMinutes && res.timeLimitMinutes > 0) {
          setQuizTimeLeft(res.timeLimitMinutes * 60);
        } else {
          setQuizTimeLeft(15 * 60);
        }
        quizStartTimeRef.current = new Date().toISOString();
        setSelectedAnswers({});
        setCurrentQuestionIndex(0);
      }

      // Check latest attempt from DB
      try {
        const attRes = await api.get<QuizAttemptSummary>(`/quiz/${quizId}/latest-attempt?studentId=${studentId}`);
        if (attRes) {
          setLatestAttempt(attRes);
        } else {
          setLatestAttempt(null);
        }
      } catch {
        setLatestAttempt(null);
      }
    } catch (err: any) {
      console.log('Lỗi tải bài trắc nghiệm:', err.message);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleVerifyQuizPassword = async () => {
    if (!selectedActivity) return;
    const qId = selectedActivity.quizId || selectedActivity.id;
    if (!quizPasswordInput.trim()) {
      setQuizPasswordError('Vui lòng nhập mật mã bài trắc nghiệm.');
      return;
    }

    try {
      setVerifyingPassword(true);
      setQuizPasswordError('');
      await api.post(`/quiz/${qId}/verify-password`, {
        password: quizPasswordInput.trim()
      });

      setUnlockedQuizKeys((prev) => ({ ...prev, [qId]: true }));
      // Reload quiz data once unlocked
      loadQuizData(qId, selectedActivity);
    } catch (err: any) {
      setQuizPasswordError(err.response?.data?.message || 'Mật khẩu bài trắc nghiệm chưa đúng. Vui lòng kiểm tra lại.');
    } finally {
      setVerifyingPassword(false);
    }
  };

  // ----------------------------------------------------
  // QUIZ RUNNER Timer
  // ----------------------------------------------------
  useEffect(() => {
    if (!selectedActivity || selectedActivity.type !== 'QUIZ') return;
    if (quizResult || showReviewMode) return;

    const timer = setInterval(() => {
      setQuizTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedActivity?.id, selectedActivity?.type, quizResult, showReviewMode]);

  const handleAutoSubmitQuiz = () => {
    Alert.alert('Hết giờ làm bài', 'Thời gian làm bài đã kết thúc! Hệ thống đang tự động nộp bài thi của bạn.');
    executeQuizSubmission();
  };

  const handleSelectOption = (questionId: string, optionId: string, isMultiple: boolean) => {
    if (quizResult || showReviewMode) return;

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

  const executeQuizSubmission = async () => {
    if (!quizDetail || !selectedActivity) return;

    try {
      setSubmittingQuiz(true);
      const answers = Object.entries(selectedAnswers).map(([questionId, selectedOptionIds]) => ({
        questionId,
        selectedOptionIds
      }));

      const res = await api.post<SubmitQuizResponse>('/quiz/submit', {
        quizId: quizDetail.quizId,
        studentId,
        password: quizPasswordInput || undefined,
        startedAt: quizStartTimeRef.current,
        answers
      });

      setQuizResult(res);

      if (res.isPassed) {
        markActivityComplete(selectedActivity.id);
      }

      // Automatically load review answers
      if (res.quizAttemptId) {
        await loadQuizReview(res.quizAttemptId);
        setShowReviewMode(true);
      }
    } catch (err: any) {
      Alert.alert('Lỗi nộp bài', err.response?.data?.message || err.message || 'Không thể gửi kết quả trắc nghiệm.');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const loadQuizReview = async (attemptId: string) => {
    try {
      setLoadingReview(true);
      const res = await api.get<QuizReview>(`/quiz/attempts/${attemptId}/review`);
      if (res) {
        setQuizReview(res);
        setShowReviewMode(true);
      }
    } catch (err: any) {
      console.log('Lỗi tải lời giải:', err.message);
      Alert.alert('Lỗi', 'Không thể tải chi tiết bài làm.');
    } finally {
      setLoadingReview(false);
    }
  };

  const handleRetakeQuiz = () => {
    quizStartTimeRef.current = new Date().toISOString();
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setQuizResult(null);
    setQuizReview(null);
    setShowReviewMode(false);
    if (quizDetail?.timeLimitMinutes) {
      setQuizTimeLeft(quizDetail.timeLimitMinutes * 60);
    } else {
      setQuizTimeLeft(15 * 60);
    }
  };

  // Back button handler:
  // - If inside an activity (Quiz, Video, Practice, etc.) -> Back to the Course Outline (stays in course)
  // - If already on Course Outline -> Exit to Courses List
  const handleTopBack = () => {
    if (selectedActivity) {
      setSelectedActivity(null);
      setShowReviewMode(false);
      setQuizResult(null);
    } else {
      onBack();
    }
  };

  // ----------------------------------------------------
  // Next / Previous Activity Helpers
  // ----------------------------------------------------
  const allCurriculumItems = sections.flatMap((s) => s.items || []);
  const currentActivityIndex = selectedActivity
    ? allCurriculumItems.findIndex((i) => i.id === selectedActivity.id)
    : -1;

  const handleNextActivity = () => {
    if (currentActivityIndex >= 0 && currentActivityIndex < allCurriculumItems.length - 1) {
      const nextItem = allCurriculumItems[currentActivityIndex + 1];
      selectActivity(nextItem);
    }
  };

  const handlePrevActivity = () => {
    if (currentActivityIndex > 0) {
      const prevItem = allCurriculumItems[currentActivityIndex - 1];
      selectActivity(prevItem);
    }
  };

  // Clean activity type label matching Web
  const getActivityTypeLabel = (type: ActivityType, subtitle?: string): string => {
    const typeMap: Record<ActivityType, string> = {
      QUIZ: 'Trắc nghiệm',
      PRACTICE: 'Bài tập thực hành',
      VIDEO: 'Video bài giảng',
      LECTURE: 'Bài giảng',
      PDF: 'Tài liệu PDF',
      DOCX: 'Tài liệu Word',
      LINK: 'Liên kết',
      SCORM: 'Bài giảng SCORM',
      TEXT: 'Bài đọc lý thuyết',
      ANNOUNCEMENT: 'Thông báo',
      OVERVIEW: 'Tổng quan'
    };
    return typeMap[type] || type;
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'VIDEO':
      case 'LECTURE':
      case 'SCORM':
        return <Feather name="play-circle" size={17} color="#2563EB" />;
      case 'PDF':
      case 'DOCX':
      case 'TEXT':
        return <Feather name="file-text" size={17} color="#0D9488" />;
      case 'PRACTICE':
        return <Feather name="edit-3" size={17} color="#EA580C" />;
      case 'QUIZ':
        return <Feather name="help-circle" size={17} color="#7C3AED" />;
      case 'LINK':
        return <Feather name="external-link" size={17} color="#2563EB" />;
      default:
        return <Feather name="book-open" size={17} color="#475569" />;
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Loading Screen
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Đang tải nội dung khóa học...</Text>
      </View>
    );
  }

  // Pre-parse media info if active activity has contentUrl
  const videoInfo = selectedActivity ? parseVideoUrl(selectedActivity.contentUrl) : null;
  const docInfo = selectedActivity ? parseDocumentUrl(selectedActivity.contentUrl, selectedActivity.type) : null;
  const isVideoType = selectedActivity?.type === 'VIDEO' || selectedActivity?.type === 'LECTURE' || selectedActivity?.type === 'SCORM';
  const isDocType = selectedActivity?.type === 'PDF' || selectedActivity?.type === 'DOCX';
  const isQuizLocked = Boolean(selectedActivity?.hasPassword && !unlockedQuizKeys[selectedActivity.quizId || selectedActivity.id]);

  return (
    <View style={styles.container}>
      {/* ==================================================== */}
      {/* 1. TOP HEADER BAR: Back + Course Info + Menu Toggle */}
      {/* ==================================================== */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleTopBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={18} color="#1E293B" />
          <Text style={styles.backButtonText}>
            {selectedActivity ? 'Đề cương môn học' : 'Danh sách khóa học'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerToggleButton}
          onPress={() => setDrawerVisible(true)}
          activeOpacity={0.7}
        >
          <Feather name="list" size={18} color="#2563EB" />
          <Text style={styles.drawerToggleText}>Mục lục</Text>
        </TouchableOpacity>
      </View>

      {/* Course Banner Info */}
      <View style={styles.courseBanner}>
        <View style={styles.bannerBadgeRow}>
          <View style={styles.courseCodeBadge}>
            <Text style={styles.courseCodeText}>{course?.courseCode}</Text>
          </View>
          <Text style={styles.teacherNameText} numberOfLines={1}>
            GV: {course?.teacherName || 'Chưa phân công'}
          </Text>
        </View>
        <Text style={styles.courseTitleText} numberOfLines={2}>
          {course?.title}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressLabel}>Tiến độ học tập</Text>
            <Text style={styles.progressPercentageText}>{course?.progressPercentage || 0}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, Math.max(0, course?.progressPercentage || 0))}%` }
              ]}
            />
          </View>
        </View>
      </View>

      {/* ==================================================== */}
      {/* 2. BODY CONTENT: Outline OR Selected Activity View   */}
      {/* ==================================================== */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!selectedActivity ? (
          // --------------------------------------------------
          // VIEW A: Full Course Outline (When no activity open)
          // --------------------------------------------------
          <View style={styles.outlineContainer}>
            <View style={styles.outlineHeader}>
              <Feather name="layers" size={18} color="#2563EB" />
              <Text style={styles.outlineHeaderText}>Chương trình học phần</Text>
            </View>

            {sections.map((section, sIdx) => {
              const isExpanded = expandedSections[section.id] !== false;
              const totalSecItems = section.items?.length || 0;
              const completedSecItems = section.items?.filter((i) => i.isCompleted).length || 0;

              return (
                <View key={section.id} style={styles.sectionCard}>
                  {/* Section Title Header Accordion */}
                  <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => toggleSection(section.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.sectionHeaderLeft}>
                      <View style={styles.sectionIndexBadge}>
                        <Text style={styles.sectionIndexText}>{sIdx + 1}</Text>
                      </View>
                      <View style={styles.sectionHeaderInfo}>
                        <Text style={styles.sectionTitleText}>{section.title}</Text>
                        <Text style={styles.sectionSubCount}>
                          Đã hoàn thành {completedSecItems}/{totalSecItems} bài
                        </Text>
                      </View>
                    </View>
                    <Feather
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>

                  {/* Section Items List */}
                  {isExpanded && (
                    <View style={styles.sectionItemsContainer}>
                      {section.items?.map((item) => {
                        return (
                          <TouchableOpacity
                            key={item.id}
                            style={[
                              styles.itemRow,
                              item.isLocked && styles.itemRowLocked
                            ]}
                            onPress={() => selectActivity(item)}
                            activeOpacity={item.isLocked ? 1 : 0.7}
                          >
                            <View style={styles.itemRowLeft}>
                              <View style={styles.itemIconContainer}>
                                {getActivityIcon(item.type)}
                              </View>
                              <View style={styles.itemInfo}>
                                <Text
                                  style={[
                                    styles.itemTitleText,
                                    item.isLocked && styles.itemTitleLocked
                                  ]}
                                  numberOfLines={2}
                                >
                                  {item.title}
                                </Text>
                                <View style={styles.itemTypeBadgeRow}>
                                  <Text style={styles.itemTypeBadgeText}>
                                    {getActivityTypeLabel(item.type, item.subtitle)}
                                  </Text>
                                </View>
                              </View>
                            </View>

                            <View style={styles.itemRowRight}>
                              {item.isLocked ? (
                                <View style={styles.lockedPill}>
                                  <Feather name="lock" size={12} color="#94A3B8" />
                                </View>
                              ) : item.isCompleted ? (
                                <View style={styles.completedPill}>
                                  <Feather name="check-circle" size={16} color="#16A34A" />
                                </View>
                              ) : (
                                <View style={styles.todoPill}>
                                  <Feather name="circle" size={16} color="#94A3B8" />
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          // --------------------------------------------------
          // VIEW B: Dedicated Activity View
          // --------------------------------------------------
          <View style={styles.activityContainer}>
            {/* Activity Navigation Header */}
            <View style={styles.activityTopBar}>
              <View style={styles.activityTypeBadge}>
                {getActivityIcon(selectedActivity.type)}
                <Text style={styles.activityTypeBadgeText}>
                  {getActivityTypeLabel(selectedActivity.type, selectedActivity.subtitle)}
                </Text>
              </View>

              {selectedActivity.isCompleted && (
                <View style={styles.completedBadge}>
                  <Feather name="check" size={13} color="#16A34A" />
                  <Text style={styles.completedBadgeText}>Đã hoàn thành</Text>
                </View>
              )}
            </View>

            <Text style={styles.activityMainTitle}>{selectedActivity.title}</Text>

            {/* ========================================================== */}
            {/* SUB-VIEW 1: PRACTICE (Bài tập thực hành)                  */}
            {/* ========================================================== */}
            {selectedActivity.type === 'PRACTICE' ? (
              <View style={styles.practiceContainer}>
                {loadingAssignment ? (
                  <View style={styles.subLoadingContainer}>
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text style={styles.subLoadingText}>Đang tải nội dung bài tập...</Text>
                  </View>
                ) : (
                  <>
                    {/* Assignment Instructions Card */}
                    <View style={styles.instructionCard}>
                      <View style={styles.instructionHeader}>
                        <Feather name="file-text" size={16} color="#2563EB" />
                        <Text style={styles.instructionTitle}>Yêu cầu bài tập thực hành</Text>
                      </View>

                      {assignmentDetail?.dueDate && (
                        <View style={styles.dueRow}>
                          <Feather name="clock" size={13} color="#DC2626" />
                          <Text style={styles.dueText}>
                            Hạn nộp: {new Date(assignmentDetail.dueDate).toLocaleString('vi-VN')}
                          </Text>
                          <Text style={styles.maxScoreText}>
                            (Thang điểm: {assignmentDetail.maxScore || 10})
                          </Text>
                        </View>
                      )}

                      <Text style={styles.instructionBody}>
                        {assignmentDetail?.instructions ||
                          selectedActivity.bodyMarkdown ||
                          'Chưa có hướng dẫn chi tiết cho bài tập này. Vui lòng tham khảo tài liệu bài giảng.'}
                      </Text>

                      {assignmentDetail?.attachmentUrl && (
                        <TouchableOpacity
                          style={styles.attachmentButton}
                          onPress={() => Linking.openURL(assignmentDetail.attachmentUrl!)}
                          activeOpacity={0.7}
                        >
                          <Feather name="paperclip" size={14} color="#2563EB" />
                          <Text style={styles.attachmentButtonText}>Tải tài liệu đính kèm đề bài</Text>
                          <Feather name="download" size={14} color="#2563EB" />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Graded Feedback Card if already graded */}
                    {assignmentDetail?.mySubmission?.grade !== undefined &&
                      assignmentDetail.mySubmission.grade !== null && (
                        <View style={styles.gradeResultCard}>
                          <View style={styles.gradeResultHeader}>
                            <Feather name="award" size={18} color="#16A34A" />
                            <Text style={styles.gradeResultTitle}>Kết quả chấm điểm</Text>
                          </View>
                          <View style={styles.gradeScoreRow}>
                            <Text style={styles.gradeScoreBig}>
                              {assignmentDetail.mySubmission.grade}
                            </Text>
                            <Text style={styles.gradeScoreMax}>
                              / {assignmentDetail.maxScore || 10} điểm
                            </Text>
                          </View>
                          {assignmentDetail.mySubmission.feedback ? (
                            <View style={styles.feedbackContainer}>
                              <Text style={styles.feedbackLabel}>Nhận xét của giảng viên:</Text>
                              <Text style={styles.feedbackText}>
                                {assignmentDetail.mySubmission.feedback}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      )}

                    {/* Submission History / Status */}
                    {assignmentDetail?.mySubmission && !isEditingSubmission ? (
                      <View style={styles.submissionStatusCard}>
                        <View style={styles.submissionStatusHeader}>
                          <Feather name="check-circle" size={16} color="#16A34A" />
                          <Text style={styles.submissionStatusTitle}>Bài nộp của bạn</Text>
                          <View style={styles.statusPillSubmitted}>
                            <Text style={styles.statusPillSubmittedText}>ĐÃ NỘP</Text>
                          </View>
                        </View>

                        <Text style={styles.submittedAtText}>
                          Thời gian nộp:{' '}
                          {new Date(assignmentDetail.mySubmission.submittedAt).toLocaleString('vi-VN')}
                        </Text>

                        {assignmentDetail.mySubmission.submissionText ? (
                          <View style={styles.subHistoryBlock}>
                            <Text style={styles.subHistoryLabel}>Ghi chú:</Text>
                            <Text style={styles.subHistoryValue}>
                              {assignmentDetail.mySubmission.submissionText}
                            </Text>
                          </View>
                        ) : null}

                        {assignmentDetail.mySubmission.gitRepoUrl ? (
                          <TouchableOpacity
                            style={styles.subHistoryLink}
                            onPress={() => Linking.openURL(assignmentDetail.mySubmission!.gitRepoUrl!)}
                            activeOpacity={0.7}
                          >
                            <Feather name="github" size={14} color="#0F172A" />
                            <Text style={styles.subHistoryLinkText} numberOfLines={1}>
                              {assignmentDetail.mySubmission.gitRepoUrl}
                            </Text>
                            <Feather name="external-link" size={12} color="#64748B" />
                          </TouchableOpacity>
                        ) : null}

                        {assignmentDetail.mySubmission.fileUrl ? (
                          <TouchableOpacity
                            style={styles.subHistoryLink}
                            onPress={() => Linking.openURL(assignmentDetail.mySubmission!.fileUrl!)}
                            activeOpacity={0.7}
                          >
                            <Feather name="link" size={14} color="#2563EB" />
                            <Text style={styles.subHistoryLinkText} numberOfLines={1}>
                              {assignmentDetail.mySubmission.fileUrl}
                            </Text>
                            <Feather name="download" size={12} color="#2563EB" />
                          </TouchableOpacity>
                        ) : null}

                        <TouchableOpacity
                          style={styles.resubmitButton}
                          onPress={() => setIsEditingSubmission(true)}
                          activeOpacity={0.8}
                        >
                          <Feather name="rotate-ccw" size={14} color="#2563EB" />
                          <Text style={styles.resubmitButtonText}>Nộp lại bài làm khác</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      // Submission Form
                      <View style={styles.submitFormCard}>
                        <View style={styles.submitFormHeader}>
                          <Feather name="send" size={16} color="#2563EB" />
                          <Text style={styles.submitFormTitle}>
                            {assignmentDetail?.mySubmission ? 'Chỉnh sửa nộp bài' : 'Nộp bài làm thực hành'}
                          </Text>
                        </View>

                        {/* GitHub Repo URL Input */}
                        <Text style={styles.inputLabel}>Đường dẫn GitHub / Git Repository (tùy chọn):</Text>
                        <View style={styles.inputContainer}>
                          <Feather name="github" size={15} color="#64748B" style={styles.inputIcon} />
                          <TextInput
                            style={styles.textInput}
                            placeholder="https://github.com/username/project-repo"
                            placeholderTextColor="#94A3B8"
                            value={stagedGitUrl}
                            onChangeText={setStagedGitUrl}
                            autoCapitalize="none"
                          />
                        </View>

                        {/* Attachment Link Input */}
                        <Text style={styles.inputLabel}>Link tài liệu bài làm / Google Drive / OneDrive:</Text>
                        <View style={styles.inputContainer}>
                          <Feather name="link" size={15} color="#64748B" style={styles.inputIcon} />
                          <TextInput
                            style={styles.textInput}
                            placeholder="https://drive.google.com/... hoặc link file nộp"
                            placeholderTextColor="#94A3B8"
                            value={stagedFileUrl}
                            onChangeText={setStagedFileUrl}
                            autoCapitalize="none"
                          />
                        </View>

                        {/* Submission Note Input */}
                        <Text style={styles.inputLabel}>Ghi chú / Lời nhắn gửi giảng viên:</Text>
                        <TextInput
                          style={[styles.textInput, styles.textAreaInput]}
                          placeholder="Mô tả công việc đã hoàn thành hoặc các lưu ý khi chấm bài..."
                          placeholderTextColor="#94A3B8"
                          value={stagedNote}
                          onChangeText={setStagedNote}
                          multiline
                          numberOfLines={4}
                          textAlignVertical="top"
                        />

                        {/* Action Buttons */}
                        <View style={styles.submitButtonRow}>
                          {isEditingSubmission && (
                            <TouchableOpacity
                              style={styles.cancelButton}
                              onPress={() => setIsEditingSubmission(false)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                          )}

                          <TouchableOpacity
                            style={[
                              styles.submitActionButton,
                              submittingAssignment && styles.buttonDisabled
                            ]}
                            onPress={handleSubmitAssignment}
                            disabled={submittingAssignment}
                            activeOpacity={0.8}
                          >
                            {submittingAssignment ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <>
                                <Feather name="send" size={15} color="#FFFFFF" />
                                <Text style={styles.submitActionButtonText}>Gửi nộp bài làm</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </>
                )}
              </View>
            ) : selectedActivity.type === 'QUIZ' ? (
              // ==========================================================
              // SUB-VIEW 2: QUIZ (Giao diện làm bài trắc nghiệm trực tiếp)
              // ==========================================================
              <View style={styles.quizContainer}>
                {loadingQuiz ? (
                  <View style={styles.subLoadingContainer}>
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text style={styles.subLoadingText}>Đang tải đề thi trắc nghiệm...</Text>
                  </View>
                ) : isQuizLocked ? (
                  // Password Unlock View
                  <View style={styles.passwordLockCard}>
                    <View style={styles.passwordIconBox}>
                      <Feather name="lock" size={28} color="#2563EB" />
                    </View>
                    <Text style={styles.passwordLockTitle}>Bài kiểm tra có mật khẩu</Text>
                    <Text style={styles.passwordLockDesc}>
                      Vui lòng nhập mật mã được cấp bởi giảng viên để mở khóa và bắt đầu làm bài trắc nghiệm.
                    </Text>

                    <TextInput
                      style={styles.passwordInlineInput}
                      placeholder="Nhập mật khẩu bài thi..."
                      placeholderTextColor="#94A3B8"
                      value={quizPasswordInput}
                      onChangeText={(val) => {
                        setQuizPasswordInput(val);
                        setQuizPasswordError('');
                      }}
                      secureTextEntry
                    />

                    {quizPasswordError ? (
                      <View style={styles.passwordErrorBox}>
                        <Feather name="alert-circle" size={14} color="#DC2626" />
                        <Text style={styles.passwordErrorText}>{quizPasswordError}</Text>
                      </View>
                    ) : null}

                    <View style={styles.passwordLockBtnRow}>
                      <TouchableOpacity
                        style={styles.passwordBackOutlineBtn}
                        onPress={() => setSelectedActivity(null)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.passwordBackOutlineText}>Quay lại đề cương</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.unlockButton, verifyingPassword && styles.buttonDisabled]}
                        onPress={handleVerifyQuizPassword}
                        disabled={verifyingPassword}
                        activeOpacity={0.8}
                      >
                        {verifyingPassword ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <Feather name="key" size={15} color="#FFFFFF" />
                            <Text style={styles.unlockButtonText}>Mở khóa</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : !quizDetail || !quizDetail.questions || quizDetail.questions.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Feather name="alert-circle" size={32} color="#DC2626" />
                    <Text style={styles.emptyTitle}>Chưa có câu hỏi trắc nghiệm</Text>
                    <Text style={styles.emptySubtitle}>
                      Giảng viên đang hoàn thiện ngân hàng câu hỏi cho bài này. Vui lòng quay lại sau!
                    </Text>
                  </View>
                ) : showReviewMode && quizReview ? (
                  // =======================================================
                  // QUIZ REVIEW VIEW (Xem lại bài làm, đáp án & lời giải)
                  // =======================================================
                  <View style={styles.reviewModeContainer}>
                    {/* Score Banner */}
                    <View
                      style={[
                        styles.quizResultBanner,
                        quizReview.isPassed
                          ? styles.quizResultBannerPass
                          : styles.quizResultBannerFail
                      ]}
                    >
                      <Feather
                        name={quizReview.isPassed ? 'check-circle' : 'x-circle'}
                        size={36}
                        color={quizReview.isPassed ? '#16A34A' : '#DC2626'}
                      />
                      <Text style={styles.quizResultScore}>
                        {quizReview.scoreAchieved.toFixed(1)} / {quizReview.maxScore || 10} điểm
                      </Text>
                      <Text style={styles.quizResultStatus}>
                        {quizReview.isPassed
                          ? 'XIN CHÚC MỪNG! BẠN ĐÃ ĐẠT YÊU CẦU'
                          : `CHƯA ĐẠT (YÊU CẦU >= ${quizReview.passingScore || 5.0} ĐIỂM)`}
                      </Text>
                    </View>

                    {/* Action Bar: Retake or Back to outline */}
                    <View style={styles.reviewActionBar}>
                      <TouchableOpacity
                        style={styles.backOutlineFromReviewBtn}
                        onPress={() => {
                          setSelectedActivity(null);
                          setShowReviewMode(false);
                          setQuizResult(null);
                        }}
                        activeOpacity={0.7}
                      >
                        <Feather name="layers" size={14} color="#475569" />
                        <Text style={styles.backOutlineFromReviewText}>Đề cương khóa học</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.retakeQuizButton}
                        onPress={handleRetakeQuiz}
                        activeOpacity={0.8}
                      >
                        <Feather name="rotate-ccw" size={14} color="#2563EB" />
                        <Text style={styles.retakeQuizButtonText}>Làm lại bài kiểm tra</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Review Questions List */}
                    <View style={styles.reviewSection}>
                      <View style={styles.reviewSectionHeader}>
                        <Feather name="book-open" size={16} color="#2563EB" />
                        <Text style={styles.reviewSectionTitle}>
                          Chi tiết đáp án & lời giải ({quizReview.questions?.length || 0} câu)
                        </Text>
                      </View>

                      {quizReview.questions?.map((rq, rqIdx) => {
                        return (
                          <View key={rq.questionId} style={styles.reviewQuestionCard}>
                            <View style={styles.reviewQuestionHeader}>
                              <Text style={styles.reviewQuestionTitle}>
                                Câu {rqIdx + 1}: {rq.questionText}
                              </Text>
                              <View
                                style={[
                                  styles.rqResultBadge,
                                  rq.isCorrect
                                    ? styles.rqResultBadgeCorrect
                                    : styles.rqResultBadgeWrong
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.rqResultText,
                                    rq.isCorrect
                                      ? styles.rqResultTextCorrect
                                      : styles.rqResultTextWrong
                                  ]}
                                >
                                  {rq.isCorrect ? `+${rq.pointsEarned} điểm` : '0 điểm'}
                                </Text>
                              </View>
                            </View>

                            {/* Review Options */}
                            <View style={styles.reviewOptionsList}>
                              {rq.options?.map((ro, roIdx) => {
                                const isSelected = rq.selectedOptionIds?.includes(ro.optionId);
                                const isCorrect = ro.isCorrect;
                                const letter = String.fromCharCode(65 + roIdx);

                                return (
                                  <View
                                    key={ro.optionId}
                                    style={[
                                      styles.reviewOption,
                                      isCorrect && styles.reviewOptionCorrect,
                                      isSelected && !isCorrect && styles.reviewOptionWrong
                                    ]}
                                  >
                                    <Text style={styles.reviewOptionLetter}>{letter}.</Text>
                                    <Text style={styles.reviewOptionText}>{ro.optionText}</Text>
                                    {isCorrect && (
                                      <Feather name="check" size={14} color="#16A34A" />
                                    )}
                                    {isSelected && !isCorrect && (
                                      <Feather name="x" size={14} color="#DC2626" />
                                    )}
                                  </View>
                                );
                              })}
                            </View>

                            {/* Explanation */}
                            {rq.explanation ? (
                              <View style={styles.explanationBox}>
                                <Text style={styles.explanationLabel}>Giải thích chi tiết:</Text>
                                <Text style={styles.explanationText}>{rq.explanation}</Text>
                              </View>
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ) : (
                  // =======================================================
                  // ACTIVE QUIZ RUNNER (Giao diện làm bài trực tiếp)
                  // =======================================================
                  <View style={styles.quizRunnerCard}>
                    {/* Latest attempt quick banner (if exists) */}
                    {latestAttempt && (
                      <View style={styles.latestAttemptBar}>
                        <View style={styles.latestAttemptLeft}>
                          <Feather name="award" size={16} color="#2563EB" />
                          <Text style={styles.latestAttemptText}>
                            Điểm gần nhất: {latestAttempt.scoreAchieved.toFixed(1)}/{latestAttempt.maxScore || 10}
                          </Text>
                          <View
                            style={[
                              styles.latestPassBadge,
                              latestAttempt.isPassed ? styles.latestPassBadgePass : styles.latestPassBadgeFail
                            ]}
                          >
                            <Text
                              style={[
                                styles.latestPassText,
                                latestAttempt.isPassed ? styles.latestPassTextPass : styles.latestPassTextFail
                              ]}
                            >
                              {latestAttempt.isPassed ? 'ĐẠT' : 'CHƯA ĐẠT'}
                            </Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={styles.viewReviewQuickBtn}
                          onPress={() => loadQuizReview(latestAttempt.attemptId)}
                          activeOpacity={0.7}
                        >
                          <Feather name="eye" size={13} color="#2563EB" />
                          <Text style={styles.viewReviewQuickText}>Xem lời giải</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Timer & Question Progress Bar */}
                    <View style={styles.quizRunnerHeader}>
                      <View style={styles.questionCounterBadge}>
                        <Text style={styles.questionCounterText}>
                          Câu {currentQuestionIndex + 1}/{quizDetail.questions.length}
                        </Text>
                      </View>

                      <View style={styles.timerBadge}>
                        <Feather name="clock" size={13} color="#DC2626" />
                        <Text style={styles.timerText}>{formatTimer(quizTimeLeft)}</Text>
                      </View>
                    </View>

                    {/* Question Jump Selector Row */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.questionNavPills}
                    >
                      {quizDetail.questions.map((q, idx) => {
                        const isCurrent = idx === currentQuestionIndex;
                        const isAnswered = (selectedAnswers[q.questionId] || []).length > 0;

                        return (
                          <TouchableOpacity
                            key={q.questionId}
                            style={[
                              styles.questionPill,
                              isCurrent && styles.questionPillCurrent,
                              isAnswered && !isCurrent && styles.questionPillAnswered
                            ]}
                            onPress={() => setCurrentQuestionIndex(idx)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.questionPillText,
                                isCurrent && styles.questionPillTextCurrent,
                                isAnswered && !isCurrent && styles.questionPillTextAnswered
                              ]}
                            >
                              {idx + 1}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    {/* Current Question Display */}
                    {(() => {
                      const q = quizDetail.questions[currentQuestionIndex];
                      if (!q) return null;
                      const isMultiple = q.questionType === 'MULTIPLE_CHOICE';
                      const currentAnswers = selectedAnswers[q.questionId] || [];

                      return (
                        <View style={styles.questionBox}>
                          <View style={styles.questionBoxHeader}>
                            <Text style={styles.questionPointsText}>
                              {q.points} điểm • {isMultiple ? 'Chọn nhiều đáp án' : 'Chọn 1 đáp án'}
                            </Text>
                          </View>

                          <Text style={styles.questionTitle}>
                            {currentQuestionIndex + 1}. {q.questionText}
                          </Text>

                          {/* Options List */}
                          <View style={styles.optionsList}>
                            {q.options?.map((opt, oIdx) => {
                              const isSelected = currentAnswers.includes(opt.optionId);
                              const letter = String.fromCharCode(65 + oIdx);

                              return (
                                <TouchableOpacity
                                  key={opt.optionId}
                                  style={[
                                    styles.optionCard,
                                    isSelected && styles.optionCardSelected
                                  ]}
                                  onPress={() =>
                                    handleSelectOption(q.questionId, opt.optionId, isMultiple)
                                  }
                                  activeOpacity={0.7}
                                >
                                  <View
                                    style={[
                                      styles.optionCircle,
                                      isSelected && styles.optionCircleSelected
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        styles.optionLetter,
                                        isSelected && styles.optionLetterSelected
                                      ]}
                                    >
                                      {letter}
                                    </Text>
                                  </View>
                                  <Text
                                    style={[
                                      styles.optionText,
                                      isSelected && styles.optionTextSelected
                                    ]}
                                  >
                                    {opt.optionText}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>

                          {/* Question Navigation Controls */}
                          <View style={styles.quizNavRow}>
                            <TouchableOpacity
                              style={[
                                styles.quizNavButton,
                                currentQuestionIndex === 0 && styles.quizNavButtonDisabled
                              ]}
                              onPress={() =>
                                setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                              }
                              disabled={currentQuestionIndex === 0}
                              activeOpacity={0.7}
                            >
                              <Feather name="arrow-left" size={14} color="#1E293B" />
                              <Text style={styles.quizNavButtonText}>Câu trước</Text>
                            </TouchableOpacity>

                            {currentQuestionIndex < quizDetail.questions.length - 1 ? (
                              <TouchableOpacity
                                style={styles.quizNavButtonPrimary}
                                onPress={() =>
                                  setCurrentQuestionIndex((prev) =>
                                    Math.min(quizDetail.questions.length - 1, prev + 1)
                                  )
                                }
                                activeOpacity={0.8}
                              >
                                <Text style={styles.quizNavButtonPrimaryText}>Câu tiếp</Text>
                                <Feather name="arrow-right" size={14} color="#FFFFFF" />
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                style={[
                                  styles.quizSubmitButton,
                                  submittingQuiz && styles.buttonDisabled
                                ]}
                                onPress={() => {
                                  const answeredCount = Object.keys(selectedAnswers).filter(
                                    (k) => (selectedAnswers[k] || []).length > 0
                                  ).length;

                                  Alert.alert(
                                    'Xác nhận nộp bài',
                                    `Bạn đã hoàn thành ${answeredCount}/${quizDetail.questions.length} câu. Bạn có chắc chắn muốn nộp bài thi?`,
                                    [
                                      { text: 'Kiểm tra lại', style: 'cancel' },
                                      {
                                        text: 'Nộp bài ngay',
                                        style: 'destructive',
                                        onPress: executeQuizSubmission
                                      }
                                    ]
                                  );
                                }}
                                disabled={submittingQuiz}
                                activeOpacity={0.8}
                              >
                                {submittingQuiz ? (
                                  <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                  <>
                                    <Feather name="check" size={14} color="#FFFFFF" />
                                    <Text style={styles.quizSubmitButtonText}>Nộp bài thi</Text>
                                  </>
                                )}
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      );
                    })()}
                  </View>
                )}
              </View>
            ) : (
              // ==========================================================
              // SUB-VIEW 3: BÀI GIẢNG / VIDEO / TÀI LIỆU (PDF, DOCX, TEXT)
              // ==========================================================
              <View style={styles.lessonReaderContainer}>
                {/* 1. In-app Video Player with WebView */}
                {isVideoType && videoInfo?.embedUrl ? (
                  <View style={styles.mediaCard}>
                    <View style={styles.mediaCardHeader}>
                      <View style={styles.mediaBadgeVideo}>
                        <Feather name="play-circle" size={14} color="#2563EB" />
                        <Text style={styles.mediaBadgeVideoText}>Bài giảng Video</Text>
                      </View>

                      {videoInfo.originalUrl ? (
                        <TouchableOpacity
                          style={styles.openExternalBtn}
                          onPress={() => Linking.openURL(videoInfo.originalUrl)}
                          activeOpacity={0.7}
                        >
                          <Feather name="external-link" size={13} color="#2563EB" />
                          <Text style={styles.openExternalText}>Mở ứng dụng ngoài</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    {/* Embedded 16:9 Video Player */}
                    <View style={styles.videoPlayerBox}>
                      <WebView
                        source={{ uri: videoInfo.embedUrl }}
                        style={styles.videoWebView}
                        allowsFullscreenVideo
                        javaScriptEnabled
                        domStorageEnabled
                        originWhitelist={['*']}
                        renderLoading={() => (
                          <View style={styles.webViewLoader}>
                            <ActivityIndicator size="small" color="#2563EB" />
                            <Text style={styles.webViewLoaderText}>Đang tải video...</Text>
                          </View>
                        )}
                        startInLoadingState
                      />
                    </View>
                  </View>
                ) : null}

                {/* 2. In-app Document Reader (PDF / DOCX) with WebView */}
                {isDocType && docInfo?.embedUrl ? (
                  <View style={styles.mediaCard}>
                    <View style={styles.mediaCardHeader}>
                      <View style={styles.mediaBadgeDoc}>
                        <Feather name="file-text" size={14} color="#0D9488" />
                        <Text style={styles.mediaBadgeDocText}>
                          {selectedActivity.type === 'PDF' ? 'Tài liệu PDF' : 'Tài liệu Word'}
                        </Text>
                      </View>

                      <View style={styles.docActionsRight}>
                        {docInfo.originalUrl ? (
                          <TouchableOpacity
                            style={styles.openExternalBtn}
                            onPress={() => Linking.openURL(docInfo.originalUrl)}
                            activeOpacity={0.7}
                          >
                            <Feather name="external-link" size={13} color="#0D9488" />
                            <Text style={[styles.openExternalText, { color: '#0D9488' }]}>
                              Mở toàn màn hình
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>

                    {/* Embedded Document Viewer */}
                    <View style={styles.documentViewerBox}>
                      <WebView
                        source={{ uri: docInfo.embedUrl }}
                        style={styles.docWebView}
                        javaScriptEnabled
                        domStorageEnabled
                        scalesPageToFit
                        originWhitelist={['*']}
                        renderLoading={() => (
                          <View style={styles.webViewLoader}>
                            <ActivityIndicator size="small" color="#0D9488" />
                            <Text style={styles.webViewLoaderText}>Đang mở tài liệu...</Text>
                          </View>
                        )}
                        startInLoadingState
                      />
                    </View>
                  </View>
                ) : null}

                {/* 3. Text Reading Card (ONLY displayed if bodyMarkdown actually exists) */}
                {selectedActivity.bodyMarkdown && selectedActivity.bodyMarkdown.trim() ? (
                  <View style={styles.markdownCard}>
                    <Text style={styles.markdownText}>{selectedActivity.bodyMarkdown}</Text>
                  </View>
                ) : null}

                {/* Completion Toggle Button */}
                <TouchableOpacity
                  style={[
                    styles.completeLessonButton,
                    selectedActivity.isCompleted && styles.completeLessonButtonDone
                  ]}
                  onPress={() => markActivityComplete(selectedActivity.id)}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={selectedActivity.isCompleted ? 'check-circle' : 'check'}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.completeLessonButtonText}>
                    {selectedActivity.isCompleted
                      ? 'Đã hoàn thành bài học'
                      : 'Đánh dấu đã hoàn thành'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Bottom Stepper: Prev & Next Lesson Buttons */}
            <View style={styles.bottomNavRow}>
              <TouchableOpacity
                style={[
                  styles.bottomNavButton,
                  currentActivityIndex <= 0 && styles.bottomNavButtonDisabled
                ]}
                onPress={handlePrevActivity}
                disabled={currentActivityIndex <= 0}
                activeOpacity={0.7}
              >
                <Feather name="arrow-left" size={14} color="#1E293B" />
                <Text style={styles.bottomNavButtonText}>Bài trước</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.bottomNavButton,
                  styles.bottomNavButtonPrimary,
                  currentActivityIndex >= allCurriculumItems.length - 1 &&
                    styles.bottomNavButtonDisabled
                ]}
                onPress={handleNextActivity}
                disabled={currentActivityIndex >= allCurriculumItems.length - 1}
                activeOpacity={0.8}
              >
                <Text style={styles.bottomNavButtonPrimaryText}>Bài tiếp theo</Text>
                <Feather name="arrow-right" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ==================================================== */}
      {/* 3. MODAL: Curriculum Drawer (Mục lục bài giảng)       */}
      {/* ==================================================== */}
      <Modal
        visible={drawerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.drawerCard}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerHeaderLeft}>
                <Feather name="layers" size={18} color="#2563EB" />
                <Text style={styles.drawerTitle}>Mục lục khóa học</Text>
              </View>
              <TouchableOpacity
                style={styles.drawerCloseButton}
                onPress={() => setDrawerVisible(false)}
                activeOpacity={0.7}
              >
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.drawerList} showsVerticalScrollIndicator={false}>
              {sections.map((section, sIdx) => {
                const total = section.items?.length || 0;
                const completed = section.items?.filter((i) => i.isCompleted).length || 0;

                return (
                  <View key={section.id} style={styles.drawerSectionBox}>
                    <Text style={styles.drawerSectionTitle}>
                      {sIdx + 1}. {section.title} ({completed}/{total})
                    </Text>

                    {section.items?.map((item) => {
                      const isSelected = selectedActivity?.id === item.id;

                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.drawerItemRow,
                            isSelected && styles.drawerItemRowSelected,
                            item.isLocked && styles.drawerItemRowLocked
                          ]}
                          onPress={() => selectActivity(item)}
                          activeOpacity={item.isLocked ? 1 : 0.7}
                        >
                          <View style={styles.drawerItemLeft}>
                            {getActivityIcon(item.type)}
                            <Text
                              style={[
                                styles.drawerItemText,
                                isSelected && styles.drawerItemTextSelected,
                                item.isLocked && styles.drawerItemTextLocked
                              ]}
                              numberOfLines={1}
                            >
                              {item.title}
                            </Text>
                          </View>

                          {item.isLocked ? (
                            <Feather name="lock" size={12} color="#94A3B8" />
                          ) : item.isCompleted ? (
                            <Feather name="check-circle" size={14} color="#16A34A" />
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500'
  },

  // 1. Top Header
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9'
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B'
  },
  drawerToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  drawerToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB'
  },

  // Course Banner
  courseBanner: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  bannerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  courseCodeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  courseCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB'
  },
  teacherNameText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    flex: 1
  },
  courseTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8
  },
  progressContainer: {
    marginTop: 4
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  progressLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500'
  },
  progressPercentageText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB'
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 3
  },

  // 2. Main Scroll
  mainScroll: {
    flex: 1
  },
  mainScrollContent: {
    padding: 16,
    paddingBottom: 40
  },

  // Outline View
  outlineContainer: {
    gap: 14
  },
  outlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  outlineHeaderText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B'
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  sectionIndexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionIndexText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  sectionHeaderInfo: {
    flex: 1
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B'
  },
  sectionSubCount: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  sectionItemsContainer: {
    backgroundColor: '#FFFFFF'
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  itemRowLocked: {
    opacity: 0.6
  },
  itemRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  itemIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemInfo: {
    flex: 1
  },
  itemTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B'
  },
  itemTitleLocked: {
    color: '#94A3B8'
  },
  itemTypeBadgeRow: {
    flexDirection: 'row',
    marginTop: 2
  },
  itemTypeBadgeText: {
    fontSize: 11,
    color: '#64748B'
  },
  itemRowRight: {
    marginLeft: 8
  },
  lockedPill: {
    padding: 4
  },
  completedPill: {
    padding: 2
  },
  todoPill: {
    padding: 2
  },

  // Activity View
  activityContainer: {
    gap: 14
  },
  activityTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  activityTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  activityTypeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB'
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A'
  },
  activityMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24
  },

  // Sub Loading
  subLoadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  subLoadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748B'
  },

  // Practice Screen Styles
  practiceContainer: {
    gap: 14
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B'
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FEE2E2'
  },
  dueText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626'
  },
  maxScoreText: {
    fontSize: 12,
    color: '#64748B'
  },
  instructionBody: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155'
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  attachmentButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB'
  },
  gradeResultCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 14,
    gap: 8
  },
  gradeResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  gradeResultTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534'
  },
  gradeScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4
  },
  gradeScoreBig: {
    fontSize: 28,
    fontWeight: '900',
    color: '#16A34A'
  },
  gradeScoreMax: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600'
  },
  feedbackContainer: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7'
  },
  feedbackLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2
  },
  feedbackText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18
  },
  submissionStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10
  },
  submissionStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  submissionStatusTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B'
  },
  statusPillSubmitted: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  statusPillSubmittedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A'
  },
  submittedAtText: {
    fontSize: 12,
    color: '#64748B'
  },
  subHistoryBlock: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8
  },
  subHistoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2
  },
  subHistoryValue: {
    fontSize: 13,
    color: '#1E293B'
  },
  subHistoryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 8
  },
  subHistoryLinkText: {
    flex: 1,
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500'
  },
  resubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    marginTop: 4
  },
  resubmitButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB'
  },
  submitFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 8
  },
  submitFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  submitFormTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B'
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 4
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10
  },
  inputIcon: {
    marginRight: 8
  },
  textInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A'
  },
  textAreaInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    height: 90,
    textAlignVertical: 'top'
  },
  submitButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B'
  },
  submitActionButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 11,
    borderRadius: 8
  },
  submitActionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  buttonDisabled: {
    opacity: 0.6
  },

  // Media (Video / Document) Styles
  mediaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden'
  },
  mediaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  mediaBadgeVideo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  mediaBadgeVideoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB'
  },
  mediaBadgeDoc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  mediaBadgeDocText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488'
  },
  openExternalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  openExternalText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB'
  },
  docActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  videoPlayerBox: {
    width: '100%',
    height: Math.round((SCREEN_WIDTH - 32) * (9 / 16)), // 16:9 aspect ratio
    backgroundColor: '#0F172A',
    overflow: 'hidden'
  },
  videoWebView: {
    flex: 1,
    backgroundColor: '#000000'
  },
  documentViewerBox: {
    width: '100%',
    height: 480,
    backgroundColor: '#FFFFFF'
  },
  docWebView: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  webViewLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  webViewLoaderText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500'
  },

  // Password Lock Card
  passwordLockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    gap: 12
  },
  passwordIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  passwordLockTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A'
  },
  passwordLockDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8
  },
  passwordInlineInput: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginTop: 4
  },
  passwordErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    width: '100%'
  },
  passwordErrorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
    flex: 1
  },
  passwordLockBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 6
  },
  passwordBackOutlineBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  passwordBackOutlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B'
  },
  unlockButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 11,
    borderRadius: 8
  },
  unlockButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF'
  },

  // Quiz Screen Styles
  quizContainer: {
    gap: 14
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B'
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center'
  },

  // Active Quiz Runner
  quizRunnerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12
  },
  latestAttemptBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  latestAttemptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1
  },
  latestAttemptText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B'
  },
  latestPassBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  latestPassBadgePass: {
    backgroundColor: '#DCFCE7'
  },
  latestPassBadgeFail: {
    backgroundColor: '#FEE2E2'
  },
  latestPassText: {
    fontSize: 10,
    fontWeight: '800'
  },
  latestPassTextPass: {
    color: '#16A34A'
  },
  latestPassTextFail: {
    color: '#DC2626'
  },
  viewReviewQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  viewReviewQuickText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB'
  },
  quizRunnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  questionCounterBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  questionCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB'
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FEE2E2'
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626'
  },

  // Question Jump Pills
  questionNavPills: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4
  },
  questionPill: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  questionPillCurrent: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB'
  },
  questionPillAnswered: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD'
  },
  questionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B'
  },
  questionPillTextCurrent: {
    color: '#FFFFFF'
  },
  questionPillTextAnswered: {
    color: '#2563EB'
  },

  questionBox: {
    gap: 12,
    marginTop: 4
  },
  questionBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  questionPointsText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600'
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22
  },
  optionsList: {
    gap: 8
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    gap: 10
  },
  optionCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB'
  },
  optionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  optionCircleSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB'
  },
  optionLetter: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B'
  },
  optionLetterSelected: {
    color: '#FFFFFF'
  },
  optionText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
    lineHeight: 18
  },
  optionTextSelected: {
    color: '#1E293B',
    fontWeight: '600'
  },
  quizNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  quizNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  quizNavButtonDisabled: {
    opacity: 0.4
  },
  quizNavButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B'
  },
  quizNavButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  quizNavButtonPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  quizSubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  quizSubmitButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },

  // Review Mode Styles
  reviewModeContainer: {
    gap: 12
  },
  quizResultBanner: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 6
  },
  quizResultBannerPass: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0'
  },
  quizResultBannerFail: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA'
  },
  quizResultScore: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A'
  },
  quizResultStatus: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  reviewActionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 4
  },
  backOutlineFromReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  backOutlineFromReviewText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569'
  },
  retakeQuizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  retakeQuizButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB'
  },
  reviewSection: {
    gap: 10
  },
  reviewSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4
  },
  reviewSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B'
  },
  reviewQuestionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 8
  },
  reviewQuestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8
  },
  reviewQuestionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    lineHeight: 18
  },
  rqResultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  rqResultBadgeCorrect: {
    backgroundColor: '#DCFCE7'
  },
  rqResultBadgeWrong: {
    backgroundColor: '#FEE2E2'
  },
  rqResultText: {
    fontSize: 11,
    fontWeight: '700'
  },
  rqResultTextCorrect: {
    color: '#16A34A'
  },
  rqResultTextWrong: {
    color: '#DC2626'
  },
  reviewOptionsList: {
    gap: 6
  },
  reviewOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 8,
    gap: 8
  },
  reviewOptionCorrect: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC'
  },
  reviewOptionWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5'
  },
  reviewOptionLetter: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B'
  },
  reviewOptionText: {
    fontSize: 12,
    color: '#334155',
    flex: 1
  },
  explanationBox: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
    padding: 8,
    borderRadius: 4,
    marginTop: 4
  },
  explanationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 2
  },
  explanationText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16
  },

  // Reading / Lesson Styles
  lessonReaderContainer: {
    gap: 14
  },
  markdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16
  },
  markdownText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1E293B'
  },
  completeLessonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10
  },
  completeLessonButtonDone: {
    backgroundColor: '#16A34A'
  },
  completeLessonButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },

  // Bottom Nav
  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  bottomNavButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 11,
    borderRadius: 8
  },
  bottomNavButtonPrimary: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB'
  },
  bottomNavButtonDisabled: {
    opacity: 0.4
  },
  bottomNavButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B'
  },
  bottomNavButtonPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },

  // Drawer Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end'
  },
  drawerCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    padding: 16
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  drawerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A'
  },
  drawerCloseButton: {
    padding: 4
  },
  drawerList: {
    marginTop: 10
  },
  drawerSectionBox: {
    marginBottom: 12
  },
  drawerSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6
  },
  drawerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 2
  },
  drawerItemRowSelected: {
    backgroundColor: '#EFF6FF'
  },
  drawerItemRowLocked: {
    opacity: 0.5
  },
  drawerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  drawerItemText: {
    fontSize: 13,
    color: '#334155',
    flex: 1
  },
  drawerItemTextSelected: {
    color: '#2563EB',
    fontWeight: '700'
  },
  drawerItemTextLocked: {
    color: '#94A3B8'
  }
});
