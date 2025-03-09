
import React from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  
  const languages = [
    { code: 'eng', name: 'English', acronym: 'EN' },
    { code: 'es', name: 'Español', acronym: 'ES' },
    { code: 'fr', name: 'Français', acronym: 'FR' }
  ];
  
  // Get the acronym of the currently selected language
  const getCurrentLanguageAcronym = () => {
    const currentLang = languages.find(lang => lang.code === language);
    return currentLang ? currentLang.acronym : 'EN';
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center p-1 rounded-md hover:bg-muted transition-colors">
        <Globe className="h-5 w-5 mr-1" />
        <span className="text-sm font-medium">{getCurrentLanguageAcronym()}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background">
        {languages.map((lang) => (
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
