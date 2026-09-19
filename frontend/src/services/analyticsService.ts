import { Platform } from 'react-native';
import app from '../config/firebase';

/**
 * Analytics Service
 * Поддерживает логирование ключевых действий пользователя
 */
export async function logEvent(name: string, params?: Record<string, any>) {
  try {
    if (__DEV__) {
      console.log(`[Analytics] Event: ${name}`, params || {});
    }

    // При сборке под мобильные устройства с google-services.json / GoogleService-Info.plist
    // нативный SDK Google Analytics автоматически регистрирует сессии и переходы.
    // Если подключен web или дополнительный SDK:
    if (Platform.OS === 'web') {
      try {
        const { getAnalytics, logEvent: firebaseLogEvent } = await import('firebase/analytics');
        const analytics = getAnalytics(app);
        firebaseLogEvent(analytics, name, params);
      } catch {}
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[Analytics] Log error:', error);
    }
  }
}

export function logScreenView(screenName: string) {
  logEvent('screen_view', { screen_name: screenName });
}

export function logAIChatSent(promptLength: number) {
  logEvent('ai_chat_prompt_sent', { prompt_length: promptLength });
}

export function logLessonView(lessonId: string, lessonTitle?: string) {
  logEvent('lesson_view', { lesson_id: lessonId, lesson_title: lessonTitle });
}

export function logTestCompleted(testId: string, score: number, total: number) {
  logEvent('test_completed', { test_id: testId, score, total });
}

export function logFormulaView(formulaId: string) {
  logEvent('formula_view', { formula_id: formulaId });
}
