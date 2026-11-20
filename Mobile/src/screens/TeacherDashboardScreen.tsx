import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { TeacherOverviewData, TeacherCourse, TeacherRecentSubmission } from '../types';

interface TeacherDashboardScreenProps {
  onNavigate?: (tab: 'home' | 'courses' | 'grades' | 'notifications' | 'profile') => void;
}

export const TeacherDashboardScreen: React.FC<TeacherDashboardScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const [overview, setOverview] = useState<TeacherOverviewData | null>(null);
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState<TeacherRecentSubmission | null>(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  const fetchTeacherData = useCallback(async () => {
    try {
      setLoading(true);
      const teacherId = user?.userId || '';
      const [overviewData, coursesData] = await Promise.all([
        api.get<any>(`/teacher/overview?teacherId=${teacherId}`).catch(() => null),
        api.get<any>(`/teacher/courses?teacherId=${teacherId}`).catch(() => [])
      ]);

      setOverview(overviewData);
      setCourses(Array.isArray(coursesData) ? coursesData : coursesData?.items || []);
    } catch (err: any) {
      console.log('Lỗi tải dữ liệu giảng viên:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchTeacherData();
  }, [fetchTeacherData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeacherData();
  };

  const handleOpenGradeModal = (sub: TeacherRecentSubmission) => {
    setGradingSubmission(sub);
    setGradeInput(sub.grade !== null && sub.grade !== undefined ? sub.grade.toString() : '');
    setFeedbackInput('');
  };

  const handleSubmitGrade = async () => {
    if (!gradingSubmission) return;
    const score = parseFloat(gradeInput.trim());
    if (isNaN(score) || score < 0 || score > 10) {
      Alert.alert('Điểm số không hợp lệ', 'Vui lòng nhập điểm từ 0 đến 10.');
      return;
    }

    try {
      setSubmittingGrade(true);
      await api.post(`/teacher/submissions/${gradingSubmission.id}/grade`, {
        grade: score,
        feedback: feedbackInput.trim() || 'Giảng viên đã chấm và ghi nhận bài nộp.'
      });

      Alert.alert('Thành công', `Đã chấm điểm ${score}/10 cho sinh viên ${gradingSubmission.studentName}!`);
      setGradingSubmission(null);
      fetchTeacherData();
    } catch (err: any) {
      Alert.alert('Lỗi chấm bài', err.message || 'Không thể lưu kết quả chấm bài.');
    } finally {
      setSubmittingGrade(false);
    }
  };

  const pendingSubmissions = overview?.recentSubmissions?.filter((s) => s.status === 'SUBMITTED') || [];
  const recentSubmissions = overview?.recentSubmissions || [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Banner matching Web TeacherDashboard */}
        <View style={styles.banner}>
          <View style={styles.bannerPill}>
            <View style={styles.pulsingDot} />
            <Text style={styles.bannerPillText}>CỔNG GIẢNG VIÊN • HK1 (2024 - 2025)</Text>
          </View>
          <Text style={styles.bannerTitle}>
            Xin chào, Thầy/Cô {user?.fullName || 'Giảng viên'}!
          </Text>
          <Text style={styles.bannerSubtitle}>
            Theo dõi tiến độ các lớp học phần phụ trách, bài nộp sinh viên cần chấm và biểu đồ học tập.
          </Text>
        </View>

        {/* Consolidated Grouped Stats Card (Thu gọn 4 chỉ số vào 1 cụm thống nhất) */}
        <View style={styles.groupedStatsCard}>
          {/* Nhóm 1: Quản lý môn học & Sinh viên */}
          <View style={styles.statsGroupRow}>
            {/* Item 1: Môn phụ trách */}
            <View style={styles.compactStatItem}>
              <View style={[styles.compactStatIcon, { backgroundColor: '#EFF6FF' }]}>
                <Feather name="book-open" size={15} color="#2563EB" />
              </View>
              <View style={styles.compactStatMeta}>
                <Text style={styles.compactStatLabel}>Môn phụ trách</Text>
                <View style={styles.compactStatValueRow}>
                  <Text style={[styles.compactStatValue, { color: '#2563EB' }]}>
                    {overview?.assignedCoursesCount ?? overview?.totalCourses ?? courses.length}
                  </Text>
                  <Text style={styles.compactStatUnit}>môn</Text>
                </View>
              </View>
            </View>

            <View style={styles.compactStatDividerV} />

            {/* Item 2: Tổng sinh viên */}
            <View style={styles.compactStatItem}>
              <View style={[styles.compactStatIcon, { backgroundColor: '#ECFDF5' }]}>
                <Feather name="users" size={15} color="#059669" />
              </View>
              <View style={styles.compactStatMeta}>
                <Text style={styles.compactStatLabel}>Tổng sinh viên</Text>
                <View style={styles.compactStatValueRow}>
                  <Text style={[styles.compactStatValue, { color: '#059669' }]}>
                    {overview?.totalStudentsCount ?? overview?.totalStudents ?? (courses.length > 0 ? courses.reduce((acc, c) => acc + (c.enrolledStudents || 0), 0) : 0)}
                  </Text>
                  <Text style={styles.compactStatUnit}>SV</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.compactStatDividerH} />

          {/* Nhóm 2: Bài cần chấm & Tiến độ trung bình */}
          <View style={styles.statsGroupRow}>
            {/* Item 3: Bài cần chấm */}
            <View style={styles.compactStatItem}>
              <View style={[styles.compactStatIcon, { backgroundColor: '#FFFBEB' }]}>
                <Feather name="clock" size={15} color="#D97706" />
              </View>
              <View style={styles.compactStatMeta}>
                <Text style={styles.compactStatLabel}>Bài cần chấm</Text>
                <View style={styles.compactStatValueRow}>
                  <Text style={[styles.compactStatValue, { color: '#D97706' }]}>
                    {overview?.pendingSubmissionsCount ?? overview?.pendingSubmissions ?? pendingSubmissions.length}
                  </Text>
                  <Text style={styles.compactStatUnit}>bài</Text>
                </View>
              </View>
            </View>

            <View style={styles.compactStatDividerV} />

            {/* Item 4: Tiến độ trung bình */}
            <View style={styles.compactStatItem}>
              <View style={[styles.compactStatIcon, { backgroundColor: '#F5F3FF' }]}>
                <Feather name="trending-up" size={15} color="#7C3AED" />
              </View>
              <View style={styles.compactStatMeta}>
                <Text style={styles.compactStatLabel}>Tiến độ TB</Text>
                <View style={styles.compactStatValueRow}>
                  <Text style={[styles.compactStatValue, { color: '#7C3AED' }]}>
                    {overview?.averagePassRate ?? overview?.averageProgress ?? 0}%
                  </Text>
                  <Text style={styles.compactStatUnit}>lớp</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Shortcut Navigation Pills */}
        <View style={styles.quickNavRow}>
          <TouchableOpacity
            style={styles.quickNavPill}
            onPress={() => onNavigate && onNavigate('courses')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickNavIcon, { backgroundColor: '#EFF6FF' }]}>
              <Feather name="book-open" size={13} color="#2563EB" />
            </View>
            <Text style={styles.quickNavText}>Lớp học phần</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavPill}
            onPress={() => onNavigate && onNavigate('grades')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickNavIcon, { backgroundColor: '#ECFDF5' }]}>
              <Feather name="award" size={13} color="#059669" />
            </View>
            <Text style={styles.quickNavText}>Bảng điểm lớp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavPill}
            onPress={() => onNavigate && onNavigate('notifications')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickNavIcon, { backgroundColor: '#FEF3C7' }]}>
              <Feather name="bell" size={13} color="#D97706" />
            </View>
            <Text style={styles.quickNavText}>Thông báo</Text>
          </TouchableOpacity>
        </View>

        {/* Section 1: Pending Student Submissions */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionIconBadge}>
                <Feather name="file-text" size={18} color="#2563EB" />
              </View>
              <View style={styles.sectionHeaderTextGroup}>
                <Text style={styles.sectionTitle} numberOfLines={1}>Bài nộp cần chấm điểm</Text>
                <Text style={styles.sectionSubtitle} numberOfLines={1}>Các bài tập và bài kiểm tra sinh viên vừa nộp</Text>
              </View>
            </View>
            {recentSubmissions.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{recentSubmissions.length} bài</Text>
              </View>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.loadingText}>Đang tải danh sách bài nộp...</Text>
            </View>
          ) : recentSubmissions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="check-circle" size={32} color="#10B981" />
              <Text style={styles.emptyTitle}>Tất cả bài nộp đã được chấm điểm!</Text>
              <Text style={styles.emptySubtitle}>
                Hiện không có bài nộp nào của sinh viên đang chờ phê duyệt.
              </Text>
            </View>
          ) : (
            <View style={styles.submissionList}>
              {recentSubmissions.map((sub) => {
                const isGraded = sub.status === 'GRADED';
                return (
                  <View key={sub.id} style={styles.submissionCard}>
                    <View style={styles.submissionTopRow}>
                      <View style={styles.codePillRow}>
                        <View style={styles.courseCodeBadge}>
                          <Text style={styles.courseCodeText}>{sub.courseCode || 'INT3306'}</Text>
                        </View>
                        <View style={styles.studentCodeBadge}>
                          <Text style={styles.studentCodeText}>{sub.studentCode}</Text>
                        </View>
                      </View>

                      {isGraded ? (
                        <View style={styles.gradedPill}>
                          <Text style={styles.gradedPillText}>ĐÃ CHẤM: {sub.grade}/10</Text>
                        </View>
                      ) : (
                        <View style={styles.pendingPill}>
                          <Text style={styles.pendingPillText}>CHỜ CHẤM</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.assignmentTitle} numberOfLines={2}>
                      {sub.assignmentTitle}
                    </Text>

                    <View style={styles.submissionBottomRow}>
                      <View style={styles.studentInfoCol}>
                        <Text style={styles.studentNameText}>SV: {sub.studentName}</Text>
                        <Text style={styles.submittedTimeText}>
                          <Feather name="clock" size={11} color="#94A3B8" /> {sub.submittedAt}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.gradeActionBtn, isGraded && styles.gradeActionBtnSecondary]}
                        onPress={() => handleOpenGradeModal(sub)}
                        activeOpacity={0.8}
                      >
                        <Feather name="edit-3" size={13} color="#FFFFFF" />
                        <Text style={styles.gradeActionBtnText}>
                          {isGraded ? 'Sửa điểm' : 'Chấm điểm'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Section 2: Assigned Courses */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#EFF6FF' }]}>
                <Feather name="book-open" size={18} color="#2563EB" />
              </View>
              <View style={styles.sectionHeaderTextGroup}>
                <Text style={styles.sectionTitle} numberOfLines={1}>Khóa học đang phụ trách</Text>
                <Text style={styles.sectionSubtitle} numberOfLines={1}>Danh sách các lớp học phần được phân công</Text>
              </View>
            </View>
            {courses.length > 0 && (
              <TouchableOpacity
                onPress={() => onNavigate && onNavigate('courses')}
                activeOpacity={0.7}
                style={{ flexShrink: 0 }}
              >
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>Tất cả ({courses.length})</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.loadingText}>Đang tải danh sách khóa học...</Text>
            </View>
          ) : courses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="book" size={32} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Chưa có môn học phụ trách</Text>
              <Text style={styles.emptySubtitle}>
                Vui lòng liên hệ Quản trị viên để được phân công giảng dạy.
              </Text>
            </View>
          ) : (
            <View style={styles.courseList}>
              {courses.map((c) => (
                <View key={c.id} style={styles.courseCard}>
                  <View style={styles.courseCardTop}>
                    <View style={styles.courseCodeBadge}>
                      <Text style={styles.courseCodeText}>{c.courseCode}</Text>
                    </View>
                    {c.accessPassword ? (
                      <View style={styles.lockBadge}>
                        <Feather name="lock" size={11} color="#6366F1" />
                        <Text style={styles.lockText}>Có mã lớp</Text>
                      </View>
                    ) : (
                      <View style={styles.openBadge}>
                        <Text style={styles.openText}>Mở tự do</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.courseTitle} numberOfLines={2}>
                    {c.title}
                  </Text>
                  <Text style={styles.departmentText}>{c.department}</Text>

                  <View style={styles.courseMetaRow}>
                    <View style={styles.metaItem}>
                      <Feather name="users" size={13} color="#2563EB" />
                      <Text style={styles.metaText}>{c.enrolledStudents} sinh viên</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Feather name="file-text" size={13} color="#059669" />
                      <Text style={styles.metaText}>{c.lessonsCount} bài giảng/quiz</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.manageCourseBtn}
                    onPress={() => onNavigate && onNavigate('courses')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.manageCourseBtnText}>Vào quản lý lớp</Text>
                    <Feather name="arrow-right" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Grading Modal */}
      <Modal
        visible={Boolean(gradingSubmission)}
        transparent
        animationType="fade"
        onRequestClose={() => setGradingSubmission(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Feather name="award" size={20} color="#2563EB" />
              </View>
              <Text style={styles.modalTitle}>Chấm điểm bài nộp</Text>
              <TouchableOpacity
                onPress={() => setGradingSubmission(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalStudentBanner}>
              <Text style={styles.modalStudentName}>
                {gradingSubmission?.studentName} ({gradingSubmission?.studentCode})
              </Text>
              <Text style={styles.modalAssignmentTitle} numberOfLines={2}>
                {gradingSubmission?.assignmentTitle}
              </Text>
            </View>

            {/* Score Input */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>ĐIỂM SỐ (THANG 10)</Text>
              <TextInput
                style={styles.modalScoreInput}
                placeholder="Ví dụ: 8.5"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
                value={gradeInput}
                onChangeText={setGradeInput}
              />
            </View>

            {/* Feedback Input */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>LỜI NHẬN XÉT CỦA GIẢNG VIÊN</Text>
              <TextInput
                style={styles.modalFeedbackInput}
                placeholder="Nhập nhận xét, điểm cộng hoặc nhắc nhở cho sinh viên..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={feedbackInput}
                onChangeText={setFeedbackInput}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setGradingSubmission(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, submittingGrade && { opacity: 0.6 }]}
                disabled={submittingGrade || !gradeInput.trim()}
                onPress={handleSubmitGrade}
                activeOpacity={0.8}
              >
                {submittingGrade ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Lưu điểm & Gửi nhận xét</Text>
                )}
              </TouchableOpacity>
            </View>
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
  scrollContent: {
    paddingBottom: 24
  },

  // Banner
  banner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 14,
    padding: 18,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1
  },
  bannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 10
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 6
  },
  bannerPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.5
  },
  bannerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginTop: 6
  },

  // Grouped Stats Card (Thu gọn & gộp nhóm tinh tế)
  groupedStatsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 16,
    marginBottom: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  statsGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  compactStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4
  },
  compactStatIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  compactStatMeta: {
    flex: 1
  },
  compactStatLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2
  },
  compactStatValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4
  },
  compactStatValue: {
    fontSize: 18,
    fontWeight: '800'
  },
  compactStatUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8'
  },
  compactStatDividerV: {
    width: 1,
    height: 32,
    backgroundColor: '#F1F5F9'
  },
  compactStatDividerH: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8
  },

  // Quick Nav Pills
  quickNavRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14
  },
  quickNavPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1
  },
  quickNavIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quickNavText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155'
  },

  // Section Card
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 18,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8
  },
  sectionHeaderTextGroup: {
    flex: 1
  },
  sectionIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1
  },
  countBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    flexShrink: 0
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8'
  },

  // Loading & Empty
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B'
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 6
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A'
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center'
  },

  // Submissions
  submissionList: {
    gap: 10
  },
  submissionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14
  },
  submissionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  codePillRow: {
    flexDirection: 'row',
    gap: 6
  },
  courseCodeBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  courseCodeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8'
  },
  studentCodeBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2
  },
  studentCodeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569'
  },
  pendingPill: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#FDE68A'
  },
  pendingPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706'
  },
  gradedPill: {
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  gradedPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669'
  },
  assignmentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8
  },
  submissionBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  studentInfoCol: {
    flex: 1
  },
  studentNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155'
  },
  submittedTimeText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2
  },
  gradeActionBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  gradeActionBtnSecondary: {
    backgroundColor: '#475569'
  },
  gradeActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF'
  },

  // Course Card
  courseList: {
    gap: 12
  },
  courseCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14
  },
  courseCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#C7D2FE'
  },
  lockText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4F46E5'
  },
  openBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  openText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B'
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2
  },
  departmentText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8
  },
  courseMetaRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 10
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  metaText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500'
  },
  manageCourseBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6
  },
  manageCourseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    padding: 20
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  modalIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 10
  },
  modalStudentBanner: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginBottom: 14
  },
  modalStudentName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF'
  },
  modalAssignmentTitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  modalInputGroup: {
    marginBottom: 12
  },
  modalInputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  modalScoreInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    backgroundColor: '#F8FAFC'
  },
  modalFeedbackInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    minHeight: 65,
    textAlignVertical: 'top'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  modalCancelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  modalSubmitBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8
  },
  modalSubmitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
