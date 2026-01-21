import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

const FormulaBox: React.FC<{ formula: string }> = ({ formula }) => (
  <View style={styles.formulaBox}>
    <Text style={styles.formulaText}>{formula}</Text>
  </View>
);

export const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ solution, isCorrect }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isCorrect ? ['#D1FAE5', '#A7F3D0'] : ['#FEE2E2', '#FECACA']}
        style={styles.headerGradient}
      >
        <Ionicons 
          name={isCorrect ? 'checkmark-circle' : 'close-circle'} 
          size={28} 
          color={isCorrect ? '#059669' : '#DC2626'} 
        />
        <Text style={[styles.headerText, { color: isCorrect ? '#059669' : '#DC2626' }]}>
          {isCorrect ? 'Правильно!' : 'Неправильно'}
        </Text>
      </LinearGradient>

      <View style={styles.columnsContainer}>
        {/* Left column - Given and SI */}
        <View style={styles.leftColumn}>
          {solution.given && solution.given.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="clipboard" size={18} color="#6C63FF" />
                <Text style={styles.sectionTitle}>Дано</Text>
              </View>
              <View style={styles.givenContainer}>
                {solution.given.map((item, index) => (
                  <View key={index} style={styles.givenRow}>
                    <View style={styles.givenSymbol}>
                      <Text style={styles.symbolText}>{item.symbol}</Text>
                    </View>
                    <Text style={styles.givenEquals}>=</Text>
                    <Text style={styles.givenValue}>{item.value} {item.unit}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {solution.si_conversion && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="swap-horizontal" size={18} color="#F59E0B" />
                <Text style={styles.sectionTitle}>СИ</Text>
              </View>
              <View style={styles.siBox}>
                <Text style={styles.siText}>{solution.si_conversion}</Text>
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
                <Text style={styles.sectionTitle}>Формулы</Text>
              </View>
              <View style={styles.formulasContainer}>
                {solution.formulas.map((formula, index) => (
                  <FormulaBox key={index} formula={formula} />
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
            <Text style={styles.sectionTitle}>Решение</Text>
          </View>
          <View style={styles.stepsContainer}>
            {solution.steps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
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
            <Text style={styles.answerLabel}>Ответ:</Text>
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
