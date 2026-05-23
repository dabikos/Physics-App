import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { PurchasesPackage } from 'react-native-purchases';
import { useTheme } from '../src/context/ThemeContext';
import { useSubscription } from '../src/context/SubscriptionContext';
import { REVENUECAT_PRODUCTS, type RevenueCatProductId } from '../src/config/revenueCat';

type PayAction = RevenueCatProductId | 'restore' | 'manage' | null;

const SCREEN_COPY = {
  ru: {
    active: 'Активна',
    basic: 'Basic',
    premium: 'Premium',
    title: 'Выберите доступ',
    subtitle: 'Basic открывает весь материал с рекламой. Premium убирает рекламу и дает больше AI-лимитов.',
    expoTitle: 'Покупки недоступны в Expo Go',
    expoText: 'Проверяйте подписки в сборке из Google Play или development build.',
    loading: 'Загрузка подписки...',
    currentPlan: 'Текущий план',
    basicTitle: 'Physics AI Basic',
    basicSubtitle: 'Полный доступ к материалам',
    premiumTitle: 'Physics AI Premium',
    premiumSubtitle: 'Максимум функций без рекламы',
    buyBasic: 'Оформить Basic',
    buyMonthly: 'Premium на месяц',
    buyYearly: 'Premium на год',
    unavailable: 'Не настроено в RevenueCat',
    restore: 'Восстановить покупки',
    manage: 'Управлять подпиской',
    successTitle: 'Подписка активирована',
    successText: 'Доступ обновлен. Если экран не изменился сразу, перезапустите приложение.',
    restoreSuccessTitle: 'Покупки восстановлены',
    restoreSuccessText: 'Активная подписка найдена.',
    restoreEmptyTitle: 'Подписка не найдена',
    restoreEmptyText: 'Для этого аккаунта активная подписка не найдена.',
    manageFallbackTitle: 'Откройте Google Play',
    manageFallbackText: 'Управление подпиской доступно в настройках Google Play.',
    footer: 'Оплата и отмена подписки обрабатываются Google Play. Доступ привязан к аккаунту приложения.',
    basicFeatures: [
      'Все разделы, подразделы, уроки, тесты, задачи и формулы',
      'Решения задач после просмотра награждаемой рекламы',
      '5 генераций тестов и 5 “Изучить больше” в день',
      '10 AI-запросов в день, дополнительные запросы за рекламу',
      'Межстраничная реклама остается',
    ],
    premiumFeatures: [
      'Все материалы без замков',
      'Без межстраничной рекламы',
      '15 генераций тестов и 15 “Изучить больше” в день',
      '30 AI-запросов в день, дополнительные запросы за рекламу',
      'Комфортный режим для регулярного обучения',
    ],
  },
  en: {
    active: 'Active',
    basic: 'Basic',
    premium: 'Premium',
    title: 'Choose access',
    subtitle: 'Basic unlocks all study content with ads. Premium removes ads and gives higher AI limits.',
    expoTitle: 'Purchases are unavailable in Expo Go',
    expoText: 'Test subscriptions in a Google Play build or a development build.',
    loading: 'Loading subscription...',
    currentPlan: 'Current plan',
    basicTitle: 'Physics AI Basic',
    basicSubtitle: 'Full content access',
    premiumTitle: 'Physics AI Premium',
    premiumSubtitle: 'Maximum features without ads',
    buyBasic: 'Get Basic',
    buyMonthly: 'Monthly Premium',
    buyYearly: 'Yearly Premium',
    unavailable: 'Not configured in RevenueCat',
    restore: 'Restore purchases',
    manage: 'Manage subscription',
    successTitle: 'Subscription activated',
    successText: 'Access has been updated. Restart the app if the screen does not refresh immediately.',
    restoreSuccessTitle: 'Purchases restored',
    restoreSuccessText: 'Active subscription found.',
    restoreEmptyTitle: 'No subscription found',
    restoreEmptyText: 'No active subscription was found for this account.',
    manageFallbackTitle: 'Open Google Play',
    manageFallbackText: 'Subscription management is available in Google Play settings.',
    footer: 'Payment and cancellation are handled by Google Play. Access is linked to your app account.',
    basicFeatures: [
      'All sections, subsections, lessons, tests, problems, and formulas',
      'Problem solutions after rewarded ads',
      '5 test generations and 5 “Learn more” generations per day',
      '10 AI chat requests per day, extra requests via ads',
      'Interstitial ads remain enabled',
    ],
    premiumFeatures: [
      'All content unlocked',
      'No interstitial ads',
      '15 test generations and 15 “Learn more” generations per day',
      '30 AI chat requests per day, extra requests via ads',
      'Comfort mode for regular studying',
    ],
  },
  kk: {
    active: 'Белсенді',
    basic: 'Basic',
    premium: 'Premium',
    title: 'Қолжетімділікті таңдаңыз',
    subtitle: 'Basic барлық оқу материалын жарнамамен ашады. Premium жарнаманы алып, AI лимитін көбейтеді.',
    expoTitle: 'Expo Go ішінде сатып алу қолжетімсіз',
    expoText: 'Жазылымдарды Google Play жинағында немесе development build ішінде тексеріңіз.',
    loading: 'Жазылым жүктелуде...',
    currentPlan: 'Ағымдағы жоспар',
    basicTitle: 'Physics AI Basic',
    basicSubtitle: 'Материалдарға толық қолжетімділік',
    premiumTitle: 'Physics AI Premium',
    premiumSubtitle: 'Жарнамасыз максималды мүмкіндіктер',
    buyBasic: 'Basic алу',
    buyMonthly: 'Айлық Premium',
    buyYearly: 'Жылдық Premium',
    unavailable: 'RevenueCat ішінде бапталмаған',
    restore: 'Сатып алуды қалпына келтіру',
    manage: 'Жазылымды басқару',
    successTitle: 'Жазылым іске қосылды',
    successText: 'Қолжетімділік жаңартылды. Экран бірден өзгермесе, қолданбаны қайта ашыңыз.',
    restoreSuccessTitle: 'Сатып алулар қалпына келді',
    restoreSuccessText: 'Белсенді жазылым табылды.',
    restoreEmptyTitle: 'Жазылым табылмады',
    restoreEmptyText: 'Бұл аккаунт үшін белсенді жазылым табылмады.',
    manageFallbackTitle: 'Google Play ашыңыз',
    manageFallbackText: 'Жазылымды Google Play баптауларында басқаруға болады.',
    footer: 'Төлем мен жазылымнан бас тартуды Google Play өңдейді. Қолжетімділік қолданба аккаунтына байланады.',
    basicFeatures: [
      'Барлық бөлімдер, бөлімшелер, сабақтар, тесттер, есептер және формулалар',
      'Есеп шешімдері марапаттық жарнамадан кейін',
      'Күніне 5 тест генерациясы және 5 “Көбірек үйрену” генерациясы',
      'Күніне 10 AI-сұраныс, қосымша сұраныстар жарнама арқылы',
      'Өтпелі жарнама қалады',
    ],
    premiumFeatures: [
      'Барлық материал толық ашық',
      'Өтпелі жарнама жоқ',
      'Күніне 15 тест генерациясы және 15 “Көбірек үйрену” генерациясы',
      'Күніне 30 AI-сұраныс, қосымша сұраныстар жарнама арқылы',
      'Тұрақты оқу үшін ыңғайлы режим',
    ],
  },
} as const;

