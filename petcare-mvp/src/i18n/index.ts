import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { translations, Language, TranslationKey } from './translations';

export type { Language, TranslationKey };

const LANG_KEY = 'petcare-language';

const ALL_LANGS: Language[] = ['en', 'tr', 'de', 'es', 'pt-BR', 'fr', 'ja', 'it'];

interface I18nContextValue {
  language: Language;
  t: (key: TranslationKey) => string;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextValue>({
  language: 'en',
  t: (key) => key,
  setLanguage: () => {},
});

function detectLanguage(): Language {
  try {
    const code = getLocales()[0]?.languageCode ?? 'en';
    const map: Record<string, Language> = {
      tr: 'tr', de: 'de', es: 'es', fr: 'fr', ja: 'ja', it: 'it', pt: 'pt-BR',
    };
    return map[code] ?? 'en';
  } catch {
    return 'en';
  }
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLang] = useState<Language>(detectLanguage());

  React.useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((saved) => {
      if (saved && ALL_LANGS.includes(saved as Language)) setLang(saved as Language);
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    AsyncStorage.setItem(LANG_KEY, lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string =>
      (translations[language] as Record<TranslationKey, string>)[key] ??
      translations.en[key] ??
      key,
    [language]
  );

  return React.createElement(I18nContext.Provider, { value: { language, t, setLanguage } }, children);
};

export const useTranslation = () => useContext(I18nContext);
