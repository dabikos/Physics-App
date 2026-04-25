import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface GivenItem {
  symbol: string;
  value: string;
  unit: string;
  name: string;
}

interface Solution {
  given?: GivenItem[];
  si_conversion?: string;
  formulas?: string[];
  steps?: string[];
  answer?: string;
}

interface SolutionDisplayProps {
  solution: Solution;
  isCorrect: boolean;
}

const FormulaBox: React.FC<{ formula: string; colors: any }> = ({ formula, colors }) => (
  <View style={[styles.formulaBox, { backgroundColor: colors.isDark ? 'rgba(99,102,241,0.15)' : '#EEF2FF', borderColor: colors.isDark ? 'rgba(99,102,241,0.3)' : '#C7D2FE' }]}>
    <Text style={[styles.formulaText, { color: colors.isDark ? '#A5B4FC' : '#4338CA' }]}>{formula}</Text>
  </View>
);

export const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ solution, isCorrect }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
      <LinearGradient
        colors={isCorrect 
          ? (isDark ? ['#064E3B', '#065F46'] : ['#D1FAE5', '#A7F3D0']) 
          : (isDark ? ['#7F1D1D', '#991B1B'] : ['#FEE2E2', '#FECACA'])}
        style={styles.headerGradient}
      >
        <Ionicons 
          name={isCorrect ? 'checkmark-circle' : 'close-circle'} 
          size={28} 
          color={isCorrect ? (isDark ? '#34D399' : '#059669') : (isDark ? '#FCA5A5' : '#DC2626')} 
        />
        <Text style={[styles.headerText, { color: isCorrect ? (isDark ? '#34D399' : '#059669') : (isDark ? '#FCA5A5' : '#DC2626') }]}>
          {isCorrect ? t('tasks.correctResult') : t('tasks.incorrectResult')}
        </Text>
      </LinearGradient>

      <View style={styles.columnsContainer}>
        {/* Left column - Given and SI */}
        <View style={styles.leftColumn}>
          {solution.given && solution.given.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="clipboard" size={18} color="#6C63FF" />
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('tasks.givenLabel')}</Text>
              </View>
              <View style={[styles.givenContainer, { backgroundColor: isDark ? colors.inputBg : '#F3F4F6' }]}>
                {solution.given.map((item, index) => (
                  <View key={index} style={styles.givenRow}>
                    <View style={[styles.givenSymbol, { backgroundColor: isDark ? 'rgba(99,102,241,0.2)' : '#EEF2FF' }]}>
                      <Text style={[styles.symbolText, { color: isDark ? '#A5B4FC' : '#4338CA' }]}>{item.symbol}</Text>
                    </View>
                    <Text style={[styles.givenEquals, { color: colors.textTertiary }]}>=</Text>
                    <Text style={[styles.givenValue, { color: colors.text }]}>{item.value} {item.unit}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {solution.si_conversion && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="swap-horizontal" size={18} color="#F59E0B" />
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('tasks.siLabel')}</Text>
              </View>
              <View style={[styles.siBox, { backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : '#FEF3C7', borderLeftColor: '#F59E0B' }]}>
                <Text style={[styles.siText, { color: isDark ? '#FCD34D' : '#92400E' }]}>{solution.si_conversion}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Right column - Formulas and Solution */}
        <View style={styles.rightColumn}>
          {solution.formulas && solution.formulas.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="flask" size={18} color="#8B5CF6" />
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('tasks.formulasLabel')}</Text>
              </View>
              <View style={styles.formulasContainer}>
                {solution.formulas.map((formula, index) => (
                  <FormulaBox key={index} formula={formula} colors={{ isDark }} />
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Full width - Solution steps */}
      {solution.steps && solution.steps.length > 0 && (
        <View style={styles.fullSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={18} color="#3B82F6" />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('tasks.solutionLabel')}</Text>
          </View>
          <View style={[styles.stepsContainer, { backgroundColor: isDark ? colors.inputBg : '#F9FAFB' }]}>
            {solution.steps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.textSecondary }]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Answer */}
      {solution.answer && (
        <View style={styles.answerSection}>
          <LinearGradient
            colors={['#6C63FF', '#8B5CF6']}
            style={styles.answerGradient}
          >
            <Text style={styles.answerLabel}>{t('tasks.answerLabel')}</Text>
            <Text style={styles.answerValue}>{solution.answer}</Text>
          </LinearGradient>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
  },
  columnsContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
  },
  leftColumn: {
    flex: 1,
    paddingRight: 8,
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 8,
  },
  section: {
    marginBottom: 16,
  },
  fullSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  givenContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
  },
  givenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  givenSymbol: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 32,
    alignItems: 'center',
  },
  symbolText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4338CA',
    fontStyle: 'italic',
  },
  givenEquals: {
    fontSize: 16,
    color: '#6B7280',
    marginHorizontal: 8,
  },
  givenValue: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  siBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  siText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  formulasContainer: {
    gap: 8,
  },
  formulaBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  formulaText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4338CA',
    fontFamily: 'monospace',
  },
  stepsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  answerSection: {
    padding: 16,
    paddingTop: 0,
  },
  answerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  answerLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  answerValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
