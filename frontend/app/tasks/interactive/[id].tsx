import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Vibration,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { InteractiveTask } from '../../../src/data/interactiveTasks';
import { useInteractiveTasks } from '../../../src/hooks/useInteractiveTasks';
import { NumberInput } from '../../../src/components/NumberInput';
import { useTheme } from '../../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';

// Компонент для отображения текста с формулами
const MathContent: React.FC<{ 
  content: string; 
  textColor?: string;
  fontSize?: number;
}> = ({ content, textColor = '#1F2937', fontSize = 16 }) => {
  const [height, setHeight] = React.useState(60);
  
  // Проверяем есть ли формулы
  const hasFormulas = /\$|\\\(|\\\[|[²³₀₁₂]/.test(content);
  
  if (!hasFormulas) {
    return <Text style={{ fontSize, color: textColor, lineHeight: fontSize * 1.6 }}>{content}</Text>;
  }

  // Конвертируем символы в LaTeX
  const processedContent = content
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/₀/g, '_0')
    .replace(/₁/g, '_1')
    .replace(/₂/g, '_2')
    .replace(/·/g, ' \\cdot ')
    .replace(/×/g, ' \\times ')
    .replace(/÷/g, ' \\div ')
    .replace(/√/g, '\\sqrt')
    .replace(/π/g, '\\pi')
    .replace(/Δ/g, '\\Delta ');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body {
      background: transparent;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: ${fontSize}px;
      line-height: 1.6;
      color: ${textColor};
    }
    .katex { font-size: 1.05em !important; }
    .katex-display { margin: 8px 0 !important; }
  </style>
</head>
<body>
  <div id="content">${processedContent}</div>
  <script>
    renderMathInElement(document.getElementById("content"), {
      delimiters: [
        {left: "$$", right: "$$", display: true},
        {left: "$", right: "$", display: false}
      ],
      throwOnError: false
    });
    setTimeout(() => {
      window.ReactNativeWebView.postMessage(JSON.stringify({ height: document.body.scrollHeight }));
    }, 100);
  </script>
</body>
</html>`;

  return (
    <View style={{ minHeight: height }}>
      <WebView
        source={{ html }}
        style={{ height, backgroundColor: 'transparent' }}
        scrollEnabled={false}
        originWhitelist={['*']}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.height > 0) setHeight(data.height + 5);
          } catch (e) {}
        }}
      />
    </View>
  );
};

// Импортируем тип шага
import { SolutionStep } from '../../../src/data/interactiveTasks';

// Компонент для отображения шагов решения с LaTeX
const SolutionSteps: React.FC<{
  hint?: string;
  steps?: SolutionStep[];
  fullSolution?: string;
  answer?: string;
  isCorrect: boolean;
  attempts: number;
  onHintUsed: () => void;
}> = ({ hint, steps, fullSolution, answer, isCorrect, attempts, onHintUsed }) => {  const { t } = useTranslation();  const { colors: solColors, isDark: solIsDark } = useTheme();  const [showHint, setShowHint] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showFullSolution, setShowFullSolution] = useState(false);

  const canShowHint = attempts >= 1;
  const canShowSteps = attempts >= 2;
  const canShowFullSolution = attempts >= 3 || isCorrect;

  return (
    <View style={[styles.solutionContainer, { backgroundColor: solColors.card }]}>
      <Text style={[styles.solutionTitle, { color: solColors.text }]}>{t('tasks.helpTitle')}</Text>
      
      {/* Подсказка */}
      {hint && canShowHint && (
        <View style={styles.solutionSection}>
          <TouchableOpacity 
            style={[styles.solutionHeader, { backgroundColor: solIsDark ? '#2D2D30' : '#F9FAFB' }]}
            onPress={() => { setShowHint(!showHint); onHintUsed(); }}
          >
            <View style={styles.solutionHeaderLeft}>
              <Ionicons name="bulb" size={20} color="#F59E0B" />
              <Text style={[styles.solutionHeaderText, { color: solColors.text }]}>{t('tasks.hint')}</Text>
            </View>
            <Ionicons name={showHint ? "chevron-up" : "chevron-down"} size={20} color={solColors.textTertiary} />
          </TouchableOpacity>
          {showHint && (
            <View style={[styles.solutionContent, { backgroundColor: solIsDark ? '#3B3520' : '#FEFCE8' }]}>
              <MathContent content={hint} textColor={solIsDark ? '#FDE68A' : '#92400E'} fontSize={15} />
            </View>
          )}
        </View>
      )}

      {/* Пошаговое решение */}
      {steps && steps.length > 0 && canShowSteps && (
        <View style={styles.solutionSection}>
          <TouchableOpacity 
            style={[styles.solutionHeader, { backgroundColor: solIsDark ? '#2D2D30' : '#F9FAFB' }]}
            onPress={() => setShowSteps(!showSteps)}
          >
            <View style={styles.solutionHeaderLeft}>
              <Ionicons name="list-outline" size={20} color="#6C63FF" />
              <Text style={[styles.solutionHeaderText, { color: solColors.text }]}>{t('tasks.stepSolution')}</Text>
            </View>
            <Ionicons name={showSteps ? "chevron-up" : "chevron-down"} size={20} color={solColors.textTertiary} />
          </TouchableOpacity>
          {showSteps && (
            <View style={[styles.solutionContent, { backgroundColor: solIsDark ? '#3B3520' : '#FEFCE8' }]}>
              {steps.slice(0, currentStep + 1).map((step, index) => (
                <View key={step.id || index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    {step.description && (
                      <Text style={[styles.stepDescription, { color: solColors.textTertiary }]}>{step.description}</Text>
                    )}
                    <MathContent content={step.content} textColor={solIsDark ? '#FDE68A' : '#1F2937'} fontSize={14} />
                  </View>
                </View>
              ))}
              {currentStep < steps.length - 1 && (
                <TouchableOpacity 
                  style={[styles.nextStepButton, { backgroundColor: solIsDark ? '#2D2B4E' : '#EEF2FF' }]}
                  onPress={() => setCurrentStep(prev => prev + 1)}
                >
                  <Text style={styles.nextStepText}>{t('tasks.nextStep')}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#6C63FF" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}

      {/* Полное решение */}
      {fullSolution && canShowFullSolution && (
        <View style={styles.solutionSection}>
          <TouchableOpacity 
            style={[styles.solutionHeader, { backgroundColor: solIsDark ? '#2D2D30' : '#F9FAFB' }]}
            onPress={() => setShowFullSolution(!showFullSolution)}
          >
            <View style={styles.solutionHeaderLeft}>
              <Ionicons name="document-text" size={20} color="#10B981" />
              <Text style={[styles.solutionHeaderText, { color: solColors.text }]}>{t('tasks.fullSolution')}</Text>
            </View>
            <Ionicons name={showFullSolution ? "chevron-up" : "chevron-down"} size={20} color={solColors.textTertiary} />
          </TouchableOpacity>
          {showFullSolution && (
            <View style={[styles.solutionContent, { backgroundColor: solIsDark ? '#3B3520' : '#FEFCE8' }]}>
              <MathContent content={fullSolution} textColor={solIsDark ? '#FDE68A' : '#1F2937'} fontSize={14} />
              {answer && (
                <View style={[styles.answerBox, { backgroundColor: solIsDark ? '#1A3A2A' : '#D1FAE5' }]}>
                  <Text style={[styles.answerLabel, { color: solIsDark ? '#6EE7B7' : '#065F46' }]}>{t('tasks.answer')}</Text>
                  <MathContent content={answer} textColor={solIsDark ? '#6EE7B7' : '#065F46'} fontSize={16} />
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default function InteractiveTaskScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { getInteractiveTaskById } = useInteractiveTasks();
  
  const task = id ? getInteractiveTaskById(id) : null;
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [numberInput, setNumberInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  
  const [shakeAnimation] = useState(new Animated.Value(0));
  const [feedbackOpacity] = useState(new Animated.Value(0));
  const [successScale] = useState(new Animated.Value(0));

  const getDifficultyInfo = (difficulty: InteractiveTask['difficulty']) => {
    switch (difficulty) {
      case 'basic': return { label: t('difficulty.basic'), color: '#10B981', emoji: '🟢' };
      case 'standard': return { label: t('difficulty.standard'), color: '#F59E0B', emoji: '🟡' };
      case 'advanced': return { label: t('difficulty.advanced'), color: '#F97316', emoji: '🟠' };
      case 'olympiad': return { label: t('difficulty.olympiad'), color: '#EF4444', emoji: '🔴' };
    }
  };

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
    Vibration.vibrate(100);
  };

  const showSuccessAnimation = () => {
    Animated.spring(successScale, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const showFeedbackAnimation = () => {
    Animated.timing(feedbackOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const checkAnswer = () => {
    if (!task) return;
    
    let correct = false;
    
    if (task.answerType === 'choice') {
      correct = selectedOption === task.correctOptionIndex;
    } else if (task.answerType === 'number') {
      const userValue = parseFloat(numberInput.replace(',', '.'));
      if (!isNaN(userValue) && task.correctValue !== undefined) {
        const tolerance = task.tolerance || 1;
        const diff = Math.abs(userValue - task.correctValue);
        const percentDiff = (diff / task.correctValue) * 100;
        correct = percentDiff <= tolerance;
      }
    }
    
    setAttempts(prev => prev + 1);
    setIsCorrect(correct);
    setShowFeedback(true);
    showFeedbackAnimation();
    
    if (correct) {
      showSuccessAnimation();
      Vibration.vibrate([0, 50, 50, 50]);
    } else {
      shakeInput();
    }
  };

  const retry = () => {
    setIsCorrect(null);
    setShowFeedback(false);
    feedbackOpacity.setValue(0);
    if (task?.answerType === 'choice') {
      setSelectedOption(null);
    }
  };

  const getInputStatus = () => {
    if (!showFeedback) return 'default';
    return isCorrect ? 'correct' : 'incorrect';
  };

  if (!task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('tasks.task')}</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t('common.taskNotFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const difficultyInfo = getDifficultyInfo(task.difficulty);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{task.title}</Text>
        <View style={[styles.attemptsContainer, { backgroundColor: colors.accentLight }]}>
          <Text style={[styles.attemptsText, { color: colors.accentText }]}>{attempts}</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Уровень сложности */}
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyInfo.color + '20' }]}>
            <Text style={styles.difficultyEmoji}>{difficultyInfo.emoji}</Text>
            <Text style={[styles.difficultyText, { color: difficultyInfo.color }]}>
              {difficultyInfo.label}
            </Text>
          </View>

          {/* Условие задачи с LaTeX */}
          <View style={[styles.conditionCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
            <MathContent content={task.condition} textColor={colors.text} fontSize={17} />
          </View>

          {/* Дано */}
          {task.given && task.given.length > 0 && (
            <View style={[styles.givenCard, { backgroundColor: colors.card, borderLeftColor: colors.accent }]}>
              <Text style={[styles.givenTitle, { color: colors.textTertiary }]}>{t('tasks.given')}</Text>
              <View style={styles.givenList}>
                {task.given.map((item, index) => (
                  <View key={index} style={styles.givenItem}>
                    <View style={styles.givenSymbol}>
                      <MathContent content={`$${item.symbol}$`} textColor={colors.text} fontSize={18} />
                    </View>
                    <Text style={[styles.givenEquals, { color: colors.textTertiary }]}>=</Text>
                    <Text style={[styles.givenValue, { color: colors.text }]}>{item.value} {item.unit}</Text>
                    <Text style={[styles.givenName, { color: colors.textTertiary }]}>({item.name})</Text>
                  </View>
                ))}
              </View>
              {task.find && (
                <View style={[styles.findSection, { borderTopColor: colors.border }]}>
                  <Text style={styles.findTitle}>{t('tasks.find')}</Text>
                  <View style={styles.findRow}>
                    <MathContent content={`$${task.find.symbol}$`} textColor="#10B981" fontSize={18} />
                    <Text style={styles.findQuestion}>— ?</Text>
                    <Text style={styles.findName}>({task.find.name})</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Блок ответа */}
          <View style={styles.answerSection}>
            <Text style={[styles.answerLabel, { color: colors.textSecondary }]}>{t('tasks.yourAnswer')}</Text>
            
            <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
              {task.answerType === 'choice' && task.options ? (
                <View style={styles.optionsContainer}>
                  {task.options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isCorrectOption = showFeedback && index === task.correctOptionIndex;
                    const isWrongSelected = showFeedback && isSelected && !isCorrect;
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionButton,
                          { backgroundColor: colors.card, borderColor: colors.optionBorder },
                          isSelected && !showFeedback && [styles.optionSelected, { borderColor: colors.accent, backgroundColor: colors.optionSelectedBg }],
                          isCorrectOption && styles.optionCorrect,
                          isWrongSelected && styles.optionWrong,
                        ]}
                        onPress={() => !showFeedback && setSelectedOption(index)}
                        disabled={showFeedback}
                      >
                        <View style={[
                          styles.optionCircle,
                          { backgroundColor: colors.optionCircleBg },
                          isSelected && !showFeedback && [styles.optionCircleSelected, { backgroundColor: colors.accent }],
                          isCorrectOption && styles.optionCircleCorrect,
                          isWrongSelected && styles.optionCircleWrong,
                        ]}>
                          {isCorrectOption ? (
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                          ) : isWrongSelected ? (
                            <Ionicons name="close" size={16} color="#FFFFFF" />
                          ) : (
                            <Text style={[
                              styles.optionLetter,
                              isSelected && styles.optionLetterSelected,
                            ]}>
                              {String.fromCharCode(65 + index)}
                            </Text>
                          )}
                        </View>
                        <View style={styles.optionTextContainer}>
                          <MathContent content={option} textColor={isCorrectOption ? '#065F46' : isWrongSelected ? '#B91C1C' : colors.text} fontSize={16} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <NumberInput
                  value={numberInput}
                  onChange={setNumberInput}
                  unit={task.unit}
                  disabled={showFeedback && isCorrect === true}
                  status={getInputStatus() as 'default' | 'correct' | 'incorrect'}
                />
              )}
            </Animated.View>
          </View>

          {/* Feedback */}
          {showFeedback && (
            <Animated.View style={[styles.feedbackContainer, { opacity: feedbackOpacity }]}>
              {isCorrect ? (
                <Animated.View style={[
                  styles.feedbackSuccess,
                  { transform: [{ scale: successScale }] }
                ]}>
                  <View style={styles.feedbackIconContainer}>
                    <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                  </View>
                  <Text style={styles.feedbackTitle}>{t('tasks.correctFirst')}</Text>
                  <Text style={styles.feedbackSubtitle}>
                    {attempts === 1 ? t('tasks.firstTry') : t('tasks.attempts', { count: attempts })}
                  </Text>
                </Animated.View>
              ) : (
                <View style={styles.feedbackError}>
                  <View style={styles.feedbackRow}>
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                    <Text style={styles.feedbackErrorText}>{t('tasks.wrongAnswer')}</Text>
                  </View>
                  {attempts >= 1 && !hintUsed && (
                    <Text style={styles.feedbackHint}>{t('tasks.hintAvailable')}</Text>
                  )}
                  <TouchableOpacity style={styles.retryButton} onPress={retry}>
                    <Ionicons name="refresh" size={18} color="#6C63FF" />
                    <Text style={styles.retryButtonText}>{t('tasks.tryAgain')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          )}

          {/* Кнопка проверки */}
          {!showFeedback && (
            <TouchableOpacity
              style={[
                styles.checkButton,
                { backgroundColor: colors.accent },
                (task.answerType === 'choice' && selectedOption === null) && [styles.checkButtonDisabled, { backgroundColor: colors.border }],
                (task.answerType === 'number' && !numberInput.trim()) && [styles.checkButtonDisabled, { backgroundColor: colors.border }],
              ]}
              onPress={checkAnswer}
              disabled={
                (task.answerType === 'choice' && selectedOption === null) ||
                (task.answerType === 'number' && !numberInput.trim())
              }
            >
              <Text style={styles.checkButtonText}>{t('tasks.checkAnswer')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* Пошаговое решение с LaTeX */}
          {(showFeedback || attempts > 0) && (
            <SolutionSteps
              hint={task.hint}
              steps={task.steps}
              fullSolution={task.fullSolution}
              answer={task.answer}
              isCorrect={isCorrect === true}
              attempts={attempts}
              onHintUsed={() => setHintUsed(true)}
            />
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  keyboardView: {
    flex: 1,
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
  attemptsContainer: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  attemptsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
  },
  headerPlaceholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  difficultyEmoji: {
    fontSize: 14,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  conditionCard: {
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
  givenCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6C63FF',
  },
  givenTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  givenList: {
    gap: 8,
  },
  givenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  givenSymbol: {
    minWidth: 30,
  },
  givenEquals: {
    fontSize: 16,
    color: '#6B7280',
    marginHorizontal: 6,
  },
  givenValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  givenName: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  findSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  findTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  findRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  findQuestion: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '500',
    marginLeft: 4,
  },
  findName: {
    fontSize: 13,
    color: '#10B981',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  answerSection: {
    marginBottom: 16,
  },
  answerLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionSelected: {
    borderColor: '#6C63FF',
    backgroundColor: '#F5F3FF',
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
    marginRight: 14,
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
  feedbackContainer: {
    marginBottom: 16,
  },
  feedbackSuccess: {
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  feedbackIconContainer: {
    marginBottom: 12,
  },
  feedbackTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 4,
  },
  feedbackSubtitle: {
    fontSize: 14,
    color: '#047857',
  },
  feedbackError: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    padding: 16,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  feedbackErrorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B91C1C',
  },
  feedbackHint: {
    fontSize: 14,
    color: '#7F1D1D',
    marginBottom: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6C63FF',
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    padding: 18,
    gap: 10,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  checkButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  solutionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  solutionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  solutionSection: {
    marginBottom: 12,
  },
  solutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
  },
  solutionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  solutionHeaderText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  solutionContent: {
    padding: 12,
    backgroundColor: '#FEFCE8',
    borderRadius: 10,
    marginTop: 8,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  nextStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    padding: 10,
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
  },
  nextStepText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C63FF',
  },
  answerBox: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  bottomPadding: {
    height: 40,
  },
});
