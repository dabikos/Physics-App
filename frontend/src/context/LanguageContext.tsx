import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { saveLanguage, getStoredLanguage, SupportedLanguage, LANGUAGES, AI_LANGUAGE_NAMES } from '../config/i18n';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  changeLanguage: (lang: SupportedLanguage) => Promise<void>;
  availableLanguages: typeof LANGUAGES;
  getAILanguageName: () => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    (i18n.language as SupportedLanguage) || 'ru'
  );

  const getAILanguageName = useCallback((): string => {
    return AI_LANGUAGE_NAMES[currentLanguage] || AI_LANGUAGE_NAMES.ru;
  }, [currentLanguage]);

  const changeLanguage = useCallback(async (lang: SupportedLanguage) => {
    await i18n.changeLanguage(lang);
    await saveLanguage(lang);
    setCurrentLanguage(lang);
  }, [i18n]);

  useEffect(() => {
    getStoredLanguage().then((lang) => {
      setCurrentLanguage(lang);
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
    });
  }, [i18n]);

  useEffect(() => {
    const validLang = (i18n.language === 'ru' || i18n.language === 'en' || i18n.language === 'kk')
      ? i18n.language as SupportedLanguage
      : 'ru';
    setCurrentLanguage(validLang);
  }, [i18n.language]);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        availableLanguages: LANGUAGES,
        getAILanguageName,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
