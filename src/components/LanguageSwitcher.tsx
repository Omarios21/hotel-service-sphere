
import React, { useEffect } from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, availableLanguages, loadAvailableLanguages } = useLanguage();
  
  useEffect(() => {
    loadAvailableLanguages();
  }, [loadAvailableLanguages]);
  
  // Get the acronym of the currently selected language
  const getCurrentLanguageAcronym = () => {
    const currentLang = availableLanguages.find(lang => lang.code === language);
    return currentLang ? currentLang.code.toUpperCase() : 'EN';
  };
  
  // Filter enabled languages
  const enabledLanguages = availableLanguages.filter(lang => lang.enabled);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center p-1 rounded-md hover:bg-muted transition-colors">
        <Globe className="h-5 w-5 mr-1" />
        <span className="text-sm font-medium">{getCurrentLanguageAcronym()}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background">
        {enabledLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className={`flex items-center gap-2 ${language === lang.code ? 'font-medium text-primary' : ''}`}
            onClick={() => setLanguage(lang.code as Language)}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
