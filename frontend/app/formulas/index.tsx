import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

interface Formula {
  id: string;
  section: string;
  name: string;
  formula: string;
  description: string;
}

interface Section {
  name: string;
  color: string;
}

export default function FormulasScreen() {
  const router = useRouter();
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [sections, setSections] = useState<Record<string, Section>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [formulasRes, sectionsRes] = await Promise.all([
        api.get('/formulas'),
        api.get('/sections'),
      ]);
      setFormulas(formulasRes.data);
      setSections(sectionsRes.data);
    } catch (error) {
      console.error('Error fetching formulas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFormulas = formulas.filter((formula) => {
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
  }, {} as Record<string, Formula[]>);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Формулы</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск формулы..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
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
          style={[styles.filterChip, !selectedSection && styles.filterChipActive]}
          onPress={() => setSelectedSection(null)}
        >
          <Text style={[styles.filterChipText, !selectedSection && styles.filterChipTextActive]}>
            Все
          </Text>
        </TouchableOpacity>
        {Object.entries(sections).map(([key, section]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterChip,
              selectedSection === key && styles.filterChipActive,
              selectedSection === key && { backgroundColor: section.color },
            ]}
            onPress={() => setSelectedSection(selectedSection === key ? null : key)}
          >
            <Text style={[
              styles.filterChipText,
              selectedSection === key && styles.filterChipTextActive,
            ]}>
              {section.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {Object.entries(groupedFormulas).map(([sectionKey, sectionFormulas]) => (
          <View key={sectionKey} style={styles.sectionGroup}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: sections[sectionKey]?.color || '#6C63FF' }]} />
              <Text style={styles.sectionName}>{sections[sectionKey]?.name || sectionKey}</Text>
            </View>
            {sectionFormulas.map((formula) => (
              <TouchableOpacity
                key={formula.id}
                style={styles.formulaCard}
                onPress={() => router.push(`/formulas/${formula.id}`)}
                activeOpacity={0.8}
              >
                <Text style={styles.formulaName}>{formula.name}</Text>
                <View style={styles.formulaBox}>
                  <Text style={styles.formulaText}>{formula.formula}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {filteredFormulas.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>Формулы не найдены</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  formulaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  formulaBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  formulaText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4338CA',
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
