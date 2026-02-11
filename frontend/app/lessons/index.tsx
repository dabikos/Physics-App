import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePhysicsData } from '../../src/hooks/usePhysicsData';
import { useOfflineCache } from '../../src/hooks/useOfflineCache';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function LessonsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { PHYSICS_SECTIONS } = usePhysicsData();
  const { isOnline, isCached, cacheForOffline } = useOfflineCache();

  const handleCacheOffline = async () => {
    const success = await cacheForOffline();
    if (success) {
      Alert.alert(t('common.done'), t('lessons.offlineSaved'));
    } else {
      Alert.alert(t('common.error'), t('lessons.offlineSaveError'));
    }
  };

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('lessons.title')}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {!isOnline && (
          <View style={[styles.offlineBanner, { backgroundColor: colors.warningBg, borderColor: colors.warning }]}>
            <Text style={[styles.offlineBannerText, { color: colors.warning }]}>{t('common.offlineMode')}</Text>
            {isCached && <Text style={[styles.offlineBannerSub, { color: colors.warning }]}>{t('common.offlineData')}</Text>}
          </View>
        )}
        
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('lessons.selectSection')}</Text>
          <TouchableOpacity style={[styles.cacheButton, { backgroundColor: colors.accentLight }]} onPress={handleCacheOffline}>
            <Ionicons name="download-outline" size={18} color={colors.accent} />
            <Text style={[styles.cacheButtonText, { color: colors.accent }]}>{isCached ? t('common.update') : t('common.offline')}</Text>
          </TouchableOpacity>
        </View>
        
        {Object.entries(PHYSICS_SECTIONS).map(([key, section]) => (
          <TouchableOpacity
            key={key}
            style={[styles.sectionCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}
            onPress={() => router.push(`/lessons/${key}`)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: section.color + '20' }]}>
              <Ionicons name={getIconName(section.icon)} size={28} color={section.color} />
            </View>
            <View style={styles.sectionInfo}>
              <Text style={[styles.sectionName, { color: colors.text }]}>{section.name}</Text>
              <Text style={[styles.subsectionCount, { color: colors.textTertiary }]}>
                {t('lessons.subsectionsCount', { subsections: section.subsections.length, topics: countTopics(key) })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
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
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cacheButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  cacheButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },
  offlineBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
    alignItems: 'center',
  },
  offlineBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  offlineBannerSub: {
    fontSize: 12,
    color: '#92400E',
    marginTop: 2,
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
