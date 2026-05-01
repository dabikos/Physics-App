import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SectionList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePhysicsData } from '../../src/hooks/usePhysicsData';
import type { Formula } from '../../src/data/physicsData';
import { useFavorites } from '../../src/hooks/useFavorites';
import { useTheme } from '../../src/context/ThemeContext';
import api from '../../src/services/api';

// Компонент для красивого отображения формулы в LaTeX
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
      .replace(/\u03B8([a-zA-Z0-9])/g, '\\theta $1')
      .replace(/\u03B8/g, '\\theta')
      .replace(/\u03C3([a-zA-Z0-9])/g, '\\sigma $1')
      .replace(/\u03C3/g, '\\sigma')
      .replace(/\u2211/g, '\\sum')
      .replace(/\u222B/g, '\\int')
      .replace(/\u221E/g, '\\infty')
      .replace(/\u2192/g, '\\rightarrow')
      .replace(/\u00B2/g, '^2')
      .replace(/\u00B3/g, '^3')
      .replace(/\u2074/g, '^4')
      .replace(/\u2080/g, '_0')
      .replace(/\u2081/g, '_1')
      .replace(/\u2082/g, '_2')
      .replace(/\u2083/g, '_3')
      .replace(/\u00B7/g, ' \\cdot ')
      .replace(/\u00D7/g, ' \\times ')
      .replace(/\u00F7/g, ' \\div ');

    result = result.replace(/\u221A\(([^)]+)\)/g, (match, expr) => {
      const inner = expr.replace(/\//g, ' \\div ');
      return `\\sqrt{${inner}}`;
    });
    
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
    result = result.replace(/\blg\b/g, '\\lg');
    
    return result;
};

const FormulaDisplay: React.FC<{ formula: string; color?: string }> = ({
  formula,
  color = '#4338CA',
}) => {
  return (
    <View style={{ minHeight: 40, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color, fontSize: 18, fontWeight: '600', textAlign: 'center' }}>{formula || ''}</Text>
    </View>
  );
};
export default function FormulasScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [remoteFormulas, setRemoteFormulas] = useState<Formula[]>([]);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const { PHYSICS_SECTIONS, FORMULAS_DATA } = usePhysicsData();
  const formulasData = remoteFormulas.length > 0 ? remoteFormulas : FORMULAS_DATA;

  useEffect(() => {
    let cancelled = false;

    const loadFormulas = async () => {
      try {
        const response = await api.get('/formulas');
        const items = Array.isArray(response.data?.items) ? response.data.items : [];
        if (!cancelled) setRemoteFormulas(items);
      } catch (error) {
        console.log('Formulas load error:', error);
        if (!cancelled) setRemoteFormulas([]);
      }
    };

    loadFormulas();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredFormulas = useMemo(() => formulasData.filter((formula) => {
    const matchesSearch = formula.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formula.formula.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = !selectedSection || formula.section === selectedSection;
    return matchesSearch && matchesSection;
  }), [formulasData, searchQuery, selectedSection]);

  const groupedFormulas = useMemo(() => filteredFormulas.reduce((acc, formula) => {
    if (!acc[formula.section]) {
      acc[formula.section] = [];
    }
    acc[formula.section].push(formula);
    return acc;
  }, {} as Record<string, Formula[]>), [filteredFormulas]);

  const formulaSections = useMemo(() => (
    Object.entries(groupedFormulas).map(([sectionKey, sectionFormulas]) => ({
      title: PHYSICS_SECTIONS[sectionKey]?.name || sectionKey,
      sectionKey,
      color: PHYSICS_SECTIONS[sectionKey]?.color || '#6C63FF',
      data: sectionFormulas,
    }))
  ), [PHYSICS_SECTIONS, groupedFormulas]);

  const renderFormulaCard = ({ item: formula }: { item: Formula }) => {
    const sectionColor = PHYSICS_SECTIONS[formula.section]?.color || '#4338CA';

    return (
      <TouchableOpacity
        style={[styles.formulaCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push(`/formulas/${formula.id}`)}
        activeOpacity={0.82}
      >
        <View style={styles.formulaCardHeader}>
          <View style={styles.formulaTitleBlock}>
            <Text style={[styles.formulaName, { color: colors.text }]} numberOfLines={1}>
              {formula.name}
            </Text>
            {!!formula.description && (
              <Text style={[styles.formulaDescription, { color: colors.textTertiary }]} numberOfLines={2}>
                {formula.description}
              </Text>
            )}
          </View>
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

        <View style={[styles.formulaPreviewBox, { backgroundColor: sectionColor + '12' }]}>
          <Text style={[styles.formulaPreviewText, { color: sectionColor }]} numberOfLines={1}>
            {formula.formula}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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

      <SectionList
        sections={formulaSections}
        keyExtractor={(item) => item.id}
        renderItem={renderFormulaCard}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <View style={[styles.sectionDot, { backgroundColor: section.color }]} />
            <Text style={[styles.sectionName, { color: colors.textTertiary }]}>{section.title}</Text>
            <Text style={[styles.sectionCount, { color: colors.textMuted }]}>{section.data.length}</Text>
          </View>
        )}
        style={styles.content}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={7}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t('formulas.notFound')}</Text>
          </View>
        }
      />
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
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionGroup: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 10,
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
  sectionCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  formulaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 13,
    marginBottom: 9,
    borderWidth: 1,
  },
  formulaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  formulaTitleBlock: {
    flex: 1,
  },
  formulaName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  formulaPreviewBox: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
  },
  formulaPreviewText: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
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
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 17,
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


