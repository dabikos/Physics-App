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
import { LinearGradient } from 'expo-linear-gradient';
import { usePhysicsData } from '../../src/hooks/usePhysicsData';
import { INTERACTIVE_TASKS } from '../../src/data/interactiveTasks';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function TasksScreen() {
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
    };
    return iconMap[icon] || 'calculator';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
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

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Интерактивные задачи - Featured Card */}
        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() => router.push('/tasks/interactive')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#6C63FF', '#8B5CF6', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredGradient}
          >
            <View style={styles.featuredContent}>
              <View style={styles.featuredIconWrap}>
                <View style={styles.featuredIcon}>
                  <Ionicons name="sparkles" size={28} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.featuredTextContent}>
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>{t('common.new')}</Text>
                </View>
                <Text style={styles.featuredTitle}>{t('tasks.interactiveTasks')}</Text>
                <Text style={styles.featuredDescription}>
                  {t('tasks.interactiveSubtitle')}
                </Text>
              </View>
              <View style={styles.featuredStats}>
                <Text style={styles.featuredStatsNumber}>{INTERACTIVE_TASKS.length}</Text>
                <Text style={styles.featuredStatsLabel}>{t('tasks.tasksCount')}</Text>
              </View>
            </View>
            <View style={styles.featuredFeatures}>
              <View style={styles.featureItem}>
                <Ionicons name="bulb-outline" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.featureText}>{t('tasks.hints')}</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="layers-outline" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.featureText}>{t('tasks.stepByStep')}</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="keypad-outline" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.featureText}>{t('tasks.numericInput')}</Text>
              </View>
            </View>
            <View style={styles.featuredArrow}>
              <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

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
  featuredCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  featuredGradient: {
    padding: 20,
    position: 'relative',
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featuredIconWrap: {
    marginRight: 14,
  },
  featuredIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredTextContent: {
    flex: 1,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  featuredDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  featuredStats: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  featuredStatsNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featuredStatsLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: -2,
  },
  featuredFeatures: {
    flexDirection: 'row',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  featureText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  featuredArrow: {
    position: 'absolute',
    right: 16,
    bottom: 20,
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
