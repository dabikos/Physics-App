import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePhysicsData } from '../../src/hooks/usePhysicsData';
import type { Formula } from '../../src/data/physicsData';
import { MathText } from '../../src/components/MathText';
import { useTheme } from '../../src/context/ThemeContext';
import api from '../../src/services/api';

const convertToLatex = (formula: string): string => {
  let result = formula;

  result = result
    .replace(/\u0394([a-zA-Z0-9])/g, '\\Delta $1')
    .replace(/\u0394/g, '\\Delta')
    .replace(/\u03BD([a-zA-Z0-9])/g, '\\nu $1')
    .replace(/\u03BD/g, '\\nu')
    .replace(/\u03BB([a-zA-Z0-9])/g, '\\lambda $1')
    .replace(/\u03BB/g, '\\lambda')
    .replace(/\u03C0([a-zA-Z0-9])/g, '\\pi $1')
    .replace(/\u03C0/g, '\\pi')
    .replace(/\u03B1([a-zA-Z0-9])/g, '\\alpha $1')
    .replace(/\u03B1/g, '\\alpha')
    .replace(/\u03B2([a-zA-Z0-9])/g, '\\beta $1')
    .replace(/\u03B2/g, '\\beta')
    .replace(/\u03B3([a-zA-Z0-9])/g, '\\gamma $1')
    .replace(/\u03B3/g, '\\gamma')
    .replace(/\u03B4([a-zA-Z0-9])/g, '\\delta $1')
    .replace(/\u03B4/g, '\\delta')
    .replace(/\u03B8([a-zA-Z0-9])/g, '\\theta $1')
    .replace(/\u03B8/g, '\\theta')
    .replace(/\u03BC([a-zA-Z0-9])/g, '\\mu $1')
    .replace(/\u03BC/g, '\\mu')
    .replace(/\u03C1([a-zA-Z0-9])/g, '\\rho $1')
    .replace(/\u03C1/g, '\\rho')
    .replace(/\u03C9([a-zA-Z0-9])/g, '\\omega $1')
    .replace(/\u03C9/g, '\\omega')
    .replace(/\u03A9([a-zA-Z0-9])/g, '\\Omega $1')
    .replace(/\u03A9/g, '\\Omega')
    .replace(/\u03A3([a-zA-Z0-9])/g, '\\Sigma $1')
    .replace(/\u03A3/g, '\\Sigma')
    .replace(/\u2211/g, '\\sum')
    .replace(/\u222B/g, '\\int')
    .replace(/\u221E/g, '\\infty')
    .replace(/\u2192/g, '\\rightarrow');

  result = result.replace(/\u221A\(([^)]+)\)/g, (match, expr) => {
    const inner = expr.replace(/\//g, ' \\div ');
    return `\\sqrt{${inner}}`;
  });

  result = result.replace(/([a-zA-Z0-9_]+)\s*\/\s*([a-zA-Z0-9_]+)/g, (match, num, den) => {
    if (match.includes('\\sqrt') || match.includes('\\frac') || match.includes('\\cdot')) {
      return match;
    }
    if (num.includes('\\') || den.includes('\\')) {
      return match;
    }
    return `\\frac{${num}}{${den}}`;
  });

  result = result.replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, (match, num, den) => {
    if (match.includes('\\sqrt') || match.includes('\\frac')) {
      return match;
    }
    if (num.includes('\\') || den.includes('\\')) {
      return match;
    }
    return `\\frac{${num}}{${den}}`;
  });

  result = result
    .replace(/\u00B2/g, '^2')
    .replace(/\u00B3/g, '^3')
    .replace(/\u2074/g, '^4');

  result = result
    .replace(/\u2080/g, '_0')
    .replace(/\u2081/g, '_1')
    .replace(/\u2082/g, '_2')
    .replace(/\u2083/g, '_3');

  result = result
    .replace(/\u00B7/g, ' \\cdot ')
    .replace(/\u00D7/g, ' \\times ')
    .replace(/\u00F7/g, ' \\div ');

  result = result.replace(/\bcos\b/g, '\\cos');
  result = result.replace(/\bsin\b/g, '\\sin');

  return result;
};


// Компонент для отображения LaTeX формулы
const FormulaDisplay: React.FC<{
  formula: string;
  color?: string;
  fontSize?: number;
  backgroundColor?: string;
}> = ({ formula, color = '#FFFFFF', fontSize = 28, backgroundColor = 'transparent' }) => {
  if (!formula || !formula.trim()) {
    return (
      <View style={{ minHeight: 60, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color, fontSize, fontWeight: '600' }}>{formula || ''}</Text>
      </View>
    );
  }

  const latexFormula = convertToLatex(formula);
  const content = latexFormula.includes('$') ? latexFormula : `$$${latexFormula}$$`;

  return (
    <View style={{ width: '100%' }}>
      <MathText
        content={content}
        textColor={color}
        fontSize={fontSize}
        backgroundColor={backgroundColor}
      />
    </View>
  );
};
const VariableItem: React.FC<{ variable: string; meaning: string; colors: any }> = ({ variable, meaning, colors }) => {
  const content = `$${convertToLatex(variable)}$`;
  return (
    <View style={styles.variableRow}>
      <View style={[styles.variableBadge, { backgroundColor: colors.accentLight }]}>
        <MathText content={content} textColor={colors.accentText} fontSize={18} backgroundColor="transparent" />
      </View>
      <Text style={[styles.variableMeaning, { color: colors.textSecondary }]}>{meaning}</Text>
    </View>
  );
};
export default function FormulaDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { getFormulaById } = usePhysicsData();
  const [remoteFormula, setRemoteFormula] = useState<Formula | null>(null);
  const [loading, setLoading] = useState(true);
  
  const localFormula = id ? getFormulaById(id) : null;

  useEffect(() => {
    let cancelled = false;

    const loadFormula = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(`/formulas/${id}`);
        const item = response.data?.item || null;
        if (!cancelled) setRemoteFormula(item);
      } catch (error) {
        console.log('Formula detail load error:', error);
        if (!cancelled) setRemoteFormula(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadFormula();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const formula = remoteFormula || localFormula;

  if (!formula && loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('formulas.title')}</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!formula) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('formulas.title')}</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="flask-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.notFoundTitle, { color: colors.textTertiary }]}>{t('formulas.title')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {formula.name}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} style={styles.content}>
        {/* Главная формула с LaTeX */}
        <View style={styles.formulaCard}>
          <FormulaDisplay 
            formula={formula.formula} 
            color="#FFFFFF" 
            fontSize={32}
            backgroundColor="transparent"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={22} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('formulas.description')}</Text>
          </View>
          <View style={[styles.sectionContent, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>{formula.description}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={22} color="#E74C3C" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('formulas.variables')}</Text>
          </View>
          <View style={[styles.variablesContainer, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
            {Object.entries(formula.variables).map(([variable, meaning]) => (
              <VariableItem key={variable} variable={variable} meaning={meaning} colors={colors} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube" size={22} color="#1ABC9C" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('formulas.unit')}</Text>
          </View>
          <View style={[styles.sectionContent, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
            <Text style={styles.unitText}>{formula.unit}</Text>
          </View>
        </View>

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
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerPlaceholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formulaCard: {
    backgroundColor: '#6C63FF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 100,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  descriptionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  variablesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  variableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  variableBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 60,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  variableMeaning: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  unitText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1ABC9C',
  },
  bottomPadding: {
    height: 40,
  },
});


