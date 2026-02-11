import axios from 'axios';
import i18next from 'i18next';

// Backend URL — замените на ваш URL от DigitalOcean после деплоя
const API_URL = 'https://ВАШЕ_ПРИЛОЖЕНИЕ.ondigitalocean.app';

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
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
