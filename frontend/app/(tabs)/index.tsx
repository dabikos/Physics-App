import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useSearch, SearchResult } from '../../src/hooks/useSearch';
import { useOfflineCache } from '../../src/hooks/useOfflineCache';
import api from '../../src/services/api';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../src/context/LanguageContext';

// Safe haptic feedback wrapper
const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  try {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  } catch {}
};

// ==================== Types ====================
interface DailyChallenge {
  date: string;
  section: string;
  type: string;
  title: string;
  target: number;
  progress: number;
  xp_reward: number;
  completed: boolean;
}

interface ProfileBannerData {
  streak: { current: number };
  stats: { lessons_completed: number; tests_completed: number; tasks_solved?: number };
  section_progress: { section: string; name: string; percentage: number }[];
}

const DAILY_CHALLENGE_GRADIENTS: [string, string][] = [
  ['#F59E0B', '#D97706'],
  ['#3B82F6', '#1D4ED8'],
  ['#8B5CF6', '#6D28D9'],
  ['#14B8A6', '#0F766E'],
  ['#EC4899', '#BE185D'],
  ['#F97316', '#C2410C'],
  ['#6366F1', '#4338CA'],
];

const getDailyChallengeGradient = (date: string): [string, string] => {
  const dayKey = date || new Date().toISOString().slice(0, 10);
  const hash = dayKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DAILY_CHALLENGE_GRADIENTS[hash % DAILY_CHALLENGE_GRADIENTS.length];
};

// ==================== Modern Bento Menu Card ====================
interface MenuCardProps {
  title: string;
  subtitle: string;
  badge?: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  onPress: () => void;
  index: number;
  cardBg: string;
  textColor: string;
  subtitleColor: string;
  borderColor: string;
  shadowColor: string;
}

const MenuCard: React.FC<MenuCardProps> = ({
  title,
  subtitle,
  badge,
  icon,
  gradient,
  onPress,
  index,
  cardBg,
  textColor,
  subtitleColor,
  borderColor,
  shadowColor,
}) => {
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
        delay: index * 60,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY]);

  const handlePressIn = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scale, { toValue: 0.96, friction: 6, tension: 100, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { transform: [{ translateY }, { scale }], opacity },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: cardBg,
            borderColor: borderColor,
            shadowColor: shadowColor,
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
        <View style={styles.cardTopRow}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradientContainer}
          >
            <Ionicons name={icon} size={24} color="#FFFFFF" />
          </LinearGradient>

          {badge && (
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>{badge}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardTextContainer}>
          <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.cardSubtitle, { color: subtitleColor }]} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        <View style={styles.cardArrowRow}>
          <Ionicons name="arrow-forward" size={14} color={subtitleColor} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ==================== Daily Challenge Card ====================
