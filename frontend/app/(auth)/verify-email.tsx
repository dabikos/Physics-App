import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/context/AuthContext';

const CODE_LENGTH = 6;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyEmail, resendCode } = useAuth();
  const { t } = useTranslation();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste — fill all cells
      const chars = text.replace(/\D/g, '').slice(0, CODE_LENGTH).split('');
      const newCode = [...code];
      chars.forEach((ch, i) => {
        if (index + i < CODE_LENGTH) newCode[index + i] = ch;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + chars.length, CODE_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      setError(null);
      return;
    }

    const digit = text.replace(/\D/g, '');
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== CODE_LENGTH) {
      setError(t('auth.enterFullCode'));
      shake();
      return;
    }

    setError(null);
    setLoading(true);
    const result = await verifyEmail(email || '', fullCode);
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setError(result.error || t('auth.invalidCode'));
      shake();
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setError(null);
    const result = await resendCode(email || '');
    setResending(false);
    if (result.success) {
      setCountdown(60);
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } else {
      setError(result.error || t('auth.sendError'));
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
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-open" size={40} color="#667EEA" />
          </View>
          <Text style={styles.title}>{t('auth.verifyEmailTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.verifyEmailSubtitle', { email: email || '' })}
          </Text>
        </View>

        {/* Code inputs */}
        <Animated.View style={[styles.codeRow, { transform: [{ translateX: shakeAnim }] }]}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref; }}
              style={[styles.codeInput, digit ? styles.codeInputFilled : null]}
              value={digit}
              onChangeText={(text) => handleChange(text, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={i === 0 ? CODE_LENGTH : 1}
              selectTextOnFocus
              autoFocus={i === 0}
            />
          ))}
        </Animated.View>

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Verify button */}
        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={loading}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={loading ? ['#4A5568', '#4A5568'] : ['#667EEA', '#764BA2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.verifyButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.verifyButtonText}>{t('auth.verify')}</Text>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendText}>{t('auth.didntReceiveCode')}</Text>
          {countdown > 0 ? (
            <Text style={styles.resendCountdown}>{countdown}{t('auth.secondsShort')}</Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              {resending ? (
                <ActivityIndicator size="small" color="#667EEA" />
              ) : (
                <Text style={styles.resendLink}>{t('auth.resendCode')}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { ...StyleSheet.absoluteFillObject },
  safeArea: { flex: 1, paddingHorizontal: 24 },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginTop: 8,
  },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  iconContainer: {
    width: 80, height: 80, borderRadius: 28,
    backgroundColor: 'rgba(102,126,234,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 12 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },
  codeRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24 },
  codeInput: {
    width: 48, height: 58, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    color: '#FFFFFF', fontSize: 24, fontWeight: '700',
    textAlign: 'center',
  },
  codeInputFilled: { borderColor: '#667EEA', backgroundColor: 'rgba(102,126,234,0.15)' },
  errorContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 12, gap: 10, marginBottom: 16,
  },
  errorText: { flex: 1, fontSize: 14, color: '#FCA5A5' },
  verifyButton: {
    borderRadius: 16, overflow: 'hidden', marginBottom: 24,
    shadowColor: '#667EEA', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  verifyButtonDisabled: { shadowOpacity: 0 },
  verifyButtonGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, gap: 10,
  },
  verifyButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  resendText: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  resendCountdown: { fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: '600' },
  resendLink: { fontSize: 14, color: '#667EEA', fontWeight: '600' },
});
