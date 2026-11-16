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
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { TeacherCourse } from '../types';

interface StudentItem {
  id: string;
  studentCode: string;
  fullName: string;
  email: string;
  className: string;
  progressPercentage?: number;
  status: 'ACTIVE' | 'SUSPENDED';
}

interface TeacherCoursesScreenProps {
  onNavigateToGrading?: (courseId: string) => void;
}

export const TeacherCoursesScreen: React.FC<TeacherCoursesScreenProps> = ({ onNavigateToGrading }) => {
  const { user } = useAuth();

  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Password Modal
  const [passwordModalCourse, setPasswordModalCourse] = useState<TeacherCourse | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Student List Modal
  const [studentListCourse, setStudentListCourse] = useState<TeacherCourse | null>(null);
  const [studentList, setStudentList] = useState<StudentItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const teacherId = user?.userId || '';
      const res = await api.get<any>(`/teacher/courses?teacherId=${teacherId}`);
      const list = Array.isArray(res) ? res : res?.items || [];
      setCourses(list);
    } catch (err: any) {
      console.log('Lỗi tải danh sách lớp học:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const handleOpenPasswordModal = (course: TeacherCourse) => {
    setPasswordModalCourse(course);
    setNewPasswordInput(course.accessPassword || '');
  };

  const handleSavePassword = async () => {
    if (!passwordModalCourse) return;
    try {
      setSavingPassword(true);
      await api.post(`/teacher/courses/${passwordModalCourse.id}/password`, {
        password: newPasswordInput.trim()
      });
      Alert.alert(
        'Thành công',
        newPasswordInput.trim()
          ? 'Đã cập nhật mật khẩu ghi danh mới cho khóa học!'
          : 'Đã mở ghi danh tự do (xóa mật khẩu) cho khóa học!'
      );
      setPasswordModalCourse(null);
      fetchCourses();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật mật khẩu môn học.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleOpenStudentList = async (course: TeacherCourse) => {
    setStudentListCourse(course);
    setStudentList([]);
    try {
      setLoadingStudents(true);
      const res = await api.get<any>(`/teacher/courses/${course.id}/students`);
      const list = Array.isArray(res) ? res : res?.items || [];
      setStudentList(list);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tải danh sách sinh viên.');
    } finally {
      setLoadingStudents(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.courseCode || '').toLowerCase().includes(q) ||
      (c.title || '').toLowerCase().includes(q) ||
      (c.department || '').toLowerCase().includes(q)
    );
  });

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
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerPill}>
            <Feather name="book-open" size={12} color="#1E40AF" />
            <Text style={styles.bannerPillText}>QUẢN LÝ LỚP HỌC PHẦN</Text>
          </View>
          <Text style={styles.bannerTitle}>Các lớp học phụ trách</Text>
          <Text style={styles.bannerSubtitle}>
            Kiểm soát danh sách sinh viên ghi danh, thiết lập mã truy cập môn học và bài giảng.
          </Text>
        </View>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo mã môn, tên lớp học phần..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Course List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={styles.loadingText}>Đang tải danh sách lớp học phần...</Text>
          </View>
        ) : filteredCourses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="book" size={38} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Không có lớp học nào</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác.' : 'Bạn chưa được phân công môn học nào.'}
            </Text>
          </View>
        ) : (
          filteredCourses.map((c) => (
            <View key={c.id} style={styles.courseCard}>
              <View style={styles.cardHeader}>
                <View style={styles.courseCodeBadge}>
                  <Text style={styles.courseCodeText}>{c.courseCode}</Text>
                </View>
                {c.accessPassword ? (
                  <View style={styles.lockBadge}>
                    <Feather name="lock" size={11} color="#6366F1" />
                    <Text style={styles.lockText}>Có mật khẩu</Text>
                  </View>
                ) : (
                  <View style={styles.openBadge}>
                    <Text style={styles.openText}>Mở tự do</Text>
                  </View>
                )}
              </View>

              <Text style={styles.courseTitle}>{c.title}</Text>
              <Text style={styles.departmentText}>{c.department}</Text>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Feather name="users" size={13} color="#2563EB" />
                  <Text style={styles.statItemText}>{c.enrolledStudents} sinh viên</Text>
                </View>
                <View style={styles.statItem}>
                  <Feather name="file-text" size={13} color="#059669" />
                  <Text style={styles.statItemText}>{c.lessonsCount} bài giảng/quiz</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.actionBtnOutline}
                  onPress={() => handleOpenStudentList(c)}
                  activeOpacity={0.7}
                >
                  <Feather name="users" size={13} color="#2563EB" />
                  <Text style={styles.actionBtnOutlineText}>Danh sách SV</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnOutline}
                  onPress={() => handleOpenPasswordModal(c)}
                  activeOpacity={0.7}
                >
                  <Feather name="key" size={13} color="#6366F1" />
                  <Text style={[styles.actionBtnOutlineText, { color: '#6366F1' }]}>Mật khẩu</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnPrimary}
                  onPress={() => onNavigateToGrading && onNavigateToGrading(c.id)}
                  activeOpacity={0.8}
                >
                  <Feather name="award" size={13} color="#FFFFFF" />
                  <Text style={styles.actionBtnPrimaryText}>Bảng điểm</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Set Password Modal */}
      <Modal
        visible={Boolean(passwordModalCourse)}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModalCourse(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Feather name="key" size={18} color="#2563EB" />
              </View>
              <Text style={styles.modalTitle}>Cài đặt mật khẩu môn học</Text>
              <TouchableOpacity
                onPress={() => setPasswordModalCourse(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalCourseName} numberOfLines={2}>
              {passwordModalCourse?.courseCode} - {passwordModalCourse?.title}
            </Text>
            <Text style={styles.modalSubtext}>
              Sinh viên sẽ phải nhập mã này để được ghi danh vào môn học. Để trống nếu muốn cho phép sinh viên ghi danh tự do.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nhập mật khẩu ghi danh (hoặc để trống)..."
              placeholderTextColor="#94A3B8"
              value={newPasswordInput}
              onChangeText={setNewPasswordInput}
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setPasswordModalCourse(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, savingPassword && { opacity: 0.6 }]}
                disabled={savingPassword}
                onPress={handleSavePassword}
                activeOpacity={0.8}
              >
                {savingPassword ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Lưu thiết lập</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Student List Modal */}
      <Modal
        visible={Boolean(studentListCourse)}
        transparent
        animationType="slide"
        onRequestClose={() => setStudentListCourse(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Feather name="users" size={18} color="#2563EB" />
              </View>
              <Text style={styles.modalTitle}>Danh sách sinh viên</Text>
              <TouchableOpacity
                onPress={() => setStudentListCourse(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalCourseName} numberOfLines={1}>
              {studentListCourse?.courseCode} - {studentListCourse?.title}
            </Text>

            {loadingStudents ? (
              <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>
                  Đang tải danh sách sinh viên...
                </Text>
              </View>
            ) : studentList.length === 0 ? (
              <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                <Feather name="user-x" size={32} color="#CBD5E1" />
                <Text style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>
                  Chưa có sinh viên nào ghi danh lớp này.
                </Text>
              </View>
            ) : (
              <ScrollView style={{ marginTop: 10, maxHeight: 380 }}>
                {studentList.map((st) => (
                  <View key={st.id} style={styles.studentItem}>
                    <View style={styles.studentAvatar}>
                      <Text style={styles.studentAvatarText}>
                        {st.fullName.split(' ').pop()?.[0]?.toUpperCase() || 'S'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stName}>{st.fullName}</Text>
                      <Text style={styles.stSub}>
                        MSSV: {st.studentCode} • Lớp: {st.className || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.stStatusBadge}>
                      <Text style={styles.stStatusText}>
                        {st.status === 'ACTIVE' ? 'Đang học' : 'Tạm khóa'}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.modalSubmitBtn, { marginTop: 14 }]}
              onPress={() => setStudentListCourse(null)}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalSubmitText, { textAlign: 'center' }]}>Đóng</Text>
            </TouchableOpacity>
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
    padding: 16,
    paddingBottom: 24
  },

  // Banner
  banner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14
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

  // Search Box
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 14
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0
  },

  // Loading & Empty
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
    color: '#0F172A'
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center'
  },

  // Card
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
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
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2
  },
  departmentText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  statItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC'
  },
  actionBtnOutlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB'
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2563EB'
  },
  actionBtnPrimaryText: {
    fontSize: 11,
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
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 10
  },
  modalCourseName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 6
  },
  modalSubtext: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 12
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
    marginBottom: 14
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
  },

  // Student Item
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  studentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  studentAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB'
  },
  stName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A'
  },
  stSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1
  },
  stStatusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8
  },
  stStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669'
  }
});