const DailyChallengeCard: React.FC<{ challenge: DailyChallenge | null; onPress?: () => void }> = ({
  challenge,
  onPress,
}) => {
  const { t } = useTranslation();
  if (!challenge) return null;

  const progressPercent = challenge.target > 0 ? Math.min(100, (challenge.progress / challenge.target) * 100) : 0;
  const localizedTitle = t(`home.dailyChallengeTitles.${challenge.type}`, {
    count: challenge.target,
    section: t(`physics.${challenge.section}`, { defaultValue: challenge.section }),
    defaultValue: challenge.title,
  });
  const gradientColors: [string, string] = challenge.completed
    ? ['#10B981', '#059669']
    : getDailyChallengeGradient(challenge.date);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={dcStyles.container}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={dcStyles.gradient}
      >
        <View style={dcStyles.topRow}>
          <View style={dcStyles.tagRow}>
            <View style={dcStyles.badge}>
              <Text style={dcStyles.badgeText}>
                {challenge.completed
                  ? t('home.dailyChallengeDone', { defaultValue: 'ВЫПОЛНЕНО' })
                  : t('home.dailyChallengeBadge', { defaultValue: 'КВЕСТ ДНЯ' })}
              </Text>
            </View>
          </View>
          <View style={dcStyles.xpPill}>
            <Ionicons name="flash" size={13} color="#FBBF24" style={{ marginRight: 3 }} />
            <Text style={dcStyles.xpText}>+{challenge.xp_reward} XP</Text>
          </View>
        </View>

        <Text style={dcStyles.title} numberOfLines={2}>
          {localizedTitle}
        </Text>

        <View style={dcStyles.progressSection}>
          <View style={dcStyles.progressBarTrack}>
            <View style={[dcStyles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={dcStyles.progressCounter}>
            {challenge.progress} / {challenge.target}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ==================== Search Modal ====================
const SearchModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { query, results, loading, search, clearSearch } = useSearch();

  const handleSelect = (item: SearchResult) => {
    onClose();
    clearSearch();
    setTimeout(() => {
      if (item.type === 'topic') {
        router.push(`/lessons/topic/${item.id}`);
      } else if (item.type === 'formula') {
        router.push(`/formulas/${item.id}`);
      } else if (item.type === 'section') {
        router.push(`/lessons/${item.id}`);
      } else if (item.type === 'subsection') {
        const [sec] = item.id.split('/');
        router.push(`/lessons/${sec}`);
      }
    }, 200);
  };

  const getIconName = (iconStr: string): keyof typeof Ionicons.glyphMap => {
    const map: Record<string, keyof typeof Ionicons.glyphMap> = {
      book: 'book',
      flask: 'flask',
      folder: 'folder',
      list: 'list',
    };
    return map[iconStr] || 'search';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      topic: t('home.topic'),
      formula: t('home.formula'),
      section: t('home.section'),
      subsection: t('home.subsection'),
    };
    return labels[type] || type;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[searchStyles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[searchStyles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <View style={[searchStyles.searchRow, { backgroundColor: colors.inputBg }]}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={[searchStyles.input, { color: colors.text }]}
              placeholder={t('home.searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={search}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={searchStyles.cancelBtn}>
            <Text style={[searchStyles.cancelText, { color: colors.accent }]}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={searchStyles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <View style={searchStyles.emptyContainer}>
            <Ionicons name="search" size={48} color={colors.border} />
            <Text style={[searchStyles.emptyText, { color: colors.textTertiary }]}>{t('home.nothingFound')}</Text>
          </View>
        )}

        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[searchStyles.resultItem, { backgroundColor: colors.card, borderBottomColor: colors.borderLight }]}
              onPress={() => handleSelect(item)}
            >
              <View style={[searchStyles.resultIcon, { backgroundColor: colors.accentLight }]}>
                <Ionicons name={getIconName(item.icon)} size={20} color={colors.accent} />
              </View>
              <View style={searchStyles.resultInfo}>
                <Text style={[searchStyles.resultTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[searchStyles.resultSubtitle, { color: colors.textTertiary }]}>
                  {getTypeLabel(item.type)} • {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.border} />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        />
      </SafeAreaView>
    </Modal>
  );
};

// ==================== Main Screen ====================
export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const { isOnline } = useOfflineCache();

  const heroScale = useRef(new Animated.Value(0.95)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;

  const [bannerData, setBannerData] = useState<ProfileBannerData | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);

  const fetchHomeData = useCallback(async () => {
    try {
      const [statsRes, challengeRes] = await Promise.allSettled([
        api.get('/profile/stats'),
        api.get('/daily-challenge'),
      ]);
      if (statsRes.status === 'fulfilled') setBannerData(statsRes.value.data);
      if (challengeRes.status === 'fulfilled') {
        const challenge = challengeRes.value.data as DailyChallenge;
        if (challenge && !challenge.completed && challenge.progress >= challenge.target) {
          try {
            const completeRes = await api.post('/daily-challenge/complete');
            setDailyChallenge({
              ...challenge,
              completed: true,
              xp_reward: completeRes.data?.xp_awarded ?? challenge.xp_reward,
            });
            const refreshedStats = await api.get('/profile/stats');
            setBannerData(refreshedStats.data);
          } catch {
            setDailyChallenge(challenge);
          }
        } else {
          setDailyChallenge(challenge);
        }
      }
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [fetchHomeData])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.spring(heroScale, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }),
      Animated.timing(heroOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [heroOpacity, heroScale]);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  // Calculations
  const firstName = user?.name?.split(' ')[0] || t('auth.student', { defaultValue: 'Ученик' });
  const streak = bannerData?.streak?.current || 0;
  const userXp = (user as any)?.xp ?? (bannerData?.stats as any)?.xp ?? 0;
  const userLevel = Math.floor(userXp / 100) + 1;
  const xpInCurrentLevel = userXp % 100;

  // Active section to continue
  const inProgressSection = bannerData?.section_progress?.find(
    (s) => s.percentage > 0 && s.percentage < 100
  );


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* ==================== Top Header ==================== */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.profileHeaderBtn}
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(tabs)/profile');
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarCircle}
            >
              <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
            <View>
              <Text style={[styles.greetingLabel, { color: colors.textTertiary }]}>
                {t('home.greeting', { defaultValue: 'Привет 👋' })}
              </Text>
              <Text style={[styles.userName, { color: colors.text }]}>{firstName}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.topActionsRow}>
            {/* Streak Counter */}
            <TouchableOpacity
              style={[styles.streakBadge, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB', borderColor: '#FDE68A' }]}
              onPress={() => {
                triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/profile');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakCount}>{streak}</Text>
            </TouchableOpacity>

            {/* Telegram Community */}
            <TouchableOpacity
              style={[
                styles.iconActionBtn,
                {
                  backgroundColor: isDark ? 'rgba(34, 158, 217, 0.15)' : '#E0F2FE',
                  borderColor: isDark ? 'rgba(34, 158, 217, 0.35)' : '#BAE6FD',
                  shadowColor: colors.shadowColor,
                },
              ]}
              onPress={() => {
                triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL('https://t.me/+4nopjpXt51w0YjMy').catch(() => {});
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="paper-plane" size={17} color="#0284C7" />
            </TouchableOpacity>

            {/* Notifications */}
            <TouchableOpacity
              style={[styles.iconActionBtn, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadowColor }]}
              onPress={() => {
                triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                router.push('/notifications');
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
            </TouchableOpacity>

            {/* Search */}
            <TouchableOpacity
              style={[styles.iconActionBtn, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadowColor }]}
              onPress={() => {
                triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                setSearchVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Offline Badge */}
        {!isOnline && (
          <View style={[styles.offlineNotice, { backgroundColor: colors.warningBg, borderColor: colors.warning }]}>
            <Ionicons name="cloud-offline" size={16} color={colors.warning} />
            <Text style={[styles.offlineNoticeText, { color: colors.warning }]}>
              {t('common.offlineMode', { defaultValue: 'Оффлайн режим • Данные сохранены локально' })}
            </Text>
          </View>
        )}

        {/* ==================== Hero Bento Card ==================== */}
        <Animated.View
          style={[
            styles.heroCardContainer,
            { transform: [{ scale: heroScale }], opacity: heroOpacity },
          ]}
        >
          <LinearGradient
            colors={['#4F46E5', '#6366F1', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            {/* Ambient Background Graphic */}
            <View style={styles.heroAmbientCircle} />
            <View style={styles.heroPlanetGlow}>
              <Ionicons name="planet" size={130} color="rgba(255, 255, 255, 0.09)" />
            </View>

            <View style={styles.heroTopRow}>
              <View style={styles.levelPill}>
                <Ionicons name="ribbon-outline" size={14} color="#FBBF24" />
                <Text style={styles.levelPillText}>
                  {t('home.level', { level: userLevel, defaultValue: `Уровень ${userLevel}` })}
                </Text>
              </View>

              <View style={styles.heroXpRow}>
                <Ionicons name="flash" size={14} color="#FBBF24" />
                <Text style={styles.heroXpText}>{userXp} XP</Text>
              </View>
            </View>

            {/* Headline */}
            <Text style={styles.heroTitle}>
              {streak >= 3
                ? `🔥 ${streak} ${getDayWord(streak, currentLanguage)} подряд!`
                : inProgressSection
                ? t('home.heroContinue', { name: inProgressSection.name, defaultValue: `Продолжим: ${inProgressSection.name}` })
                : t('home.heroReady', { defaultValue: 'Готов покорять физику?' })}
            </Text>

            <Text style={styles.heroSubtitle}>
              {inProgressSection
                ? t('home.heroContinueSub', { percent: inProgressSection.percentage, defaultValue: `Пройдено ${inProgressSection.percentage}% темы. Нажми, чтобы продолжить.` })
                : t('home.heroDefaultSub', { defaultValue: 'Изучай интерактивные уроки, решай формулы и тренируйся с AI.' })}
            </Text>

            {/* Level Progress Bar */}
            <View style={styles.levelProgressContainer}>
              <View style={styles.levelTrack}>
                <View style={[styles.levelFill, { width: `${xpInCurrentLevel}%` }]} />
              </View>
              <Text style={styles.levelRatioText}>{xpInCurrentLevel}/100 XP</Text>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              style={styles.heroCtaBtn}
              onPress={() => {
                triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                if (inProgressSection) {
                  router.push(`/lessons/${inProgressSection.section}`);
                } else {
                  router.push('/lessons');
                }
              }}
              activeOpacity={0.88}
            >
              <Text style={styles.heroCtaText}>
                {inProgressSection
                  ? t('home.continueLesson', { defaultValue: 'Продолжить урок' })
                  : t('home.startLearning', { defaultValue: 'Начать обучение' })}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#4F46E5" />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* ==================== Daily Challenge ==================== */}
        {dailyChallenge && (
          <View style={styles.sectionWrap}>
            <DailyChallengeCard
              challenge={dailyChallenge}
              onPress={() => {
                triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                if (dailyChallenge.type === 'test') {
                  router.push(`/tests/${dailyChallenge.section}`);
                } else if (dailyChallenge.type === 'solve') {
                  router.push('/tasks');
                } else {
                  router.push(`/lessons/${dailyChallenge.section}`);
                }
              }}
            />
          </View>
        )}

        {/* ==================== Quick Search Bar ==================== */}
        <TouchableOpacity
          style={[styles.quickSearchBar, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadowColor }]}
          onPress={() => {
            triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
            setSearchVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <Text style={[styles.quickSearchPlaceholder, { color: colors.textMuted }]}>
            {t('home.searchPlaceholder', { defaultValue: 'Поиск тем, формул и задач...' })}
          </Text>
          <View style={[styles.searchKeyboardHint, { backgroundColor: colors.inputBg }]}>
            <Text style={[styles.searchKeyboardHintText, { color: colors.textTertiary }]}>⌘K</Text>
          </View>
        </TouchableOpacity>

        {/* ==================== Section Title ==================== */}
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('home.sectionsTitle', { defaultValue: 'Разделы обучения' })}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textTertiary }]}>
            {t('home.sectionsSubtitle', { defaultValue: 'Выбери режим' })}
          </Text>
        </View>

        {/* ==================== Bento Grid Menu ==================== */}
        <View style={styles.menuGrid}>
          {/* Row 1 */}
          <View style={styles.menuRow}>
            <MenuCard
              title={t('home.lessons', { defaultValue: 'Уроки' })}
              subtitle={t('home.lessonsCount', { defaultValue: '142 темы' })}
              badge={t('home.lessonsBadge', { defaultValue: 'База' })}
              icon="book"
              gradient={['#3B82F6', '#1D4ED8']}
              onPress={() => router.push('/lessons')}
              index={0}
              cardBg={colors.card}
              textColor={colors.text}
              subtitleColor={colors.textTertiary}
              borderColor={colors.border}
              shadowColor={colors.shadowColor}
            />
            <MenuCard
              title={t('home.tasks', { defaultValue: 'Задачи' })}
              subtitle={t('home.tasksCount', { defaultValue: '710 заданий' })}
              badge={t('home.tasksBadge', { defaultValue: 'Практика' })}
              icon="calculator"
              gradient={['#EF4444', '#B91C1C']}
              onPress={() => router.push('/tasks')}
              index={1}
              cardBg={colors.card}
              textColor={colors.text}
              subtitleColor={colors.textTertiary}
              borderColor={colors.border}
              shadowColor={colors.shadowColor}
            />
          </View>

          {/* Row 2 */}
          <View style={styles.menuRow}>
            <MenuCard
              title={t('home.tests', { defaultValue: 'Тесты' })}
              subtitle={t('home.testsCount', { defaultValue: 'Проверка знаний' })}
              badge={t('home.testsBadge', { defaultValue: 'Экзамен' })}
              icon="checkbox"
              gradient={['#10B981', '#047857']}
              onPress={() => router.push('/tests')}
              index={2}
              cardBg={colors.card}
              textColor={colors.text}
              subtitleColor={colors.textTertiary}
              borderColor={colors.border}
              shadowColor={colors.shadowColor}
            />
            <MenuCard
              title={t('home.formulas', { defaultValue: 'Формулы' })}
              subtitle={t('home.formulasCount', { defaultValue: 'Все формулы' })}
              badge={t('home.formulasBadge', { defaultValue: 'Шпаргалка' })}
              icon="flask"
              gradient={['#8B5CF6', '#6D28D9']}
              onPress={() => router.push('/formulas')}
              index={3}
              cardBg={colors.card}
              textColor={colors.text}
              subtitleColor={colors.textTertiary}
              borderColor={colors.border}
              shadowColor={colors.shadowColor}
            />
          </View>

          {/* Row 3 */}
          <View style={styles.menuRow}>
            <MenuCard
              title={t('home.connection', { defaultValue: 'QR-Класс' })}
              subtitle={t('home.connectionSubtitle', { defaultValue: 'Синхронизация' })}
              badge={t('auth.teacher', { defaultValue: 'Учитель' })}
              icon="qr-code-outline"
              gradient={['#6366F1', '#4338CA']}
              onPress={() => router.push('/connect')}
              index={4}
              cardBg={colors.card}
              textColor={colors.text}
              subtitleColor={colors.textTertiary}
              borderColor={colors.border}
              shadowColor={colors.shadowColor}
            />
            <MenuCard
              title={t('home.games', { defaultValue: 'Игры' })}
              subtitle={t('home.gamesSubtitle', { defaultValue: 'Обучающие игры' })}
              badge={t('common.play', { defaultValue: 'Играть' })}
              icon="game-controller"
              gradient={['#F59E0B', '#B45309']}
              onPress={() => router.push('/games')}
              index={5}
              cardBg={colors.card}
              textColor={colors.text}
              subtitleColor={colors.textTertiary}
              borderColor={colors.border}
              shadowColor={colors.shadowColor}
            />
          </View>
        </View>
      </ScrollView>

      {/* Search Modal */}
      <SearchModal visible={searchVisible} onClose={() => setSearchVisible(false)} />
    </SafeAreaView>
  );
}

// ==================== Helpers ====================
function getDayWord(n: number, lang: string = 'ru'): string {
  if (lang === 'en') {
    return n === 1 ? 'day' : 'days';
  }
  if (lang === 'kk') {
    return 'күн';
  }
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 14) return 'дней';
  if (last === 1) return 'день';
  if (last >= 2 && last <= 4) return 'дня';
  return 'дней';
}

// ==================== Styles ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  profileHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  greetingLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  streakEmoji: {
    fontSize: 15,
  },
  streakCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  iconActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  offlineNoticeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  heroCardContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  heroGradient: {
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
  },
  heroAmbientCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    top: -60,
    right: -60,
  },
  heroPlanetGlow: {
    position: 'absolute',
    right: -15,
    bottom: -20,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroXpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroXpText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 6,
    lineHeight: 28,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  levelProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  levelTrack: {
    flex: 1,
    height: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    backgroundColor: '#FBBF24',
    borderRadius: 4,
  },
  levelRatioText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  heroCtaText: {
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionWrap: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  aiCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  aiCardGradient: {
    padding: 16,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  aiIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  aiIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiHeaderTextContainer: {
    flex: 1,
  },
  aiCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  aiCardSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  aiChipsScroll: {
    gap: 8,
  },
  aiChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderWidth: 1,
  },
  aiChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  quickSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  quickSearchPlaceholder: {
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
  },
  searchKeyboardHint: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  searchKeyboardHintText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  menuGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  menuRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconGradientContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cardBadgeText: {
    color: '#6366F1',
    fontSize: 11,
    fontWeight: '700',
  },
  cardTextContainer: {
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardArrowRow: {
    alignItems: 'flex-end',
    marginTop: 6,
  },
});

const dcStyles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  gradient: {
    padding: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 12,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressCounter: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

const searchStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  searchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 12,
  },
});
