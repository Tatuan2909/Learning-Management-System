import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface AppHeaderProps {
  activeTab?: string;
  onNavigate: (tab: 'home' | 'courses' | 'grades' | 'notifications' | 'profile') => void;
  unreadCount?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onNavigate,
  unreadCount = 0
}) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: logout }
      ]
    );
  };

  return (
    <View style={styles.topNavbar}>
      {/* Left: Brand Identity matching Web App.tsx */}
      <TouchableOpacity
        style={styles.brandRow}
        onPress={() => onNavigate('home')}
        activeOpacity={0.8}
      >
        <View style={styles.logoBadge}>
          <Ionicons name="school" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.brandTitleCol}>
          <Text style={styles.brandTitle}>Hệ thống LMS</Text>
          <Text style={styles.brandSubtitle}>Client - Server</Text>
        </View>
      </TouchableOpacity>

      {/* Right: Notifications & User Avatar & Logout */}
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => onNavigate('notifications')}
          activeOpacity={0.7}
        >
          <Feather name="bell" size={18} color="#475569" />
          {unreadCount > 0 && <View style={styles.notificationDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.userAvatar}
          onPress={() => onNavigate('profile')}
          activeOpacity={0.7}
        >
          <Text style={styles.userAvatarText}>
            {user?.fullName?.split(' ').pop()?.[0]?.toUpperCase() || 'U'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={handleLogout}
          accessibilityLabel="Đăng xuất"
          activeOpacity={0.7}
        >
          <Feather name="log-out" size={17} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topNavbar: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3
  },
  brandTitleCol: {
    justifyContent: 'center'
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3
  },
  brandSubtitle: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#2563EB',
    fontWeight: '700',
    marginTop: 1
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headerIconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center'
  },
  userAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1D4ED8'
  }
});
