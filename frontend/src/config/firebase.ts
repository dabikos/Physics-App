/**
 * Firebase Configuration
 * 
 * Для настройки:
 * 1. Создайте проект на https://console.firebase.google.com
 * 2. Включите Authentication → Email/Password
 * 3. Скопируйте конфигурацию из Project Settings → Web App
 * 4. Вставьте значения ниже или в .env файл
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Firebase конфигурация
const defaultApiKey = Platform.OS === 'ios'
  ? 'AIzaSyAHKY2_vDSiFhJiaFlE0ooGinpvlKDGtrw'
  : 'AIzaSyCRT66ylCtCXTHD__X4Ag9bgpH-iwNdAm8';

const defaultAppId = Platform.OS === 'ios'
  ? '1:201868571438:ios:7412d7371693e85f0700bf'
  : '1:201868571438:android:acb1c655419231b70700bf';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || defaultApiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'phus-a53ce.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'phus-a53ce',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'phus-a53ce.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '201868571438',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || defaultAppId,
};

// Инициализация Firebase App
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Инициализация Auth с persistence для React Native
let auth: any;
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













