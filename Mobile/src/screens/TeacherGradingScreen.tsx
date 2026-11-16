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
import { TeacherCourse, StudentGradeRow } from '../types';

interface TeacherGradingScreenProps {
  initialCourseId?: string;
}

export const TeacherGradingScreen: React.FC<TeacherGradingScreenProps> = ({ initialCourseId }) => {
  const { user } = useAuth();

  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId || '');
  const [grades, setGrades] = useState<StudentGradeRow[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Grade Modal State
  const [editingStudent, setEditingStudent] = useState<StudentGradeRow | null>(null);
  const [attendanceInput, setAttendanceInput] = useState('');
  const [assignmentInput, setAssignmentInput] = useState('');
  const [examInput, setExamInput] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);

  // 1. Fetch Teacher Courses
  const fetchCourses = useCallback(async () => {
    try {
      setLoadingCourses(true);
      const teacherId = user?.userId || '';
      const res = await api.get<any>(`/teacher/courses?teacherId=${teacherId}`);
      const list: TeacherCourse[] = Array.isArray(res) ? res : res?.items || [];
      setCourses(list);
      if (list.length > 0 && !selectedCourseId) {
        setSelectedCourseId(list[0].id);
      }
    } catch (err: any) {
      console.log('Lỗi tải danh sách lớp:', err.message);
    } finally {
      setLoadingCourses(false);
    }
  }, [user?.userId, selectedCourseId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // 2. Fetch Gradebook for selected course
  const fetchGradebook = useCallback(async (courseId: string) => {
    if (!courseId) return;
    try {
      setLoadingGrades(true);
      const res = await api.get<any>(`/teacher/courses/${courseId}/gradebook`);
      const list = Array.isArray(res) ? res : res?.items || [];
      setGrades(list);
    } catch (err: any) {
      console.log('Lỗi tải bảng điểm lớp:', err.message);
      setGrades([]);
    } finally {
      setLoadingGrades(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchGradebook(selectedCourseId);
    }
  }, [selectedCourseId, fetchGradebook]);

  const onRefresh = () => {
    setRefreshing(true);
    if (selectedCourseId) {
      fetchGradebook(selectedCourseId);
    } else {
      fetchCourses();
    }
  };

  const handleOpenEditGrade = (row: StudentGradeRow) => {
    setEditingStudent(row);
    setAttendanceInput(row.attendanceScore !== undefined ? row.attendanceScore.toString() : '10');
    setAssignmentInput(row.assignmentScore !== undefined ? row.assignmentScore.toString() : '8');
    setExamInput(row.examScore !== undefined ? row.examScore.toString() : '8');
  };

  const handleSaveGrade = async () => {
    if (!editingStudent || !selectedCourseId) return;
    const att = parseFloat(attendanceInput.trim());
    const asg = parseFloat(assignmentInput.trim());
    const exm = parseFloat(examInput.trim());

    if (isNaN(att) || att < 0 || att > 10 || isNaN(asg) || asg < 0 || asg > 10 || isNaN(exm) || exm < 0 || exm > 10) {
      Alert.alert('Điểm số không hợp lệ', 'Tất cả các đầu điểm phải là số từ 0 đến 10.');
      return;
    }

    try {
      setSavingGrade(true);
      await api.post(`/teacher/courses/${selectedCourseId}/gradebook/${editingStudent.studentId}`, {
        attendanceScore: att,
        assignmentScore: asg,
        examScore: exm
      });

      Alert.alert('Thành công', `Đã cập nhật bảng điểm cho sinh viên ${editingStudent.fullName}!`);
      setEditingStudent(null);
      fetchGradebook(selectedCourseId);
    } catch (err: any) {
      Alert.alert('Lỗi cập nhật', err.message || 'Không thể lưu bảng điểm.');
    } finally {
      setSavingGrade(false);
    }
  };

  const getLetterGradeBadge = (grade: string) => {
    const isHigh = ['A', 'A+', 'B+', 'B'].includes(grade);
    const isMedium = ['C+', 'C', 'D+', 'D'].includes(grade);
    if (isHigh) {
      return { bg: '#ECFDF5', border: '#A7F3D0', text: '#059669' };
    }
    if (isMedium) {
      return { bg: '#EFF6FF', border: '#BFDBFE', text: '#2563EB' };
    }
    return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' };
  };

  // Preview score calculation
  const previewAtt = parseFloat(attendanceInput) || 0;
  const previewAsg = parseFloat(assignmentInput) || 0;
  const previewExm = parseFloat(examInput) || 0;
  const previewTotal = Math.round((previewAtt * 0.1 + previewAsg * 0.3 + previewExm * 0.6) * 10) / 10;

  const filteredGrades = grades.filter((g) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (g.fullName || '').toLowerCase().includes(q) ||
      (g.studentCode || '').toLowerCase().includes(q) ||
      (g.className || '').toLowerCase().includes(q)
    );
  });

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

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
            <Feather name="award" size={12} color="#1E40AF" />
            <Text style={styles.bannerPillText}>SỔ ĐIỂM & ĐÁNH GIÁ</Text>
          </View>
          <Text style={styles.bannerTitle}>Bảng điểm học phần</Text>
          <Text style={styles.bannerSubtitle}>
            Nhập điểm thành phần Chuyên cần (10%), Bài tập (30%) và Thi cuối kỳ (60%).
          </Text>
        </View>

        {/* Course Horizontal Selector Tabs */}
        {loadingCourses ? (
          <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 10 }} />
        ) : courses.length === 0 ? (
          <Text style={styles.noCoursesText}>Bạn chưa có lớp học nào để chấm điểm.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.coursePillsContainer}
          >
            {courses.map((c) => {
              const isSelected = c.id === selectedCourseId;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.coursePill, isSelected && styles.coursePillActive]}
                  onPress={() => setSelectedCourseId(c.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.coursePillCode, isSelected && styles.coursePillCodeActive]}>
                    {c.courseCode}
                  </Text>
                  <Text
                    style={[styles.coursePillTitle, isSelected && styles.coursePillTitleActive]}
                    numberOfLines={1}
                  >
                    {c.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Course Details Summary Header */}
        {selectedCourse && (
          <View style={styles.courseSummaryBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedCourseCode}>{selectedCourse.courseCode}</Text>
              <Text style={styles.selectedCourseTitle} numberOfLines={1}>
                {selectedCourse.title}
              </Text>
            </View>
            <View style={styles.studentsCountBadge}>
              <Text style={styles.studentsCountText}>{grades.length} sinh viên</Text>
            </View>
          </View>
        )}

        {/* Search Box */}
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo MSSV, tên sinh viên, lớp..."
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

        {/* Grades List */}
        {loadingGrades ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={styles.loadingText}>Đang tải bảng điểm môn học...</Text>
          </View>
        ) : filteredGrades.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="award" size={38} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Chưa có sinh viên</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Không tìm thấy kết quả phù hợp.' : 'Lớp học này chưa có sinh viên ghi danh.'}
            </Text>
          </View>
        ) : (
          filteredGrades.map((row) => {
            const letterBadge = getLetterGradeBadge(row.letterGrade);
            return (
              <View key={row.studentId} style={styles.studentGradeCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.studentInfoCol}>
                    <View style={styles.codeRow}>
                      <View style={styles.stCodeBadge}>
                        <Text style={styles.stCodeText}>{row.studentCode}</Text>
                      </View>
                      <Text style={styles.classNameText}>{row.className || 'K68-CNTT'}</Text>
                    </View>
                    <Text style={styles.studentName}>{row.fullName}</Text>
                  </View>

                  {row.letterGrade && (
                    <View
                      style={[
                        styles.letterBadge,
                        { backgroundColor: letterBadge.bg, borderColor: letterBadge.border }
                      ]}
                    >
                      <Text style={[styles.letterBadgeText, { color: letterBadge.text }]}>
                        {row.letterGrade}
                      </Text>
                    </View>
                  )}
                </View>

                {/* 4 Score Component Cells */}
                <View style={styles.scoreRow}>
                  <View style={styles.scoreCol}>
                    <Text style={styles.scoreLabel}>Chuyên cần</Text>
                    <Text style={styles.scoreVal}>{row.attendanceScore ?? '-'}</Text>
                  </View>
                  <View style={styles.scoreCol}>
                    <Text style={styles.scoreLabel}>Bài tập</Text>
                    <Text style={styles.scoreVal}>{row.assignmentScore ?? '-'}</Text>
                  </View>
                  <View style={styles.scoreCol}>
                    <Text style={styles.scoreLabel}>Cuối kỳ</Text>
                    <Text style={styles.scoreVal}>{row.examScore ?? '-'}</Text>
                  </View>
                  <View style={[styles.scoreCol, styles.scoreColTotal]}>
                    <Text style={styles.scoreLabelTotal}>TỔNG KẾT</Text>
                    <Text style={styles.scoreValTotal}>{row.totalScore ?? '-'}</Text>
                  </View>
                </View>

                {/* Edit Grade Button */}
                <TouchableOpacity
                  style={styles.editGradeBtn}
                  onPress={() => handleOpenEditGrade(row)}
                  activeOpacity={0.8}
                >
                  <Feather name="edit-3" size={13} color="#2563EB" />
                  <Text style={styles.editGradeBtnText}>Nhập / Sửa điểm</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Edit Grade Modal */}
      <Modal
        visible={Boolean(editingStudent)}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingStudent(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Feather name="award" size={18} color="#2563EB" />
              </View>
              <Text style={styles.modalTitle}>Nhập điểm học phần</Text>
              <TouchableOpacity
                onPress={() => setEditingStudent(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalStudentBanner}>
              <Text style={styles.modalStudentName}>
                {editingStudent?.fullName} ({editingStudent?.studentCode})
              </Text>
              <Text style={styles.modalSubtext}>Môn: {selectedCourse?.title}</Text>
            </View>

            {/* Inputs: 3 Components */}
            <View style={styles.inputRow}>
              <View style={styles.inputCol}>
                <Text style={styles.inputLabel}>Chuyên cần (10%)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="decimal-pad"
                  value={attendanceInput}
                  onChangeText={setAttendanceInput}
                  placeholder="10"
                />
              </View>

              <View style={styles.inputCol}>
                <Text style={styles.inputLabel}>Bài tập (30%)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="decimal-pad"
                  value={assignmentInput}
                  onChangeText={setAssignmentInput}
                  placeholder="8.5"
                />
              </View>

              <View style={styles.inputCol}>
                <Text style={styles.inputLabel}>Cuối kỳ (60%)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="decimal-pad"
                  value={examInput}
                  onChangeText={setExamInput}
                  placeholder="8.0"
                />
              </View>
            </View>

            {/* Preview Total */}
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>Điểm tổng kết dự kiến:</Text>
              <Text style={styles.previewVal}>{previewTotal} / 10</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditingStudent(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, savingGrade && { opacity: 0.6 }]}
                disabled={savingGrade}
                onPress={handleSaveGrade}
                activeOpacity={0.8}
              >
                {savingGrade ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Lưu điểm vào sổ</Text>
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

  // Course Pills
  coursePillsContainer: {
    gap: 8,
    paddingBottom: 12
  },
  coursePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 110
  },
  coursePillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB'
  },
  coursePillCode: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB'
  },
  coursePillCodeActive: {
    color: '#FFFFFF'
  },
  coursePillTitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  coursePillTitleActive: {
    color: '#DBEAFE'
  },
  noCoursesText: {
    fontSize: 12,
    color: '#64748B',
    marginVertical: 10
  },

  // Course Summary Box
  courseSummaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12
  },
  selectedCourseCode: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB'
  },
  selectedCourseTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1
  },
  studentsCountBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  studentsCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8'
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

  // Student Card
  studentGradeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
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
    marginBottom: 10
  },
  studentInfoCol: {
    flex: 1
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2
  },
  stCodeBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2
  },
  stCodeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8'
  },
  classNameText: {
    fontSize: 11,
    color: '#64748B'
  },
  studentName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A'
  },
  letterBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1
  },
  letterBadgeText: {
    fontSize: 12,
    fontWeight: '800'
  },
  scoreRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    marginBottom: 10
  },
  scoreCol: {
    flex: 1,
    alignItems: 'center'
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B'
  },
  scoreVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2
  },
  scoreColTotal: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingVertical: 2
  },
  scoreLabelTotal: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1D4ED8'
  },
  scoreValTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D4ED8',
    marginTop: 1
  },
  editGradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  editGradeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB'
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
    marginBottom: 10
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
    marginBottom: 12
  },
  modalStudentName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF'
  },
  modalSubtext: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  inputCol: {
    flex: 1
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    textAlign: 'center'
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    textAlign: 'center'
  },
  previewBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: 10,
    marginBottom: 16
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF'
  },
  previewVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D4ED8'
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
