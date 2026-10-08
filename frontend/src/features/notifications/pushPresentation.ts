import ru from '../../locales/ru.json';
import en from '../../locales/en.json';
import kk from '../../locales/kk.json';

export type PushLanguage = 'ru' | 'en' | 'kk';
export const PUSH_LANGUAGES: PushLanguage[] = ['ru', 'en', 'kk'];
const translations = { ru: ru.push, en: en.push, kk: kk.push };

export function pushLanguage(value?: string): PushLanguage {
  const language = (value || 'ru').toLowerCase().split(/[-_]/)[0];
  return language === 'kz' ? 'kk' : language === 'en' || language === 'kk' ? language : 'ru';
}

export function pushCategories(language: PushLanguage) {
  const copy = translations[language];
  return [
    { identifier: `physics-assigned-${language}`, action: 'start-test', title: copy.startTest },
    { identifier: `physics-result-${language}`, action: 'view-result', title: copy.viewResult },
    { identifier: `physics-continue-${language}`, action: 'continue-learning', title: copy.continueLearning },
  ];
}

export function pushChannelNames(language: PushLanguage) {
  const copy = translations[language];
  return {
    default: copy.defaultChannel,
    learning: copy.learningChannel,
    results: copy.resultsChannel,
    reminders: copy.remindersChannel,
  };
}

type PushDestination =
  | '/notifications'
  | '/(tabs)'
  | { pathname: '/tests/assigned'; params: { testId: string } }
  | { pathname: '/teacher/classes'; params: { studentId?: string; resultId?: string } };

export function pushDestination(data: Record<string, unknown>, role?: string): PushDestination {
  if (data.type === 'assigned_test' && role === 'student' && typeof data.test_id === 'string' && data.test_id) {
    return { pathname: '/tests/assigned', params: { testId: data.test_id } };
  }
  if (data.type === 'test_result' && role === 'teacher') {
    return {
      pathname: '/teacher/classes',
      params: {
        studentId: typeof data.student_id === 'string' ? data.student_id : undefined,
        resultId: typeof data.result_id === 'string' ? data.result_id : undefined,
      },
    };
  }
  if (data.type === 'daily_reminder') return '/(tabs)';
  return '/notifications';
}
