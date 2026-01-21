import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { SuccessModal } from '../../src/components/SuccessModal';

interface Task {
  id: string;
  section: string;
  title: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: string;
}

interface Section {
  name: string;
  color: string;
}

export default function TasksSectionScreen() {
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section: string }>();
  const { token } = useAuthStore();
  const [sectionData, setSectionData] = useState<Section | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    fetchData();
  }, [section]);

  const fetchData = async () => {
    try {
      const [sectionRes, tasksRes] = await Promise.all([
        api.get(`/sections/${section}`),
        api.get(`/tasks?section=${section}`),
      ]);
      setSectionData(sectionRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (selectedAnswer === null) return;
    
    const currentTask = tasks[currentTaskIndex];
    
    if (token) {
      try {
        const response = await api.post(`/tasks/${currentTask.id}/submit`, {
          answer: selectedAnswer,
        });
        setIsCorrect(response.data.correct);
        setExplanation(response.data.explanation);
      } catch (error) {
        console.error('Error submitting answer:', error);
        setIsCorrect(selectedAnswer === currentTask.correct_answer);
        setExplanation(currentTask.explanation);
      }
    } else {
      setIsCorrect(selectedAnswer === currentTask.correct_answer);
      setExplanation(currentTask.explanation);
    }
    
    setShowResult(true);
  };

  const nextTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      Alert.alert('Поздравляем!', 'Вы выполнили все задачи этого раздела!', [
        { text: 'ОК', onPress: () => router.back() },
      ]);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Лёгкая';
      case 'medium': return 'Средняя';
      case 'hard': return 'Сложная';
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{sectionData?.name}</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="document-text" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>Задачи в разработке</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentTask = tasks[currentTaskIndex];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sectionData?.name}</Text>
        <Text style={styles.taskCounter}>
          {currentTaskIndex + 1}/{tasks.length}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{currentTask.title}</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(currentTask.difficulty) + '20' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(currentTask.difficulty) }]}>
                {getDifficultyText(currentTask.difficulty)}
              </Text>
            </View>
          </View>

          <Text style={styles.questionText}>{currentTask.question}</Text>

          <View style={styles.optionsContainer}>
            {currentTask.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === index && styles.optionSelected,
                  showResult && index === currentTask.correct_answer && styles.optionCorrect,
                  showResult && selectedAnswer === index && !isCorrect && styles.optionWrong,
                ]}
                onPress={() => !showResult && setSelectedAnswer(index)}
                disabled={showResult}
              >
                <View style={[
                  styles.optionCircle,
                  selectedAnswer === index && styles.optionCircleSelected,
                  showResult && index === currentTask.correct_answer && styles.optionCircleCorrect,
                  showResult && selectedAnswer === index && !isCorrect && styles.optionCircleWrong,
                ]}>
                  <Text style={[
                    styles.optionLetter,
                    (selectedAnswer === index || (showResult && index === currentTask.correct_answer)) && styles.optionLetterSelected,
                  ]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {showResult && (
            <View style={[styles.resultCard, isCorrect ? styles.resultCorrect : styles.resultWrong]}>
              <View style={styles.resultHeader}>
                <Ionicons
                  name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                  size={24}
                  color={isCorrect ? '#10B981' : '#EF4444'}
                />
                <Text style={[styles.resultTitle, { color: isCorrect ? '#10B981' : '#EF4444' }]}>
                  {isCorrect ? 'Правильно!' : 'Неправильно'}
                </Text>
              </View>
              <Text style={styles.explanationText}>{explanation}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            !showResult && selectedAnswer === null && styles.actionButtonDisabled,
          ]}
          onPress={showResult ? nextTask : submitAnswer}
          disabled={!showResult && selectedAnswer === null}
        >
          <Text style={styles.actionButtonText}>
            {showResult ? (
              currentTaskIndex < tasks.length - 1 ? 'Следующая задача' : 'Завершить'
            ) : 'Проверить'}
          </Text>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerPlaceholder: {
    width: 44,
  },
  taskCounter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionSelected: {
    borderColor: '#6C63FF',
    backgroundColor: '#EEF2FF',
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionCircleSelected: {
    backgroundColor: '#6C63FF',
  },
  optionCircleCorrect: {
    backgroundColor: '#10B981',
  },
  optionCircleWrong: {
    backgroundColor: '#EF4444',
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionLetterSelected: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  resultCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  resultCorrect: {
    backgroundColor: '#D1FAE5',
  },
  resultWrong: {
    backgroundColor: '#FEE2E2',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  explanationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  actionButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
