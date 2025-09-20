'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export function LanguageSwitch() {
  const [currentLang, setCurrentLang] = useState('zh');

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    // 在实际应用中，这里会触发整个应用的语言切换
    localStorage.setItem('xcoa-language', langCode);
    // 可以触发页面重新渲染或使用 i18n 库
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
          <Globe className="w-4 h-4" />
          <span className="text-base">{currentLanguage.flag}</span>
          <span className="text-sm">{currentLanguage.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center space-x-2"
          >
            <span className="text-base">{language.flag}</span>
            <span>{language.name}</span>
            {currentLang === language.code && (
              <span className="ml-auto text-xs text-green-600">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}