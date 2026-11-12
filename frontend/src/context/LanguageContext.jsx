import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../translations/en.json';
import teTranslations from '../translations/te.json';

const LanguageContext = createContext(null);

const dictionaries = {
  en: enTranslations,
  te: teTranslations,
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('govscheme_lang') || 'en';
  });

  const setLanguage = (lang) => {
    if (dictionaries[lang]) {
      setLanguageState(lang);
      localStorage.setItem('govscheme_lang', lang);
    }
  };

  const t = (keyPath, fallback = '') => {
    if (!keyPath) return '';
    const keys = keyPath.split('.');
    
    // Attempt lookup in active language dictionary
    let current = dictionaries[language];
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        current = undefined;
        break;
      }
    }

    if (current !== undefined) return current;

    // Fallback to English dictionary
    let fallbackCurrent = dictionaries.en;
    for (const key of keys) {
      if (fallbackCurrent && typeof fallbackCurrent === 'object' && key in fallbackCurrent) {
        fallbackCurrent = fallbackCurrent[key];
      } else {
        fallbackCurrent = undefined;
        break;
      }
    }

    return fallbackCurrent !== undefined ? fallbackCurrent : fallback || keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
