
import React from 'react';
import { LogOut, User, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher';
import CurrencySwitcher from '../CurrencySwitcher';
import { useTheme } from '@/contexts/ThemeContext';

interface AdminHeaderProps {
  onSignOut: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onSignOut }) => {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  
  return (
    <header className="bg-card border-b border-border px-4 py-3 shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="hidden md:flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="p-0"
              aria-label="Admin profile"
            >
              <User className="h-5 w-5" />
            </Button>
            <LanguageSwitcher />
          </div>
          <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {t('admin.dashboard')}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="mr-2"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <CurrencySwitcher />
          <Button variant="outline" size="sm" onClick={onSignOut} className="ml-2 font-medium">
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">{t('button.signOut')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
