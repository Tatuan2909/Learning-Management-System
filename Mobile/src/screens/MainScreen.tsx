import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { BottomNavBar, TabType } from '../components/BottomNavBar';
import { useAuth } from '../context/AuthContext';
import { DashboardScreen } from './DashboardScreen';
import { CoursesScreen } from './CoursesScreen';
import { GradesScreen } from './GradesScreen';
import { NotificationsScreen } from './NotificationsScreen';
import { ProfileScreen } from './ProfileScreen';
import { TeacherDashboardScreen } from './TeacherDashboardScreen';
import { TeacherCoursesScreen } from './TeacherCoursesScreen';
import { TeacherGradingScreen } from './TeacherGradingScreen';
import { CourseStudyScreen } from './CourseStudyScreen';
import { api } from '../api/client';

export const MainScreen: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [studyingCourseId, setStudyingCourseId] = useState<string | null>(null);
  const [initialActivityId, setInitialActivityId] = useState<string | undefined>(undefined);

  const isTeacher = user?.role === 'TEACHER';

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get<any>('/notifications/unread-count').catch(() => ({ unreadCount: 0 }));
      setUnreadCount(res?.unreadCount || 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    // Poll unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const renderCurrentScreen = () => {
    // 1. Teacher Views
    if (isTeacher) {
      switch (activeTab) {
        case 'courses':
          return <TeacherCoursesScreen onNavigateToGrading={() => setActiveTab('grades')} />;
        case 'grades':
          return <TeacherGradingScreen />;
        case 'notifications':
          return <NotificationsScreen onNotificationRead={fetchUnreadCount} />;
        case 'profile':
          return <ProfileScreen />;
        case 'home':
        default:
          return <TeacherDashboardScreen onNavigate={setActiveTab} />;
      }
    }

    // 2. Student Views (Default)
    switch (activeTab) {
      case 'courses':
        return (
          <CoursesScreen
            onNavigateCourse={(courseId) => {
              setStudyingCourseId(courseId);
            }}
          />
        );
      case 'grades':
        return <GradesScreen />;
      case 'notifications':
        return <NotificationsScreen onNotificationRead={fetchUnreadCount} />;
      case 'profile':
        return <ProfileScreen />;
      case 'home':
      default:
        return (
          <DashboardScreen
            onNavigate={setActiveTab}
            onNavigateCourse={(courseId) => {
              setStudyingCourseId(courseId);
            }}
          />
        );
    }
  };

  // If a student is currently studying a course, show full-screen CourseStudyScreen
  if (!isTeacher && studyingCourseId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CourseStudyScreen
          courseId={studyingCourseId}
          initialActivityId={initialActivityId}
          onBack={() => {
            setStudyingCourseId(null);
            setInitialActivityId(undefined);
            setActiveTab('courses');
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header - Unified branding matching Web App.tsx */}
      <AppHeader
        activeTab={activeTab}
        onNavigate={setActiveTab}
        unreadCount={unreadCount}
      />

      {/* Screen Body */}
      <View style={styles.content}>{renderCurrentScreen()}</View>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onNavigate={setActiveTab}
        unreadCount={unreadCount}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  }
});
