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
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { SuccessModal } from '../../src/components/SuccessModal';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

interface Test {
  id: string;
  section: string;
  title: string;
  questions: Question[];
  time_limit: number;
}

interface Section {
  name: string;
  color: string;
}

export default function TestsSectionScreen() {
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section: string }>();
  const { token } = useAuthStore();
  const [sectionData, setSectionData] = useState<Section | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [section]);

  useEffect(() => {
    if (testStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testStarted]);

  const fetchData = async () => {
    try {
      const [sectionRes, testsRes] = await Promise.all([
        api.get(`/sections/${section}`),
        api.get(`/tests?section=${section}`),
      ]);
      setSectionData(sectionRes.data);
      setTests(testsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTest = async () => {
    if (!token) {
      Alert.alert('Требуется авторизация', 'Войдите для генерации тестов', [
        { text: 'Войти', onPress: () => router.push('/auth/login') },
        { text: 'Отмена', style: 'cancel' },
      ]);
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/tests/generate', {
        section: section,
        num_questions: 5,
        difficulty: 'medium',
      });
      
      const newTest = response.data;
      setTests(prev => [...prev, newTest]);
      Alert.alert('Успех', 'Новый тест сгенерирован!', [
        { text: 'Начать', onPress: () => startTest(newTest) },
        { text: 'Позже', style: 'cancel' },
      ]);
    } catch (error: any) {
      Alert.alert('Ошибка', 'Не удалось сгенерировать тест');
    } finally {
      setGenerating(false);
    }
  };

  const startTest = (test: Test) => {
    setSelectedTest(test);
    setCurrentQuestionIndex(0);
    setAnswers(new Array(test.questions.length).fill(-1));
    setTimeLeft(test.time_limit);
    setTestStarted(true);
    setTestFinished(false);
    setResults(null);
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (selectedTest && currentQuestionIndex < selectedTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishTest = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTestStarted(false);
    setTestFinished(true);

    if (token && selectedTest) {
      try {
        const response = await api.post(`/tests/${selectedTest.id}/submit`, {
          answers: answers,
        });
        setResults(response.data);
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Error submitting test:', error);
        calculateLocalResults();
        setShowSuccessModal(true);
      }
    } else {
      calculateLocalResults();
      setShowSuccessModal(true);
    }
  };

  const calculateLocalResults = () => {
    if (!selectedTest) return;
    let correctCount = 0;
    const resultDetails = selectedTest.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correct;
      if (isCorrect) correctCount++;
      return {
        question: q.question,
        correct: isCorrect,
        correct_answer: q.correct,
        user_answer: answers[i],
      };
    });
    setResults({
      score: Math.round((correctCount / selectedTest.questions.length) * 100),
      correct_count: correctCount,
      total: selectedTest.questions.length,
      results: resultDetails,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTest = () => {
    setSelectedTest(null);
    setTestStarted(false);
    setTestFinished(false);
    setResults(null);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setShowSuccessModal(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  // Test results screen
  if (testFinished && results) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={resetTest}>
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Результаты</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.resultsCard}>
            <View style={[
              styles.scoreCircle,
              { backgroundColor: results.score >= 70 ? '#D1FAE5' : results.score >= 50 ? '#FEF3C7' : '#FEE2E2' }
            ]}>
              <Text style={[
                styles.scoreText,
                { color: results.score >= 70 ? '#10B981' : results.score >= 50 ? '#F59E0B' : '#EF4444' }
              ]}>
                {results.score}%
              </Text>
            </View>
            <Text style={styles.scoreLabel}>
              {results.correct_count} из {results.total} правильных
            </Text>
            <Text style={styles.scoreMessage}>
              {results.score >= 70 ? 'Отличный результат!' : 
               results.score >= 50 ? 'Хорошо, но есть куда расти' : 
               'Нужно повторить материал'}
            </Text>
          </View>

          <Text style={styles.detailsTitle}>Подробные результаты</Text>
          {results.results?.map((r: any, i: number) => (
            <View key={i} style={[
              styles.resultItem,
              { borderLeftColor: r.correct ? '#10B981' : '#EF4444' }
            ]}>
              <View style={styles.resultHeader}>
                <Ionicons
                  name={r.correct ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={r.correct ? '#10B981' : '#EF4444'}
                />
                <Text style={styles.resultQuestion} numberOfLines={2}>
                  {r.question}
                </Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.retryButton} onPress={resetTest}>
            <Text style={styles.retryButtonText}>Вернуться к тестам</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Active test screen
  if (testStarted && selectedTest) {
    const currentQuestion = selectedTest.questions[currentQuestionIndex];

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Alert.alert('Выйти из теста?', 'Прогресс будет потерян', [
                { text: 'Отмена', style: 'cancel' },
                { text: 'Выйти', style: 'destructive', onPress: resetTest },
              ]);
            }}
          >
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.timerContainer}>
            <Ionicons name="time" size={18} color={timeLeft < 60 ? '#EF4444' : '#6B7280'} />
            <Text style={[styles.timerText, timeLeft < 60 && styles.timerTextWarning]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
          <Text style={styles.questionCounter}>
            {currentQuestionIndex + 1}/{selectedTest.questions.length}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentQuestionIndex + 1) / selectedTest.questions.length) * 100}%` },
            ]}
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    answers[currentQuestionIndex] === index && styles.optionSelected,
                  ]}
                  onPress={() => selectAnswer(index)}
                >
                  <View style={[
                    styles.optionCircle,
                    answers[currentQuestionIndex] === index && styles.optionCircleSelected,
                  ]}>
                    <Text style={[
                      styles.optionLetter,
                      answers[currentQuestionIndex] === index && styles.optionLetterSelected,
                    ]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
              onPress={prevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <Ionicons name="arrow-back" size={20} color={currentQuestionIndex === 0 ? '#D1D5DB' : '#6C63FF'} />
              <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
                Назад
              </Text>
            </TouchableOpacity>

            {currentQuestionIndex === selectedTest.questions.length - 1 ? (
              <TouchableOpacity style={styles.finishButton} onPress={finishTest}>
                <Text style={styles.finishButtonText}>Завершить</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
                <Text style={styles.nextButtonText}>Далее</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        <SuccessModal
          visible={showSuccessModal}
          onClose={handleCloseSuccessModal}
          title="Тест завершён!"
          subtitle={selectedTest?.title}
          score={results?.score}
          type="test"
        />
      </SafeAreaView>
    );
  }

  // Tests list screen
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sectionData?.name}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Generate test button */}
        <TouchableOpacity
          style={styles.generateTestButton}
          onPress={generateTest}
          disabled={generating}
        >
          <LinearGradient
            colors={['#1ABC9C', '#16A085']}
            style={styles.generateGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {generating ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            )}
            <Text style={styles.generateText}>
              {generating ? 'Генерация...' : 'Сгенерировать тест'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Доступные тесты</Text>

        {tests.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Тесты в разработке</Text>
          </View>
        ) : (
          tests.map((test) => (
            <TouchableOpacity
              key={test.id}
              style={styles.testCard}
              onPress={() => startTest(test)}
              activeOpacity={0.8}
            >
              <View style={styles.testIcon}>
                <Ionicons name="document-text" size={24} color="#6C63FF" />
              </View>
              <View style={styles.testInfo}>
                <Text style={styles.testTitle}>{test.title}</Text>
                <View style={styles.testMeta}>
                  <View style={styles.testMetaItem}>
                    <Ionicons name="help-circle" size={14} color="#6B7280" />
                    <Text style={styles.testMetaText}>{test.questions.length} вопросов</Text>
                  </View>
                  <View style={styles.testMetaItem}>
                    <Ionicons name="time" size={14} color="#6B7280" />
                    <Text style={styles.testMetaText}>{Math.floor(test.time_limit / 60)} мин</Text>
                  </View>
                </View>
              </View>
              <View style={styles.startButton}>
                <Ionicons name="play" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ))
        )}
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerPlaceholder: {
    width: 44,
  },
  generateTestButton: {
    marginBottom: 16,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  generateText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  timerTextWarning: {
    color: '#EF4444',
  },
  questionCounter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  testCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  testIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testInfo: {
    flex: 1,
    marginLeft: 12,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  testMeta: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 16,
  },
  testMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  testMetaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  startButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 26,
    marginBottom: 24,
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
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6C63FF',
  },
  navButtonTextDisabled: {
    color: '#D1D5DB',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 6,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  finishButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  finishButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  scoreMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  resultItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultQuestion: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  retryButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
