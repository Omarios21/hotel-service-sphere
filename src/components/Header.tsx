
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, ShoppingBag, Home } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/70 border-b border-border transition-all duration-200">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => handleNavigation('/home')}
              className="font-medium text-lg transition-opacity hover:opacity-80"
            >
              Hotel Service
            </button>
          </div>
          
          {/* Desktop navigation - visible only on larger screens */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation('/home')}
              className={`flex items-center space-x-1 transition-colors ${
                isActive('/home') 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => handleNavigation('/room-service')}
              className={`flex items-center space-x-1 transition-colors ${
                isActive('/room-service') 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Room Service</span>
            </button>
            <button
              onClick={() => handleNavigation('/spa')}
              className={`flex items-center space-x-1 transition-colors ${
                isActive('/spa') 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <span>Spa</span>
            </button>
            <button
              onClick={() => handleNavigation('/activities')}
              className={`flex items-center space-x-1 transition-colors ${
                isActive('/activities') 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <span>Activities</span>
            </button>
            <button
              onClick={() => handleNavigation('/profile')}
              className={`flex items-center space-x-1 transition-colors ${
                isActive('/profile') 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
