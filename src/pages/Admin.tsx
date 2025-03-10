
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [loading, setLoading] = useState(false); // Set initial loading to false
  const [isAdmin, setIsAdmin] = useState(true); // Set initial admin status to true
  const navigate = useNavigate();

  // Remove authentication check completely
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // Remove loading check since we're not loading anything
  
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader onSignOut={handleSignOut} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="transactions">
              <TabsList className="mb-6 flex flex-wrap">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="clearing-history">Clearing History</TabsTrigger>
                <TabsTrigger value="menu-items">Menu Items</TabsTrigger>
                <TabsTrigger value="spa-services">Spa Services</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="spa-calendar">Spa Calendar</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transactions">
                <TransactionManager />
              </TabsContent>
              
              <TabsContent value="clearing-history">
                <TransactionClearingManager />
              </TabsContent>
              
              <TabsContent value="menu-items">
                <MenuItemsManager />
              </TabsContent>
              
              <TabsContent value="spa-services">
                <SpaServicesManager />
              </TabsContent>
              
              <TabsContent value="activities">
                <ActivitiesManager />
              </TabsContent>
              
              <TabsContent value="spa-calendar">
                <SpaCalendarManager />
              </TabsContent>
              
              <TabsContent value="notifications">
                <NotificationsManager />
              </TabsContent>
              
              <TabsContent value="users">
                <UserManager />
              </TabsContent>
              
              <TabsContent value="settings">
                <div className="text-center p-12">
                  <h3 className="text-lg font-medium mb-2">Admin Settings</h3>
                  <p className="text-muted-foreground">Settings management functionality coming soon.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
