import axios from 'axios';
import i18next from 'i18next';

// Backend URL — DigitalOcean App Platform
const API_URL = 'https://physics-app-hgw72.ondigitalocean.app';

const api = axios.create({
  baseURL: `${API_URL}/api`,
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
    console.error('API Error:', error.response?.data || error.message);

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
