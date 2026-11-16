import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Tự động nhận diện IP của máy tính đang chạy backend:
// - Trong Expo Go (Điện thoại thật hoặc máy ảo): hostUri chứa IP của máy tính (ví dụ: 172.20.10.4:8081)
// - Web: window.location.hostname
export const getAutoDetectedHost = (): string => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      return window.location.hostname;
    }
    return 'localhost';
  }

  // Lấy host IP từ Expo Metro bundler connection
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }

  // Fallback IP máy tính trên mạng Wi-Fi hiện tại
  return '172.20.10.4';
};

export const getDefaultApiUrl = (): string => {
  const host = getAutoDetectedHost();
  return `http://${host}:5000/api`;
};

export const PHYSICAL_DEVICE_API_URL = 'http://172.20.10.4:5000/api';
export const LOCALHOST_API_URL = 'http://localhost:5000/api';
export const EMULATOR_API_URL = 'http://10.0.2.2:5000/api';

export let currentApiBaseUrl = getDefaultApiUrl();

export const setApiBaseUrl = (url: string) => {
  currentApiBaseUrl = url.trim().replace(/\/+$/, '');
};
