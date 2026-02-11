import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ru from '../locales/ru.json';
import en from '../locales/en.json';
import kk from '../locales/kk.json';

const LANGUAGE_KEY = '@app_language';

const resources = {
  ru: { translation: ru },
  en: { translation: en },
  kk: { translation: kk },
};

export type SupportedLanguage = 'ru' | 'en' | 'kk';

export const LANGUAGES: { code: SupportedLanguage; name: string; nativeName: string; flag: string }[] = [
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша', flag: '🇰🇿' },
];

// Название языка для AI промптов
export const AI_LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  ru: 'русский',
  en: 'английский (English)',
  kk: 'казахский (Қазақ тілі)',
};

export const getStoredLanguage = async (): Promise<SupportedLanguage> => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored && (stored === 'ru' || stored === 'en' || stored === 'kk')) {
      return stored as SupportedLanguage;
    }
    return 'ru';
  } catch {
    return 'ru';
  }
};

export const saveLanguage = async (language: SupportedLanguage): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

const initI18n = async () => {
  const storedLanguage = await getStoredLanguage();
  const deviceLang = Localization.getLocales()[0]?.languageCode;
  
  // Определяем начальный язык: сохраненный > язык устройства > русский
  let initialLanguage: SupportedLanguage = storedLanguage;
  if (!storedLanguage) {
    if (deviceLang === 'kk') initialLanguage = 'kk';
    else if (deviceLang === 'en') initialLanguage = 'en';
    else initialLanguage = 'ru';
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'ru',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
  });
};

initI18n();

export default i18n;
