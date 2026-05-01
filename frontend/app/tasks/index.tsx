import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePhysicsData } from '../../src/hooks/usePhysicsData';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { PHYSICS_SECTIONS } = usePhysicsData();

  const getIconName = (icon: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      speedometer: 'speedometer',
      thermometer: 'thermometer',
      flash: 'flash',
      eye: 'eye',
      planet: 'planet',
      infinite: 'infinite',
      moon: 'moon',
    };
    return iconMap[icon] || 'calculator';
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('tasks.title')}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('tasks.quickTasks')}</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textTertiary }]}>{t('tasks.quickSubtitle')}</Text>
        
        {Object.entries(PHYSICS_SECTIONS).map(([key, section]) => (
          <TouchableOpacity
            key={key}
            style={[styles.sectionCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}
            onPress={() => router.push(`/tasks/${key}`)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: section.color + '20' }]}>
              <Ionicons name={getIconName(section.icon)} size={28} color={section.color} />
            </View>
            <View style={styles.sectionInfo}>
              <Text style={[styles.sectionName, { color: colors.text }]}>{section.name}</Text>
              <Text style={[styles.sectionDescription, { color: colors.textTertiary }]}>{t('tasks.practicalTasks')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        ))}

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
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
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
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  bottomPadding: {
    height: 24,
  },
});


