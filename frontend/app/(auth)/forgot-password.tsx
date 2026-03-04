import React, { useState } from 'react';
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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/context/AuthContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword, confirmResetPassword } = useAuth();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError(t('auth.enterEmail'));
      return;
    }

    setError(null);
    setLoading(true);

    const result = await resetPassword(email.trim());
    
    setLoading(false);

    if (result.success) {
      setStep('code');
    } else {
      setError(result.error || t('auth.sendError'));
    }
  };

  const handleConfirmReset = async () => {
    if (!code.trim() || code.trim().length !== 6) {
      setError(t('auth.enterFullCode'));
      return;
    }
    if (newPassword.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setError(null);
    setLoading(true);

    const result = await confirmResetPassword(email.trim(), code.trim(), newPassword);

    setLoading(false);

    if (result.success) {
      setStep('success');
    } else {
      setError(result.error || t('auth.resetError'));
    }
  };

  if (step === 'success') {
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
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>{t('auth.passwordChanged')}</Text>
            <Text style={styles.successText}>
              {t('auth.passwordChangedMessage')}
            </Text>
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.backToLoginText}>{t('auth.backToLogin')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
              onPress={() => step === 'code' ? setStep('email') : router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Заголовок */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="key" size={32} color="#F59E0B" />
              </View>
              <Text style={styles.title}>{t('auth.forgotPasswordTitle')}</Text>
              <Text style={styles.subtitle}>
                {step === 'email'
                  ? t('auth.forgotPasswordSubtitle')
                  : t('auth.enterResetCode')}
              </Text>
            </View>

            {/* Форма */}
            <View style={styles.form}>
              {step === 'email' ? (
                <>
                  {/* Email */}
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIcon}>
                      <Ionicons name="mail-outline" size={20} color="#F59E0B" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onChangeText={(text) => { setEmail(text); setError(null); }}
                    />
                  </View>
                </>
              ) : (
                <>
                  {/* Code */}
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIcon}>
                      <Ionicons name="keypad-outline" size={20} color="#F59E0B" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.verificationCode')}
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={code}
                      onChangeText={(text) => { setCode(text.replace(/\D/g, '')); setError(null); }}
                    />
                  </View>

                  {/* New password */}
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIcon}>
                      <Ionicons name="lock-closed-outline" size={20} color="#F59E0B" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.newPassword')}
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      secureTextEntry={!showPassword}
                      value={newPassword}
                      onChangeText={(text) => { setNewPassword(text); setError(null); }}
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
                </>
              )}

              {/* Ошибка */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Кнопка */}
              <TouchableOpacity
                style={[styles.resetButton, loading && styles.resetButtonDisabled]}
                onPress={step === 'email' ? handleSendCode : handleConfirmReset}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={loading ? ['#4A5568', '#4A5568'] : ['#F59E0B', '#D97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.resetButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.resetButtonText}>
                        {step === 'email' ? t('auth.sendCode') : t('auth.resetPasswordButton')}
                      </Text>
                      <Ionicons name={step === 'email' ? 'send' : 'checkmark-circle'} size={20} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Вернуться к входу */}
            <TouchableOpacity
              style={styles.backToLogin}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Ionicons name="arrow-back" size={16} color="#667EEA" />
              <Text style={styles.backToLoginLink}>{t('auth.backToLogin')}</Text>
            </TouchableOpacity>
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
    marginTop: 60,
    marginBottom: 40,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
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
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
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
  resetButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  resetButtonDisabled: {
    shadowOpacity: 0,
  },
  resetButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  resetButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 6,
  },
  backToLoginLink: {
    fontSize: 15,
    color: '#667EEA',
    fontWeight: '500',
  },
  // Success state
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backToLoginButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  backToLoginText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});













