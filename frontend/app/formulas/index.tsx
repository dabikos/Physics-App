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
import type { Formula } from '../../src/types/physics';
import { useFavorites } from '../../src/hooks/useFavorites';
import { useTheme } from '../../src/context/ThemeContext';
import api from '../../src/services/api';

export default function FormulasScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [remoteFormulas, setRemoteFormulas] = useState<Formula[] | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const { PHYSICS_SECTIONS, FORMULAS_DATA } = usePhysicsData();
  const formulasData = remoteFormulas ?? FORMULAS_DATA;

  useEffect(() => {
    let cancelled = false;

    const loadFormulas = async () => {
      try {
        const response = await api.get('/formulas', { params: { summary: true, section: selectedSection || undefined } });
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


