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
  return '192.168.1.192';
};

export const getDefaultApiUrl = (): string => {
  const host = getAutoDetectedHost();
  return `http://${host}:5000/api`;
};

export const PHYSICAL_DEVICE_API_URL = 'http://192.168.1.192:5000/api';
export const LOCALHOST_API_URL = 'http://localhost:5000/api';
export const EMULATOR_API_URL = 'http://10.0.2.2:5000/api';

export let currentApiBaseUrl = getDefaultApiUrl();

export const setApiBaseUrl = (url: string) => {
  currentApiBaseUrl = url.trim().replace(/\/+$/, '');
};

export const getBackendRootUrl = (): string => {
  return currentApiBaseUrl.replace(/\/api\/?$/, '');
};

export const resolveMediaUrl = (rawUrl?: string): string => {
  if (!rawUrl || !rawUrl.trim()) return '';
  const url = rawUrl.trim();
  const root = getBackendRootUrl();

  // If relative path like /docs/de-cuong.pdf or /uploads/...
  if (url.startsWith('/')) {
    return `${root}${url}`;
  }

  // If localhost or 127.0.0.1 on physical device / emulator
  if (url.includes('localhost:5000') || url.includes('127.0.0.1:5000')) {
    const host = getAutoDetectedHost();
    return url.replace(/localhost:5000|127\.0\.0\.1:5000/g, `${host}:5000`);
  }

  return url;
};
