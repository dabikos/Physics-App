import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_REDIRECT_URI } from '../../src/config/google';

WebBrowser.maybeCompleteAuthSession();

// Generate PKCE code verifier & challenge
async function generatePKCE() {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  const codeVerifier = btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    codeVerifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  const codeChallenge = digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return { codeVerifier, codeChallenge };
}

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogleCode } = useAuth();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Анимация ошибки
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      setError(t('auth.enterEmail'));
      shake();
      return;
    }
    if (!password) {
      setError(t('auth.enterPassword'));
      shake();
      return;
    }

    setError(null);
    setLoading(true);

    const result = await signIn(email.trim(), password);
    
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      // If email not verified, redirect to verification
      if (result.error?.includes('не подтверждён')) {
        router.push({ pathname: '/(auth)/verify-email', params: { email: email.trim() } });
        return;
      }
      setError(result.error || t('auth.loginError'));
      shake();
    }
  };

  const handleGoogleSignIn = async () => {
    if (!GOOGLE_WEB_CLIENT_ID) {
      setError(t('auth.googleSetupRequired'));
      shake();
      return;
    }
    setError(null);
    setGoogleLoading(true);
    try {
      const { codeVerifier, codeChallenge } = await generatePKCE();

      // Return URL for app — where backend will redirect with the code
      const returnUrl = Linking.createURL('auth');

      // Build Google OAuth URL with backend as redirect_uri
      const params = new URLSearchParams({
        client_id: GOOGLE_WEB_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: 'openid profile email',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: returnUrl,
        access_type: 'offline',
        prompt: 'select_account',
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      // Open browser — it will redirect: Google → backend → app deep link
      const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          setError(error);
          shake();
        } else if (code) {
          // Exchange code for tokens via backend
          const authResult = await signInWithGoogleCode(code, codeVerifier, GOOGLE_REDIRECT_URI);
          if (authResult.success) {
            router.replace('/(tabs)');
          } else {
            setError(authResult.error || t('auth.googleError'));
            shake();
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || t('auth.googleError'));
      shake();
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#0F0C29', '#302B63', '#24243E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Кнопка назад */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Заголовок */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="log-in" size={32} color="#667EEA" />
              </View>
              <Text style={styles.title}>{t('auth.login')}</Text>
              <Text style={styles.subtitle}>
                {t('auth.loginSubtitle')}
              </Text>
            </View>

            {/* Форма */}
            <Animated.View 
              style={[
                styles.form,
                { transform: [{ translateX: shakeAnim }] }
              ]}
            >
              {/* Email */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="mail-outline" size={20} color="#667EEA" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                />
              </View>

              {/* Пароль */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="lock-closed-outline" size={20} color="#667EEA" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.password')}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(null);
                  }}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="rgba(255,255,255,0.6)"
                  />
                </TouchableOpacity>
              </View>

              {/* Забыли пароль */}
              <TouchableOpacity
                style={styles.forgotButton}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text style={styles.forgotButtonText}>{t('auth.forgotPassword')}</Text>
              </TouchableOpacity>

              {/* Ошибка */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Кнопка входа */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={loading ? ['#4A5568', '#4A5568'] : ['#667EEA', '#764BA2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
                      <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Разделитель */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('auth.or')}</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign-In */}
              <TouchableOpacity
                style={[styles.googleButton, googleLoading && styles.loginButtonDisabled]}
                onPress={handleGoogleSignIn}
                disabled={googleLoading}
                activeOpacity={0.9}
              >
                {googleLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={20} color="#FFFFFF" />
                    <Text style={styles.googleButtonText}>{t('auth.continueWithGoogle')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Регистрация */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('auth.noAccount')}</Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
                <Text style={styles.registerLink}>{t('auth.register')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    height: 58,
  },
  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  eyeButton: {
    padding: 8,
  },
  forgotButton: {
    alignSelf: 'flex-end',
  },
  forgotButtonText: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#FCA5A5',
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonDisabled: {
    shadowOpacity: 0,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 16,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 6,
  },
  footerText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
  },
  registerLink: {
    fontSize: 15,
    color: '#667EEA',
    fontWeight: '600',
  },
});













