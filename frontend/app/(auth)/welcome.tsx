import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { SupportedLanguage } from '../../src/config/i18n';

const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  try {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  } catch {}
};

export default function WelcomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const isAuthenticated = !!user;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, logoScale, slideAnim]);

  const handleLangChange = (code: SupportedLanguage) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    changeLanguage(code);
  };

  const featureCards = [
    {
      icon: 'sparkles' as const,
      color: '#818CF8',
      bg: 'rgba(99, 102, 241, 0.12)',
      title: t('auth.feature1Title', { defaultValue: 'AI-Репетитор' }),
      desc: t('auth.feature1Desc', { defaultValue: 'Пошаговые решения и объяснения 24/7' }),
    },
    {
      icon: 'flash' as const,
      color: '#38BDF8',
      bg: 'rgba(56, 189, 248, 0.12)',
      title: t('auth.feature2Title', { defaultValue: 'Формулы и справочник' }),
      desc: t('auth.feature2Desc', { defaultValue: 'Все формулы с выводом и единицами величин' }),
    },
    {
      icon: 'ribbon' as const,
      color: '#34D399',
      bg: 'rgba(52, 211, 153, 0.12)',
      title: t('auth.feature3Title', { defaultValue: 'Тесты и практика' }),
      desc: t('auth.feature3Desc', { defaultValue: 'Блиц-тесты и сотни реальных задач' }),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Dark Quantum Space Gradient */}
      <LinearGradient
        colors={['#070A13', '#0B1222', '#0A0F1D']}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient background glow orbs */}
      <View style={[styles.glowOrb, styles.glowOrbTop]} pointerEvents="none" />
      <View style={[styles.glowOrb, styles.glowOrbBottom]} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Top Bar: Language Switcher */}
          <View style={styles.topBar}>
            <View style={styles.langCapsule}>
              {availableLanguages.map((lang) => {
                const isActive = currentLanguage === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.langTab, isActive && styles.langTabActive]}
                    onPress={() => handleLangChange(lang.code)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.langText, isActive && styles.langTextActive]}>
                      {lang.code.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Hero Section */}
          <Animated.View
            style={[
              styles.heroContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Orbital Glowing Logo */}
            <View style={styles.logoWrapper}>
              <View style={styles.outerOrbit} />
              <View style={styles.innerOrbit} />
              <Animated.View
                style={[
                  styles.logoCard,
                  { transform: [{ scale: logoScale }] },
                ]}
              >
                <LinearGradient
                  colors={['#172036', '#0F172A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoInnerGradient}
                >
                  <Image
                    source={require('../../assets/images/splash-logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Badge Pill */}
            <View style={styles.badgePill}>
              <Ionicons name="flash" size={12} color="#60A5FA" />
              <Text style={styles.badgeText}>
                {t('auth.welcomeBadge', { defaultValue: 'Физика с поддержкой AI ⚡' })}
              </Text>
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.mainTitle}>
              {t('auth.welcomeTitle', { defaultValue: 'Physics AI' })}
            </Text>
            <Text style={styles.mainSubtitle}>
              {isAuthenticated
                ? t('auth.welcome', { name: user?.name || '', defaultValue: 'Добро пожаловать!' })
                : t('auth.welcomeSubtitle', {
                    defaultValue: 'Интерактивная платформа для глубокого и понятного изучения физики',
                  })}
            </Text>
          </Animated.View>

          {/* Feature Bento Cards */}
          <Animated.View
            style={[
              styles.featuresContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {featureCards.map((feat, idx) => (
              <View key={idx} style={styles.featureRow}>
                <View style={[styles.featureIconBox, { backgroundColor: feat.bg }]}>
                  <Ionicons name={feat.icon} size={18} color={feat.color} />
                </View>
                <View style={styles.featureTextBox}>
                  <Text style={styles.featureTitle}>{feat.title}</Text>
                  <Text style={styles.featureDesc} numberOfLines={2}>
                    {feat.desc}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* Bottom Action Section */}
          <Animated.View
            style={[
              styles.actionsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {isAuthenticated ? (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                  router.replace('/(tabs)');
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#4F46E5', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryGradient}
                >
                  <Text style={styles.primaryBtnText}>
                    {t('auth.continue', { defaultValue: 'Продолжить' })}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <>
                {/* Register CTA */}
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                    router.push('/(auth)/register');
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#4F46E5', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryGradient}
                  >
                    <Text style={styles.primaryBtnText}>
                      {t('auth.createAccount', { defaultValue: 'Создать аккаунт' })}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>

                {/* Login CTA */}
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => {
                    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/(auth)/login');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryBtnText}>
                    {t('auth.haveAccount', { defaultValue: 'Уже есть аккаунт? Войти' })}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A13',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 24,
  },
  glowOrb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.22,
  },
  glowOrbTop: {
    top: -50,
    right: -40,
    backgroundColor: '#6366F1',
  },
  glowOrbBottom: {
    bottom: 80,
    left: -60,
    backgroundColor: '#38BDF8',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 12,
  },
  langCapsule: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  langTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  langTabActive: {
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  langTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroContainer: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  outerOrbit: {
    position: 'absolute',
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    borderStyle: 'dashed',
  },
  innerOrbit: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.15)',
  },
  logoCard: {
    width: 78,
    height: 78,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
  },
  logoInnerGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 58,
    height: 58,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.25)',
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#93C5FD',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  featuresContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextBox: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 16,
    color: '#94A3B8',
  },
  actionsContainer: {
    gap: 10,
    paddingTop: 6,
  },
  primaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  guestBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
  },
});
