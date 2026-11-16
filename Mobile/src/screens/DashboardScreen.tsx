import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { UpcomingDeadline, EnrolledCourseSummary } from '../types';

interface DashboardScreenProps {
  onNavigate?: (tab: 'home' | 'courses' | 'grades' | 'notifications' | 'profile') => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const [deadlines, setDeadlines] = useState<UpcomingDeadline[]>([]);
  const [courses, setCourses] = useState<EnrolledCourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. Fetch upcoming deadlines
      const deadlinesData = await api.get<UpcomingDeadline[]>('/student/upcoming-deadlines').catch(() => []);
      setDeadlines(deadlinesData || []);

      // 2. Fetch enrolled courses
      const coursesData = await api.get<any>('/courses/my-courses').catch(() => []);
      const courseList = Array.isArray(coursesData) ? coursesData : coursesData?.items || [];
      setCourses(courseList);
    } catch (err: any) {
      console.log('Lỗi tải dữ liệu dashboard:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatRemainingTime = (seconds: number) => {
    if (seconds <= 0) return 'Đã hết hạn';
    const hours = Math.floor(seconds / 3600);
    if (hours < 24) return `Còn ${hours} giờ`;
    const days = Math.floor(hours / 24);
    return `Còn ${days} ngày`;
  };

  const getUrgencyBadge = (urgency: 'RED' | 'YELLOW' | 'GREEN') => {
    switch (urgency) {
      case 'RED':
        return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', label: 'Gấp (< 24h)' };
      case 'YELLOW':
        return { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706', label: 'Sắp hạn (< 3 ngày)' };
      case 'GREEN':
      default:
        return { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A', label: 'Bình thường' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Scroll Content */}
      <ScrollView
        style={styles.container}
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
        {/* Welcome Banner - Exact Web App.tsx Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.semesterPill}>
            <View style={styles.pulsingDot} />
            <Text style={styles.semesterPillText}>HỌC KỲ HIỆN HÀNH: HK1 (2024 - 2025)</Text>
          </View>
          <Text style={styles.welcomeTitle}>
            Xin chào, {user?.fullName || 'Học viên'}!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Theo dõi hạn nộp bài tập và bài kiểm tra trắc nghiệm dưới đây, hoặc vào "Khóa học của tôi" để tiếp tục bài giảng.
          </Text>
        </View>

        {/* Quick Nav Shortcut Pills */}
        <View style={styles.quickNavRow}>
          <TouchableOpacity
            style={styles.quickNavPill}
            onPress={() => onNavigate && onNavigate('courses')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickNavIcon, { backgroundColor: '#EFF6FF' }]}>
              <Feather name="book-open" size={14} color="#2563EB" />
            </View>
            <Text style={styles.quickNavText}>Khóa học ({courses.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavPill}
            onPress={() => onNavigate && onNavigate('grades')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickNavIcon, { backgroundColor: '#ECFDF5' }]}>
              <Feather name="award" size={14} color="#059669" />
            </View>
            <Text style={styles.quickNavText}>Bảng điểm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavPill}
            onPress={() => onNavigate && onNavigate('notifications')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickNavIcon, { backgroundColor: '#FEF3C7' }]}>
              <Feather name="bell" size={14} color="#D97706" />
            </View>
            <Text style={styles.quickNavText}>Thông báo</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Deadlines Section - Matching UpcomingDeadlinesWidget.tsx */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionIconBadge}>
                <Feather name="clock" size={18} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Hạn nộp bài tập & Quiz</Text>
                <Text style={styles.sectionSubtitle}>Các bài tập và quiz cần hoàn thành</Text>
              </View>
            </View>
            {deadlines.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{deadlines.length} bài</Text>
              </View>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.loadingText}>Đang tải danh sách bài tập...</Text>
            </View>
          ) : deadlines.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="check-circle" size={32} color="#10B981" />
              <Text style={styles.emptyTitle}>Tuyệt vời! Không có bài tập tồn đọng</Text>
              <Text style={styles.emptySubtitle}>
                Bạn đã hoàn thành tất cả các bài tập và quiz sắp đến hạn.
              </Text>
            </View>
          ) : (
            <View style={styles.deadlineList}>
              {deadlines.map((item) => {
                const badge = getUrgencyBadge(item.urgency);
                const isQuiz = item.type === 'QUIZ';
                return (
                  <View key={item.id} style={styles.deadlineCard}>
                    {/* Header: Course Code & Urgency Pill */}
                    <View style={styles.deadlineCardHeader}>
                      <View style={styles.courseCodeBadge}>
                        <Text style={styles.courseCodeText}>
                          {item.courseCode || 'INT3307'}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.urgencyPill,
                          { backgroundColor: badge.bg, borderColor: badge.border }
                        ]}
                      >
                        <Text style={[styles.urgencyPillText, { color: badge.text }]}>
                          {badge.label}
                        </Text>
                      </View>
                    </View>

                    {/* Deadline Title */}
                    <Text style={styles.deadlineTitle} numberOfLines={2}>
                      {item.title}
                    </Text>

                    {/* Footer Info & Action Button */}
                    <View style={styles.deadlineToRow}>
                      <View style={styles.deadlineToLeft}>
                        <View style={styles.typeBadge}>
                          <Text style={styles.typeBadgeText}>
                            {isQuiz ? 'TRẮC NGHIỆM' : 'BÀI TẬP'}
                          </Text>
                        </View>
                        <View style={styles.countdownRow}>
                          <Feather name="clock" size={12} color="#DC2626" />
                          <Text style={styles.countdownText}>
                            {formatRemainingTime(item.remainingSeconds)}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          if (onNavigate) {
                            onNavigate('courses');
                          } else {
                            Alert.alert('Vào làm bài', `Đang mở bài: ${item.title}`);
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.actionButtonText}>
                          {isQuiz ? 'Làm Quiz' : 'Nộp bài'}
                        </Text>
                        <Feather name="arrow-right" size={13} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Enrolled Courses Section - Matching Web CoursesPage.tsx */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#EFF6FF' }]}>
                <Feather name="book-open" size={18} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Khóa học của tôi</Text>
                <Text style={styles.sectionSubtitle}>Tiến độ học tập và bài giảng đang học</Text>
              </View>
            </View>
            {courses.length > 0 && (
              <TouchableOpacity
                onPress={() => onNavigate && onNavigate('courses')}
                activeOpacity={0.7}
              >
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>Xem tất cả ({courses.length})</Text>
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
              <Text style={styles.emptyTitle}>Chưa đăng ký khóa học nào</Text>
              <Text style={styles.emptySubtitle}>
                Vui lòng vào tab "Khóa học" để đăng ký các môn học mới.
              </Text>
            </View>
          ) : (
            <View style={styles.courseList}>
              {courses.map((c) => {
                const progress = c.progressPercentage ?? 0;
                return (
                  <View key={c.id} style={styles.courseCard}>
                    {/* Header Row: Course Code & Status */}
                    <View style={styles.courseCardHeader}>
                      <View style={styles.courseCodeBadge}>
                        <Text style={styles.courseCodeText}>{c.courseCode}</Text>
                      </View>
                      <View style={styles.statusActivePill}>
                        <Text style={styles.statusActiveText}>ĐANG HỌC</Text>
                      </View>
                    </View>

                    {/* Course Title */}
                    <Text style={styles.courseTitle} numberOfLines={2}>
                      {c.title}
                    </Text>

                    {/* Teacher / Department Info */}
                    <View style={styles.teacherRow}>
                      <Feather name="user-check" size={13} color="#64748B" />
                      <Text style={styles.teacherNameText} numberOfLines={1}>
                        {c.teacherName || 'Giảng viên phụ trách'}
                      </Text>
                    </View>

                    {/* Progress Bar matching Web */}
                    <View style={styles.progressSection}>
                      <View style={styles.progressLabelRow}>
                        <Text style={styles.progressLabel}>Tiến độ hoàn thành</Text>
                        <Text style={styles.progressPercent}>{progress}%</Text>
                      </View>
                      <View style={styles.progressBarTrack}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${Math.min(100, Math.max(0, progress))}%` }
                          ]}
                        />
                      </View>
                    </View>

                    {/* Action Button: Vào học ngay */}
                    <TouchableOpacity
                      style={styles.courseEnterButton}
                      onPress={() => {
                        if (onNavigate) {
                          onNavigate('courses');
                        } else {
                          Alert.alert('Khóa học', `Đang mở môn học: ${c.title}`);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.courseEnterButtonText}>Vào học ngay</Text>
                      <Feather name="arrow-right" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
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

  // Welcome Banner
  welcomeBanner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 18,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1
  },
  semesterPill: {
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
  semesterPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.5
  },
  welcomeTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginTop: 6
  },

  // Quick Nav Shortcut Pills
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
    gap: 10
  },
  sectionIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
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
    borderColor: '#DBEAFE'
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8'
  },

  // Loading & Empty States
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500'
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    textAlign: 'center'
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
    maxWidth: 260
  },

  // Deadline Card
  deadlineList: {
    gap: 12
  },
  deadlineCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14
  },
  deadlineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  courseCodeBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  courseCodeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8'
  },
  urgencyPill: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1
  },
  urgencyPillText: {
    fontSize: 10,
    fontWeight: '700'
  },
  deadlineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 10
  },
  deadlineToRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  deadlineToLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  typeBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569'
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  countdownText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626'
  },
  actionButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  actionButtonText: {
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
  courseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  statusActivePill: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  statusActiveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669'
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10
  },
  teacherNameText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B'
  },
  progressSection: {
    marginBottom: 12
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569'
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB'
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 3
  },
  courseEnterButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  courseEnterButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
