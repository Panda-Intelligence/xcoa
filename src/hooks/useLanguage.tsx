'use client';

import { useState, useEffect, createContext, useContext } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
  tArray: (key: string, defaultValue?: string[]) => string[];
  isLoading: boolean; // 新增loading状态
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 翻译数据缓存
const translations: Record<Language, any> = {
  zh: {},
  en: {},
};

// 定义翻译模块列表
const TRANSLATION_MODULES = [
  'common',
  'scales',
  'copyright',
  'insights',
  'auth',
  'user',
  'admin',
  'billing',
  'reports',
  'landing',
  'forms',
  'errors'
];

// 加载翻译文件（支持模块化加载）
async function loadTranslations(lang: Language) {
  if (Object.keys(translations[lang]).length > 0) {
    return translations[lang];
  }

  try {
    // 尝试加载模块化翻译文件
    const modulePromises = TRANSLATION_MODULES.map(async (module) => {
      try {
        const response = await fetch(`/locales/${lang}/${module}.json`);
        if (response.ok) {
          return await response.json();
        }
        return {};
      } catch (err) {
        console.warn(`Failed to load module ${module} for ${lang}:`, err);
        return {};
      }
    });

    const modules = await Promise.all(modulePromises);

    // 合并所有模块
    translations[lang] = modules.reduce((acc, module) => {
      return { ...acc, ...module };
    }, {});

    console.log(`Loaded ${Object.keys(translations[lang]).length} translation keys for ${lang}`);
    return translations[lang];
  } catch (error) {
    console.error(`Failed to load translations for ${lang}:`, error);

    // 降级：尝试加载单一文件（向后兼容）
    try {
      const response = await fetch(`/locales/${lang}.json`);
      if (response.ok) {
        translations[lang] = await response.json();
        console.log(`Loaded translations from fallback single file for ${lang}`);
        return translations[lang];
      }
    } catch (fallbackError) {
      console.error(`Fallback loading also failed for ${lang}:`, fallbackError);
    }

    return {};
  }
}

// 获取嵌套对象的值
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en'); // 默认英文
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  // 初始化语言设置和立即加载翻译
  useEffect(() => {
    async function initializeLanguage() {
      const savedLanguage = localStorage.getItem('xcoa-language') as Language;
      console.log('Saved language from localStorage:', savedLanguage);

      let targetLanguage: Language = 'en'; // 默认英文

      if (savedLanguage && ['zh', 'en'].includes(savedLanguage)) {
        console.log('Using saved language:', savedLanguage);
        targetLanguage = savedLanguage;
      } else {
        // 默认使用英文，只有明确检测到中文浏览器时才使用中文
        const browserLang = navigator.language;
        console.log('Browser language detected:', browserLang);

        if (browserLang.startsWith('zh')) {
          console.log('Chinese browser detected, setting to zh');
          targetLanguage = 'zh';
        } else {
          console.log('Non-Chinese browser, setting default to en');
          targetLanguage = 'en';
        }
      }

      // 立即设置语言和加载翻译
      setLanguageState(targetLanguage);

      // 加载目标语言的翻译
      await loadTranslations(targetLanguage);
      setTranslationsLoaded(true);

      // 预加载另一种语言
      const otherLang = targetLanguage === 'zh' ? 'en' : 'zh';
      loadTranslations(otherLang);
    }

    initializeLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    console.log('Setting language to:', lang);

    // Prevent multiple simultaneous language changes
    if (!translationsLoaded) {
      console.warn('Translation loading in progress, ignoring language change');
      return;
    }

    // If new language's translations are already loaded, switch immediately
    if (Object.keys(translations[lang]).length > 0) {
      setLanguageState(lang);
      localStorage.setItem('xcoa-language', lang);
      return;
    }

    // Set loading state for new language
    setTranslationsLoaded(false);
    setLanguageState(lang);
    localStorage.setItem('xcoa-language', lang);

    try {
      // Load new language's translations
      await loadTranslations(lang);
      setTranslationsLoaded(true);

      // Preload other language in background
      const otherLang = lang === 'zh' ? 'en' : 'zh';
      loadTranslations(otherLang).catch(console.error);
    } catch (error) {
      console.error('Failed to load translations for', lang, error);
      // Fallback to English if translation loading fails
      if (lang !== 'en') {
        console.log('Falling back to English');
        setLanguageState('en');
        await loadTranslations('en').catch(() => {
          console.error('Failed to load fallback English translations');
        });
      }
      setTranslationsLoaded(true);
    }
  };

  const t = (key: string, defaultValue?: string): string => {
    if (!translationsLoaded) {
      // loading期间返回默认值或空字符串，避免显示key
      return defaultValue || '';
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

  const tArray = (key: string, defaultValue?: string[]): string[] => {
    if (!translationsLoaded) {
      return defaultValue || [];
    }

    const translation = getNestedValue(translations[language], key);

    if (Array.isArray(translation)) {
      return translation;
    }

    // 尝试从另一种语言获取翻译
    const fallbackLang = language === 'zh' ? 'en' : 'zh';
    const fallbackTranslation = getNestedValue(translations[fallbackLang], key);

    if (Array.isArray(fallbackTranslation)) {
      return fallbackTranslation;
    }

    return defaultValue || [];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tArray, isLoading: !translationsLoaded }}>
      {!translationsLoaded ? (
        // 翻译加载中的全局loading界面
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <div className="text-sm text-muted-foreground">Loading application...</div>
          </div>
        </div>
      ) : (
        children
      )}
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
      type="button"
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