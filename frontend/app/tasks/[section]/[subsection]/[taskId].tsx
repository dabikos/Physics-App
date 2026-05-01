import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { MathContent } from '../../../../src/components/MathContent';
import { useTheme } from '../../../../src/context/ThemeContext';
import api from '../../../../src/services/api';

type PracticeTask = {
  id: string;
  topic_title?: string;
  title: string;
  problem_text: string;
  given_data?: string;
  find_text?: string;
  solution?: string;
  answer?: string;
};

export default function PracticeTaskDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [task, setTask] = useState<PracticeTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [answerChecked, setAnswerChecked] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [checkingAnswer, setCheckingAnswer] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadTask = async () => {
      if (!taskId) return;
      setLoading(true);
      setUserAnswer('');
      setAnswerChecked(false);
      setIsAnswerCorrect(false);
      setCheckingAnswer(false);
      setShowHint(false);
      setShowSolution(false);
      try {
        const response = await api.get(`/practice/tasks/${taskId}`);
        const item = response.data?.item || null;
        if (!cancelled) setTask(item);
      } catch (error) {
        console.log('Practice task detail load error:', error);
        if (!cancelled) setTask(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTask();
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const solutionSteps = useMemo(() => {
    if (!task?.solution) return [];
    return task.solution
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }, [task?.solution]);

  const normalizeAnswer = (value: string) => {
    return value
      .toLowerCase()
      .replace(/ответ\s*:?/gi, '')
      .replace(/[^0-9a-zа-яё.,\-+*/^]/gi, '')
      .replace(/,/g, '.')
      .trim();
  };

  const extractNumbers = (value: string): string[] => {
    return value
      .replace(/,/g, '.')
      .match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi) || [];
  };

  const checkUserAnswer = async () => {
    if (!task?.answer || !userAnswer.trim() || checkingAnswer) return;

    const expected = normalizeAnswer(task.answer);
    const actual = normalizeAnswer(userAnswer);
    const expectedNumbers = extractNumbers(task.answer);
    const actualNumbers = extractNumbers(userAnswer);
    const hasMatchingNumber = actualNumbers.some((num) => expectedNumbers.includes(num));
    const textMatches = actual.length >= 2 && (expected.includes(actual) || actual.includes(expected));
    const localCorrect = textMatches || hasMatchingNumber;

    setCheckingAnswer(true);
    try {
      const response = await api.post(`/practice/tasks/${task.id}/submit`, { answer: userAnswer });
      setIsAnswerCorrect(Boolean(response.data?.correct));
    } catch (error) {
      console.log('Practice task submit error:', error);
      setIsAnswerCorrect(localCorrect);
    } finally {
      setAnswerChecked(true);
      setCheckingAnswer(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {task?.topic_title || t('tasks.task')}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : !task ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t('common.taskNotFound')}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          <View style={[styles.topicBadge, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="school-outline" size={16} color={colors.accentText} />
            <Text style={[styles.topicBadgeText, { color: colors.accentText }]}>
              {task.topic_title || t('tasks.practicalTasks')}
            </Text>
          </View>

          <View style={[styles.conditionCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
            <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
            <MathContent content={task.problem_text} textColor={colors.text} fontSize={17} />
          </View>

          {!!task.given_data && (
            <InfoCard
              title={t('tasks.givenLabel')}
              content={task.given_data}
              icon="list-outline"
              colors={colors}
            />
          )}

          {!!task.find_text && (
            <InfoCard
              title={t('tasks.find')}
              content={task.find_text}
              icon="search-outline"
              colors={colors}
              accent="#10B981"
            />
          )}

          {!!task.answer && (
            <View style={[styles.answerInputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.infoHeader}>
                <Ionicons name="create-outline" size={18} color={colors.accent} />
                <Text style={[styles.infoTitle, { color: colors.accent }]}>Ваш ответ</Text>
              </View>
              <TextInput
                style={[styles.answerInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                value={userAnswer}
                onChangeText={(value) => {
                  setUserAnswer(value);
                  setAnswerChecked(false);
                }}
                placeholder="Напишите ответ перед просмотром решения"
                placeholderTextColor={colors.textMuted}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.checkAnswerButton,
                  { backgroundColor: userAnswer.trim() ? colors.accent : colors.border },
                ]}
                onPress={checkUserAnswer}
                disabled={!userAnswer.trim() || checkingAnswer}
              >
                <Text style={styles.checkAnswerText}>{checkingAnswer ? t('common.loading') : t('tasks.checkAnswer')}</Text>
              </TouchableOpacity>
              {answerChecked && (
                <View style={[
                  styles.answerFeedback,
                  { backgroundColor: isAnswerCorrect ? '#ECFDF5' : '#FEF3C7' },
                ]}>
                  <Ionicons
                    name={isAnswerCorrect ? 'checkmark-circle' : 'alert-circle'}
                    size={18}
                    color={isAnswerCorrect ? '#047857' : '#B45309'}
                  />
                  <Text style={[styles.answerFeedbackText, { color: isAnswerCorrect ? '#047857' : '#92400E' }]}>
                    {isAnswerCorrect
                      ? 'Похоже, ответ совпадает. Можно открыть решение и сверить ход рассуждений.'
                      : 'Ответ не совпал автоматически. Откройте решение и сравните единицы, округление и смысл.'}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowHint((value) => !value)}
            >
              <Ionicons name="bulb-outline" size={18} color="#F59E0B" />
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                {showHint ? 'Скрыть подсказку' : t('tasks.hint')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.accent }]}
              onPress={() => setShowSolution((value) => !value)}
            >
              <Text style={styles.primaryButtonText}>
                {showSolution ? 'Скрыть решение' : t('tasks.showSolution')}
              </Text>
              <Ionicons name={showSolution ? 'chevron-up' : 'chevron-down'} size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {showHint && (
            <View style={[styles.hintCard, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="bulb" size={22} color="#D97706" />
              <Text style={styles.hintText}>
                Начните с блока «Дано», определите искомую величину и выберите формулу из темы.
              </Text>
            </View>
          )}

          {showSolution && (
            <View style={[styles.solutionCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
              <Text style={[styles.solutionTitle, { color: colors.text }]}>{t('tasks.solutionLabel')}</Text>
              <View style={styles.stepsList}>
                {solutionSteps.map((step, index) => (
                  <View key={`${index}-${step}`} style={styles.stepRow}>
                    <View style={[styles.stepNumber, { backgroundColor: colors.accentLight }]}>
                      <Text style={[styles.stepNumberText, { color: colors.accentText }]}>{index + 1}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <MathContent content={step} textColor={colors.text} fontSize={15} />
                    </View>
                  </View>
                ))}
              </View>

              {!!task.answer && (
                <View style={[styles.answerCard, { backgroundColor: '#ECFDF5' }]}>
                  <Text style={styles.answerLabel}>{t('tasks.answerLabel')}</Text>
                  <MathContent content={task.answer} textColor="#047857" fontSize={16} />
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function InfoCard({
  title,
  content,
  icon,
  colors,
  accent,
}: {
  title: string;
  content: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: any;
  accent?: string;
}) {
  const color = accent || colors.accent;
  return (
    <View style={[styles.infoCard, { backgroundColor: colors.card, borderLeftColor: color }]}>
      <View style={styles.infoHeader}>
        <Ionicons name={icon} size={18} color={color} />
        <Text style={[styles.infoTitle, { color }]}>{title}</Text>
      </View>
      <MathContent content={content} textColor={colors.text} fontSize={15} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerPlaceholder: {
    width: 44,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 14,
  },
  topicBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  conditionCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  answerInputCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  answerInput: {
    minHeight: 72,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    lineHeight: 21,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  checkAnswerButton: {
    minHeight: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkAnswerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  answerFeedback: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  answerFeedbackText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  hintCard: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  hintText: {
    flex: 1,
    color: '#92400E',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  solutionCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  solutionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  stepsList: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '800',
  },
  stepContent: {
    flex: 1,
  },
  answerCard: {
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  answerLabel: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
});
