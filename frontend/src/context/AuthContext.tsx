import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  signUp: (email: string, password: string, name: string, role: 'student' | 'teacher', classId?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const userJson = await AsyncStorage.getItem(USER_KEY);
        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (error) {
        console.log('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;

      await AsyncStorage.setItem(TOKEN_KEY, access_token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
      setUser(userData);

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
      const { access_token, user: userData } = response.data;

      await AsyncStorage.setItem(TOKEN_KEY, access_token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      return { success: false, error: detail || 'Ошибка регистрации' };
    }
  };

  const signOut = async () => {
    try {
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

  const resetPassword = async (_email: string) => {
    return { success: false, error: 'Сброс пароля пока не поддерживается' };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword, updateUser }}>
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
