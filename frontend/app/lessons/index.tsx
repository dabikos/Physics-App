import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { usePhysicsData } from '../../src/hooks/usePhysicsData';
import { useOfflineCache } from '../../src/hooks/useOfflineCache';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';

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

interface SectionCardProps {
  sectionKey: string;
  section: any;
  topicCount: number;
  gradient: [string, string];
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  index: number;
  cardBg: string;
  borderColor: string;
  textColor: string;
  textSecondary: string;
  shadowColor: string;
}

const SectionCardItem: React.FC<SectionCardProps> = ({
  section,
  topicCount,
  gradient,
  icon,
  onPress,
  cardBg,
  borderColor,
  textColor,
  textSecondary,
  shadowColor,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

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
          styles.sectionCard,
          {
            backgroundColor: cardBg,
            borderColor,
            shadowColor,
          },
        ]}
        onPress={() => {
          triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          <Ionicons name={icon} size={26} color="#FFFFFF" />
        </LinearGradient>

        <View style={styles.sectionInfo}>
          <Text style={[styles.sectionName, { color: textColor }]}>{section.name}</Text>
          <View style={styles.tagsRow}>
            <View style={[styles.subCountPill, { backgroundColor: gradient[0] + '18' }]}>
              <Text style={[styles.subCountText, { color: gradient[0] }]}>
                {section.subsections.length} подраздела
              </Text>
            </View>
            <Text style={[styles.topicCountLabel, { color: textSecondary }]}>
              • {topicCount} тем
            </Text>
          </View>
        </View>

        <View style={[styles.arrowCircle, { backgroundColor: cardBg, borderColor }]}>
          <Ionicons name="chevron-forward" size={18} color={textSecondary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function LessonsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { PHYSICS_SECTIONS } = usePhysicsData();
  const { isOnline, isCached, cacheForOffline } = useOfflineCache();

  const handleCacheOffline = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    const success = await cacheForOffline();
    if (success) {
      Alert.alert(t('common.done', { defaultValue: 'Готово' }), t('lessons.offlineSaved', { defaultValue: 'Все уроки сохранены для оффлайн доступа.' }));
    } else {
      Alert.alert(t('common.error', { defaultValue: 'Ошибка' }), t('lessons.offlineSaveError', { defaultValue: 'Не удалось сохранить уроки.' }));
    }
  };

  const getIconName = (icon: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      speedometer: 'speedometer-outline',
      thermometer: 'thermometer-outline',
      flash: 'flash-outline',
      eye: 'eye-outline',
      planet: 'planet-outline',
      infinite: 'infinite-outline',
      moon: 'moon-outline',
    };
    return iconMap[icon] || 'book-outline';
  };

  const countTopics = (sectionKey: string): number => {
    const section = PHYSICS_SECTIONS[sectionKey];
    if (!section?.subsections) return 0;
    return section.subsections.reduce((acc, sub) => acc + (sub.topics?.length || 0), 0);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* ==================== Top Header ==================== */}
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
            {t('lessons.title', { defaultValue: 'Уроки физики' })}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textTertiary }]}>
            7 разделов • 142 темы
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.cachePillBtn,
            {
              backgroundColor: isCached
                ? isDark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5'
                : colors.accentLight,
              borderColor: isCached ? '#10B981' : colors.border,
            },
          ]}
          onPress={handleCacheOffline}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isCached ? 'checkmark-circle' : 'cloud-download-outline'}
            size={16}
            color={isCached ? '#10B981' : colors.accent}
          />
          <Text
            style={[
              styles.cachePillText,
              { color: isCached ? '#10B981' : colors.accent },
            ]}
          >
            {isCached ? 'В кэше' : 'Оффлайн'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ==================== Content ==================== */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
      >
        {!isOnline && (
          <View style={[styles.offlineBanner, { backgroundColor: colors.warningBg, borderColor: colors.warning }]}>
            <Ionicons name="cloud-offline-outline" size={18} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.offlineBannerText, { color: colors.warning }]}>
                {t('common.offlineMode', { defaultValue: 'Оффлайн-режим' })}
              </Text>
              {isCached && (
                <Text style={[styles.offlineBannerSub, { color: colors.warning }]}>
                  {t('common.offlineData', { defaultValue: 'Данные загружаются из локального кэша' })}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Section Intro Card */}
        <LinearGradient
          colors={['#4F46E5', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSummaryCard}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroSummaryTitle}>Полный школьный курс</Text>
            <Text style={styles.heroSummarySubtitle}>
              Интерактивная теория, формулы с разбором величин и симуляции физических процессов.
            </Text>
          </View>
          <View style={styles.heroIconWrap}>
            <Ionicons name="school-outline" size={48} color="rgba(255, 255, 255, 0.25)" />
          </View>
        </LinearGradient>

        <Text style={[styles.listHeaderTitle, { color: colors.text }]}>
          {t('lessons.selectSection', { defaultValue: 'Выберите раздел для изучения' })}
        </Text>

        <View style={styles.cardsList}>
          {Object.entries(PHYSICS_SECTIONS).map(([key, section], idx) => {
            const gradient = SECTION_GRADIENTS[key] || ['#6366F1', '#4F46E5'];
            const iconName = getIconName(section.icon);
            const topicCount = countTopics(key);

            return (
              <SectionCardItem
                key={key}
                sectionKey={key}
                section={section}
                topicCount={topicCount}
                gradient={gradient}
                icon={iconName}
                onPress={() => router.push(`/lessons/${key}`)}
                index={idx}
                cardBg={colors.card}
                borderColor={colors.border}
                textColor={colors.text}
                textSecondary={colors.textTertiary}
                shadowColor={colors.shadowColor}
              />
            );
          })}
        </View>
      </ScrollView>
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
  cachePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  cachePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  offlineBannerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  offlineBannerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  heroSummaryCard: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  heroContent: {
    flex: 1,
    paddingRight: 10,
  },
  heroSummaryTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  heroSummarySubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    lineHeight: 17,
  },
  heroIconWrap: {
    width: 50,
    alignItems: 'center',
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  cardsList: {
    gap: 12,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  iconGradient: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  sectionInfo: {
    flex: 1,
    marginLeft: 14,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subCountPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  subCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  topicCountLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