function normalizeLanguage(language: string) {
  if (language.startsWith('kk')) return 'kk';
  if (language.startsWith('en')) return 'en';
  return 'ru';
}

function findDisplayedPackage(packages: PurchasesPackage[], productId: RevenueCatProductId) {
  const expected = REVENUECAT_PRODUCTS[productId].toLowerCase();
  return (
    packages.find((item) => item.product.identifier.toLowerCase() === expected) ||
    packages.find((item) => item.product.identifier.toLowerCase().startsWith(`${expected}:`)) ||
    packages.find((item) => item.product.identifier.toLowerCase().includes(expected)) ||
    packages.find((item) => item.identifier.toLowerCase().includes(productId))
  );
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { i18n } = useTranslation();
  const copy = SCREEN_COPY[normalizeLanguage(i18n.language)];
  const isExpoGo = Constants.appOwnership === 'expo';
  const {
    loading,
    error,
    hasFullContent,
    subscriptionTier,
    packages,
    purchaseProduct,
    restorePurchases,
    presentCustomerCenter,
  } = useSubscription();
  const [actionLoading, setActionLoading] = useState<PayAction>(null);

  const basicPackage = useMemo(() => findDisplayedPackage(packages, 'basic'), [packages]);
  const monthlyPackage = useMemo(() => findDisplayedPackage(packages, 'monthly'), [packages]);
  const yearlyPackage = useMemo(() => findDisplayedPackage(packages, 'yearly'), [packages]);

  const openStoreSubscriptionSettings = useCallback(async () => {
    const url = Platform.OS === 'android'
      ? 'https://play.google.com/store/account/subscriptions?package=com.physicsai.app'
      : 'https://apps.apple.com/account/subscriptions';

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(copy.manageFallbackTitle, copy.manageFallbackText);
    }
  }, [copy.manageFallbackText, copy.manageFallbackTitle]);

  const handlePurchase = useCallback(async (productId: RevenueCatProductId) => {
    if (actionLoading || isExpoGo) return;

    setActionLoading(productId);
    try {
      const purchased = await purchaseProduct(productId);
      if (purchased) {
        Alert.alert(copy.successTitle, copy.successText);
      }
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, copy.successText, copy.successTitle, isExpoGo, purchaseProduct]);

  const handleRestore = useCallback(async () => {
    if (actionLoading || isExpoGo) return;

    setActionLoading('restore');
    try {
      const restored = await restorePurchases();
      Alert.alert(
        restored ? copy.restoreSuccessTitle : copy.restoreEmptyTitle,
        restored ? copy.restoreSuccessText : copy.restoreEmptyText,
      );
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, copy.restoreEmptyText, copy.restoreEmptyTitle, copy.restoreSuccessText, copy.restoreSuccessTitle, isExpoGo, restorePurchases]);

  const handleManage = useCallback(async () => {
    if (actionLoading || isExpoGo) return;

    setActionLoading('manage');
    try {
      if (Platform.OS === 'android') {
        await openStoreSubscriptionSettings();
        return;
      }

      const opened = await presentCustomerCenter();
      if (!opened) {
        await openStoreSubscriptionSettings();
      }
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, isExpoGo, openStoreSubscriptionSettings, presentCustomerCenter]);

  const renderButton = (
    label: string,
    productId: RevenueCatProductId,
    packageToBuy?: PurchasesPackage,
    variant: 'basic' | 'premium' = 'basic',
  ) => {
    const disabled = isExpoGo || actionLoading !== null || !packageToBuy;
    const loadingThis = actionLoading === productId;

    return (
      <TouchableOpacity
        style={[styles.planButton, variant === 'premium' && styles.premiumButton, disabled && styles.disabledButton]}
        onPress={() => handlePurchase(productId)}
        disabled={disabled}
        activeOpacity={0.9}
      >
        {loadingThis ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.planButtonText}>{packageToBuy ? label : copy.unavailable}</Text>
            {packageToBuy ? <Text style={styles.planPrice}>{packageToBuy.product.priceString}</Text> : null}
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Physics AI</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#0F172A', '#1D4ED8', '#14B8A6']} style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.proBadge}>
            <Ionicons name="sparkles" size={18} color="#FDE68A" />
            <Text style={styles.proBadgeText}>
              {hasFullContent ? `${copy.active}: ${subscriptionTier === 'basic' ? copy.basic : copy.premium}` : 'Physics AI'}
            </Text>
          </View>
          <Text style={styles.heroTitle}>{copy.title}</Text>
          <Text style={styles.heroText}>{copy.subtitle}</Text>
        </LinearGradient>

        {isExpoGo ? (
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="phone-portrait" size={20} color={colors.accent} />
            <View style={styles.infoTextBlock}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>{copy.expoTitle}</Text>
              <Text style={[styles.mutedText, { color: colors.textSecondary }]}>{copy.expoText}</Text>
            </View>
          </View>
        ) : null}

        {loading && !isExpoGo ? (
          <View style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator color={colors.accent} />
            <Text style={[styles.mutedText, { color: colors.textSecondary }]}>{copy.loading}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={[styles.errorCard, { backgroundColor: colors.errorBg }]}>
            <Ionicons name="warning" size={20} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.plans}>
          <View style={[styles.planCard, styles.basicPlan, { backgroundColor: colors.card, borderColor: subscriptionTier === 'basic' ? '#14B8A6' : colors.border }]}>
            {subscriptionTier === 'basic' ? <Text style={styles.activeBadge}>{copy.currentPlan}</Text> : null}
            <View style={styles.planHeader}>
              <View style={styles.basicIcon}>
                <Ionicons name="library" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.planTitleBlock}>
                <Text style={[styles.planTitle, { color: colors.text }]}>{copy.basicTitle}</Text>
                <Text style={[styles.planSubtitle, { color: colors.textTertiary }]}>{copy.basicSubtitle}</Text>
              </View>
            </View>
            {copy.basicFeatures.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color="#14B8A6" />
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feature}</Text>
              </View>
            ))}
            {subscriptionTier === 'basic' ? (
              <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.border }]} onPress={handleManage} disabled={isExpoGo || actionLoading !== null}>
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{copy.manage}</Text>
              </TouchableOpacity>
            ) : (
              renderButton(copy.buyBasic, 'basic', basicPackage, 'basic')
            )}
          </View>

          <View style={[styles.planCard, styles.premiumPlan, { backgroundColor: colors.card, borderColor: subscriptionTier === 'pro' ? '#6366F1' : colors.border }]}>
            {subscriptionTier === 'pro' ? <Text style={styles.activeBadge}>{copy.currentPlan}</Text> : null}
            <View style={styles.planHeader}>
              <LinearGradient colors={['#6366F1', '#06B6D4']} style={styles.premiumIcon}>
                <Ionicons name="diamond" size={22} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.planTitleBlock}>
                <Text style={[styles.planTitle, { color: colors.text }]}>{copy.premiumTitle}</Text>
                <Text style={[styles.planSubtitle, { color: colors.textTertiary }]}>{copy.premiumSubtitle}</Text>
              </View>
            </View>
            {copy.premiumFeatures.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color="#6366F1" />
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feature}</Text>
              </View>
            ))}
            <View style={styles.premiumActions}>
              {subscriptionTier === 'pro' ? (
                <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.border }]} onPress={handleManage} disabled={isExpoGo || actionLoading !== null}>
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{copy.manage}</Text>
                </TouchableOpacity>
              ) : (
                <>
                  {renderButton(copy.buyMonthly, 'monthly', monthlyPackage, 'premium')}
                  {renderButton(copy.buyYearly, 'yearly', yearlyPackage, 'premium')}
                </>
              )}
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={isExpoGo || actionLoading !== null}>
            {actionLoading === 'restore' ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <Text style={[styles.restoreText, { color: colors.textSecondary }]}>{copy.restore}</Text>
            )}
          </TouchableOpacity>
          {hasFullContent ? (
            <TouchableOpacity style={styles.restoreButton} onPress={handleManage} disabled={isExpoGo || actionLoading !== null}>
              {actionLoading === 'manage' ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <Text style={[styles.restoreText, { color: colors.textSecondary }]}>{copy.manage}</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={[styles.footerText, { color: colors.textTertiary }]}>{copy.footer}</Text>
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
    color: 'rgba(255,255,255,0.86)',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
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
  loadingCard: {
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
  plans: {
    gap: 16,
  },
  planCard: {
    borderWidth: 2,
    borderRadius: 28,
    padding: 18,
    gap: 12,
  },
  basicPlan: {
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  premiumPlan: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 4,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    color: '#047857',
    fontSize: 11,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  basicIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitleBlock: {
    flex: 1,
  },
  planTitle: {
    fontSize: 19,
    fontWeight: '900',
  },
  planSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  premiumActions: {
    gap: 10,
  },
  planButton: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#14B8A6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumButton: {
    backgroundColor: '#6366F1',
  },
  planButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  planPrice: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.45,
  },
  actions: {
    gap: 2,
  },
  restoreButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 14,
  },
});
