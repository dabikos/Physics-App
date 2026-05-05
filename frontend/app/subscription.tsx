import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { useSubscription } from '../src/context/SubscriptionContext';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    loading,
    error,
    isPro,
    packages,
    purchaseProduct,
    restorePurchases,
    presentPaywall,
    presentCustomerCenter,
    refreshCustomerInfo,
    refreshOfferings,
  } = useSubscription();

  const reload = async () => {
    await Promise.all([refreshCustomerInfo(), refreshOfferings()]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Physics AI Pro</Text>
        <TouchableOpacity style={styles.backButton} onPress={reload}>
          <Ionicons name="refresh" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#111827', '#4338CA', '#06B6D4']} style={styles.hero}>
          <View style={styles.proBadge}>
            <Ionicons name="sparkles" size={18} color="#FDE68A" />
            <Text style={styles.proBadgeText}>{isPro ? 'Active Pro' : 'Upgrade available'}</Text>
          </View>
          <Text style={styles.heroTitle}>Unlock full Physics AI</Text>
          <Text style={styles.heroText}>
            Premium removes ads, unlocks full content access and enables advanced AI learning tools.
          </Text>
        </LinearGradient>

        {loading ? (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ActivityIndicator color={colors.accent} />
            <Text style={[styles.mutedText, { color: colors.textSecondary }]}>Loading subscription data...</Text>
          </View>
        ) : null}

        {error ? (
          <View style={[styles.errorCard, { backgroundColor: colors.errorBg }]}>
            <Ionicons name="warning" size={20} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Plans</Text>
          {packages.length > 0 ? (
            packages.map((item) => (
              <View key={item.identifier} style={[styles.planRow, { borderColor: colors.border }]}>
                <View style={styles.planInfo}>
                  <Text style={[styles.planTitle, { color: colors.text }]}>
                    {item.product.title || item.identifier}
                  </Text>
                  <Text style={[styles.planSubtitle, { color: colors.textSecondary }]}>
                    {item.product.description || item.product.identifier}
                  </Text>
                </View>
                <Text style={[styles.price, { color: colors.accentText }]}>
                  {item.product.priceString}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.mutedText, { color: colors.textSecondary }]}>
              No RevenueCat offering found. Create an offering with monthly and yearly products in the RevenueCat dashboard.
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.accent }]} onPress={presentPaywall}>
            <Ionicons name="card" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Show RevenueCat Paywall</Text>
          </TouchableOpacity>

          <View style={styles.actionGrid}>
            <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => purchaseProduct('monthly')}>
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Buy monthly</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => purchaseProduct('yearly')}>
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Buy yearly</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.secondaryWideButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={restorePurchases}>
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Restore purchases</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.secondaryWideButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={presentCustomerCenter}>
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Open Customer Center</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Access rules</Text>
          <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Entitlement: Physics AI Pro</Text>
          <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Product IDs: monthly, yearly</Text>
          <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Use requirePro() before premium-only actions.</Text>
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
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  content: {
    padding: 20,
    paddingBottom: 44,
    gap: 16,
  },
  hero: {
    borderRadius: 28,
    padding: 24,
    minHeight: 190,
    justifyContent: 'space-between',
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
    fontWeight: '800',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
    marginTop: 26,
  },
  heroText: {
    color: 'rgba(255,255,255,0.82)',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  mutedText: {
    fontSize: 14,
    lineHeight: 21,
  },
  planRow: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  planSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    height: 56,
    borderRadius: 18,
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
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  secondaryWideButton: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  bullet: {
    fontSize: 14,
    lineHeight: 22,
  },
});
