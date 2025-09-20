'use client';

import { useState, useEffect, createContext, useContext } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 翻译数据缓存
const translations: Record<Language, any> = {
  zh: {},
  en: {},
};

// 加载翻译文件
async function loadTranslations(lang: Language) {
  if (Object.keys(translations[lang]).length > 0) {
    return translations[lang];
  }

  try {
    const response = await fetch(`/locales/${lang}.json`);
    translations[lang] = await response.json();
    return translations[lang];
  } catch (error) {
    console.error(`Failed to load translations for ${lang}:`, error);
    return {};
  }
}

// 获取嵌套对象的值
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh');
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  // 初始化语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('xcoa-language') as Language;
    if (savedLanguage && ['zh', 'en'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      // 检测浏览器语言
      const browserLang = navigator.language;
      if (browserLang.startsWith('zh')) {
        setLanguageState('zh');
      } else {
        setLanguageState('en');
      }
    }
  }, []);

  // 加载翻译文件
  useEffect(() => {
    loadTranslations(language).then(() => {
      setTranslationsLoaded(true);
    });
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('xcoa-language', lang);

    // 预加载另一种语言的翻译
    const otherLang = lang === 'zh' ? 'en' : 'zh';
    loadTranslations(otherLang);
  };

  const t = (key: string, defaultValue?: string): string => {
    if (!translationsLoaded) {
      return defaultValue || key;
    }

    const translation = getNestedValue(translations[language], key);

    if (translation) {
      return translation;
    }

    // 尝试从另一种语言获取翻译
    const fallbackLang = language === 'zh' ? 'en' : 'zh';
    const fallbackTranslation = getNestedValue(translations[fallbackLang], key);

    if (fallbackTranslation) {
      return fallbackTranslation;
    }

    return defaultValue || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// 语言切换组件
export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
      className="flex items-center space-x-1 px-2 py-1 text-sm rounded hover:bg-gray-100 transition-colors"
      title={language === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      <span className="text-base">
        {language === 'zh' ? '🇨🇳' : '🇺🇸'}
      </span>
      <span>
        {language === 'zh' ? '中' : 'EN'}
      </span>
    </button>
  );
}