import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';

const APP_VERSION = '1.0.0';
const SUPPORT_EMAIL = 'support@physicsai.me';
const TELEGRAM_URL = 'https://t.me/+4nopjpXt51w0YjMy';
const PRIVACY_URL = 'https://github.com/dabikos/Physics-App/blob/main/PRIVACY_POLICY.md';

export default function AboutScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const linkItems: {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBackground: string;
    label: string;
    value: string;
    onPress: () => void;
  }[] = [
    {
      icon: 'mail',
      iconColor: colors.accent,
      iconBackground: colors.accent + '15',
      label: t('about.support'),
      value: SUPPORT_EMAIL,
      onPress: () => openLink(`mailto:${SUPPORT_EMAIL}`),
    },
    {
      icon: 'shield-checkmark',
      iconColor: '#10B981',
      iconBackground: 'rgba(16,185,129,0.12)',
      label: t('about.privacy'),
      value: t('common.open'),
      onPress: () => openLink(PRIVACY_URL),
    },
    {
      icon: 'paper-plane',
      iconColor: '#229ED9',
      iconBackground: 'rgba(34,158,217,0.12)',
      label: t('about.telegram'),
      value: t('common.open'),
      onPress: () => openLink(TELEGRAM_URL),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('about.title')}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* Logo & Name */}
        <View style={styles.logoSection}>
          <View style={[styles.logoContainer, { backgroundColor: colors.accent + '15' }]}>
            <Image
              source={require('../assets/images/adaptive-icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>Физика AI</Text>
          <Text style={[styles.version, { color: colors.textMuted }]}>v{APP_VERSION}</Text>
        </View>

        {/* Description */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t('about.description')}
          </Text>
        </View>

        {/* Features */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('about.features')}</Text>
          {[
            { icon: 'book', color: '#6C63FF', text: t('about.featureLessons') },
            { icon: 'calculator', color: '#10B981', text: t('about.featureFormulas') },
            { icon: 'clipboard', color: '#F59E0B', text: t('about.featureTests') },
            { icon: 'chatbubble-ellipses', color: '#3B82F6', text: t('about.featureAI') },
            { icon: 'game-controller', color: '#EF4444', text: t('about.featureGames') },
            { icon: 'people', color: '#8B5CF6', text: t('about.featureTeacher') },
          ].map((item, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Links */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {linkItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity style={styles.linkRow} onPress={item.onPress}>
                <View style={styles.linkLeft}>
                  <View style={[styles.linkIconBox, { backgroundColor: item.iconBackground }]}>
                    <Ionicons name={item.icon} size={18} color={item.iconColor} />
                  </View>
                  <View style={styles.linkMeta}>
                    <Text style={[styles.linkText, { color: colors.textSecondary }]}>{item.label}</Text>
                    <Text style={[styles.linkValue, { color: colors.textMuted }]}>{item.value}</Text>
                  </View>
                </View>
                <Ionicons name="open-outline" size={18} color={colors.textMuted} />
              </TouchableOpacity>

              {index < linkItems.length - 1 ? (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              ) : null}
            </React.Fragment>
          ))}
        </View>

        {/* Credits */}
        <View style={styles.credits}>
          <Text style={[styles.creditsText, { color: colors.textMuted }]}>
            {t('about.madeWith')}
          </Text>
          <Text style={[styles.creditsText, { color: colors.textMuted }]}>
            © 2026 Физика AI
          </Text>
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
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerPlaceholder: {
    width: 44,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  logoImage: {
    width: 76,
    height: 76,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
  },
  version: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  linkIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkMeta: {
    flex: 1,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
  },
  linkValue: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  credits: {
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  creditsText: {
    fontSize: 13,
  },
});
