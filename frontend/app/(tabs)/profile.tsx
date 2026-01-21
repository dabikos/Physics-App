import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import api from '../../src/services/api';
import { AnimatedIcon } from '../../src/components/AnimatedIcon';

interface Progress {
  overall_progress: number;
  lessons: { completed: number; total: number; percentage: number };
  tasks: { completed: number; total: number; percentage: number };
  tests: { completed: number; total: number; percentage: number; scores: Record<string, number> };
}

const AnimatedProgressBar: React.FC<{ progress: number; color: string; delay?: number }> = ({ 
  progress, 
  color, 
  delay = 0 
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(animatedWidth, {
        toValue: progress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, [progress]);

  return (
    <View style={styles.progressBarContainer}>
      <Animated.View 
        style={[
          styles.progressBar, 
          { 
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }), 
            backgroundColor: color 
          }
        ]} 
      />
    </View>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchProgress();
    }
  }, [token]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await api.get('/progress');
      setProgress(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Выйти', 'Вы уверены, что хотите выйти?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/');
        },
      },
    ]);
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Профиль</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="person-circle" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Войдите в аккаунт</Text>
          <Text style={styles.emptySubtitle}>
            Для отслеживания прогресса войдите или зарегистрируйтесь
          </Text>
          <View style={styles.authButtons}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.loginButtonText}>Войти</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push('/auth/register')}
            >
              <Text style={styles.registerButtonText}>Регистрация</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Профиль</Text>
        </View>

        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {progress && (
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Общий прогресс</Text>
            <View style={styles.overallProgress}>
              <Text style={styles.overallProgressText}>
                {progress.overall_progress}%
              </Text>
              <ProgressBar progress={progress.overall_progress} color="#6C63FF" />
            </View>

            <View style={styles.progressCards}>
              <View style={styles.progressCard}>
                <Ionicons name="book" size={24} color="#4A90D9" />
                <Text style={styles.progressCardTitle}>Уроки</Text>
                <Text style={styles.progressCardValue}>
                  {progress.lessons.completed}/{progress.lessons.total}
                </Text>
                <ProgressBar progress={progress.lessons.percentage} color="#4A90D9" />
              </View>

              <View style={styles.progressCard}>
                <Ionicons name="calculator" size={24} color="#E74C3C" />
                <Text style={styles.progressCardTitle}>Задачи</Text>
                <Text style={styles.progressCardValue}>
                  {progress.tasks.completed}/{progress.tasks.total}
                </Text>
                <ProgressBar progress={progress.tasks.percentage} color="#E74C3C" />
              </View>

              <View style={styles.progressCard}>
                <Ionicons name="checkbox" size={24} color="#1ABC9C" />
                <Text style={styles.progressCardTitle}>Тесты</Text>
                <Text style={styles.progressCardValue}>
                  {progress.tests.completed}/{progress.tests.total}
                </Text>
                <ProgressBar progress={progress.tests.percentage} color="#1ABC9C" />
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  authButtons: {
    marginTop: 24,
    gap: 12,
  },
  loginButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  registerButtonText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '600',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  progressSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  overallProgress: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  overallProgressText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6C63FF',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressCards: {
    gap: 12,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  progressCardValue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
