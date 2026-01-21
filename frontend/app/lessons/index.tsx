import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PHYSICS_SECTIONS } from '../../src/data/physicsData';

export default function LessonsScreen() {
  const router = useRouter();

  const getIconName = (icon: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      speedometer: 'speedometer',
      thermometer: 'thermometer',
      flash: 'flash',
      eye: 'eye',
      planet: 'planet',
    };
    return iconMap[icon] || 'book';
  };

  // Подсчёт общего количества тем
  const countTopics = (sectionKey: string): number => {
    const section = PHYSICS_SECTIONS[sectionKey];
    return section.subsections.reduce((acc, sub) => acc + sub.topics.length, 0);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Уроки</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <Text style={styles.sectionTitle}>Выберите раздел</Text>
        
        {Object.entries(PHYSICS_SECTIONS).map(([key, section]) => (
          <TouchableOpacity
            key={key}
            style={styles.sectionCard}
            onPress={() => router.push(`/lessons/${key}`)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: section.color + '20' }]}>
              <Ionicons name={getIconName(section.icon)} size={28} color={section.color} />
            </View>
            <View style={styles.sectionInfo}>
              <Text style={styles.sectionName}>{section.name}</Text>
              <Text style={styles.subsectionCount}>
                {section.subsections.length} подразделов • {countTopics(key)} тем
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
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
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  sectionName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  subsectionCount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});
