import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

interface Formula {
  id: string;
  section: string;
  name: string;
  formula: string;
  description: string;
  variables: Record<string, string>;
  unit: string;
}

export default function FormulaDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [formula, setFormula] = useState<Formula | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFormula();
  }, [id]);

  const fetchFormula = async () => {
    try {
      const response = await api.get(`/formulas/${id}`);
      setFormula(response.data);
    } catch (error) {
      console.error('Error fetching formula:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!formula) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Формула не найдена</Text>
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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {formula.name}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.formulaCard}>
          <Text style={styles.formulaMainText}>{formula.formula}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={22} color="#6C63FF" />
            <Text style={styles.sectionTitle}>Описание</Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.descriptionText}>{formula.description}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={22} color="#E74C3C" />
            <Text style={styles.sectionTitle}>Значения величин</Text>
          </View>
          <View style={styles.variablesContainer}>
            {Object.entries(formula.variables).map(([variable, meaning]) => (
              <View key={variable} style={styles.variableRow}>
                <View style={styles.variableBadge}>
                  <Text style={styles.variableText}>{variable}</Text>
                </View>
                <Text style={styles.variableMeaning}>{meaning}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube" size={22} color="#1ABC9C" />
            <Text style={styles.sectionTitle}>Единица измерения</Text>
          </View>
          <View style={styles.sectionContent}>
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
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  formulaMainText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  variableText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4338CA',
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
