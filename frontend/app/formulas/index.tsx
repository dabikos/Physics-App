import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SectionList,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { usePhysicsData } from '../../src/hooks/usePhysicsData';
import type { Formula } from '../../src/types/physics';
import { useFavorites } from '../../src/hooks/useFavorites';
import { useTheme } from '../../src/context/ThemeContext';
import api from '../../src/services/api';

const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  try {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  } catch {}
};

const SECTION_GRADIENTS: Record<string, [string, string]> = {
  mechanics: ['#3B82F6', '#1D4ED8'],
  thermodynamics: ['#F97316', '#C2410C'],
  electromagnetism: ['#8B5CF6', '#6D28D9'],
  optics: ['#10B981', '#047857'],
  atomic: ['#EC4899', '#BE185D'],
  relativity: ['#6366F1', '#4338CA'],
  astronomy: ['#F59E0B', '#D97706'],
};

interface FormulaCardProps {
  formula: Formula;
  isFav: boolean;
  onToggleFav: () => void;
  onPress: () => void;
  cardBg: string;
  borderColor: string;
  textColor: string;
  textSecondary: string;
  shadowColor: string;
}

const FormulaCardItem: React.FC<FormulaCardProps> = ({
  formula,
  isFav,
  onToggleFav,
  onPress,
  cardBg,
  borderColor,
  textColor,
  textSecondary,
  shadowColor,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isLocked = formula.is_locked || formula.requires_pro;
  const sectionGradient = SECTION_GRADIENTS[formula.section] || ['#6366F1', '#4F46E5'];

  const handlePressIn = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scale, { toValue: 0.97, friction: 6, tension: 100, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          styles.formulaCard,
          {
            backgroundColor: cardBg,
            borderColor,
            shadowColor,
          },
          isLocked && styles.lockedCard,
        ]}
        onPress={() => {
          triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.formulaCardTop}>
          <View style={styles.formulaTitleArea}>
            <Text style={[styles.formulaName, { color: textColor }]} numberOfLines={1}>
              {formula.name}
            </Text>
            {!!formula.description && (
              <Text style={[styles.formulaDescription, { color: textSecondary }]} numberOfLines={2}>
                {formula.description}
              </Text>
            )}
          </View>

          {isLocked ? (
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.proBadge}
            >
              <Ionicons name="lock-closed" size={11} color="#FFFFFF" />
              <Text style={styles.proBadgeText}>PRO</Text>
            </LinearGradient>
          ) : (
            <TouchableOpacity
              onPress={() => {
                triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                onToggleFav();
              }}
              style={styles.favBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={22}
                color={isFav ? '#EF4444' : textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Formula Math Box */}
        {!isLocked && (
          <View style={[styles.mathDisplayBox, { backgroundColor: sectionGradient[0] + '12', borderColor: sectionGradient[0] + '30' }]}>
            <Text style={[styles.mathDisplayText, { color: sectionGradient[0] }]}>
              {formula.formula}
            </Text>
            <View style={styles.mathArrowCircle}>
              <Ionicons name="calculator-outline" size={16} color={sectionGradient[0]} />
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function FormulasScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [remoteFormulas, setRemoteFormulas] = useState<Formula[] | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors, isDark } = useTheme();
  const { PHYSICS_SECTIONS, FORMULAS_DATA } = usePhysicsData();
  const formulasData = remoteFormulas ?? FORMULAS_DATA;

  useEffect(() => {
    let cancelled = false;

    const loadFormulas = async () => {
      try {
        const response = await api.get('/formulas', {
          params: { summary: true, section: selectedSection || undefined },
        });
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
  }, [selectedSection]);

  const filteredFormulas = useMemo(() => {
    return formulasData.filter((formula) => {
      const matchesSearch =
        formula.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formula.formula.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSection = !selectedSection || formula.section === selectedSection;
      return matchesSearch && matchesSection;
    });
  }, [formulasData, searchQuery, selectedSection]);

  const groupedFormulas = useMemo(() => {
    return filteredFormulas.reduce((acc, formula) => {
      if (!acc[formula.section]) {
        acc[formula.section] = [];
      }
      acc[formula.section].push(formula);
      return acc;
    }, {} as Record<string, Formula[]>);
  }, [filteredFormulas]);

  const formulaSections = useMemo(() => {
    return Object.entries(groupedFormulas).map(([sectionKey, sectionFormulas]) => ({
      title: PHYSICS_SECTIONS[sectionKey]?.name || sectionKey,
      sectionKey,
      color: PHYSICS_SECTIONS[sectionKey]?.color || '#6366F1',
      data: sectionFormulas,
    }));
  }, [PHYSICS_SECTIONS, groupedFormulas]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* ==================== Header ==================== */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('formulas.title', { defaultValue: 'Справочник формул' })}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textTertiary }]}>
            {filteredFormulas.length} формул доступно
          </Text>
        </View>

        <View style={styles.navBtnPlaceholder} />
      </View>

      {/* ==================== Search Bar ==================== */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadowColor }]}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('formulas.searchPlaceholder', { defaultValue: 'Поиск формулы или величины...' })}
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
              setSearchQuery('');
            }}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ==================== Section Filters ==================== */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: !selectedSection ? '#6366F1' : colors.card,
                borderColor: !selectedSection ? '#6366F1' : colors.border,
              },
            ]}
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
              setSelectedSection(null);
            }}
          >
            <Text style={[styles.filterChipText, { color: !selectedSection ? '#FFFFFF' : colors.text }]}>
              {t('common.all', { defaultValue: 'Все разделы' })}
            </Text>
          </TouchableOpacity>

          {Object.entries(PHYSICS_SECTIONS).map(([key, section]) => {
            const isSelected = selectedSection === key;
            const gradient = SECTION_GRADIENTS[key] || ['#6366F1', '#4F46E5'];

            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? gradient[0] : colors.card,
                    borderColor: isSelected ? gradient[0] : colors.border,
                  },
                ]}
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedSection(isSelected ? null : key);
                }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {section.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ==================== Formulas SectionList ==================== */}
      <SectionList
        sections={formulaSections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FormulaCardItem
            formula={item}
            isFav={isFavorite(item.id, 'formula')}
            onToggleFav={() => toggleFavorite(item.id, 'formula')}
            onPress={() =>
              router.push(
                (item.is_locked || item.requires_pro
                  ? '/subscription'
                  : `/formulas/${item.id}`) as any
              )
            }
            cardBg={colors.card}
            borderColor={colors.border}
            textColor={colors.text}
            textSecondary={colors.textTertiary}
            shadowColor={colors.shadowColor}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeaderRow, { backgroundColor: colors.background }]}>
            <View style={[styles.sectionDot, { backgroundColor: section.color }]} />
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionBadge, { backgroundColor: colors.inputBg }]}>
              <Text style={[styles.sectionBadgeText, { color: colors.textTertiary }]}>
                {section.data.length}
              </Text>
            </View>
          </View>
        )}
        style={styles.contentList}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 30 }]}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={54} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Ничего не найдено</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
              Попробуйте изменить поисковый запрос или фильтр раздела
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnPlaceholder: {
    width: 40,
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
    padding: 0,
  },
  filtersWrapper: {
    marginBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  contentList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginTop: 6,
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  formulaCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  lockedCard: {
    opacity: 0.8,
  },
  formulaCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  formulaTitleArea: {
    flex: 1,
    paddingRight: 10,
  },
  formulaName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  formulaDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  favBtn: {
    padding: 2,
  },
  mathDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  mathDisplayText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  mathArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
