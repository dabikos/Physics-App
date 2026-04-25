import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePhysicsData } from '../../src/hooks/usePhysicsData';
import { SuccessModal } from '../../src/components/SuccessModal';
import { SolutionDisplay } from '../../src/components/SolutionDisplay';
import { MathContent } from '../../src/components/MathContent';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
export default function TasksSectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section: string }>();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { PHYSICS_SECTIONS, getTasksBySection } = usePhysicsData();
  
  const sectionData = section ? PHYSICS_SECTIONS[section] : null;
  const tasks = section ? getTasksBySection(section) : [];
  
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const currentTask = tasks[currentTaskIndex];
    const correct = selectedAnswer === currentTask.correct_answer;
    
    setIsCorrect(correct);
    if (correct) setCorrectCount(prev => prev + 1);
    setShowResult(true);
  };

  const nextTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setShowSuccessModal(true);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    router.back();
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
      case 'easy': return t('difficulty.easy');
      case 'medium': return t('difficulty.medium');
      case 'hard': return t('difficulty.hard');
      default: return difficulty;
    }
  };

  const getOptionState = (index: number) => {
    if (!showResult) return 'default';
    if (index === currentTask.correct_answer) return 'correct';
    if (selectedAnswer === index && !isCorrect) return 'wrong';
    return 'default';
  };

  const getOptionTextColor = (index: number) => {
    const optionState = getOptionState(index);
    if (optionState === 'correct') return '#064E3B';
    if (optionState === 'wrong') return '#7F1D1D';
    return colors.text;
  };

  if (!sectionData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('tasks.title')}</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t('common.sectionNotFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (tasks.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{sectionData.name}</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="document-text" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t('tasks.tasksInDev')}</Text>
          <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>{t('tasks.tasksInDevMessage')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentTask = tasks[currentTaskIndex];
  const solution = {
    steps: [currentTask.explanation],
    answer: currentTask.options[currentTask.correct_answer],
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{sectionData.name}</Text>
        <Text style={[styles.taskCounter, { color: colors.accentText, backgroundColor: colors.accentLight }]}>
          {currentTaskIndex + 1}/{tasks.length}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} style={styles.content}>
        <View style={[styles.taskCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
          <View style={styles.taskHeader}>
            <Text style={[styles.taskTitle, { color: colors.text }]}>{currentTask.title}</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(currentTask.difficulty) + '20' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(currentTask.difficulty) }]}>
                {getDifficultyText(currentTask.difficulty)}
              </Text>
            </View>
          </View>

          <View style={styles.questionContainer}>
            <MathContent content={currentTask.question} fontSize={16} textColor={colors.text} />
          </View>

          <View style={styles.optionsContainer}>
            {currentTask.options.map((option, index) => {
              const optionState = getOptionState(index);
              const optionTextColor = getOptionTextColor(index);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    { backgroundColor: colors.optionBg, borderColor: colors.optionBorder },
                    selectedAnswer === index && [styles.optionSelected, { borderColor: colors.accent, backgroundColor: colors.optionSelectedBg }],
                    optionState === 'correct' && styles.optionCorrect,
                    optionState === 'wrong' && styles.optionWrong,
                  ]}
                  onPress={() => !showResult && setSelectedAnswer(index)}
                  disabled={showResult}
                >
                  <View style={[
                    styles.optionCircle,
                    { backgroundColor: colors.optionCircleBg },
                    selectedAnswer === index && [styles.optionCircleSelected, { backgroundColor: colors.accent }],
                    optionState === 'correct' && styles.optionCircleCorrect,
                    optionState === 'wrong' && styles.optionCircleWrong,
                  ]}>
                    <Text style={[
                      styles.optionLetter,
                      { color: colors.textTertiary },
                      (selectedAnswer === index || optionState === 'correct') && styles.optionLetterSelected,
                    ]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <View style={styles.optionTextContainer}>
                    <MathContent content={option} fontSize={15} textColor={optionTextColor} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {showResult && (
          <SolutionDisplay solution={solution} isCorrect={isCorrect} />
        )}

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.accent },
            !showResult && selectedAnswer === null && [styles.actionButtonDisabled, { backgroundColor: colors.border }],
          ]}
          onPress={showResult ? nextTask : submitAnswer}
          disabled={!showResult && selectedAnswer === null}
        >
          <Text style={styles.actionButtonText}>
            {showResult ? (
              currentTaskIndex < tasks.length - 1 ? t('tasks.nextTask') : t('common.finish')
            ) : t('tasks.check')}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <SuccessModal
        visible={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title={t('tasks.tasksCompleted')}
        subtitle={t('tasks.correctCount', { correct: correctCount, total: tasks.length })}
        score={Math.round((correctCount / tasks.length) * 100)}
        type="task"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
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
  questionContainer: {
    marginBottom: 20,
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
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
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


