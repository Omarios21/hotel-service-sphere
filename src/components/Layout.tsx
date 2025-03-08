
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import ChatBubble from './ChatBubble';

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideHeader = false }) => {
  const location = useLocation();
  
  // Determine if we're on the authentication page
  const isAuthPage = location.pathname === '/';
  const isChatPage = location.pathname === '/chat';
  
  return (
    <div className="flex flex-col min-h-full w-full bg-background">
      {!hideHeader && !isAuthPage && <Header />}
      <main className="flex-1 overflow-y-auto pb-28">
        <div className="animate-fade-in mx-auto max-w-screen-xl px-4 sm:px-6 w-full">
          {children}
        </div>
      </main>
      {!isAuthPage && <BottomNav />}
      {!isAuthPage && !isChatPage && <ChatBubble />}
    </div>
  );
};

export default Layout;
