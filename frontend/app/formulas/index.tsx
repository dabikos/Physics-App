import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePhysicsData } from '../../src/hooks/usePhysicsData';
import { MathText } from '../../src/components/MathText';
import { useFavorites } from '../../src/hooks/useFavorites';
import { useTheme } from '../../src/context/ThemeContext';

// Компонент для красивого отображения формулы в LaTeX
const convertToLatex = (formula: string): string => {
    let result = formula;
    
    // ВАЖНО: Сначала заменяем греческие буквы
    // Добавляем пробелы после них, если следующая буква/цифра (чтобы LaTeX правильно разделил команду и переменную)
    result = result
      .replace(/Δ([a-zA-Z0-9])/g, '\\Delta $1')  // Delta перед буквой/цифрой
      .replace(/Δ/g, '\\Delta')                   // Delta в остальных случаях
      .replace(/ν([a-zA-Z0-9])/g, '\\nu $1')      // nu перед буквой/цифрой
      .replace(/ν/g, '\\nu')                       // nu в остальных случаях
      .replace(/λ([a-zA-Z0-9])/g, '\\lambda $1') // lambda перед буквой/цифрой
      .replace(/λ/g, '\\lambda')                   // lambda в остальных случаях
      .replace(/π([a-zA-Z0-9])/g, '\\pi $1')
      .replace(/π/g, '\\pi')
      .replace(/α([a-zA-Z0-9])/g, '\\alpha $1')
      .replace(/α/g, '\\alpha')
      .replace(/β([a-zA-Z0-9])/g, '\\beta $1')
      .replace(/β/g, '\\beta')
      .replace(/γ([a-zA-Z0-9])/g, '\\gamma $1')
      .replace(/γ/g, '\\gamma')
      .replace(/δ([a-zA-Z0-9])/g, '\\delta $1')
      .replace(/δ/g, '\\delta')
      .replace(/θ([a-zA-Z0-9])/g, '\\theta $1')
      .replace(/θ/g, '\\theta')
      .replace(/μ([a-zA-Z0-9])/g, '\\mu $1')
      .replace(/μ/g, '\\mu')
      .replace(/ρ([a-zA-Z0-9])/g, '\\rho $1')
      .replace(/ρ/g, '\\rho')
      .replace(/ω([a-zA-Z0-9])/g, '\\omega $1')
      .replace(/ω/g, '\\omega')
      .replace(/Ω([a-zA-Z0-9])/g, '\\Omega $1')
      .replace(/Ω/g, '\\Omega')
      .replace(/Σ([a-zA-Z0-9])/g, '\\Sigma $1')
      .replace(/Σ/g, '\\Sigma')
      .replace(/∑/g, '\\sum')
      .replace(/∫/g, '\\int')
      .replace(/∞/g, '\\infty')
      .replace(/→/g, '\\rightarrow');
    
    // Затем обрабатываем корни с выражениями в скобках: √(x) -> \sqrt{x}
    result = result.replace(/√\(([^)]+)\)/g, (match, expr) => {
      // Конвертируем выражение внутри корня
      const inner = expr.replace(/\//g, ' \\div ');
      return `\\sqrt{${inner}}`;
    });
    
    // Обрабатываем простые дроби вида x / y или x/y
    // ВАЖНО: проверяем, что в числителе/знаменателе НЕТ обратных слешей (LaTeX команд)
    result = result.replace(/([a-zA-Z0-9_]+)\s*\/\s*([a-zA-Z0-9_]+)/g, (match, num, den) => {
      // Пропускаем если это часть уже обработанной конструкции
      if (match.includes('\\sqrt') || match.includes('\\frac') || match.includes('\\cdot')) {
        return match;
      }
      // Пропускаем если в числителе или знаменателе есть обратный слеш (LaTeX команда)
      if (num.includes('\\') || den.includes('\\')) {
        return match;
      }
      return `\\frac{${num}}{${den}}`;
    });
    
    // Обрабатываем дроби со скобками: (x) / (y)
    result = result.replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, (match, num, den) => {
      if (match.includes('\\sqrt') || match.includes('\\frac')) {
        return match;
      }
      // Пропускаем если есть LaTeX команды
      if (num.includes('\\') || den.includes('\\')) {
        return match;
      }
      return `\\frac{${num}}{${den}}`;
    });
    
    // Степени
    result = result
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/⁴/g, '^4');
    
    // Индексы
    result = result
      .replace(/₀/g, '_0')
      .replace(/₁/g, '_1')
      .replace(/₂/g, '_2')
      .replace(/₃/g, '_3');
    
    // Операторы
    result = result
      .replace(/·/g, ' \\cdot ')
      .replace(/×/g, ' \\times ')
      .replace(/÷/g, ' \\div ');
    
    // Обрабатываем cos, sin и другие функции
    result = result.replace(/\bcos\b/g, '\\cos');
    result = result.replace(/\bsin\b/g, '\\sin');
    
    return result;
};

