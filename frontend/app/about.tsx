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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';

const APP_VERSION = '1.0.0';
const SUPPORT_EMAIL = 'support@physicsai.app';
const GITHUB_URL = 'https://github.com/dabikos/Physics-App';
const PRIVACY_URL = 'https://github.com/dabikos/Physics-App/blob/main/PRIVACY_POLICY.md';

export default function AboutScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('about.title')}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Logo & Name */}
        <View style={styles.logoSection}>
          <View style={[styles.logoContainer, { backgroundColor: colors.accent + '15' }]}>
            <Ionicons name="flask" size={56} color={colors.accent} />
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
          <TouchableOpacity style={styles.linkRow} onPress={() => openLink(`mailto:${SUPPORT_EMAIL}`)}>
            <View style={styles.linkLeft}>
              <Ionicons name="mail" size={20} color={colors.accent} />
              <Text style={[styles.linkText, { color: colors.textSecondary }]}>{t('about.support')}</Text>
            </View>
            <Text style={[styles.linkValue, { color: colors.textMuted }]}>{SUPPORT_EMAIL}</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.linkRow} onPress={() => openLink(PRIVACY_URL)}>
            <View style={styles.linkLeft}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text style={[styles.linkText, { color: colors.textSecondary }]}>{t('about.privacy')}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.linkRow} onPress={() => openLink(GITHUB_URL)}>
            <View style={styles.linkLeft}>
              <Ionicons name="logo-github" size={20} color={colors.text} />
              <Text style={[styles.linkText, { color: colors.textSecondary }]}>GitHub</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
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
  },
  linkText: {
    fontSize: 15,
    fontWeight: '500',
  },
  linkValue: {
    fontSize: 13,
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
