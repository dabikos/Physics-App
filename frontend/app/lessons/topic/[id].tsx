import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../src/services/api';
import { useAuthStore } from '../../../src/store/authStore';

interface Topic {
  id: string;
  section: string;
  subsection: string;
  title: string;
  brief_info: string;
  example_problem: string;
  formulas: string[];
  full_content?: string;
}

export default function TopicDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuthStore();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  useEffect(() => {
    fetchTopic();
  }, [id]);

  const fetchTopic = async () => {
    try {
      const response = await api.get(`/topics/${id}`);
      setTopic(response.data);
    } catch (error) {
      console.error('Error fetching topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDetailedContent = async () => {
    if (!token) {
      Alert.alert('Требуется авторизация', 'Войдите для использования AI', [
        { text: 'Войти', onPress: () => router.push('/auth/login') },
        { text: 'Отмена', style: 'cancel' },
      ]);
      return;
    }

    setGeneratingContent(true);
    try {
      const response = await api.post(`/topics/${id}/generate`, {
        topic_id: id,
        content_type: 'detailed',
      });
      setGeneratedContent(response.data.content);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сгенерировать контент');
    } finally {
      setGeneratingContent(false);
    }
  };

  const markAsComplete = async () => {
    if (!token) {
      Alert.alert('Требуется авторизация', 'Войдите для сохранения прогресса');
      return;
    }

    try {
      await api.post(`/progress/lesson/${id}`);
      Alert.alert('Успех', 'Урок отмечен как пройденный!');
    } catch (error) {
      console.error('Error marking lesson:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!topic) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Тема не найдена</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {topic.title}
        </Text>
        <TouchableOpacity onPress={markAsComplete} style={styles.checkButton}>
          <Ionicons name="checkmark-circle" size={28} color="#10B981" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={22} color="#6C63FF" />
            <Text style={styles.sectionTitle}>Краткая информация</Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.briefText}>{topic.brief_info}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calculator" size={22} color="#E74C3C" />
            <Text style={styles.sectionTitle}>Пример задачи</Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.exampleText}>{topic.example_problem}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flask" size={22} color="#9B59B6" />
            <Text style={styles.sectionTitle}>Формулы</Text>
          </View>
          <View style={styles.formulasGrid}>
            {topic.formulas.map((formula, index) => (
              <View key={index} style={styles.formulaCard}>
                <Text style={styles.formulaText}>{formula}</Text>
              </View>
            ))}
          </View>
        </View>

        {generatedContent && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles" size={22} color="#F39C12" />
              <Text style={styles.sectionTitle}>Подробнее (AI)</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.generatedText}>{generatedContent}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.generateButton,
            generatingContent && styles.generateButtonDisabled,
          ]}
          onPress={generateDetailedContent}
          disabled={generatingContent}
        >
          {generatingContent ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.generateButtonText}>Генерация...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
              <Text style={styles.generateButtonText}>Изучить больше</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  checkButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  briefText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  exampleText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  formulasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  formulaCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  formulaText: {
    fontSize: 16,
    color: '#4338CA',
    fontWeight: '500',
  },
  generatedText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    marginTop: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
