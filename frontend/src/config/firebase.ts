/**
 * Firebase Configuration
 * 
 * Для настройки:
 * 1. Создайте проект на https://console.firebase.google.com
 * 2. Включите Authentication → Email/Password
 * 3. Скопируйте конфигурацию из Project Settings → Web App
 * 4. Вставьте значения ниже или в .env файл
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Firebase конфигурация
// ВАЖНО: Замените эти значения на ваши из Firebase Console
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
};

// Инициализация Firebase App
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Инициализация Auth с persistence для React Native
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app);
  } catch {
    // Если auth уже инициализирован
    auth = getAuth(app);
  }
}

// Инициализация Firestore
const db = getFirestore(app);

export { app, auth, db };
export default app;













