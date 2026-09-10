import React, { useRef } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../src/context/ThemeContext';
import { useSubscription } from '../src/context/SubscriptionContext';

const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  try {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  } catch {}
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isExpoGo = Constants.appOwnership === 'expo';
  const ctaScale = useRef(new Animated.Value(1)).current;

  const {
    loading,
    error,
    isPro,
    packages,
    restorePurchases,
    presentPaywall,
  } = useSubscription();

  const benefits = [
    {
      icon: 'sparkles' as const,
      gradient: ['#8B5CF6', '#6D28D9'] as [string, string],
      title: t('subscription.benefitAiTools', { defaultValue: 'Безлимитный AI-репетитор' }),
      sub: 'Мгновенные ответы и решение сложных задач 24/7',
    },
    {
      icon: 'library-outline' as const,
      gradient: ['#3B82F6', '#1D4ED8'] as [string, string],
      title: t('subscription.benefitFullAccess', { defaultValue: 'Полная база знаний' }),
      sub: 'Доступ ко всем 142 темам, 61 формуле и 710 задачам',
    },
    {
      icon: 'bulb-outline' as const,
      gradient: ['#F59E0B', '#D97706'] as [string, string],
      title: t('subscription.benefitSolutions', { defaultValue: 'Пошаговые разборы' }),
      sub: 'Подробные ходы решения каждой физической задачи',
    },
    {
      icon: 'ban-outline' as const,
      gradient: ['#10B981', '#047857'] as [string, string],
      title: t('subscription.benefitNoAds', { defaultValue: 'Никакой рекламы' }),
      sub: 'Чистый фокус на обучении без отвлекающих пауз',
    },
  ];

  const handleCtaPress = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    presentPaywall();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ==================== Top Header ==================== */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Physics AI Pro</Text>
        <View style={styles.closeBtnPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================== Hero Card ==================== */}
        <LinearGradient
          colors={['#0F172A', '#1E1B4B', '#312E81']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          {/* Ambient Glow Graphic */}
          <View style={styles.ambientGlow} />
          <View style={styles.heroOrbitIcon}>
            <Ionicons name="planet" size={120} color="rgba(255, 255, 255, 0.08)" />
          </View>

          {/* Pro Pill Badge */}
          <View style={styles.proBadgeRow}>
            <LinearGradient
              colors={['#F59E0B', '#FBBF24']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.proBadge}
            >
              <Ionicons name="sparkles" size={14} color="#78350F" />
              <Text style={styles.proBadgeText}>
                {isPro ? t('subscription.activeBadge', { defaultValue: 'PRO АКТИВЕН' }) : 'PREMIUM'}
              </Text>
            </LinearGradient>
          </View>

          <Text style={styles.heroTitle}>
            {t('subscription.heroTitle', { defaultValue: 'Прокачай физику на максимум' })}
          </Text>

          <Text style={styles.heroSub}>
            {t('subscription.heroSubtitle', {
              defaultValue: 'Безлимитный AI-помощник, все решения задач и персональные тесты без ограничений.',
            })}
          </Text>
        </LinearGradient>

        {/* Expo Go Notice if running in sandbox */}
        {isExpoGo && (
          <View style={[styles.expoNotice, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="phone-portrait-outline" size={20} color="#6366F1" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.expoNoticeTitle, { color: colors.text }]}>
                {t('subscription.expoGoTitle', { defaultValue: 'Режим демонстрации (Expo Go)' })}
              </Text>
              <Text style={[styles.expoNoticeSub, { color: colors.textSecondary }]}>
                {t('subscription.expoGoText', { defaultValue: 'Настоящие покупки активируются в релизном приложении из App Store / Google Play.' })}
              </Text>
            </View>
          </View>
        )}

        {/* Loading / Error States */}
        {loading && !isExpoGo && (
          <View style={[styles.stateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator color="#6366F1" size="small" />
            <Text style={[styles.stateCardText, { color: colors.textSecondary }]}>
              {t('subscription.loading', { defaultValue: 'Загрузка тарифов...' })}
            </Text>
          </View>
        )}

        {error ? (
          <View style={[styles.errorCard, { backgroundColor: colors.errorBg }]}>
            <Ionicons name="warning" size={18} color={colors.error} />
            <Text style={[styles.errorCardText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}

        {/* ==================== Benefits List ==================== */}
        <View style={styles.benefitsSection}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            {t('subscription.includes', { defaultValue: 'Что входит в подписку Pro:' })}
          </Text>

          <View style={styles.benefitsGrid}>
            {benefits.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.benefitCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    shadowColor: colors.shadowColor,
                  },
                ]}
              >
                <LinearGradient
                  colors={item.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.benefitIconBadge}
                >
                  <Ionicons name={item.icon} size={20} color="#FFFFFF" />
                </LinearGradient>

                <View style={styles.benefitTextWrap}>
                  <Text style={[styles.benefitTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.benefitSub, { color: colors.textTertiary }]}>{item.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ==================== Plans Grid ==================== */}
        {packages.length > 0 && (
          <View style={styles.plansSection}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Выберите тариф:</Text>
            <View style={styles.plansRow}>
              {packages.slice(0, 2).map((item) => {
                const id = `${item.identifier} ${item.product.identifier}`.toLowerCase();
                const isYearly = id.includes('annual') || id.includes('year');

                return (
                  <View
                    key={item.identifier}
                    style={[
                      styles.planCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: isYearly ? '#6366F1' : colors.border,
                        shadowColor: colors.shadowColor,
                      },
                    ]}
                  >
                    {isYearly && (
                      <View style={styles.bestValueBadge}>
                        <Text style={styles.bestValueText}>-45% ВЫГОДА</Text>
                      </View>
                    )}
                    <Text style={[styles.planPeriod, { color: colors.text }]}>
                      {isYearly
                        ? t('subscription.yearly', { defaultValue: '1 Год' })
                        : t('subscription.monthly', { defaultValue: '1 Месяц' })}
                    </Text>
                    <Text style={[styles.planPrice, { color: '#6366F1' }]}>
                      {item.product.priceString}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ==================== CTA Button ==================== */}
        <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
          <TouchableOpacity
            style={[styles.ctaButton, isExpoGo && styles.ctaDisabled]}
            onPress={handleCtaPress}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#4F46E5', '#7C3AED', '#A855F7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>
                {isPro
                  ? t('subscription.activeBadge', { defaultValue: 'Подписка активна' })
                  : t('subscription.upgradeCta', { defaultValue: 'Оформить Physics AI Pro' })}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Restore Purchases */}
        <TouchableOpacity
          style={styles.restoreBtn}
          onPress={() => {
            triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
            restorePurchases();
          }}
        >
          <Text style={[styles.restoreBtnText, { color: colors.textTertiary }]}>
            {t('subscription.restore', { defaultValue: 'Восстановить покупки' })}
          </Text>
        </TouchableOpacity>

        {/* Trust Badges */}
        <View style={styles.trustFooter}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.textTertiary} />
            <Text style={[styles.trustText, { color: colors.textTertiary }]}>
              Безопасная оплата
            </Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="refresh-outline" size={14} color={colors.textTertiary} />
            <Text style={[styles.trustText, { color: colors.textTertiary }]}>
              Отмена в любой момент
            </Text>
          </View>
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
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnPlaceholder: {
    width: 38,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  heroCard: {
    borderRadius: 24,
    padding: 22,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  ambientGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    top: -50,
    right: -50,
  },
  heroOrbitIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
  },
  proBadgeRow: {
    marginBottom: 12,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  proBadgeText: {
    color: '#78350F',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 8,
    lineHeight: 29,
  },
  heroSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    lineHeight: 20,
  },
  expoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  expoNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  expoNoticeSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  stateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  stateCardText: {
    fontSize: 13,
    fontWeight: '600',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorCardText: {
    fontSize: 13,
    fontWeight: '600',
  },
  benefitsSection: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  benefitsGrid: {
    gap: 10,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  benefitIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitTextWrap: {
    flex: 1,
    marginLeft: 14,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  benefitSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  plansSection: {
    marginBottom: 24,
  },
  plansRow: {
    flexDirection: 'row',
    gap: 12,
  },
  planCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 2,
    padding: 16,
    position: 'relative',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: '#6366F1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bestValueText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  planPeriod: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800',
  },
  ctaButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    marginBottom: 14,
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 16,
  },
  restoreBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  trustFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
