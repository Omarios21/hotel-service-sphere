
import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher';
import CurrencySwitcher from '../CurrencySwitcher';

interface AdminHeaderProps {
  onSignOut: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onSignOut }) => {
  const { t } = useLanguage();
  
  return (
    <header className="bg-white border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('admin.dashboard')}</h1>
        
        <div className="flex items-center space-x-4">
          <CurrencySwitcher />
          <LanguageSwitcher />
          
          <Button variant="outline" size="sm" onClick={onSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            {t('button.signOut')}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
