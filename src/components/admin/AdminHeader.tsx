
import React from 'react';
import { LogOut, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../LanguageSwitcher';
import CurrencySwitcher from '../CurrencySwitcher';

interface AdminHeaderProps {
  onSignOut: () => void;
  authenticated: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onSignOut, authenticated }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <header className="bg-white border-b border-border px-4 py-3">
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
          <h1 className="text-lg md:text-xl font-bold">{t('admin.dashboard')}</h1>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-3">
          <CurrencySwitcher />
          {authenticated ? (
            <Button variant="outline" size="sm" onClick={onSignOut} className="ml-2">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">{t('button.signOut')}</span>
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate('/auth')} className="ml-2">
              <LogIn className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">{t('button.signIn')}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
