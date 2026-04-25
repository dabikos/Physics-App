import axios from 'axios';
import i18next from 'i18next';

const API_PROFILES: Record<string, string> = {
  development: 'http://10.0.2.2:8000',
  preview: 'https://physics-app-hgw72.ondigitalocean.app',
  production: 'https://physics-app-hgw72.ondigitalocean.app',
};

const apiProfile = String(process.env.EXPO_PUBLIC_API_PROFILE || 'production').trim().toLowerCase();
const envApiUrl = String(process.env.EXPO_PUBLIC_API_URL || '').trim();
const resolvedApiUrl = (envApiUrl || API_PROFILES[apiProfile] || API_PROFILES.production).replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${resolvedApiUrl}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Accept-Language header from current i18next language
api.interceptors.request.use((config) => {
  const lang = i18next.language || 'ru';
  config.headers['Accept-Language'] = lang;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const detail = error.response?.data?.detail;
    const errorCode = typeof detail === 'object' ? detail?.code : undefined;
    const isExpectedChatLimit = errorCode === 'CHAT_LIMIT_REACHED';

    if (isExpectedChatLimit) {
      console.warn('API Chat Limit:', error.response?.data);
    } else {
      console.error('API Error:', error.response?.data || error.message);
    }

    // Auto-logout on invalid/expired token
    if (error.response?.status === 401 && error.response?.data?.detail === 'Invalid token') {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      delete api.defaults.headers.common.Authorization;
    }

    return Promise.reject(error);
  }
);

export default api;
