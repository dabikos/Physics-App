import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import freeExam from '../../src/data/ozpFree.json';
import { useTheme } from '../../src/context/ThemeContext';
import { useSubscription } from '../../src/context/SubscriptionContext';
import api from '../../src/services/api';
import { TestSession, SessionQuestion } from '../../src/features/tests/TestSession';
import { ExamContext } from '../../src/features/tests/ExamIllustration';
import { canOpenOzp, FREE_OZP_SESSION_ID, OZP_SESSIONS } from '../../src/features/tests/ozpAccess';

interface OzpExam {
  id: string;
  questions: SessionQuestion[];
  contexts: Record<string, ExamContext>;
  durationSeconds: number;
  passingCount: number;
  contextStart: number;
}

export default function OzpPractice() {
  const { session } = useLocalSearchParams<{ session?: string | string[] }>();
  const id = (Array.isArray(session) ? session[0] : session) || FREE_OZP_SESSION_ID;
  return <OzpExamScreen key={id} sessionId={id} />;
}

function OzpExamScreen({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isPro, loading, refreshCustomerInfo } = useSubscription();
  const [remote, setRemote] = useState<OzpExam | null>(null);
  const [error, setError] = useState<'premium' | 'network' | null>(null);
  const [attempt, setAttempt] = useState(0);
  const free = sessionId === FREE_OZP_SESSION_ID;
  const catalog = OZP_SESSIONS.find(session => session.id === sessionId);

  useFocusEffect(useCallback(() => {
    if (free || !catalog || loading || !canOpenOzp(sessionId, isPro)) return;
    let active = true;
    // Sync RevenueCat first. Basic is NOT Premium; don't accept just any paid plan.
    void refreshCustomerInfo().then(() => api.get<OzpExam>(`/exams/ozp/${encodeURIComponent(sessionId)}`, { params: { attempt } })).then(response => {
      if (!active) return;
      if (response.data.id !== sessionId || !response.data.questions?.length) throw new Error('Invalid exam');
      setRemote(response.data);
      setError(null);
    }).catch(failure => {
      if (active) setError(failure?.response?.status === 403 ? 'premium' : 'network');
    });
    return () => { active = false; };
  }, [free, catalog, loading, isPro, sessionId, refreshCustomerInfo, attempt]));

  const locked = !free && !loading && (!isPro || error === 'premium');
  const exam = free ? freeExam as OzpExam : remote;
  if (catalog && !locked && (free || !loading) && exam) return <TestSession
    key={sessionId}
    title={`${t('exam.ozpTitle')} · ${t(`exam.${catalog.titleKey}`)}`}
    questions={exam.questions} contexts={exam.contexts} contextStart={exam.contextStart}
    durationSeconds={exam.durationSeconds} passingCount={exam.passingCount} showAiHelp
    onClose={() => router.back()}
  />;

  const unavailable = !catalog || error === 'network';
  return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
    <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityLabel={t('common.back')}>
      <Ionicons name="arrow-back" size={24} color={colors.text} />
    </TouchableOpacity>
    <View style={styles.message}>
      {locked ? <>
        <Ionicons name="lock-closed-outline" size={36} color={colors.accentText} />
        <Text style={[styles.title, { color: colors.text }]}>{t('exam.premiumRequired')}</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>{t('exam.accessSummary')}</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }]} onPress={() => router.push('/subscription')}><Text style={styles.buttonText}>{t('exam.viewPremium')}</Text></TouchableOpacity>
      </> : unavailable ? <>
        <Text style={[styles.body, { color: colors.textSecondary }]}>{t('exam.loadError')}</Text>
        {catalog && <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }]} onPress={() => { setError(null); setAttempt(previous => previous + 1); }}><Text style={styles.buttonText}>{t('common.retry')}</Text></TouchableOpacity>}
      </> : <ActivityIndicator size="large" color={colors.accent} />}
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  message: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { fontSize: 19, fontWeight: '800', textAlign: 'center' },
  body: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
  button: { paddingVertical: 14, paddingHorizontal: 22, borderRadius: 14 },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
