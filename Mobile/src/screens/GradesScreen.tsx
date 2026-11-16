import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { TranscriptData, CourseTranscriptItem } from '../types';

export const GradesScreen: React.FC = () => {
  const { user } = useAuth();

  const [data, setData] = useState<TranscriptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PASSED' | 'IN_PROGRESS' | 'FAILED'>('ALL');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  const fetchGrades = useCallback(async () => {
    try {
      setLoading(true);
      const studentId = user?.userId || '';
      const res = await api.get<TranscriptData>(`/student/transcript?studentId=${studentId}`);
      setData(res);
      if (res?.courses && res.courses.length > 0 && !expandedCourseId) {
        setExpandedCourseId(res.courses[0].courseId);
      }
    } catch (err: any) {
      console.log('Lỗi tải bảng điểm:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGrades();
  };

  const toggleExpand = (courseId: string) => {
    setExpandedCourseId((prev) => (prev === courseId ? null : courseId));
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

  const courses = data?.courses || [];
  const summary = data?.summary;
  const student = data?.student;

  const filteredCourses = courses.filter((c) => {
    const query = searchQuery.trim().toLowerCase();
    const matchSearch =
      !query ||
      c.courseCode.toLowerCase().includes(query) ||
      c.courseTitle.toLowerCase().includes(query) ||
      c.teacherName.toLowerCase().includes(query);

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
        {/* Banner matching Web StudentGradesPage */}
        <View style={styles.banner}>
          <View style={styles.bannerPill}>
            <Feather name="award" size={12} color="#1E40AF" />
            <Text style={styles.bannerPillText}>BẢNG ĐIỂM & KẾT QUẢ HỌC TẬP</Text>
          </View>
          <Text style={styles.bannerTitle}>Kết quả học tập cá nhân</Text>
          <Text style={styles.bannerSubtitle}>
            Học viên: {student?.fullName || user?.fullName} • MSSV: {student?.studentCode || user?.studentCode || 'N/A'}
          </Text>
        </View>

        {/* GPA Summary 4-Grid Cards */}
        {summary && (
          <View style={styles.statGrid}>
            {/* Card 1: GPA 10 */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>ĐIỂM TB (HỆ 10)</Text>
              <Text style={[styles.statValue, { color: '#2563EB' }]}>
                {summary.averageGpa10.toFixed(2)}
              </Text>
              <Text style={styles.statSubtext}>Thang điểm 10</Text>
            </View>

            {/* Card 2: GPA 4 */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>ĐIỂM TB (HỆ 4)</Text>
              <Text style={[styles.statValue, { color: '#059669' }]}>
                {summary.averageGpa4.toFixed(2)}
              </Text>
              <Text style={styles.statSubtext}>Thang điểm 4.0</Text>
            </View>

            {/* Card 3: Tín chỉ */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>TÍN CHỈ TÍCH LŨY</Text>
              <Text style={[styles.statValue, { color: '#D97706' }]}>
                {summary.earnedCredits} / {summary.totalCredits}
              </Text>
              <Text style={styles.statSubtext}>Số tín chỉ đã đạt</Text>
            </View>

            {/* Card 4: Xếp loại */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>XẾP LOẠI</Text>
              <Text style={[styles.statValue, { color: '#7C3AED', fontSize: 16, marginTop: 4 }]}>
                {summary.overallGrade || 'Khá'}
              </Text>
              <Text style={styles.statSubtext}>Đánh giá học vụ</Text>
            </View>
          </View>
        )}

        {/* Filter Status Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filterStatus === 'ALL' && styles.filterTabActive]}
            onPress={() => setFilterStatus('ALL')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, filterStatus === 'ALL' && styles.filterTabTextActive]}>
              Tất cả ({courses.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filterStatus === 'PASSED' && styles.filterTabActive]}
            onPress={() => setFilterStatus('PASSED')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.filterTabText, filterStatus === 'PASSED' && styles.filterTabTextActive]}
            >
              Đã đạt ({summary?.passedCourses ?? 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filterStatus === 'IN_PROGRESS' && styles.filterTabActive]}
            onPress={() => setFilterStatus('IN_PROGRESS')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterTabText,
                filterStatus === 'IN_PROGRESS' && styles.filterTabTextActive
              ]}
            >
              Đang học ({summary?.inProgressCourses ?? 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo môn học, giảng viên..."
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

        {/* Grades Course Cards */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={styles.loadingText}>Đang tải bảng điểm chi tiết...</Text>
          </View>
        ) : filteredCourses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="award" size={38} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Chưa có thông tin điểm số</Text>
            <Text style={styles.emptySubtitle}>Không có môn học phù hợp với bộ lọc hiện tại.</Text>
          </View>
        ) : (
          filteredCourses.map((c) => {
            const isExpanded = expandedCourseId === c.courseId;
            const letterBadge = getLetterGradeBadge(c.letterGrade);

            return (
              <View key={c.courseId} style={styles.gradeCard}>
                {/* Clickable Header Row */}
                <TouchableOpacity
                  style={styles.gradeCardHeader}
                  onPress={() => toggleExpand(c.courseId)}
                  activeOpacity={0.7}
                >
                  <View style={styles.gradeCardHeaderLeft}>
                    <View style={styles.courseCodeBadge}>
                      <Text style={styles.courseCodeText}>{c.courseCode}</Text>
                    </View>
                    <View style={styles.creditsBadge}>
                      <Text style={styles.creditsText}>{c.credits} TC</Text>
                    </View>
                  </View>

                  <View style={styles.gradeCardHeaderRight}>
                    {c.letterGrade && (
                      <View
                        style={[
                          styles.letterBadge,
                          { backgroundColor: letterBadge.bg, borderColor: letterBadge.border }
                        ]}
                      >
                        <Text style={[styles.letterBadgeText, { color: letterBadge.text }]}>
                          Điểm: {c.letterGrade}
                        </Text>
                      </View>
                    )}
                    <Feather
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#64748B"
                    />
                  </View>
                </TouchableOpacity>

                {/* Course Title */}
                <Text style={styles.gradeCourseTitle}>{c.courseTitle}</Text>
                <Text style={styles.gradeTeacherText}>GV: {c.teacherName}</Text>

                {/* Score Breakdown Bar (4 Components) */}
                <View style={styles.scoreRow}>
                  <View style={styles.scoreCol}>
                    <Text style={styles.scoreColLabel}>Chuyên cần (10%)</Text>
                    <Text style={styles.scoreColVal}>{c.attendanceScore ?? '-'}</Text>
                  </View>
                  <View style={styles.scoreCol}>
                    <Text style={styles.scoreColLabel}>Bài tập (30%)</Text>
                    <Text style={styles.scoreColVal}>{c.assignmentScore ?? '-'}</Text>
                  </View>
                  <View style={styles.scoreCol}>
                    <Text style={styles.scoreColLabel}>Cuối kỳ (60%)</Text>
                    <Text style={styles.scoreColVal}>{c.examScore ?? '-'}</Text>
                  </View>
                  <View style={[styles.scoreCol, styles.scoreColTotal]}>
                    <Text style={styles.scoreColLabelTotal}>TỔNG KẾT</Text>
                    <Text style={styles.scoreColValTotal}>{c.totalScore ?? '-'}</Text>
                  </View>
                </View>

                {/* Expanded Details: Assignments list */}
                {isExpanded && (
                  <View style={styles.expandedSection}>
                    <Text style={styles.expandedTitle}>Chi tiết các bài tập & bài kiểm tra:</Text>
                    {(!c.assignments || c.assignments.length === 0) ? (
                      <Text style={styles.expandedEmpty}>Chưa có bài tập nào được chấm điểm.</Text>
                    ) : (
                      c.assignments.map((a) => (
                        <View key={a.id} style={styles.assignmentItem}>
                          <View style={styles.assignmentItemTop}>
                            <Text style={styles.assignmentTitle} numberOfLines={1}>
                              {a.title}
                            </Text>
                            <Text style={styles.assignmentScore}>
                              {a.grade !== null ? `${a.grade}/${a.maxScore}` : 'Chưa chấm'}
                            </Text>
                          </View>
                          {a.feedback && (
                            <Text style={styles.assignmentFeedback}>Nhận xét: {a.feedback}</Text>
                          )}
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
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
    marginTop: 4
  },

  // Stat Grid
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14
  },
  statCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2
  },
  statSubtext: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2
  },

  // Filter Tabs
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8
  },
  filterTabActive: {
    backgroundColor: '#2563EB'
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B'
  },
  filterTabTextActive: {
    color: '#FFFFFF'
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
    color: '#0F172A',
    marginTop: 6
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center'
  },

  // Grade Card
  gradeCard: {
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
  gradeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  gradeCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
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
  creditsBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2.5
  },
  creditsText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569'
  },
  gradeCardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  letterBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderWidth: 1
  },
  letterBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  gradeCourseTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2
  },
  gradeTeacherText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10
  },

  // Score Row
  scoreRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8
  },
  scoreCol: {
    flex: 1,
    alignItems: 'center'
  },
  scoreColLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center'
  },
  scoreColVal: {
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
  scoreColLabelTotal: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1D4ED8'
  },
  scoreColValTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D4ED8',
    marginTop: 1
  },

  // Expanded
  expandedSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  expandedTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6
  },
  expandedEmpty: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic'
  },
  assignmentItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  assignmentItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  assignmentTitle: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
    marginRight: 6
  },
  assignmentScore: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB'
  },
  assignmentFeedback: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3
  }
});
