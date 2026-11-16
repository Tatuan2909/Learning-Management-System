import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
  SafeAreaView
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import {
  currentApiBaseUrl,
  setApiBaseUrl,
  PHYSICAL_DEVICE_API_URL,
  LOCALHOST_API_URL,
  EMULATOR_API_URL
} from '../api/config';

export const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();

  const [identifier, setIdentifier] = useState('SV2024001');
  const [password, setPassword] = useState('SV2024001');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeApiUrl, setActiveApiUrl] = useState(currentApiBaseUrl);

  // Server URL settings modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState(currentApiBaseUrl);

  const applyServerUrl = (url: string) => {
    setApiBaseUrl(url);
    setActiveApiUrl(url);
    setTempApiUrl(url);
    setErrorMessage('');
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setErrorMessage('');
    try {
      await login(identifier, password);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Email hoặc mật khẩu không chính xác hoặc máy chủ không phản hồi.'
      );
    }
  };

  const fillDemo = (userType: 'STUDENT' | 'TEACHER') => {
    setErrorMessage('');
    if (userType === 'STUDENT') {
      setIdentifier('SV2024001');
      setPassword('SV2024001');
    } else {
      setIdentifier('GV002');
      setPassword('GV002');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Brand Section - Aligned with Web LoginPage.tsx */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Ionicons name="school" size={38} color="#FFFFFF" />
            </View>
            <Text style={styles.appTitle}>Hệ thống LMS</Text>
            <Text style={styles.appSubtitle}>Cổng đăng nhập Giảng viên & Sinh viên</Text>
          </View>

          {/* Login Card - Exact Web LoginPage Card Design */}
          <View style={styles.card}>
            {/* Error Alert Box */}
            {!!errorMessage && (
              <View style={styles.errorAlert}>
                <Feather name="alert-circle" size={18} color="#DC2626" style={styles.errorIcon} />
                <Text style={styles.errorAlertText}>{errorMessage}</Text>
              </View>
            )}

            {/* Input: Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>TÊN ĐĂNG NHẬP</Text>
              <View style={styles.inputWrapper}>
                <Feather name="mail" size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập Mã SV hoặc Mã GV"
                  placeholderTextColor="#94A3B8"
                  value={identifier}
                  onChangeText={(text) => {
                    setIdentifier(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Input: Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>MẬT KHẨU</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Options Row: Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Feather name="check" size={12} color="#FFFFFF" />}
                </View>
                <Text style={styles.rememberMeText}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            {/* Primary Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Đang xác thực...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Đăng nhập vào hệ thống</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Demo Credentials Fill Pills */}
          <View style={styles.demoSection}>
            <Text style={styles.demoSectionTitle}>Chọn nhanh tài khoản thử nghiệm:</Text>
            <View style={styles.demoPillsRow}>
              <TouchableOpacity
                style={[styles.demoPill, identifier === 'SV2024001' && styles.demoPillActive]}
                onPress={() => fillDemo('STUDENT')}
                activeOpacity={0.7}
              >
                <Feather name="user" size={12} color={identifier === 'SV2024001' ? '#2563EB' : '#64748B'} />
                <Text style={[styles.demoPillText, identifier === 'SV2024001' && styles.demoPillTextActive]}>
                  Sinh viên (SV2024001)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoPill, identifier === 'GV002' && styles.demoPillActive]}
                onPress={() => fillDemo('TEACHER')}
                activeOpacity={0.7}
              >
                <Feather name="award" size={12} color={identifier === 'GV002' ? '#2563EB' : '#64748B'} />
                <Text style={[styles.demoPillText, identifier === 'GV002' && styles.demoPillTextActive]}>
                  Giảng viên (GV002)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Server Connection Pill */}
          <TouchableOpacity
            style={styles.serverPill}
            onPress={() => setShowConfigModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.serverPillDot} />
            <Text style={styles.serverPillLabel} numberOfLines={1}>
              Backend: {activeApiUrl}
            </Text>
            <Feather name="settings" size={13} color="#2563EB" />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Backend Server Configuration Modal */}
      <Modal
        visible={showConfigModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfigModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIconBadge}>
                <Feather name="server" size={18} color="#2563EB" />
              </View>
              <Text style={styles.modalTitle}>Cấu hình kết nối Backend</Text>
              <TouchableOpacity
                onPress={() => setShowConfigModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Chọn một trong các địa chỉ máy chủ phù hợp với thiết bị bạn đang chạy:
            </Text>

            {/* Option 1: Physical LAN Wi-Fi */}
            <TouchableOpacity
              style={[
                styles.modalOption,
                activeApiUrl === PHYSICAL_DEVICE_API_URL && styles.modalOptionActive
              ]}
              onPress={() => {
                applyServerUrl(PHYSICAL_DEVICE_API_URL);
                setShowConfigModal(false);
              }}
            >
              <View style={styles.modalOptionRadio}>
                {activeApiUrl === PHYSICAL_DEVICE_API_URL && <View style={styles.modalOptionRadioDot} />}
              </View>
              <View style={styles.modalOptionTextCol}>
                <Text style={styles.modalOptionTitle}>Điện thoại thật qua Wi-Fi (Khuyến nghị)</Text>
                <Text style={styles.modalOptionUrl}>{PHYSICAL_DEVICE_API_URL}</Text>
              </View>
            </TouchableOpacity>

            {/* Option 2: Android Emulator */}
            <TouchableOpacity
              style={[
                styles.modalOption,
                activeApiUrl === EMULATOR_API_URL && styles.modalOptionActive
              ]}
              onPress={() => {
                applyServerUrl(EMULATOR_API_URL);
                setShowConfigModal(false);
              }}
            >
              <View style={styles.modalOptionRadio}>
                {activeApiUrl === EMULATOR_API_URL && <View style={styles.modalOptionRadioDot} />}
              </View>
              <View style={styles.modalOptionTextCol}>
                <Text style={styles.modalOptionTitle}>Giả lập Android Studio (10.0.2.2)</Text>
                <Text style={styles.modalOptionUrl}>{EMULATOR_API_URL}</Text>
              </View>
            </TouchableOpacity>

            {/* Option 3: Localhost */}
            <TouchableOpacity
              style={[
                styles.modalOption,
                activeApiUrl === LOCALHOST_API_URL && styles.modalOptionActive
              ]}
              onPress={() => {
                applyServerUrl(LOCALHOST_API_URL);
                setShowConfigModal(false);
              }}
            >
              <View style={styles.modalOptionRadio}>
                {activeApiUrl === LOCALHOST_API_URL && <View style={styles.modalOptionRadioDot} />}
              </View>
              <View style={styles.modalOptionTextCol}>
                <Text style={styles.modalOptionTitle}>Localhost (Web / iOS Simulator)</Text>
                <Text style={styles.modalOptionUrl}>{LOCALHOST_API_URL}</Text>
              </View>
            </TouchableOpacity>

            {/* Custom URL Input */}
            <View style={styles.customUrlContainer}>
              <Text style={styles.customUrlLabel}>Hoặc nhập URL tùy chỉnh:</Text>
              <TextInput
                style={styles.customUrlInput}
                value={tempApiUrl}
                onChangeText={setTempApiUrl}
                placeholder="http://192.168.1.xxx:5000"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.customUrlSaveButton}
                onPress={() => {
                  if (tempApiUrl.trim()) {
                    applyServerUrl(tempApiUrl.trim().replace(/\/+$/, ''));
                    setShowConfigModal(false);
                  }
                }}
              >
                <Text style={styles.customUrlSaveText}>Lưu & Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  container: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32
  },

  // Brand Header
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginTop: 16
  },
  appSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 4
  },

  // Main Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3
  },

  // Error Alert
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18
  },
  errorIcon: {
    marginRight: 8,
    marginTop: 1
  },
  errorAlertText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#B91C1C',
    lineHeight: 18
  },

  // Input Fields
  inputGroup: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48
  },
  inputIcon: {
    marginRight: 10
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0
  },
  eyeButton: {
    padding: 4
  },

  // Options: Remember Me & Forgot Password
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 20
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB'
  },
  rememberMeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569'
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB'
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4
  },
  submitButtonDisabled: {
    opacity: 0.6
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },

  // Quick Demo Section
  demoSection: {
    marginTop: 20,
    alignItems: 'center'
  },
  demoSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8
  },
  demoPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7
  },
  demoPillActive: {
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF'
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569'
  },
  demoPillTextActive: {
    color: '#1D4ED8',
    fontWeight: '700'
  },

  // Server Pill
  serverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 14,
    alignSelf: 'center'
  },
  serverPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981'
  },
  serverPillLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
    maxWidth: 240
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    padding: 20
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  modalHeaderIconBadge: {
    width: 32,
    height: 32,
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
  modalDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginBottom: 10
  },
  modalOptionActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF'
  },
  modalOptionRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  modalOptionRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB'
  },
  modalOptionTextCol: {
    flex: 1
  },
  modalOptionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A'
  },
  modalOptionUrl: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  customUrlContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  customUrlLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6
  },
  customUrlInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginBottom: 10
  },
  customUrlSaveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  customUrlSaveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  }
});
