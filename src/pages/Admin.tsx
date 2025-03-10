
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MenuItemsManager from '@/components/admin/MenuItemsManager';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import SpaServicesManager from '@/components/admin/SpaServicesManager';
import ActivitiesManager from '@/components/admin/ActivitiesManager';
import SpaCalendarManager from '@/components/admin/SpaCalendarManager';
import NotificationsManager from '@/components/admin/NotificationsManager';
import UserManager from '@/components/admin/UserManager';
import TransactionManager from '@/components/admin/TransactionManager';
import TransactionClearingManager from '@/components/admin/TransactionClearingManager';

const Admin: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('transactions');
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Check for authentication for sections that require it
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      const requiresAuth = ['transactions', 'clearing-history', 'spa-calendar', 'notifications', 'users', 'settings'];
      
      // If section requires auth and user is not authenticated
      if (requiresAuth.includes(activeSection) && !data.session) {
        toast.error("Authentication required for this section", { duration: 2000 });
        navigate('/auth');
      } else {
        setAuthenticated(!!data.session);
      }
    };
    
    checkAuth();
  }, [activeSection, navigate]);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
    
    // If current section requires auth, redirect to a section that doesn't
    const requiresAuth = ['transactions', 'clearing-history', 'spa-calendar', 'notifications', 'users', 'settings'];
    if (requiresAuth.includes(activeSection)) {
      setActiveSection('menu-items');
    }
    
    toast.success("Signed out successfully", { duration: 2000 });
  };
  
  const renderActiveSection = () => {
    // Sections that don't require authentication
    if (['menu-items', 'spa-services', 'activities'].includes(activeSection)) {
      switch (activeSection) {
        case 'menu-items':
          return <MenuItemsManager />;
        case 'spa-services':
          return <SpaServicesManager />;
        case 'activities':
          return <ActivitiesManager />;
        default:
          return <MenuItemsManager />;
      }
    }
    
    // Sections that require authentication
    if (authenticated) {
      switch (activeSection) {
        case 'transactions':
          return <TransactionManager />;
        case 'clearing-history':
          return <TransactionClearingManager />;
        case 'spa-calendar':
          return <SpaCalendarManager />;
        case 'notifications':
          return <NotificationsManager />;
        case 'users':
          return <UserManager />;
        case 'settings':
          return (
            <div className="text-center p-12">
              <h3 className="text-lg font-medium mb-2">Admin Settings</h3>
              <p className="text-muted-foreground">Settings management functionality coming soon.</p>
            </div>
          );
        default:
          return <TransactionManager />;
      }
    }
    
    // Fallback for unauthenticated users trying to access auth-required sections
    return (
      <div className="text-center p-12">
        <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
        <p className="text-muted-foreground mb-4">
          You need to sign in to access this section.
        </p>
        <button 
          onClick={() => navigate('/auth')}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Sign In
        </button>
      </div>
    );
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar 
        onNavigate={setActiveSection} 
        activeSection={activeSection} 
        authenticated={authenticated}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader 
          onSignOut={handleSignOut} 
          authenticated={authenticated}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
