import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { pt, en, TranslationKeys } from '../locales';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  isPortuguese: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, TranslationKeys> = { pt, en };

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage first
    const saved = localStorage.getItem('tarot-language') as Language;
    if (saved && (saved === 'pt' || saved === 'en')) return saved;

    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('pt') ? 'pt' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('tarot-language', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    isPortuguese: language === 'pt',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language toggle component
export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 transition-all duration-300 text-sm"
      title={language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
    >
      <span className={`transition-opacity ${language === 'pt' ? 'opacity-100' : 'opacity-40'}`}>🇧🇷</span>
      <span className="text-gray-500">/</span>
      <span className={`transition-opacity ${language === 'en' ? 'opacity-100' : 'opacity-40'}`}>🇺🇸</span>
    </button>
  );
};
