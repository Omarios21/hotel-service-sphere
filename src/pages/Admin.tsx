
import React, { useState } from 'react';
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
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };
  
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'transactions':
        return <TransactionManager />;
      case 'clearing-history':
        return <TransactionClearingManager />;
      case 'menu-items':
        return <MenuItemsManager />;
      case 'spa-services':
        return <SpaServicesManager />;
      case 'activities':
        return <ActivitiesManager />;
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
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar onNavigate={setActiveSection} activeSection={activeSection} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader onSignOut={handleSignOut} />
        
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
