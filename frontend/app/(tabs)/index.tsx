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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedIcon } from '../../src/components/AnimatedIcon';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useSearch, SearchResult } from '../../src/hooks/useSearch';
import { useOfflineCache } from '../../src/hooks/useOfflineCache';
import api from '../../src/services/api';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../src/context/LanguageContext';

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
  stats: { lessons_completed: number; tests_completed: number };
  section_progress: Array<{ section: string; name: string; percentage: number }>;
}

// ==================== Menu Card ====================
interface MenuCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  index: number;
  animation: 'bounce' | 'pulse' | 'rotate' | 'shake';
  cardBg: string;
  textColor: string;
  subtitleColor: string;
  shadowColor: string;
}

const MenuCard: React.FC<MenuCardProps> = ({
  title,
  subtitle,
  icon,
  color,
  onPress,
  index,
  animation,
  cardBg,
  textColor,
  subtitleColor,
  shadowColor: shadowCol,
}) => {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
        delay: index * 100,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.95, friction: 5, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  };

  return (
    <Animated.View
      style={[styles.cardWrapper, { transform: [{ translateY }, { scale }], opacity }]}
    >
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardBg, shadowColor: shadowCol }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <AnimatedIcon name={icon} size={28} color={color} animation={animation} delay={index * 200 + 500} />
        </View>
        <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
        <Text style={[styles.cardSubtitle, { color: subtitleColor }]}>{subtitle}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ==================== Search Modal ====================
const SearchModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
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
            <Text style={[searchStyles.cancelText, { color: colors.accent }]}>{t('search.cancel')}</Text>
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
            <TouchableOpacity style={[searchStyles.resultItem, { backgroundColor: colors.card, borderBottomColor: colors.borderLight }]} onPress={() => handleSelect(item)}>
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
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </SafeAreaView>
    </Modal>
  );
};

