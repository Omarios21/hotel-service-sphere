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
import LanguageManager from '@/components/admin/LanguageManager';
import SettingsManager from '@/components/admin/SettingsManager';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const Admin: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('transactions');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  useEffect(() => {
    const menuItemsChannel = supabase
      .channel('admin_menu_items_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'menu_items' 
        }, 
        () => {
          console.log('Menu items updated in admin');
          window.dispatchEvent(new Event('menuItemsUpdated'));
          window.dispatchEvent(new Event('adminMenuItemsChanged'));
      })
      .subscribe();
      
    const spaServicesChannel = supabase
      .channel('admin_spa_services_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'spa_services' 
        }, 
        () => {
          console.log('Spa services updated in admin');
          window.dispatchEvent(new Event('spaServicesUpdated'));
          window.dispatchEvent(new Event('adminSpaServicesChanged'));
      })
      .subscribe();
      
    const activitiesChannel = supabase
      .channel('admin_activities_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'activities' 
        }, 
        () => {
          console.log('Activities updated in admin');
          window.dispatchEvent(new Event('activitiesUpdated'));
          window.dispatchEvent(new Event('adminActivitiesChanged'));
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(menuItemsChannel);
      supabase.removeChannel(spaServicesChannel);
      supabase.removeChannel(activitiesChannel);
    };
  }, []);
  
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'transactions':
        return <TransactionManager />;
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
      case 'languages':
        return <LanguageManager />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <TransactionManager />;
    }
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <div className={cn(
        "transition-all duration-300 ease-in-out relative",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <AdminSidebar 
          onNavigate={setActiveSection} 
          activeSection={activeSection} 
          collapsed={sidebarCollapsed}
        />
        <button 
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-primary text-white p-1 rounded-full shadow-md z-10"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      
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
