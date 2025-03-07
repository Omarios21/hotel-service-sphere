
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Scissors, MapPin, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { path: '/home', label: 'Home', icon: <Home className="h-5 w-5" /> },
    { path: '/room-service', label: 'Service', icon: <ShoppingBag className="h-5 w-5" /> },
    { path: '/spa', label: 'Spa', icon: <Scissors className="h-5 w-5" /> },
    { path: '/activities', label: 'Activities', icon: <MapPin className="h-5 w-5" /> },
    { path: '/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-lg border-t border-border">
      <div className="flex justify-around items-center py-2">
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
              isActive(item.path)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
