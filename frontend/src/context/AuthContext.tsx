import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import api from '../services/api';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  class_id?: string | null;
  avatar?: string;
  grade?: string;
  progress?: Record<string, any>;
  created_at?: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, role: 'student' | 'teacher', classId?: string) => Promise<{ success: boolean; error?: string; verificationRequired?: boolean }>;
  signInWithGoogle: (idToken: string, name?: string, role?: 'student' | 'teacher', classId?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogleCode: (code: string, codeVerifier: string, redirectUri: string, name?: string, role?: 'student' | 'teacher', classId?: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  resendCode: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const isExpoGo = Constants.appOwnership === 'expo';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          try {
            const res = await api.get('/auth/me');
            const userData = res.data;
            setUser(userData);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
          } catch {
            await AsyncStorage.removeItem(TOKEN_KEY);
            await AsyncStorage.removeItem(USER_KEY);
            delete api.defaults.headers.common.Authorization;
            setUser(null);
          }
        }
      } catch (error) {
        console.log('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const _saveSession = async (access_token: string, userData: UserData) => {
    await AsyncStorage.setItem(TOKEN_KEY, access_token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
    setUser(userData);
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      await _saveSession(access_token, userData);
      return { success: true };
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      return { success: false, error: detail || 'Ошибка входа' };
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'student' | 'teacher', classId?: string) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        name,
        role,
        class_id: role === 'student' ? classId : null,
      });
      const data = response.data;

      if (data.status === 'verification_required') {
        return { success: true, verificationRequired: true };
      }

      // Fallback if backend returns token directly
      if (data.access_token) {
        await _saveSession(data.access_token, data.user);
        return { success: true };
      }

      return { success: true, verificationRequired: true };
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      return { success: false, error: detail || 'Ошибка регистрации' };
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      const response = await api.post('/auth/verify-email', { email, code });
      const { access_token, user: userData } = response.data;
      await _saveSession(access_token, userData);
      return { success: true };
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      return { success: false, error: detail || 'Неверный код' };
    }
  };

  const resendCode = async (email: string) => {
    try {
      await api.post('/auth/resend-code', { email });
      return { success: true };
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      return { success: false, error: detail || 'Ошибка отправки кода' };
    }
  };

  const signInWithGoogle = async (idToken: string, name?: string, role: 'student' | 'teacher' = 'student', classId?: string) => {
    try {
      const response = await api.post('/auth/google', {
        id_token: idToken,
        name,
        role,
        class_id: classId,
      });
      const { access_token, user: userData } = response.data;
      await _saveSession(access_token, userData);
      return { success: true };
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      return { success: false, error: detail || 'Ошибка входа через Google' };
    }
  };

  const signInWithGoogleCode = async (code: string, codeVerifier: string, redirectUri: string, name?: string, role: 'student' | 'teacher' = 'student', classId?: string) => {
    try {
      const response = await api.post('/auth/google-code', {
        code,
        code_verifier: codeVerifier,
        redirect_uri: redirectUri,
        name,
        role,
        class_id: classId,
      });
      const { access_token, user: userData } = response.data;
      await _saveSession(access_token, userData);
      return { success: true };
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      return { success: false, error: detail || 'Ошибка входа через Google' };
    }
  };

  const signOut = async () => {
    try {
      // Удаляем push-токен с сервера
      if (!isExpoGo) {
        try {
          const Notifications = await import('expo-notifications');
          const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: '0f5d864b-9c41-42d1-b161-6a29613030ae',
          });
          if (tokenData?.data) {
            await api.delete('/push-token', { data: { token: tokenData.data } });
          }
        } catch {}
      }
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } finally {
      delete api.defaults.headers.common.Authorization;
      setUser(null);
    }
  };

  const updateUser = async (data: Partial<UserData>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
  };

  const resetPassword = async (email: string) => {
    try {
      await api.post('/auth/reset-password/request', { email });
      return { success: true };
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      return { success: false, error: detail || 'Ошибка отправки' };
    }
  };

  const confirmResetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      await api.post('/auth/reset-password/confirm', { email, code, new_password: newPassword });
      return { success: true };
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      return { success: false, error: detail || 'Ошибка сброса пароля' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      signIn, signUp, signInWithGoogle, signInWithGoogleCode,
      verifyEmail, resendCode,
      signOut, resetPassword, confirmResetPassword, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
