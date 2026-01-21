import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getTopicById, PHYSICS_SECTIONS } from '../../../src/data/physicsData';

export default function TopicDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const topic = id ? getTopicById(id) : null;
  const sectionColor = topic ? PHYSICS_SECTIONS[topic.section]?.color || '#6C63FF' : '#6C63FF';

  if (!topic) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Тема</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
          <Text style={styles.notFoundTitle}>Тема не найдена</Text>
          <Text style={styles.notFoundSubtitle}>Контент в разработке</Text>
        </View>
      </SafeAreaView>
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
          {topic.title}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Краткая информация */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={22} color={sectionColor} />
            <Text style={styles.sectionTitle}>Краткая информация</Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.briefText}>{topic.brief_info}</Text>
          </View>
        </View>

        {/* Пример задачи */}
        {topic.example_problem && topic.example_problem.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calculator" size={22} color="#E74C3C" />
              <Text style={styles.sectionTitle}>Пример задачи</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.exampleText}>{topic.example_problem}</Text>
            </View>
          </View>
        )}

        {/* Формулы */}
        {topic.formulas && topic.formulas.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flask" size={22} color="#9B59B6" />
              <Text style={styles.sectionTitle}>Формулы</Text>
            </View>
            <View style={styles.formulasGrid}>
              {topic.formulas.map((formula, index) => (
                <View key={index} style={styles.formulaCard}>
                  <Text style={styles.formulaText}>{formula}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Если контент в разработке */}
        {topic.brief_info === "Раздел в разработке" && (
          <View style={styles.devNotice}>
            <Ionicons name="construct" size={32} color="#F59E0B" />
            <Text style={styles.devNoticeText}>
              Полный контент этой темы находится в разработке.
              Скоро здесь появится подробная информация!
            </Text>
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
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  notFoundSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
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
  briefText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  exampleText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  formulasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  formulaCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  formulaText: {
    fontSize: 16,
    color: '#4338CA',
    fontWeight: '500',
  },
  devNotice: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  devNoticeText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});
