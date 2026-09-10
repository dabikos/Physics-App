import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { usePhysicsData } from '../../src/hooks/usePhysicsData';
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

interface TaskCardProps {
  sectionKey: string;
  section: any;
  gradient: [string, string];
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  cardBg: string;
  borderColor: string;
  textColor: string;
  textSecondary: string;
  shadowColor: string;
}

const TaskCardItem: React.FC<TaskCardProps> = ({
  section,
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
          styles.taskCard,
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

        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: textColor }]}>{section.name}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.pillBadge, { backgroundColor: gradient[0] + '18' }]}>
              <Text style={[styles.pillBadgeText, { color: gradient[0] }]}>
                {section.subsections?.length || 4} темы задач
              </Text>
            </View>
            <Text style={[styles.cardSubtext, { color: textSecondary }]}>
              Разбор решений
            </Text>
          </View>
        </View>

        <View style={[styles.arrowCircle, { borderColor }]}>
          <Ionicons name="chevron-forward" size={18} color={textSecondary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { PHYSICS_SECTIONS } = usePhysicsData();

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
    return iconMap[icon] || 'calculator-outline';
  };

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
            {t('tasks.title', { defaultValue: 'Задачник по физике' })}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textTertiary }]}>
            710 практических задач
          </Text>
        </View>

        <View style={styles.navBtnPlaceholder} />
      </View>

      {/* ==================== Content ==================== */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
      >
        {/* Practice Hero Banner */}
        <LinearGradient
          colors={['#EF4444', '#B91C1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.heroBannerContent}>
            <View style={styles.heroTopTag}>
              <Ionicons name="calculator" size={13} color="#FFFFFF" />
              <Text style={styles.heroTopTagText}>ПРАКТИКА И РАСЧЕТЫ</Text>
            </View>
            <Text style={styles.heroBannerTitle}>Научись решать задачи как профи</Text>
            <Text style={styles.heroBannerSub}>
              Каждая задача содержит правильный ответ, ход решения и формулы.
            </Text>
          </View>
          <View style={styles.heroIconBadge}>
            <Ionicons name="extension-puzzle-outline" size={44} color="rgba(255, 255, 255, 0.28)" />
          </View>
        </LinearGradient>

        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('tasks.quickTasks', { defaultValue: 'Выберите раздел задач' })}
          </Text>
          <Text style={[styles.sectionCountBadge, { color: colors.textTertiary }]}>
            7 разделов
          </Text>
        </View>

        <View style={styles.cardsList}>
          {Object.entries(PHYSICS_SECTIONS).map(([key, section]) => {
            const gradient = SECTION_GRADIENTS[key] || ['#EF4444', '#DC2626'];
            const iconName = getIconName(section.icon);

            return (
              <TaskCardItem
                key={key}
                sectionKey={key}
                section={section}
                gradient={gradient}
                icon={iconName}
                onPress={() => router.push(`/tasks/${key}`)}
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
  content: {
    padding: 16,
  },
  heroBanner: {
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  heroBannerContent: {
    flex: 1,
    paddingRight: 10,
  },
  heroTopTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  heroTopTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroBannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
    lineHeight: 23,
  },
  heroBannerSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    lineHeight: 17,
  },
  heroIconBadge: {
    width: 50,
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionCountBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardsList: {
    gap: 12,
  },
  taskCard: {
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
  cardInfo: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardSubtext: {
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
