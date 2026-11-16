import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { CourseItem } from '../types';

interface CoursesScreenProps {
  onNavigateCourse?: (courseId: string) => void;
}

export const CoursesScreen: React.FC<CoursesScreenProps> = ({ onNavigateCourse }) => {
  const { user } = useAuth();

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'ENROLLED' | 'AVAILABLE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Password Modal for locked courses
  const [selectedCourseForPassword, setSelectedCourseForPassword] = useState<CourseItem | null>(null);
  const [coursePassword, setCoursePassword] = useState('');
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const studentId = user?.userId || '';
      const endpoint =
        filterType === 'ENROLLED'
          ? `/courses/my-courses?studentId=${studentId}`
          : `/courses?studentId=${studentId}`;
      const res = await api.get<any>(endpoint);
      const list = Array.isArray(res) ? res : res?.items || [];
      setCourses(list);
    } catch (err: any) {
      console.log('Lỗi tải danh sách khóa học:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterType, user?.userId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const handleEnroll = async (course: CourseItem, password?: string) => {
    try {
      setEnrollLoading(true);
      setPasswordError('');
      await api.post(`/courses/${course.id}/enroll`, {
        studentId: user?.userId,
        password: password || undefined
      });
      setSelectedCourseForPassword(null);
      setCoursePassword('');
      Alert.alert('Thành công', `Bạn đã ghi danh thành công khóa học: ${course.title}!`);
      fetchCourses();
    } catch (err: any) {
      const msg = err.message || 'Mật khẩu ghi danh không chính xác hoặc không thể đăng ký.';
      if (selectedCourseForPassword) {
        setPasswordError(msg);
      } else {
        Alert.alert('Lỗi ghi danh', msg);
      }
    } finally {
      setEnrollLoading(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      (c.courseCode || '').toLowerCase().includes(query) ||
      (c.title || '').toLowerCase().includes(query) ||
      (c.teacherName || '').toLowerCase().includes(query) ||
      (c.department || '').toLowerCase().includes(query)
    );
  });

  return (
    <View style={styles.container}>
      {/* Banner matching Web CoursesPage */}
      <View style={styles.banner}>
        <View style={styles.bannerPill}>
          <Feather name="book-open" size={12} color="#1E40AF" />
          <Text style={styles.bannerPillText}>KHÁM PHÁ KHÓA HỌC</Text>
        </View>
        <Text style={styles.bannerTitle}>Khóa học trực tuyến</Text>
        <Text style={styles.bannerSubtitle}>
          Theo dõi tiến độ, tài liệu học phần và hoàn thành các bài kiểm tra trắc nghiệm.
        </Text>
      </View>

      {/* Filter Tabs: ALL | ENROLLED | AVAILABLE */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, filterType === 'ALL' && styles.tabButtonActive]}
          onPress={() => setFilterType('ALL')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabButtonText, filterType === 'ALL' && styles.tabButtonTextActive]}>
            Tất cả ({courses.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, filterType === 'ENROLLED' && styles.tabButtonActive]}
          onPress={() => setFilterType('ENROLLED')}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.tabButtonText, filterType === 'ENROLLED' && styles.tabButtonTextActive]}
          >
            Đang học
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, filterType === 'AVAILABLE' && styles.tabButtonActive]}
          onPress={() => setFilterType('AVAILABLE')}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.tabButtonText, filterType === 'AVAILABLE' && styles.tabButtonTextActive]}
          >
            Chưa đăng ký
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Box */}
      <View style={styles.searchBoxContainer}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo mã môn, tên môn học, giảng viên..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Course List */}
      <ScrollView
        contentContainerStyle={styles.scrollList}
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={styles.loadingText}>Đang tải danh sách khóa học...</Text>
          </View>
        ) : filteredCourses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="book" size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Không tìm thấy khóa học</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác.' : 'Chưa có môn học nào trong mục này.'}
            </Text>
          </View>
        ) : (
          filteredCourses.map((c) => {
            const isEnrolled = Boolean(c.isEnrolled);
            const hasPassword = Boolean(c.hasPassword || (c.accessPassword || '').trim());
            const progress = c.progressPercentage ?? 0;

            return (
              <View key={c.id} style={styles.courseCard}>
                {/* Header Row: Course Code & Status Pills */}
                <View style={styles.courseCardHeader}>
                  <View style={styles.codePillRow}>
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeText}>{c.courseCode}</Text>
                    </View>
                    {c.department && (
                      <View style={styles.deptBadge}>
                        <Text style={styles.deptText}>{c.department}</Text>
                      </View>
                    )}
                  </View>

                  {isEnrolled ? (
                    <View style={styles.statusEnrolledPill}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusEnrolledText}>ĐANG HỌC</Text>
                    </View>
                  ) : hasPassword ? (
                    <View style={styles.passwordLockBadge}>
                      <Feather name="lock" size={11} color="#6366F1" />
                      <Text style={styles.passwordLockText}>Có mật khẩu</Text>
                    </View>
                  ) : (
                    <View style={styles.openBadge}>
                      <Text style={styles.openBadgeText}>MỞ GHI DANH</Text>
                    </View>
                  )}
                </View>

                {/* Course Title */}
                <Text style={styles.courseTitle} numberOfLines={2}>
                  {c.title}
                </Text>

                {/* Description if available */}
                {c.description && (
                  <Text style={styles.courseDesc} numberOfLines={2}>
                    {c.description}
                  </Text>
                )}

                {/* Lecturer Info */}
                <View style={styles.teacherRow}>
                  <Feather name="user-check" size={13} color="#64748B" />
                  <Text style={styles.teacherText} numberOfLines={1}>
                    {c.teacherName || 'Chưa phân công giảng viên'}
                  </Text>
                </View>

                {/* Progress bar if enrolled */}
                {isEnrolled && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressLabelRow}>
                      <Text style={styles.progressLabel}>Tiến độ học tập</Text>
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
                )}

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  {isEnrolled ? (
                    <TouchableOpacity
                      style={styles.enterButton}
                      onPress={() => {
                        if (onNavigateCourse) {
                          onNavigateCourse(c.id);
                        } else {
                          Alert.alert('Vào học', `Đang mở khóa học: ${c.title}`);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.enterButtonText}>Vào học ngay</Text>
                      <Feather name="arrow-right" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  ) : hasPassword ? (
                    <TouchableOpacity
                      style={styles.enrollPasswordButton}
                      onPress={() => {
                        setSelectedCourseForPassword(c);
                        setCoursePassword('');
                        setPasswordError('');
                      }}
                      activeOpacity={0.8}
                    >
                      <Feather name="key" size={14} color="#4338CA" />
                      <Text style={styles.enrollPasswordButtonText}>Nhập mã ghi danh</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.enrollButton}
                      onPress={() => handleEnroll(c)}
                      activeOpacity={0.8}
                    >
                      <Feather name="plus-circle" size={14} color="#FFFFFF" />
                      <Text style={styles.enrollButtonText}>Ghi danh môn học</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Password Dialog Modal */}
      <Modal
        visible={Boolean(selectedCourseForPassword)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCourseForPassword(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Feather name="lock" size={20} color="#2563EB" />
              </View>
              <Text style={styles.modalTitle}>Mật khẩu ghi danh</Text>
              <TouchableOpacity
                onPress={() => setSelectedCourseForPassword(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalCourseName} numberOfLines={2}>
              {selectedCourseForPassword?.title}
            </Text>
            <Text style={styles.modalSubtext}>
              Khóa học này yêu cầu mật khẩu ghi danh do giảng viên cung cấp. Vui lòng nhập mật khẩu để tham gia.
            </Text>

            {passwordError ? (
              <View style={styles.modalErrorBox}>
                <Feather name="alert-circle" size={14} color="#DC2626" />
                <Text style={styles.modalErrorText}>{passwordError}</Text>
              </View>
            ) : null}

            <TextInput
              style={styles.modalInput}
              placeholder="Nhập mã truy cập / mật khẩu..."
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={coursePassword}
              onChangeText={setCoursePassword}
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSelectedCourseForPassword(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, enrollLoading && { opacity: 0.6 }]}
                disabled={enrollLoading || !coursePassword.trim()}
                onPress={() => {
                  if (selectedCourseForPassword) {
                    handleEnroll(selectedCourseForPassword, coursePassword.trim());
                  }
                }}
                activeOpacity={0.8}
              >
                {enrollLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Xác nhận ghi danh</Text>
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

  // Banner
  banner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 16
  },
  bannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  bannerPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.5
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A'
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    lineHeight: 18
  },

  // Filter Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 4
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10
  },
  tabButtonActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B'
  },
  tabButtonTextActive: {
    color: '#FFFFFF'
  },

  // Search Box
  searchBoxContainer: {
    paddingHorizontal: 16,
    marginBottom: 12
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0
  },

  // Scroll List
  scrollList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12
  },

  // Loading & Empty States
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B'
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 6
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center'
  },

  // Course Card
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  courseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  codePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  codeBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  codeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8'
  },
  deptBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2.5
  },
  deptText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B'
  },
  statusEnrolledPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2.5
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981'
  },
  statusEnrolledText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669'
  },
  passwordLockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2.5
  },
  passwordLockText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4F46E5'
  },
  openBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2.5
  },
  openBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B'
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    lineHeight: 20
  },
  courseDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 8
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10
  },
  teacherText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569'
  },
  progressContainer: {
    marginBottom: 12
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B'
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
  actionRow: {
    marginTop: 4
  },
  enterButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  enterButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  enrollPasswordButton: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  enrollPasswordButtonText: {
    color: '#4338CA',
    fontSize: 12,
    fontWeight: '700'
  },
  enrollButton: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  enrollButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
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
    marginBottom: 8
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
  modalCourseName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 6
  },
  modalSubtext: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10
  },
  modalErrorText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600'
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginBottom: 16
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10
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