const FormulaDisplay: React.FC<{ formula: string; color?: string }> = ({
  formula,
  color = '#4338CA',
}) => {
  if (!formula || !formula.trim()) {
    return (
      <View style={{ minHeight: 40, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color, fontSize: 18, fontWeight: '600' }}>{formula || ''}</Text>
      </View>
    );
  }

  const latexFormula = convertToLatex(formula);
  const content = latexFormula.includes('$') ? latexFormula : `$$${latexFormula}$$`;

  return (
    <View style={{ width: '100%' }}>
      <MathText content={content} textColor={color} fontSize={20} backgroundColor="transparent" />
    </View>
  );
};
export default function FormulasScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const { PHYSICS_SECTIONS, FORMULAS_DATA } = usePhysicsData();

  const filteredFormulas = FORMULAS_DATA.filter((formula) => {
    const matchesSearch = formula.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formula.formula.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = !selectedSection || formula.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  const groupedFormulas = filteredFormulas.reduce((acc, formula) => {
    if (!acc[formula.section]) {
      acc[formula.section] = [];
    }
    acc[formula.section].push(formula);
    return acc;
  }, {} as Record<string, typeof FORMULAS_DATA>);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('formulas.title')}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('formulas.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, { backgroundColor: colors.chipBg, borderColor: colors.chipBorder }, !selectedSection && { backgroundColor: colors.chipActiveBg, borderColor: colors.chipActiveBg }]}
          onPress={() => setSelectedSection(null)}
        >
          <Text style={[styles.filterChipText, { color: colors.textTertiary }, !selectedSection && styles.filterChipTextActive]}>
            {t('common.all')}
          </Text>
        </TouchableOpacity>
        {Object.entries(PHYSICS_SECTIONS).map(([key, section]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterChip,
              { backgroundColor: colors.chipBg, borderColor: colors.chipBorder },
              selectedSection === key && styles.filterChipActive,
              selectedSection === key && { backgroundColor: section.color },
            ]}
            onPress={() => setSelectedSection(selectedSection === key ? null : key)}
          >
            <Text style={[
              styles.filterChipText,
              { color: colors.textTertiary },
              selectedSection === key && styles.filterChipTextActive,
            ]}>
              {section.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} style={styles.content}>
        {Object.entries(groupedFormulas).map(([sectionKey, sectionFormulas]) => (
          <View key={sectionKey} style={styles.sectionGroup}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: PHYSICS_SECTIONS[sectionKey]?.color || '#6C63FF' }]} />
              <Text style={[styles.sectionName, { color: colors.textTertiary }]}>{PHYSICS_SECTIONS[sectionKey]?.name || sectionKey}</Text>
            </View>
            {sectionFormulas.map((formula) => (
              <TouchableOpacity
                key={formula.id}
                style={[styles.formulaCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}
                onPress={() => router.push(`/formulas/${formula.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.formulaCardHeader}>
                  <Text style={[styles.formulaName, { color: colors.text }]}>{formula.name}</Text>
                  <TouchableOpacity
                    onPress={() => toggleFavorite(formula.id, 'formula')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={isFavorite(formula.id, 'formula') ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isFavorite(formula.id, 'formula') ? '#EF4444' : '#D1D5DB'}
                    />
                  </TouchableOpacity>
                </View>
                <View style={[
                  styles.formulaBox, 
                  { borderLeftColor: PHYSICS_SECTIONS[formula.section]?.color || '#6C63FF', backgroundColor: colors.cardAlt }
                ]}>
                  <FormulaDisplay 
                    formula={formula.formula} 
                    color={PHYSICS_SECTIONS[formula.section]?.color || '#4338CA'}
                  />
                </View>
                {formula.description && (
                  <Text style={[styles.formulaDescription, { color: colors.textTertiary }]} numberOfLines={2}>
                    {formula.description}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {filteredFormulas.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t('formulas.notFound')}</Text>
          </View>
        )}

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  filtersContainer: {
    maxHeight: 50,
    marginTop: 12,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionGroup: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  formulaCard: {
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
  formulaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  formulaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  formulaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    alignItems: 'center',
  },
  formulaTextDisplay: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  formulaDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 10,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  bottomPadding: {
    height: 40,
  },
});


