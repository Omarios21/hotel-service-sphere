
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MenuIcon, XIcon, User, ShoppingBag, Home } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
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
          
          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary transition-colors"
              aria-expanded="false"
            >
              {isMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
          
          {/* Desktop navigation */}
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
      
      {/* Mobile navigation menu */}
      {isMenuOpen && (
        <div className="lg:hidden animate-slide-down">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
            <button
              onClick={() => handleNavigation('/home')}
              className={`block px-3 py-2 rounded-md w-full text-left ${
                isActive('/home')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('/room-service')}
              className={`block px-3 py-2 rounded-md w-full text-left ${
                isActive('/room-service')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
              }`}
            >
              Room Service
            </button>
            <button
              onClick={() => handleNavigation('/spa')}
              className={`block px-3 py-2 rounded-md w-full text-left ${
                isActive('/spa')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
              }`}
            >
              Spa
            </button>
            <button
              onClick={() => handleNavigation('/activities')}
              className={`block px-3 py-2 rounded-md w-full text-left ${
                isActive('/activities')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
              }`}
            >
              Activities
            </button>
            <button
              onClick={() => handleNavigation('/profile')}
              className={`block px-3 py-2 rounded-md w-full text-left ${
                isActive('/profile')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
              }`}
            >
              Profile
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
