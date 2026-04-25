import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SolutionStep } from '../data/interactiveTasks';

// Включаем LayoutAnimation для Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  hint: string;
  steps: SolutionStep[];
  fullSolution: string;
  answer: string;
  isCorrect: boolean;
  attempts: number;
  onHintUsed?: () => void;
}

export function StepByStepSolution({
  hint,
  steps,
  fullSolution,
  answer,
  isCorrect,
  attempts,
  onHintUsed,
}: Props) {
  const [showHint, setShowHint] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [showFullSolution, setShowFullSolution] = useState(false);
  
  // Анимации
  const [hintOpacity] = useState(new Animated.Value(0));
  const [stepAnimations] = useState(steps.map(() => new Animated.Value(0)));

  // Условия разблокировки
  const canShowHint = attempts >= 1 || isCorrect;
  const canShowSteps = attempts >= 2 || isCorrect;
  const canShowFullSolution = attempts >= 3 || isCorrect;

  // Анимация появления подсказки
  useEffect(() => {
    if (showHint) {
      Animated.timing(hintOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      onHintUsed?.();
    }
  }, [hintOpacity, onHintUsed, showHint]);

  // Анимация появления шага
  const animateStep = (index: number) => {
    Animated.spring(stepAnimations[index], {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const toggleHint = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowHint(!showHint);
  };

  const showNextStep = () => {
    if (visibleSteps < steps.length) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setVisibleSteps(prev => prev + 1);
      animateStep(visibleSteps);
    }
  };

  const toggleFullSolution = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFullSolution(!showFullSolution);
  };

  const getStepTypeIcon = (type: SolutionStep['type']) => {
    switch (type) {
      case 'formula': return 'flask';
      case 'substitution': return 'create';
      case 'calculation': return 'calculator';
      case 'text': return 'text';
      default: return 'ellipse';
    }
  };

  const getStepTypeColor = (type: SolutionStep['type']) => {
    switch (type) {
      case 'formula': return '#8B5CF6';
      case 'substitution': return '#F59E0B';
      case 'calculation': return '#10B981';
      case 'text': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      {/* Заголовок секции решения */}
      <View style={styles.sectionHeader}>
        <Ionicons name="bulb" size={22} color="#F59E0B" />
        <Text style={styles.sectionTitle}>Решение</Text>
        {isCorrect && (
          <View style={styles.unlockedBadge}>
            <Ionicons name="lock-open" size={14} color="#10B981" />
            <Text style={styles.unlockedText}>Разблокировано</Text>
          </View>
        )}
      </View>

      {/* Уровень 1: Подсказка */}
      <View style={styles.levelContainer}>
        <TouchableOpacity
          style={[
            styles.levelButton,
            !canShowHint && styles.levelButtonLocked,
            showHint && styles.levelButtonActive,
          ]}
          onPress={toggleHint}
          disabled={!canShowHint}
        >
          <View style={styles.levelButtonContent}>
            <View style={[styles.levelIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons 
                name={canShowHint ? (showHint ? "eye" : "eye-off") : "lock-closed"} 
                size={18} 
                color="#F59E0B" 
              />
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>Подсказка</Text>
              <Text style={styles.levelSubtitle}>
                {canShowHint ? 'Намёк на решение' : 'Сделайте попытку'}
              </Text>
            </View>
            {canShowHint && (
              <Ionicons 
                name={showHint ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#9CA3AF" 
              />
            )}
          </View>
        </TouchableOpacity>
        
        {showHint && (
          <Animated.View style={[styles.hintContent, { opacity: hintOpacity }]}>
            <View style={styles.hintBox}>
              <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
              <Text style={styles.hintText}>{hint}</Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Уровень 2: Пошаговое решение */}
      <View style={styles.levelContainer}>
        <View style={[
          styles.levelHeader,
          !canShowSteps && styles.levelHeaderLocked,
        ]}>
          <View style={[styles.levelIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons 
              name={canShowSteps ? "list" : "lock-closed"} 
              size={18} 
              color="#3B82F6" 
            />
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>Пошаговое решение</Text>
            <Text style={styles.levelSubtitle}>
              {canShowSteps 
                ? `${visibleSteps}/${steps.length} шагов показано` 
                : 'Сделайте 2 попытки'}
            </Text>
          </View>
        </View>

        {canShowSteps && (
          <View style={styles.stepsContainer}>
            {steps.slice(0, visibleSteps).map((step, index) => (
              <Animated.View
                key={step.id}
                style={[
                  styles.stepItem,
                  {
                    opacity: stepAnimations[index],
                    transform: [{
                      translateY: stepAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    }],
                  },
                ]}
              >
                <View style={[
                  styles.stepIconContainer,
                  { backgroundColor: getStepTypeColor(step.type) + '20' }
                ]}>
                  <Ionicons 
                    name={getStepTypeIcon(step.type) as any}
                    size={16}
                    color={getStepTypeColor(step.type)}
                  />
                </View>
                <View style={styles.stepContent}>
                  {step.description && (
                    <Text style={styles.stepDescription}>{step.description}</Text>
                  )}
                  <Text style={[
                    styles.stepText,
                    step.type === 'formula' && styles.formulaText,
                    step.type === 'calculation' && styles.calculationText,
                  ]}>
                    {step.content}
                  </Text>
                </View>
              </Animated.View>
            ))}

            {visibleSteps < steps.length && (
              <TouchableOpacity
                style={styles.showStepButton}
                onPress={showNextStep}
              >
                <View style={styles.showStepButtonContent}>
                  <Ionicons name="add-circle" size={20} color="#3B82F6" />
                  <Text style={styles.showStepButtonText}>
                    Показать шаг {visibleSteps + 1}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Уровень 3: Полное решение */}
      <View style={styles.levelContainer}>
        <TouchableOpacity
          style={[
            styles.levelButton,
            !canShowFullSolution && styles.levelButtonLocked,
            showFullSolution && styles.levelButtonActive,
          ]}
          onPress={toggleFullSolution}
          disabled={!canShowFullSolution}
        >
          <View style={styles.levelButtonContent}>
            <View style={[styles.levelIcon, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons 
                name={canShowFullSolution ? "document-text" : "lock-closed"} 
                size={18} 
                color="#10B981" 
              />
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>Полное решение</Text>
              <Text style={styles.levelSubtitle}>
                {canShowFullSolution ? 'Развёрнутый ответ' : 'Сделайте 3 попытки'}
              </Text>
            </View>
            {canShowFullSolution && (
              <Ionicons 
                name={showFullSolution ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#9CA3AF" 
              />
            )}
          </View>
        </TouchableOpacity>

        {showFullSolution && (
          <View style={styles.fullSolutionContent}>
            <View style={styles.fullSolutionBox}>
              <Text style={styles.fullSolutionText}>{fullSolution}</Text>
            </View>
            <View style={styles.answerBox}>
              <Text style={styles.answerLabel}>Ответ:</Text>
              <Text style={styles.answerValue}>{answer}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  unlockedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  levelContainer: {
    marginBottom: 12,
  },
  levelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  levelButtonLocked: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  levelButtonActive: {
    borderColor: '#6C63FF',
    backgroundColor: '#F5F3FF',
  },
  levelButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  levelHeaderLocked: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  levelIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  levelSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  hintContent: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  hintBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  stepsContainer: {
    marginTop: 12,
    paddingLeft: 12,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  formulaText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B5CF6',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  calculationText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#10B981',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  showStepButton: {
    marginTop: 4,
  },
  showStepButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
    gap: 8,
  },
  showStepButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  fullSolutionContent: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  fullSolutionBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  fullSolutionText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  answerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  answerLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  answerValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

















