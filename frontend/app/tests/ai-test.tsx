import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GeneratedTest } from '../../src/services/aiService';
import { MathContent } from '../../src/components/MathContent';
import { usePhysicsData } from '../../src/hooks/usePhysicsData';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';

const DIFFICULTY_COLORS = {
  basic: '#10B981',
  standard: '#F59E0B',
  advanced: '#F97316',
  olympiad: '#EF4444',
};

export default function AITestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { PHYSICS_SECTIONS } = usePhysicsData();
  
  // Парсим данные теста из параметров
  const [test, setTest] = useState<GeneratedTest | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Анимации
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (params.testData) {
      try {
        const parsed = JSON.parse(params.testData as string);
        setTest(parsed);
        setSelectedAnswers(new Array(parsed.questions.length).fill(null));
      } catch (e) {
        console.error('Failed to parse test data:', e);
        Alert.alert(t('common.error'), t('tests.loadError'));
        router.back();
      }
    }
  }, [params.testData]);

  if (!test) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textTertiary }]}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const question = test.questions[currentQuestion];
  const isAnswered = selectedAnswers[currentQuestion] !== null;
  const isCorrect = selectedAnswers[currentQuestion] === question.correct;
  const totalCorrect = selectedAnswers.filter((ans, idx) => ans === test.questions[idx].correct).length;
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;

  const handleSelectAnswer = (answerIndex: number) => {
    if (isAnswered) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);

    // Анимация выбора
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (currentQuestion < test.questions.length - 1) {
      setShowExplanation(false);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setCurrentQuestion(currentQuestion + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setShowExplanation(false);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setCurrentQuestion(currentQuestion - 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handleFinish = () => {
    router.back();
  };

  const getScoreMessage = () => {
    const percentage = (totalCorrect / test.questions.length) * 100;
    if (percentage >= 90) return { text: t('tests.excellent'), color: '#10B981' };
    if (percentage >= 70) return { text: t('tests.good'), color: '#22C55E' };
    if (percentage >= 50) return { text: t('tests.average'), color: '#F59E0B' };
    return { text: t('tests.needReview'), color: '#EF4444' };
  };

  // Экран результатов
  if (showResults) {
    const scoreInfo = getScoreMessage();
    const percentage = Math.round((totalCorrect / test.questions.length) * 100);

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsEmoji}>
              {percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '📖'}
            </Text>
            <Text style={[styles.resultsMessage, { color: scoreInfo.color }]}>
              {scoreInfo.text}
            </Text>
          </View>

          <View style={styles.scoreCard}>
            <LinearGradient
              colors={['#8B5CF6', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scoreGradient}
            >
              <Text style={styles.scoreNumber}>{totalCorrect}/{test.questions.length}</Text>
              <Text style={styles.scoreLabel}>{t('tests.correctAnswers')}</Text>
              <View style={styles.scorePercentage}>
                <Text style={styles.percentageText}>{percentage}%</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={[styles.resultsSummary, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
            <View style={styles.summaryItem}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={[styles.summaryValue, { color: colors.text }]}>{totalCorrect}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>{t('tests.correct')}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Ionicons name="close-circle" size={24} color={colors.error} />
              <Text style={[styles.summaryValue, { color: colors.text }]}>{test.questions.length - totalCorrect}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>{t('tests.incorrect')}</Text>
            </View>
          </View>

          <Text style={[styles.reviewTitle, { color: colors.text }]}>{t('tests.yourAnswers')}</Text>

          {test.questions.map((q, idx) => {
            const userAnswer = selectedAnswers[idx];
            const isQuestionCorrect = userAnswer === q.correct;
            
            return (
              <View key={idx} style={[styles.reviewCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
                <View style={styles.reviewHeader}>
                  <View style={[
                    styles.reviewBadge,
                    { backgroundColor: isQuestionCorrect ? colors.successBg : colors.errorBg }
                  ]}>
                    <Ionicons 
                      name={isQuestionCorrect ? 'checkmark' : 'close'} 
                      size={16} 
                      color={isQuestionCorrect ? colors.success : colors.error} 
                    />
                  </View>
                  <Text style={[styles.reviewQuestionNumber, { color: colors.textSecondary }]}>{t('tests.question')} {idx + 1}</Text>
                </View>
                
                <MathContent 
                  content={q.question} 
                  fontSize={15} 
                  textColor={colors.textSecondary}
                />
                
                <View style={[styles.reviewAnswers, { borderTopColor: colors.border }]}>
                  <Text style={[styles.reviewAnswerLabel, { color: colors.textTertiary }]}>{t('tests.yourAnswer')}:</Text>
                  <Text style={[
                    styles.reviewAnswerText,
                    { color: isQuestionCorrect ? colors.success : colors.error }
                  ]}>
                    {userAnswer !== null ? q.options[userAnswer] : t('tests.notAnswered')}
                  </Text>
                  
                  {!isQuestionCorrect && (
                    <>
                      <Text style={[styles.reviewAnswerLabel, { color: colors.textTertiary }]}>{t('tests.correctAnswer')}:</Text>
                      <Text style={[styles.reviewAnswerText, { color: colors.success }]}>
                        {q.options[q.correct]}
                      </Text>
                    </>
                  )}
                  
                  {q.explanation && (
                    <View style={[styles.explanationBox, { backgroundColor: isDark ? '#78350F' : '#FEF3C7' }]}>
                      <Text style={[styles.explanationLabel, { color: isDark ? '#FBBF24' : '#92400E' }]}>{'💡 ' + t('tests.explanation') + ':'}</Text>
                      <MathContent content={q.explanation} fontSize={14} textColor={isDark ? '#FDE68A' : '#4B5563'} />
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          <TouchableOpacity style={[styles.finishButton, { backgroundColor: colors.accent }]} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>{t('common.finish')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Основной экран теста
  const sectionData = PHYSICS_SECTIONS[test.section];
  const difficultyColor = DIFFICULTY_COLORS[test.difficulty as keyof typeof DIFFICULTY_COLORS] || '#6B7280';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Alert.alert(
              t('tests.exitTest'),
              t('tests.exitTestMessage'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('tests.exitButton'), onPress: () => router.back(), style: 'destructive' },
              ]
            );
          }}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{test.title}</Text>
          <View style={styles.headerMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '20' }]}>
              <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                {t(`difficulty.${test.difficulty}`)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Progress */}
      <View style={[styles.progressContainer, { backgroundColor: colors.headerBg }]}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textTertiary }]}>
          {currentQuestion + 1} / {test.questions.length}
        </Text>
      </View>

      {/* Question */}
      <Animated.ScrollView 
        style={[styles.questionContainer, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.questionCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
          <View style={styles.questionHeader}>
            <View style={[styles.questionNumber, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.questionNumberText, { color: colors.accentText }]}>#{currentQuestion + 1}</Text>
            </View>
          </View>
          
          <MathContent 
            content={question.question} 
            fontSize={17} 
            textColor={colors.text}
          />
        </View>

        {/* Options */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentQuestion] === idx;
            const isCorrectOption = idx === question.correct;
            const showCorrectness = isAnswered;
            
            let optionBgColor = colors.card;
            let optionBorderColor = colors.optionBorder;
            let iconName: keyof typeof Ionicons.glyphMap = 'ellipse-outline';
            let iconColor = colors.textMuted;

            if (showCorrectness) {
              if (isCorrectOption) {
                optionBgColor = colors.successBg;
                optionBorderColor = colors.success;
                iconName = 'checkmark-circle';
                iconColor = colors.success;
              } else if (isSelected && !isCorrectOption) {
                optionBgColor = colors.errorBg;
                optionBorderColor = colors.error;
                iconName = 'close-circle';
                iconColor = colors.error;
              }
            } else if (isSelected) {
              optionBgColor = colors.optionSelectedBg;
              optionBorderColor = colors.accent;
              iconName = 'ellipse';
              iconColor = colors.accent;
            }

            return (
              <TouchableOpacity
                key={idx}
                style={[styles.option, { backgroundColor: optionBgColor, borderColor: optionBorderColor }]}
                onPress={() => handleSelectAnswer(idx)}
                disabled={isAnswered}
                activeOpacity={0.7}
              >
                <Ionicons name={iconName} size={24} color={iconColor} />
                <View style={styles.optionContent}>
                  <MathContent content={option} fontSize={15} textColor={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Explanation */}
        {isAnswered && question.explanation && (
          <TouchableOpacity 
            style={styles.explanationToggle}
            onPress={() => setShowExplanation(!showExplanation)}
          >
            <Ionicons 
              name={showExplanation ? 'chevron-up' : 'information-circle'} 
              size={20} 
              color={colors.accentText} 
            />
            <Text style={[styles.explanationToggleText, { color: colors.accentText }]}>
              {showExplanation ? t('tests.hideExplanation') : t('tests.showExplanation')}
            </Text>
          </TouchableOpacity>
        )}

        {showExplanation && question.explanation && (
          <View style={[styles.explanationCard, { backgroundColor: isDark ? '#78350F' : '#FFFBEB', borderColor: isDark ? '#92400E' : '#FDE68A' }]}>
            <View style={styles.explanationHeader}>
              <Ionicons name="bulb" size={20} color={colors.warning} />
              <Text style={[styles.explanationTitle, { color: isDark ? '#FBBF24' : '#92400E' }]}>{t('tests.explanation')}</Text>
            </View>
            <MathContent content={question.explanation} fontSize={14} textColor={isDark ? '#FDE68A' : '#4B5563'} />
          </View>
        )}

        {/* Feedback */}
        {isAnswered && (
          <View style={[
            styles.feedbackCard,
            { backgroundColor: isCorrect ? colors.successBg : colors.errorBg }
          ]}>
            <Ionicons 
              name={isCorrect ? 'checkmark-circle' : 'close-circle'} 
              size={24} 
              color={isCorrect ? colors.success : colors.error} 
            />
            <Text style={[
              styles.feedbackText,
              { color: isCorrect ? (isDark ? '#34D399' : '#065F46') : (isDark ? '#F87171' : '#B91C1C') }
            ]}>
              {isCorrect ? t('tests.correct') : t('tests.incorrect')}
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </Animated.ScrollView>

      {/* Navigation */}
      <View style={[styles.navigationContainer, { backgroundColor: colors.headerBg, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestion === 0 && styles.navButtonDisabled]}
          onPress={handlePrev}
          disabled={currentQuestion === 0}
        >
          <Ionicons name="chevron-back" size={20} color={currentQuestion === 0 ? colors.textMuted : colors.textSecondary} />
          <Text style={[styles.navButtonText, { color: colors.textSecondary }, currentQuestion === 0 && { color: colors.textMuted }]}>
            {t('common.back')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: colors.accent },
            !isAnswered && { backgroundColor: colors.border },
          ]}
          onPress={handleNext}
          disabled={!isAnswered}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion === test.questions.length - 1 ? t('common.finish') : t('common.next')}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerMeta: {
    flexDirection: 'row',
    marginTop: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerPlaceholder: {
    width: 44,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 50,
    textAlign: 'right',
  },
  questionContainer: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  questionNumberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366F1',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  optionSelected: {
    borderColor: '#6366F1',
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
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
  },
  explanationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  explanationToggleText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  explanationCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  explanationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 14,
    marginTop: 16,
    gap: 10,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  navButtonTextDisabled: {
    color: '#D1D5DB',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 6,
  },
  nextButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Results styles
  resultsContainer: {
    padding: 20,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultsEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  resultsMessage: {
    fontSize: 24,
    fontWeight: '700',
  },
  scoreCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  scoreGradient: {
    padding: 28,
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  scorePercentage: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  percentageText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resultsSummary: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#E5E7EB',
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  reviewCard: {
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
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  reviewBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewQuestionNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  reviewAnswers: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  reviewAnswerLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  reviewAnswerText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  explanationBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 6,
  },
  finishButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  finishButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});













