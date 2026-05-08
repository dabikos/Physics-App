import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../src/context/ThemeContext';
import { useSubscription } from '../src/context/SubscriptionContext';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const isExpoGo = Constants.appOwnership === 'expo';
  const {
    loading,
    error,
    isPro,
    packages,
    restorePurchases,
    presentPaywall,
    presentCustomerCenter,
  } = useSubscription();
  const [actionLoading, setActionLoading] = useState(false);

  const benefits = [
    { icon: 'ban', text: t('subscription.benefitNoAds') },
    { icon: 'library', text: t('subscription.benefitFullAccess') },
    { icon: 'sparkles', text: t('subscription.benefitAiTools') },
    { icon: 'bulb', text: t('subscription.benefitSolutions') },
  ];

  const openStoreSubscriptionSettings = useCallback(async () => {
    const url = Platform.OS === 'android'
      ? 'https://play.google.com/store/account/subscriptions?package=com.physicsai.app'
      : 'https://apps.apple.com/account/subscriptions';

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('subscription.manageFallbackTitle'), t('subscription.manageFallbackText'));
    }
  }, [t]);

  const handlePrimaryAction = useCallback(async () => {
    if (actionLoading || isExpoGo) return;

    setActionLoading(true);
    try {
      if (isPro) {
        const opened = await presentCustomerCenter();
        if (!opened) {
          await openStoreSubscriptionSettings();
        }
        return;
      }

      const purchased = await presentPaywall();
      if (purchased) {
        Alert.alert(t('subscription.purchaseSuccessTitle'), t('subscription.purchaseSuccessText'));
      }
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, isExpoGo, isPro, openStoreSubscriptionSettings, presentCustomerCenter, presentPaywall, t]);

  const handleRestore = useCallback(async () => {
    if (actionLoading || isExpoGo) return;

    setActionLoading(true);
    try {
      const restored = await restorePurchases();
      Alert.alert(
        restored ? t('subscription.restoreSuccessTitle') : t('subscription.restoreEmptyTitle'),
        restored ? t('subscription.restoreSuccessText') : t('subscription.restoreEmptyText'),
      );
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, isExpoGo, restorePurchases, t]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Physics AI Pro</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#10172F', '#312E81', '#0891B2']} style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.proBadge}>
            <Ionicons name="sparkles" size={18} color="#FDE68A" />
            <Text style={styles.proBadgeText}>
              {isPro ? t('subscription.activeBadge') : t('subscription.proBadge')}
            </Text>
          </View>
          <Text style={styles.heroTitle}>{t('subscription.heroTitle')}</Text>
          <Text style={styles.heroText}>{t('subscription.heroSubtitle')}</Text>
        </LinearGradient>

        {isExpoGo ? (
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="phone-portrait" size={20} color={colors.accent} />
            <View style={styles.infoTextBlock}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>{t('subscription.expoGoTitle')}</Text>
              <Text style={[styles.mutedText, { color: colors.textSecondary }]}>{t('subscription.expoGoText')}</Text>
            </View>
          </View>
        ) : null}

        {loading && !isExpoGo ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator color={colors.accent} />
            <Text style={[styles.mutedText, { color: colors.textSecondary }]}>{t('subscription.loading')}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={[styles.errorCard, { backgroundColor: colors.errorBg }]}>
            <Ionicons name="warning" size={20} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}

        <View style={[styles.benefitsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('subscription.includes')}</Text>
          {benefits.map((item) => (
            <View key={item.text} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons name={item.icon as any} size={18} color="#FFFFFF" />
              </View>
              <Text style={[styles.benefitText, { color: colors.text }]}>{item.text}</Text>
            </View>
          ))}
        </View>

        {packages.length > 0 ? (
          <View style={styles.planGrid}>
            {packages.slice(0, 2).map((item) => {
              const id = `${item.identifier} ${item.product.identifier}`.toLowerCase();
              const isYearly = id.includes('annual') || id.includes('year');
              return (
                <View
                  key={item.identifier}
                  style={[
                    styles.planChip,
                    { backgroundColor: colors.card, borderColor: isYearly ? '#22D3EE' : colors.border },
                  ]}
                >
                  {isYearly ? <Text style={styles.bestBadge}>{t('subscription.bestValue')}</Text> : null}
                  <Text style={[styles.planTitle, { color: colors.text }]}>
                    {isYearly ? t('subscription.yearly') : t('subscription.monthly')}
                  </Text>
                  <Text style={[styles.price, { color: colors.accentText }]}>{item.product.priceString}</Text>
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, (isExpoGo || actionLoading) && styles.disabledButton]}
            onPress={handlePrimaryAction}
            disabled={isExpoGo || actionLoading}
            activeOpacity={0.9}
          >
            <LinearGradient colors={['#6366F1', '#06B6D4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryButtonGradient}>
              {actionLoading ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name={isPro ? 'settings' : 'lock-open'} size={20} color="#FFFFFF" />}
              <Text style={styles.primaryButtonText}>
                {isPro ? t('subscription.manageButton') : t('subscription.ctaButton')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={isExpoGo || actionLoading}>
            <Text style={[styles.restoreText, { color: colors.textSecondary }]}>{t('subscription.restore')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footerText, { color: colors.textTertiary }]}>{t('subscription.footer')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  content: {
    padding: 20,
    paddingBottom: 44,
    gap: 16,
  },
  hero: {
    borderRadius: 30,
    padding: 24,
    minHeight: 230,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    right: -46,
    top: -28,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  proBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
    marginTop: 26,
  },
  heroText: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  errorCard: {
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontWeight: '700',
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  infoTextBlock: {
    flex: 1,
    gap: 6,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  mutedText: {
    fontSize: 14,
    lineHeight: 21,
  },
  benefitsCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  planGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  planChip: {
    flex: 1,
    minHeight: 94,
    borderWidth: 2,
    borderRadius: 22,
    padding: 14,
    justifyContent: 'center',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
  },
  bestBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: '#22D3EE',
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  actions: {
    gap: 10,
  },
  primaryButton: {
    height: 58,
    borderRadius: 20,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.45,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 14,
  },
});
