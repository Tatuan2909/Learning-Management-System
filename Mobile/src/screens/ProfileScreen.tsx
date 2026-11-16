import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { currentApiBaseUrl } from '../api/config';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.userId) return;
      try {
        setLoadingProfile(true);
        const res = await api.get(`/auth/me?userId=${user.userId}`);
        setProfile(res);
      } catch (err: any) {
        console.log('Lỗi tải thông tin cá nhân:', err.message);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user?.userId]);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ các thông tin mật khẩu.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    setSubmittingPassword(true);
    setMessage(null);

    try {
      await api.post('/auth/change-password', {
        userId: user?.userId,
        currentPassword,
        newPassword
      });
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công! Hãy lưu lại mật khẩu mới.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Thành công', 'Đổi mật khẩu tài khoản thành công!');
    } catch (err: any) {
      const errorMsg =
        err.message || 'Mật khẩu hiện tại không chính xác hoặc không thể cập nhật. Vui lòng thử lại.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: logout }
      ]
    );
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'QUẢN TRỊ VIÊN', bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' };
      case 'TEACHER':
        return { label: 'GIẢNG VIÊN', bg: '#EFF6FF', border: '#BFDBFE', text: '#2563EB' };
      case 'STUDENT':
      default:
        return { label: 'SINH VIÊN', bg: '#ECFDF5', border: '#A7F3D0', text: '#059669' };
    }
  };

  const roleBadge = getRoleBadge(user?.role);
  const fullName = profile?.fullName || user?.fullName || 'Học viên';
  const email = profile?.email || user?.email || 'N/A';
  const studentCode = profile?.studentCode || user?.studentCode;
  const teacherCode = profile?.teacherCode || user?.teacherCode;
  const department = profile?.department || user?.department || 'Khoa Công nghệ Thông tin';
  const className = profile?.className || user?.className || 'K68-CNTT1';
  const major = profile?.major || user?.major || 'Kỹ thuật Phần mềm';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner matching Web ProfilePage */}
        <View style={styles.banner}>
          <View style={styles.bannerPill}>
            <Feather name="user" size={12} color="#1E40AF" />
            <Text style={styles.bannerPillText}>HỒ SƠ TÀI KHOẢN</Text>
          </View>
          <Text style={styles.bannerTitle}>Thông tin cá nhân & Bảo mật</Text>
          <Text style={styles.bannerSubtitle}>
            Quản lý lý lịch đào tạo, đơn vị học tập và thay đổi mật khẩu đăng nhập.
          </Text>
        </View>

        {/* User Profile Card */}
        <View style={styles.card}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {fullName.split(' ').pop()?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={styles.fullNameText}>{fullName}</Text>
            <Text style={styles.emailText}>{email}</Text>

            <View
              style={[
                styles.roleBadge,
                { backgroundColor: roleBadge.bg, borderColor: roleBadge.border }
              ]}
            >
              <Text style={[styles.roleBadgeText, { color: roleBadge.text }]}>
                {roleBadge.label}
              </Text>
            </View>
          </View>

          {/* Academic Info Table */}
          <View style={styles.infoTable}>
            {studentCode && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mã sinh viên (MSSV):</Text>
                <Text style={styles.infoValueBold}>{studentCode}</Text>
              </View>
            )}

            {teacherCode && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mã giảng viên (MSGV):</Text>
                <Text style={styles.infoValueBold}>{teacherCode}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Khoa / Viện:</Text>
              <Text style={styles.infoValue}>{department}</Text>
            </View>

            {user?.role === 'STUDENT' && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Chuyên ngành:</Text>
                  <Text style={styles.infoValue}>{major}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Lớp sinh hoạt:</Text>
                  <Text style={styles.infoValue}>{className}</Text>
                </View>
              </>
            )}

            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Trạng thái đào tạo:</Text>
              <View style={styles.activeStatusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.activeStatusText}>Đang học tập</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Change Password Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Feather name="lock" size={18} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Đổi mật khẩu</Text>
              <Text style={styles.cardSubtitle}>Cập nhật mật khẩu bảo vệ tài khoản</Text>
            </View>
          </View>

          {message && (
            <View
              style={[
                styles.messageAlert,
                message.type === 'error' ? styles.messageError : styles.messageSuccess
              ]}
            >
              <Feather
                name={message.type === 'error' ? 'alert-circle' : 'check-circle'}
                size={16}
                color={message.type === 'error' ? '#DC2626' : '#059669'}
              />
              <Text
                style={[
                  styles.messageText,
                  message.type === 'error' ? styles.messageTextError : styles.messageTextSuccess
                ]}
              >
                {message.text}
              </Text>
            </View>
          )}

          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>MẬT KHẨU HIỆN TẠI</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu hiện tại"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>
                <Feather name={showCurrent ? 'eye-off' : 'eye'} size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>MẬT KHẨU MỚI (TỐI THIỂU 6 KÝ TỰ)</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                <Feather name={showNew ? 'eye-off' : 'eye'} size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>XÁC NHẬN MẬT KHẨU MỚI</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showNew}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.savePasswordBtn, submittingPassword && { opacity: 0.6 }]}
            onPress={handleChangePassword}
            disabled={submittingPassword}
            activeOpacity={0.8}
          >
            {submittingPassword ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="check" size={16} color="#FFFFFF" />
                <Text style={styles.savePasswordText}>Cập nhật mật khẩu</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Server & System Connection Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardHeaderIcon, { backgroundColor: '#F1F5F9' }]}>
              <Feather name="server" size={18} color="#475569" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Kết nối máy chủ Backend</Text>
              <Text style={styles.cardSubtitle}>Địa chỉ API đang kết nối</Text>
            </View>
          </View>
          <View style={styles.serverInfoBox}>
            <View style={styles.serverDot} />
            <Text style={styles.serverUrlText} numberOfLines={1}>
              {currentApiBaseUrl}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Feather name="log-out" size={18} color="#DC2626" />
          <Text style={styles.logoutBtnText}>Đăng xuất khỏi hệ thống</Text>
        </TouchableOpacity>
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
    paddingBottom: 32
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

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  avatarSection: {
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  fullNameText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A'
  },
  emailText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  roleBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    marginTop: 8
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },

  // Table
  infoTable: {
    marginTop: 12
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC'
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B'
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    maxWidth: 200,
    textAlign: 'right'
  },
  infoValueBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB'
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981'
  },
  activeStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669'
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14
  },
  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748B'
  },

  // Messages
  messageAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1
  },
  messageError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA'
  },
  messageSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  messageText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600'
  },
  messageTextError: {
    color: '#B91C1C'
  },
  messageTextSuccess: {
    color: '#047857'
  },

  // Input
  inputGroup: {
    marginBottom: 12
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0
  },
  eyeBtn: {
    padding: 6
  },
  savePasswordBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6
  },
  savePasswordText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },

  // Server Box
  serverInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12
  },
  serverDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981'
  },
  serverUrlText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    fontWeight: '600'
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626'
  }
});
