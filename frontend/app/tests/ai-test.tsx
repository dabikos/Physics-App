import React, { useMemo } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GeneratedTest } from '../../src/services/aiService';
import { useTheme } from '../../src/context/ThemeContext';
import { TestSession } from '../../src/features/tests/TestSession';
import { practiceDurationSeconds } from '../../src/features/tests/practiceDuration';
import api from '../../src/services/api';

export default function AITestScreen() {
  const router = useRouter();
  const { testData } = useLocalSearchParams<{ testData: string }>();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const test = useMemo<GeneratedTest | null>(() => {
    try {
      const parsed = JSON.parse(testData || '');
      return Array.isArray(parsed.questions) && parsed.questions.length > 0 ? parsed : null;
    } catch {
      return null;
    }
  }, [testData]);

  if (!test) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.text }}>{t('tests.loadError')}</Text>
    </SafeAreaView>;
  }

  return <TestSession
    title={test.title}
    durationSeconds={practiceDurationSeconds(test.time_limit, test.questions.length)}
    questions={test.questions.map((question, index) => ({
      id: String(index + 1),
      text: question.question,
      options: question.options,
      correct: question.correct,
      explanation: question.explanation,
    }))}
    onClose={() => router.back()}
    onSubmit={async answers => {
      if (!test.id || test.source !== 'practice_random') return;
      try {
        await api.post(`/tests/${test.id}/submit`, { answers, source: 'practice_random' });
      } catch (error) {
        console.log('Random practice test submit error:', error);
      }
    }}
  />;
}
