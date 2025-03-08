
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Scissors, MapPin, Wallet } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { path: '/home', label: t('nav.home'), icon: <Home className="h-5 w-5" /> },
    { path: '/room-service', label: t('nav.roomService'), icon: <ShoppingBag className="h-5 w-5" /> },
    { path: '/spa', label: t('nav.spa'), icon: <Scissors className="h-5 w-5" /> },
    { path: '/activities', label: t('nav.activities'), icon: <MapPin className="h-5 w-5" /> },
    { path: '/wallet', label: t('nav.wallet'), icon: <Wallet className="h-5 w-5" /> },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-lg border-t border-border">
      <div className="flex justify-around items-center h-16">
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center h-full w-full py-2 transition-colors ${
              isActive(item.path)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <div className="flex justify-center">{item.icon}</div>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
