import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export type TabType = 'home' | 'courses' | 'grades' | 'notifications' | 'profile';

interface BottomNavBarProps {
  activeTab: TabType;
  onNavigate: (tab: TabType) => void;
  unreadCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onNavigate,
  unreadCount = 0
}) => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'TEACHER';

  return (
    <View style={styles.bottomTabBar}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onNavigate('home')}
        activeOpacity={0.7}
      >
        <Feather
          name="grid"
          size={18}
          color={activeTab === 'home' ? '#2563EB' : '#94A3B8'}
        />
        <Text
          style={[
            styles.tabItemLabel,
            activeTab === 'home' && styles.tabItemLabelActive
          ]}
        >
          Dashboard
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onNavigate('courses')}
        activeOpacity={0.7}
      >
        <Feather
          name="book-open"
          size={18}
          color={activeTab === 'courses' ? '#2563EB' : '#94A3B8'}
        />
        <Text
          style={[
            styles.tabItemLabel,
            activeTab === 'courses' && styles.tabItemLabelActive
          ]}
        >
          {isTeacher ? 'Lớp học' : 'Khóa học'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onNavigate('grades')}
        activeOpacity={0.7}
      >
        <Feather
          name="award"
          size={18}
          color={activeTab === 'grades' ? '#2563EB' : '#94A3B8'}
        />
        <Text
          style={[
            styles.tabItemLabel,
            activeTab === 'grades' && styles.tabItemLabelActive
          ]}
        >
          {isTeacher ? 'Chấm điểm' : 'Bảng điểm'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onNavigate('notifications')}
        activeOpacity={0.7}
      >
        <View style={styles.tabBadgeWrap}>
          <Feather
            name="bell"
            size={18}
            color={activeTab === 'notifications' ? '#2563EB' : '#94A3B8'}
          />
          {unreadCount > 0 && <View style={styles.tabDot} />}
        </View>
        <Text
          style={[
            styles.tabItemLabel,
            activeTab === 'notifications' && styles.tabItemLabelActive
          ]}
        >
          Thông báo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onNavigate('profile')}
        activeOpacity={0.7}
      >
        <Feather
          name="user"
          size={18}
          color={activeTab === 'profile' ? '#2563EB' : '#94A3B8'}
        />
        <Text
          style={[
            styles.tabItemLabel,
            activeTab === 'profile' && styles.tabItemLabelActive
          ]}
        >
          Cá nhân
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomTabBar: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 3
  },
  tabItemLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8'
  },
  tabItemLabelActive: {
    color: '#2563EB',
    fontWeight: '700'
  },
  tabBadgeWrap: {
    position: 'relative'
  },
  tabDot: {
    position: 'absolute',
    top: -1,
    right: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFFFFF'
  }
});
