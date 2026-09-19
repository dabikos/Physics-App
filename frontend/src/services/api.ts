import axios from 'axios';
import i18n from '../config/i18n';

const API_PROFILES: Record<string, string> = {
  development: 'http://10.0.2.2:8000',
  preview: 'https://physics-app-production-2585.up.railway.app',
  production: 'https://physics-app-production-2585.up.railway.app',
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

const getApiLanguage = () => {
  const language = i18n.resolvedLanguage || i18n.language || 'ru';
  if (language.startsWith('en')) return 'en';
  if (language.startsWith('kk') || language.startsWith('kz')) return 'kk';
  return 'ru';
};

// Add Accept-Language header from the app i18n instance.
api.interceptors.request.use((config) => {
  config.headers['Accept-Language'] = getApiLanguage();
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const detail = error.response?.data?.detail;
    const errorCode = typeof detail === 'object' ? detail?.code : undefined;
    const isExpectedChatLimit = errorCode === 'CHAT_LIMIT_REACHED';
    const isUnauthenticated = error.response?.status === 401;

    if (isExpectedChatLimit) {
      console.warn('API Chat Limit:', error.response?.data);
    } else if (isUnauthenticated) {
      // Normal when guest or token expired
      if (__DEV__) {
        console.log('[API] Unauthenticated request (401)');
      }
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