// ==================== Daily Challenge Card ====================
const DailyChallengeCard: React.FC<{ challenge: DailyChallenge | null }> = ({ challenge }) => {
  const { t } = useTranslation();
  if (!challenge) return null;

  const progressPercent = challenge.target > 0 ? Math.min(100, (challenge.progress / challenge.target) * 100) : 0;

  return (
    <View style={dcStyles.container}>
      <LinearGradient
        colors={challenge.completed ? ['#10B981', '#059669'] : ['#F59E0B', '#D97706']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={dcStyles.gradient}
      >
        <View style={dcStyles.header}>
          <View style={dcStyles.headerLeft}>
            <Text style={dcStyles.emoji}>{challenge.completed ? '✅' : '🎯'}</Text>
            <Text style={dcStyles.label}>{t('home.dailyChallenge')}</Text>
          </View>
          <View style={dcStyles.xpBadge}>
            <Text style={dcStyles.xpText}>+{challenge.xp_reward} XP</Text>
          </View>
        </View>

        <Text style={dcStyles.title}>{challenge.title}</Text>

        <View style={dcStyles.progressRow}>
          <View style={dcStyles.progressBarBg}>
            <View style={[dcStyles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={dcStyles.progressText}>
            {challenge.progress}/{challenge.target}
          </Text>
        </View>

        {challenge.completed && (
          <Text style={dcStyles.completedText}>{t('home.dailyChallengeCompleted')}</Text>
        )}
      </LinearGradient>
    </View>
  );
};

// ==================== Home Screen ====================
export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isOnline } = useOfflineCache();
  const bannerScale = useRef(new Animated.Value(0.9)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;

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
      if (challengeRes.status === 'fulfilled') setDailyChallenge(challengeRes.value.data);
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [fetchHomeData])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bannerScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(bannerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // Build personalized banner text
  const firstName = user?.name?.split(' ')[0] || t('auth.student');
  const streak = bannerData?.streak?.current || 0;

  let bannerTitle = t('home.hello', { name: firstName });
  let bannerSubtitle = t('home.defaultSubtitle');

  if (streak >= 3) {
    bannerTitle = t('home.helloStreak', { name: firstName });
    bannerSubtitle = t('home.streakSubtitle', { count: streak, word: getDayWord(streak, currentLanguage) });
  } else if (bannerData?.section_progress) {
    const inProgress = bannerData.section_progress.find((s) => s.percentage > 0 && s.percentage < 100);
    if (inProgress) {
      // Используем ключ секции для перевода вместо русского названия
      const sectionName = t(`physics.${inProgress.section}`, { defaultValue: inProgress.name }).toLowerCase();
      bannerSubtitle = t('home.continueSubtitle', { section: sectionName, percent: inProgress.percentage });
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with search */}
        <View style={styles.header}>
          <Text style={[styles.appTitle, { color: colors.accent }]}>{t('home.appTitle')}</Text>
          <View style={styles.headerRight}>
            {!isOnline && (
              <View style={[styles.offlineBadge, { backgroundColor: colors.warningBg, borderColor: colors.warning }]}>
                <Text style={[styles.offlineText, { color: colors.warning }]}>{'📶 ' + t('common.offline')}</Text>
              </View>
            )}
            <TouchableOpacity style={[styles.searchButton, { backgroundColor: colors.accentLight }]} onPress={() => setSearchVisible(true)}>
              <Ionicons name="search" size={22} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Personalized Banner */}
        <Animated.View
          style={[
            styles.bannerContainer,
            { transform: [{ scale: bannerScale }], opacity: bannerOpacity },
          ]}
        >
          <LinearGradient
            colors={['#6C63FF', '#4A90D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>{bannerTitle}</Text>
              <Text style={styles.bannerSubtitle}>{bannerSubtitle}</Text>
              {streak > 0 && (
                <View style={styles.streakRow}>
                  <Text style={styles.streakEmoji}>🔥</Text>
                  <Text style={styles.streakText}>{streak} {getDayWord(streak, currentLanguage)}</Text>
                </View>
              )}
            </View>
            <View style={styles.bannerImageContainer}>
              <AnimatedIcon name="planet" size={80} color="rgba(255,255,255,0.4)" animation="rotate" />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Daily Challenge */}
        <View style={styles.dailyChallengeContainer}>
          <DailyChallengeCard challenge={dailyChallenge} />
        </View>

        {/* Quick Search Bar */}
        <TouchableOpacity style={[styles.searchBar, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]} onPress={() => setSearchVisible(true)} activeOpacity={0.7}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <Text style={[styles.searchBarText, { color: colors.textMuted }]}>{t('home.searchPlaceholder')}</Text>
        </TouchableOpacity>

        {/* Menu */}
        <View style={styles.menuContainer}>
          <View style={styles.menuRow}>
            <MenuCard
              title={t('home.lessons')}
              subtitle={t('home.lessonsSubtitle')}
              icon="book"
              color="#4A90D9"
              onPress={() => router.push('/lessons')}
              index={0}
              animation="bounce"
              cardBg={colors.card}
              textColor={colors.text}
              subtitleColor={colors.textTertiary}
              shadowColor={colors.shadowColor}
            />
            <MenuCard
              title={t('home.tasks')}
              subtitle={t('home.tasksSubtitle')}
              icon="calculator"
              color="#E74C3C"
              onPress={() => router.push('/tasks')}
              index={1}
              animation="shake"
              cardBg={colors.card}
              textColor={colors.text}
              subtitleColor={colors.textTertiary}
              shadowColor={colors.shadowColor}
            />
          </View>
          <View style={styles.menuRow}>
            <MenuCard
              title={t('home.tests')}
              subtitle={t('home.testsSubtitle')}
              icon="checkbox"
              color="#1ABC9C"
              onPress={() => router.push('/tests')}
              index={2}
              animation="pulse"
              cardBg={colors.card}
              textColor={colors.text}
              subtitleColor={colors.textTertiary}
              shadowColor={colors.shadowColor}
            />
            <MenuCard
              title={t('home.formulas')}
              subtitle={t('home.formulasSubtitle')}
              icon="flask"
              color="#9B59B6"
              onPress={() => router.push('/formulas')}
              index={3}
              animation="bounce"
              cardBg={colors.card}
              textColor={colors.text}
              subtitleColor={colors.textTertiary}
              shadowColor={colors.shadowColor}
            />
          </View>
          <View style={styles.menuRow}>
            <MenuCard
              title={t('home.connection')}
              subtitle={t('home.connectionSubtitle')}
              icon="link"
              color="#6C63FF"
              onPress={() => router.push('/connect')}
              index={4}
              animation="pulse"
              cardBg={colors.card}
              textColor={colors.text}
              subtitleColor={colors.textTertiary}
              shadowColor={colors.shadowColor}
            />
            <MenuCard
              title={t('home.games')}
              subtitle={t('home.gamesSubtitle')}
              icon="game-controller"
              color="#F59E0B"
              onPress={() => router.push('/games')}
              index={5}
              animation="pulse"
              cardBg={colors.card}
              textColor={colors.text}
              subtitleColor={colors.textTertiary}
              shadowColor={colors.shadowColor}
            />
          </View>
        </View>
      </ScrollView>

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
  // Russian pluralization
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
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offlineBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  banner: {
    borderRadius: 20,
    padding: 24,
    minHeight: 160,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  bannerImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  streakEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dailyChallengeContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  searchBarText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  menuContainer: {
    paddingHorizontal: 16,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardWrapper: {
    flex: 1,
    marginHorizontal: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
});

const searchStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 10,
  },
  searchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 15,
    color: '#6C63FF',
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  resultSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});

const dcStyles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    padding: 16,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  xpBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completedText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
});
