import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { GeneratedTest } from '../../src/services/aiService';
import { TestSession } from '../../src/features/tests/TestSession';
import { practiceDurationSeconds } from '../../src/features/tests/practiceDuration';
import api from '../../src/services/api';

export default function AssignedTestScreen() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  return <AssignedTest key={testId || 'missing'} testId={testId} />;
}

function AssignedTest({ testId }: { testId?: string }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [test, setTest] = useState<GeneratedTest | null>(null);
  const [loading, setLoading] = useState(Boolean(testId));

  useEffect(() => {
    let active = true;
    if (!testId) return;
    void api.get(`/student/tests/${encodeURIComponent(testId)}`).then(response => {
      if (active && Array.isArray(response.data?.questions) && response.data.questions.length) {
        setTest(response.data);
      }
    }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [testId]);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const submit = useCallback(async function sendResult(answers: number[]) {
    if (!test?.id) return;
    try {
      await api.post(`/tests/${encodeURIComponent(test.id)}/submit`, {
        answers, assigned_test_id: test.id, source: 'assigned_test',
      });
    } catch {
      Alert.alert(t('common.error'), t('push.resultSyncError'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('push.retrySend'), onPress: () => { void sendResult(answers); } },
      ]);
    }
  }, [test?.id, t]);

  if (loading) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.accent} size="large" />
    </SafeAreaView>;
  }

  if (!test) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <TouchableOpacity onPress={close} style={{ padding: 20 }} accessibilityLabel={t('common.back')}>
        <Ionicons name="arrow-back" color={colors.text} size={24} />
      </TouchableOpacity>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Ionicons name="document-text-outline" color={colors.textMuted} size={44} />
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: 16 }}>{t('push.assignedUnavailable')}</Text>
      </View>
    </SafeAreaView>;
  }

  return <TestSession
    key={test.id}
    title={test.title}
    durationSeconds={practiceDurationSeconds(test.time_limit, test.questions.length)}
    questions={test.questions.map((question, index) => ({
      id: String(index + 1), text: question.question, options: question.options,
      correct: question.correct, explanation: question.explanation,
    }))}
    onClose={close}
    onSubmit={submit}
  />;
}
