import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  FadeInUp,
  ZoomIn,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Test, TestDifficulty } from '../../../src/data/physicsData';
import { usePhysicsData } from '../../../src/hooks/usePhysicsData';
import api from '../../../src/services/api';
import { useAuth } from '../../../src/context/AuthContext';
import { SuccessModal } from '../../../src/components/SuccessModal';
import { MathContent } from '../../../src/components/MathContent';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/context/ThemeContext';

const getDifficultyInfo = (difficulty: TestDifficulty, t: (key: string) => string) => {
  switch (difficulty) {
    case 'basic':
      return { label: t('difficulty.basic'), color: '#10B981', emoji: '🟢' };
    case 'standard':
      return { label: t('difficulty.standard'), color: '#F59E0B', emoji: '🟡' };
    case 'advanced':
      return { label: t('difficulty.advanced'), color: '#F97316', emoji: '🟠' };
    case 'olympiad':
      return { label: t('difficulty.olympiad'), color: '#EF4444', emoji: '🔴' };
    default:
      return { label: t('difficulty.basic'), color: '#10B981', emoji: '🟢' };
  }
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AnimatedScoreRing = ({
  score,
  color,
  trackColor,
  backgroundColor,
}: {
  score: number;
  color: string;
  trackColor: string;
  backgroundColor: string;
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const progress = useSharedValue(0);
  const size = 132;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(score / 100, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });

    const duration = 900;
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextValue = Math.min(score, Math.round((elapsed / duration) * score));
      setDisplayScore(nextValue);
      if (elapsed >= duration) {
        setDisplayScore(score);
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [progress, score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={[styles.scoreRingContainer, { backgroundColor }]}>
      <Svg width={size} height={size} style={styles.scoreRingSvg}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={0.45}
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          originX={center}
          originY={center}
          rotation="-90"
        />
      </Svg>
      <View style={styles.scoreRingCenter}>
        <Text style={[styles.scoreText, { color }]}>{displayScore}%</Text>
      </View>
    </View>
  );
};

export default function TestsSectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { section, subsection } = useLocalSearchParams<{ section: string; subsection: string }>();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { PHYSICS_SECTIONS, getTestsBySection } = usePhysicsData();
  
  const sectionData = section ? PHYSICS_SECTIONS[section] : null;
  const subsectionData = sectionData?.subsections.find((item) => item.id === subsection);
  const localTests = section ? getTestsBySection(section) : [];
  const [remoteTests, setRemoteTests] = useState<Test[]>([]);
  const tests = remoteTests.length > 0 ? remoteTests : localTests;

  const { user } = useAuth();
  const [assignedTests, setAssignedTests] = useState<Test[]>([]);
  
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const loadAssignedTests = async () => {
      if (!user || user.role !== 'student') return;
      try {
        const response = await api.get('/assigned-tests');
        const items = Array.isArray(response.data) ? response.data : [];
        const mapped: Test[] = items.map((t: any) => ({
          id: t.id,
          section: t.section || section || 'mechanics',
          title: t.title || '????',
          difficulty: 'standard',
          questions: t.questions || [],
          time_limit: t.time_limit || 600,
        }));
        setAssignedTests(mapped);
      } catch (error) {
        console.log('Assigned tests load error:', error);
      }
    };

    loadAssignedTests();
  }, [user, section]);

  useEffect(() => {
    let cancelled = false;

    const loadPracticeTests = async () => {
      if (!section) {
        setRemoteTests([]);
        return;
      }

      try {
        const response = await api.get('/practice/tests', {
          params: { section, subsection },
        });
        const items = Array.isArray(response.data?.items) ? response.data.items : [];
        const mapped: Test[] = items.map((item: any) => ({
          id: item.id,
          section: item.section || item.section_id || section,
          title: item.title || 'Тест',
          difficulty: (item.difficulty || 'basic') as TestDifficulty,
          questions: Array.isArray(item.questions) ? item.questions : [],
          time_limit: item.time_limit || 300,
        })).filter((item: Test) => item.questions.length > 0);

        if (!cancelled) {
          setRemoteTests(mapped);
        }
      } catch (error) {
        console.log('Practice tests load error:', error);
        if (!cancelled) {
          setRemoteTests([]);
        }
      }
    };

    loadPracticeTests();

    return () => {
      cancelled = true;
    };
  }, [section, subsection]);

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

  const submitTestResult = useCallback(async () => {
    if (!selectedTest) return;
    try {
      await api.post(`/tests/${selectedTest.id}/submit`, {
        answers,
        source: 'mobile',
      });
    } catch (error) {
      console.log('Test submit error:', error);
    }
  }, [answers, selectedTest]);

  const calculateLocalResults = useCallback(() => {
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
  }, [answers, selectedTest]);

  const finishTest = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTestStarted(false);
    setTestFinished(true);
    calculateLocalResults();
    await submitTestResult();
    setShowSuccessModal(true);
  }, [calculateLocalResults, submitTestResult]);

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
  }, [finishTest, testStarted, timeLeft]);

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

  if (!sectionData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('tests.title')}</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t('common.sectionNotFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Test results screen
  if (testFinished && results) {
    const difficultyInfo = selectedTest ? getDifficultyInfo(selectedTest.difficulty, t) : null;
    const resultColor = results.score >= 70 ? colors.success : results.score >= 50 ? colors.warning : colors.error;
    const resultBg = results.score >= 70 ? colors.successBg : results.score >= 50 ? colors.warningBg : colors.errorBg;
    
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={resetTest}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('tests.results')}</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
          <Animated.View
            entering={ZoomIn.duration(420).springify().damping(14)}
            style={[styles.resultsCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}
          >
            <AnimatedScoreRing
              score={results.score}
              color={resultColor}
              trackColor={colors.border}
              backgroundColor={resultBg}
            />
            <Text style={[styles.scoreLabel, { color: colors.textTertiary }]}>
              {t('tests.correctAnswers')}: {results.correct_count} {t('tests.of')} {results.total}
            </Text>
            {difficultyInfo && (
              <View style={[styles.difficultyBadgeLarge, { backgroundColor: difficultyInfo.color + '20' }]}>
                <Text style={styles.difficultyEmoji}>{difficultyInfo.emoji}</Text>
                <Text style={[styles.difficultyLabelLarge, { color: difficultyInfo.color }]}>
                  {difficultyInfo.label}
                </Text>
              </View>
            )}
            <Text style={[styles.scoreMessage, { color: colors.text }]}>
              {results.score >= 70 ? t('tests.passed') : t('tests.failed')}
            </Text>
          </Animated.View>

          <Animated.Text
            entering={FadeInUp.delay(220).duration(360)}
            style={[styles.detailsTitle, { color: colors.text }]}
          >
            {t('tests.results')}
          </Animated.Text>
          {results.results?.map((r: any, i: number) => (
            <Animated.View
              key={i}
              entering={FadeInUp.delay(280 + Math.min(i, 8) * 45).duration(340)}
              style={[
              styles.resultItem,
              { backgroundColor: colors.card, borderLeftColor: r.correct ? colors.success : colors.error }
            ]}>
              <View style={styles.resultHeader}>
                <Ionicons
                  name={r.correct ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={r.correct ? colors.success : colors.error}
                />
                <Text style={[styles.resultQuestion, { color: colors.textSecondary }]} numberOfLines={2}>
                  {r.question}
                </Text>
              </View>
            </Animated.View>
          ))}

          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.accent }]} onPress={resetTest}>
            <Text style={styles.retryButtonText}>{t('tests.backToTests')}</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Active test screen
  if (testStarted && selectedTest) {
    const currentQuestion = selectedTest.questions[currentQuestionIndex];
    const difficultyInfo = getDifficultyInfo(selectedTest.difficulty, t);

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Alert.alert(t('tests.exitTest'), t('tests.progressLost'), [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('tests.exitButton'), style: 'destructive', onPress: resetTest },
              ]);
            }}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.timerContainer, { backgroundColor: colors.inputBg }]}>
            <Ionicons name="time" size={18} color={timeLeft < 60 ? colors.error : colors.textTertiary} />
            <Text style={[styles.timerText, { color: colors.textTertiary }, timeLeft < 60 && styles.timerTextWarning]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
          <Text style={[styles.questionCounter, { color: colors.accentText }]}>
            {currentQuestionIndex + 1}/{selectedTest.questions.length}
          </Text>
        </View>

        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { 
                width: `${((currentQuestionIndex + 1) / selectedTest.questions.length) * 100}%`,
                backgroundColor: difficultyInfo.color
              },
            ]}
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
          <View style={[styles.questionCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
            <View style={styles.questionContainer}>
              <MathContent content={currentQuestion.question} fontSize={18} textColor={colors.text} />
            </View>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    { backgroundColor: colors.optionBg, borderColor: colors.optionBorder },
                    answers[currentQuestionIndex] === index && [styles.optionSelected, { borderColor: colors.accent, backgroundColor: colors.optionSelectedBg }],
                  ]}
                  onPress={() => selectAnswer(index)}
                >
                  <View style={[
                    styles.optionCircle,
                    { backgroundColor: colors.optionCircleBg },
                    answers[currentQuestionIndex] === index && [styles.optionCircleSelected, { backgroundColor: colors.accent }],
                  ]}>
                    <Text style={[
                      styles.optionLetter,
                      { color: colors.textTertiary },
                      answers[currentQuestionIndex] === index && styles.optionLetterSelected,
                    ]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <View style={styles.optionTextContainer}>
                    <MathContent content={option} fontSize={15} textColor={colors.text} />
                  </View>
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
              <Ionicons name="arrow-back" size={20} color={currentQuestionIndex === 0 ? colors.textMuted : colors.accent} />
              <Text style={[styles.navButtonText, { color: colors.accent }, currentQuestionIndex === 0 && { color: colors.textMuted }]}>
                {t('common.back')}
              </Text>
            </TouchableOpacity>

            {currentQuestionIndex === selectedTest.questions.length - 1 ? (
              <TouchableOpacity style={styles.finishButton} onPress={finishTest}>
                <Text style={styles.finishButtonText}>{t('common.finish')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.nextButton, { backgroundColor: colors.accent }]} onPress={nextQuestion}>
                <Text style={styles.nextButtonText}>{t('common.next')}</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        <SuccessModal
          visible={showSuccessModal}
          onClose={handleCloseSuccessModal}
          title={t('tests.completed')}
          subtitle={selectedTest?.title}
          score={results?.score}
          type="test"
        />
      </SafeAreaView>
    );
  }

  const assignedForSection = assignedTests.filter(t => !t.section || t.section === section);
  const testsByDifficulty = {
    basic: tests.filter(t => t.difficulty === 'basic'),
    standard: tests.filter(t => t.difficulty === 'standard'),
    advanced: tests.filter(t => t.difficulty === 'advanced'),
    olympiad: tests.filter(t => t.difficulty === 'olympiad'),
  };

  // Tests list screen
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{subsectionData?.name || sectionData.name}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.statsText, { color: colors.textTertiary }]}>{t('tests.totalTests', { count: tests.length })}</Text>
        </View>

        {tests.length === 0 && assignedForSection.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t('tests.testsInDev')}</Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>{t('tests.testsInDevMessage')}</Text>
          </View>
        ) : (
          <>
            {assignedForSection.length > 0 && (
              <View style={styles.difficultySection}>
                <View style={styles.difficultySectionHeader}>
                  <Ionicons name="person-circle-outline" size={20} color="#6366F1" />
                  <Text style={[styles.difficultySectionTitle, { color: '#6366F1' }]}>
                    Назначенные тесты ({assignedForSection.length})
                  </Text>
                </View>
                {assignedForSection.map((test) => renderTestCard(test))}
              </View>
            )}

            <View style={styles.testsList}>
              {tests.map((test) => renderTestCard(test))}
            </View>

            {/* Basic tests */}
            {false && testsByDifficulty.basic.length > 0 && (
              <View style={styles.difficultySection}>
                <View style={styles.difficultySectionHeader}>
                  <Text style={styles.difficultyEmoji}>🟢</Text>
                  <Text style={[styles.difficultySectionTitle, { color: '#10B981' }]}>
                    {t('difficulty.basic')} ({testsByDifficulty.basic.length})
                  </Text>
                </View>
                {testsByDifficulty.basic.map((test) => renderTestCard(test))}
              </View>
            )}

            {/* Standard tests */}
            {false && testsByDifficulty.standard.length > 0 && (
              <View style={styles.difficultySection}>
                <View style={styles.difficultySectionHeader}>
                  <Text style={styles.difficultyEmoji}>🟡</Text>
                  <Text style={[styles.difficultySectionTitle, { color: '#F59E0B' }]}>
                    {t('difficulty.standard')} ({testsByDifficulty.standard.length})
                  </Text>
                </View>
                {testsByDifficulty.standard.map((test) => renderTestCard(test))}
              </View>
            )}

            {/* Advanced tests */}
            {false && testsByDifficulty.advanced.length > 0 && (
              <View style={styles.difficultySection}>
                <View style={styles.difficultySectionHeader}>
                  <Text style={styles.difficultyEmoji}>🟠</Text>
                  <Text style={[styles.difficultySectionTitle, { color: '#F97316' }]}>
                    {t('difficulty.advanced')} ({testsByDifficulty.advanced.length})
                  </Text>
                </View>
                {testsByDifficulty.advanced.map((test) => renderTestCard(test))}
              </View>
            )}

            {/* Olympiad tests */}
            {false && testsByDifficulty.olympiad.length > 0 && (
              <View style={styles.difficultySection}>
                <View style={styles.difficultySectionHeader}>
                  <Text style={styles.difficultyEmoji}>🔴</Text>
                  <Text style={[styles.difficultySectionTitle, { color: '#EF4444' }]}>
                    {t('difficulty.olympiad')} ({testsByDifficulty.olympiad.length})
                  </Text>
                </View>
                {testsByDifficulty.olympiad.map((test) => renderTestCard(test))}
              </View>
            )}
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );

  function renderTestCard(test: Test) {
    const difficultyInfo = getDifficultyInfo(test.difficulty, t);
    
    return (
      <TouchableOpacity
        key={test.id}
        style={[styles.testCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor, borderLeftColor: difficultyInfo.color }]}
        onPress={() => startTest(test)}
        activeOpacity={0.8}
      >
        <View style={styles.testContent}>
          <View style={styles.testMainInfo}>
            <Text style={[styles.testTitle, { color: colors.text }]}>{test.title}</Text>
            <View style={styles.testMeta}>
              <View style={[styles.testDifficultyBadge, { backgroundColor: difficultyInfo.color + '18' }]}>
                <Text style={[styles.testDifficultyText, { color: difficultyInfo.color }]}>
                  {difficultyInfo.label}
                </Text>
              </View>
              <View style={styles.testMetaItem}>
                <Ionicons name="help-circle-outline" size={14} color={colors.textTertiary} />
                <Text style={[styles.testMetaText, { color: colors.textTertiary }]}>{test.questions.length} {t('tests.questions')}</Text>
              </View>
              <View style={styles.testMetaItem}>
                <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                <Text style={[styles.testMetaText, { color: colors.textTertiary }]}>{Math.floor(test.time_limit / 60)} {t('tests.minutes')}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.startButton, { backgroundColor: difficultyInfo.color }]}>
            <Ionicons name="play" size={18} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
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
  difficultySection: {
    marginBottom: 20,
  },
  difficultySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  difficultySectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  difficultyEmoji: {
    fontSize: 18,
  },
  testsList: {
    gap: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  testContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testMainInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  testMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  testDifficultyBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  testDifficultyText: {
    fontSize: 11,
    fontWeight: '800',
  },
  testMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  testMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  startButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  questionContainer: {
    marginBottom: 24,
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
  optionTextContainer: {
    flex: 1,
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
  scoreRingContainer: {
    width: 148,
    height: 148,
    borderRadius: 74,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreRingSvg: {
    position: 'absolute',
  },
  scoreRingCenter: {
    width: 108,
    height: 108,
    borderRadius: 54,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 12,
  },
  difficultyBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  difficultyLabelLarge: {
    fontSize: 14,
    fontWeight: '600',
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


