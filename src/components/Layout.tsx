
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideHeader = false }) => {
  const location = useLocation();
  
  // Determine if we're on the authentication page
  const isAuthPage = location.pathname === '/';
  
  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {!hideHeader && !isAuthPage && <Header />}
      <main className="flex-1 overflow-auto pb-16">
        <div className="animate-fade-in mx-auto max-w-screen-xl px-4 sm:px-6 w-full h-full">
          {children}
        </div>
      </main>
      {!isAuthPage && <BottomNav />}
    </div>
  );
};

export default Layout;
