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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_REDIRECT_URI } from '../../src/config/google';

WebBrowser.maybeCompleteAuthSession();

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

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, signInWithGoogleCode } = useAuth();
  const { t } = useTranslation();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [classId, setClassId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

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

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async () => {
    // Валидация
    if (!name.trim()) {
      setError(t('auth.enterName'));
      shake();
      return;
    }
    if (!email.trim()) {
      setError(t('auth.enterEmail'));
      shake();
      return;
    }
    if (!validateEmail(email.trim())) {
      setError(t('auth.invalidEmail'));
      shake();
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      shake();
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDontMatch'));
      shake();
      return;
    }

    setError(null);
    setLoading(true);

    const result = await signUp(email.trim(), password, name.trim(), role, classId.trim());
    
    setLoading(false);

    if (result.success) {
      if (result.verificationRequired) {
        router.push({ pathname: '/(auth)/verify-email', params: { email: email.trim() } });
      } else {
        router.replace('/(tabs)');
      }
    } else {
      setError(result.error || t('auth.registerError'));
      shake();
    }
  };

  const handleGoogleSignIn = async (selectedRole: 'student' | 'teacher') => {
    setShowRoleModal(false);
    if (!GOOGLE_WEB_CLIENT_ID) {
      setError(t('auth.googleSetupRequired'));
      shake();
      return;
    }
    setError(null);
    setGoogleLoading(true);
    try {
      const { codeVerifier, codeChallenge } = await generatePKCE();
      const returnUrl = Linking.createURL('auth');

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
      const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          setError(error);
          shake();
        } else if (code) {
          const authResult = await signInWithGoogleCode(
            code, codeVerifier, GOOGLE_REDIRECT_URI,
            name.trim() || undefined, selectedRole, classId.trim() || undefined
          );
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

  // Проверка силы пароля
  const getPasswordStrength = () => {
    if (password.length === 0) return { level: 0, text: '', color: '#4A5568' };
    if (password.length < 6) return { level: 1, text: t('auth.passwordWeak'), color: '#EF4444' };
    if (password.length < 8) return { level: 2, text: t('auth.passwordMedium'), color: '#F59E0B' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { level: 4, text: t('auth.passwordStrong'), color: '#10B981' };
    }
    return { level: 3, text: t('auth.passwordGood'), color: '#22C55E' };
  };

  const passwordStrength = getPasswordStrength();

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
                <Ionicons name="person-add" size={32} color="#764BA2" />
              </View>
              <Text style={styles.title}>{t('auth.register')}</Text>
              <Text style={styles.subtitle}>
                {t('auth.registerSubtitle')}
              </Text>
            </View>

            {/* Форма */}
            <Animated.View 
              style={[
                styles.form,
                { transform: [{ translateX: shakeAnim }] }
              ]}
            >
              {/* Имя */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="person-outline" size={20} color="#764BA2" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.name')}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="none"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setError(null);
                  }}
                />
              </View>

              
              
                                          {/* Роль */}
              <View style={styles.roleContainer}>
                <View style={styles.roleButtons}>
                  <TouchableOpacity
                    style={[styles.roleCard, role === 'student' && styles.roleCardActive]}
                    onPress={() => setRole('student')}
                    activeOpacity={0.9}
                  >
                    <View style={[styles.roleIconCircle, role === 'student' && styles.roleIconCircleActive]}>
                      <Ionicons
                        name="school"
                        size={20}
                        color={role === 'student' ? '#FFFFFF' : '#8B7CF6'}
                      />
                    </View>
                    <Text style={[styles.roleTitle, role === 'student' && styles.roleTitleActive]}>
                      {t('auth.student')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleCard, role === 'teacher' && styles.roleCardActive]}
                    onPress={() => setRole('teacher')}
                    activeOpacity={0.9}
                  >
                    <View style={[styles.roleIconCircle, role === 'teacher' && styles.roleIconCircleActive]}>
                      <Ionicons
                        name="ribbon"
                        size={20}
                        color={role === 'teacher' ? '#FFFFFF' : '#8B7CF6'}
                      />
                    </View>
                    <Text style={[styles.roleTitle, role === 'teacher' && styles.roleTitleActive]}>
                      {t('auth.teacher')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Класс */}
              {role === 'student' && (
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="school-outline" size={20} color="#764BA2" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.grade')}
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    autoComplete="off"
                    textContentType="none"
                    value={classId}
                    onChangeText={(textValue) => {
                      setClassId(textValue);
                      setError(null);
                    }}
                  />
                </View>
              )}

              {/* Email */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="mail-outline" size={20} color="#764BA2" />
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
                  <Ionicons name="lock-closed-outline" size={20} color="#764BA2" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.passwordPlaceholder')}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry={!showPassword}
                  textContentType="none"
                  autoComplete="off"
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

              {/* Индикатор силы пароля */}
              {password.length > 0 && (
                <View style={styles.passwordStrength}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3, 4].map((level) => (
                      <View
                        key={level}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor:
                              level <= passwordStrength.level
                                ? passwordStrength.color
                                : 'rgba(255,255,255,0.1)',
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.text}
                  </Text>
                </View>
              )}

              {/* Подтверждение пароля */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#764BA2" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.confirmPassword')}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry={!showPassword}
                  textContentType="none"
                  autoComplete="off"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setError(null);
                  }}
                />
                {confirmPassword.length > 0 && (
                  <Ionicons
                    name={password === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={password === confirmPassword ? '#10B981' : '#EF4444'}
                  />
                )}
              </View>

              {/* Ошибка */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Кнопка регистрации */}
              <TouchableOpacity
                style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={loading ? ['#4A5568', '#4A5568'] : ['#764BA2', '#667EEA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.registerButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.registerButtonText}>{t('auth.register')}</Text>
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
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
                style={[styles.googleButton, googleLoading && styles.registerButtonDisabled]}
                onPress={() => setShowRoleModal(true)}
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

              {/* Соглашение */}
              <Text style={styles.agreement}>
                {t('auth.termsAgree')}{' '}
                <Text style={styles.agreementLink}>{t('auth.termsLink')}</Text>
              </Text>
            </Animated.View>

            {/* Вход */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('auth.haveAccountAlt')}</Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.loginLink}>{t('auth.login')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {/* Role selection modal for Google sign-in */}
      <Modal
        visible={showRoleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRoleModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('auth.selectRole')}</Text>
            <Text style={styles.modalSubtitle}>{t('auth.selectRoleSubtitle')}</Text>

            <TouchableOpacity
              style={styles.modalRoleOption}
              onPress={() => handleGoogleSignIn('student')}
              activeOpacity={0.8}
            >
              <View style={styles.modalRoleIconContainer}>
                <Ionicons name="school-outline" size={28} color="#667EEA" />
              </View>
              <View style={styles.modalRoleTextContainer}>
                <Text style={styles.modalRoleOptionTitle}>{t('auth.student')}</Text>
                <Text style={styles.modalRoleOptionDesc}>{t('auth.studentDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalRoleOption}
              onPress={() => handleGoogleSignIn('teacher')}
              activeOpacity={0.8}
            >
              <View style={[styles.modalRoleIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Ionicons name="people-outline" size={28} color="#F59E0B" />
              </View>
              <View style={styles.modalRoleTextContainer}>
                <Text style={styles.modalRoleOptionTitle}>{t('auth.teacher')}</Text>
                <Text style={styles.modalRoleOptionDesc}>{t('auth.teacherDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowRoleModal(false)}
            >
              <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    marginTop: 24,
    marginBottom: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(118, 75, 162, 0.15)',
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
    gap: 14,
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
    backgroundColor: 'rgba(118, 75, 162, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  roleContainer: {
    gap: 12,
    marginBottom: 6,
  },
  roleLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  roleCardActive: {
    backgroundColor: 'rgba(118, 75, 162, 0.25)',
    borderColor: 'rgba(118, 75, 162, 0.7)',
  },
  roleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(139,124,246,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconCircleActive: {
    backgroundColor: 'rgba(118, 75, 162, 0.9)',
  },
  roleTextWrap: {
    flex: 1,
  },
  roleTitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '700',
  },
  roleTitleActive: {
    color: '#FFFFFF',
  },
  roleSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  roleSubtitleActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  eyeButton: {
    padding: 8,
  },
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 6,
  },
  strengthBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
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
  registerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#764BA2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  registerButtonDisabled: {
    shadowOpacity: 0,
  },
  registerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  registerButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
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
  agreement: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 8,
  },
  agreementLink: {
    color: '#667EEA',
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
  },
  loginLink: {
    fontSize: 15,
    color: '#764BA2',
    fontWeight: '600',
  },
  // Role selection modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1E1B4B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalRoleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalRoleIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  modalRoleTextContainer: {
    flex: 1,
  },
  modalRoleOptionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  modalRoleOptionDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  modalCancel: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  modalCancelText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
});













