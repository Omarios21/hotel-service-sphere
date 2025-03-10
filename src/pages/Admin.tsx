
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import MenuItemsManager from '@/components/admin/MenuItemsManager';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import SpaServicesManager from '@/components/admin/SpaServicesManager';
import ActivitiesManager from '@/components/admin/ActivitiesManager';
import SpaCalendarManager from '@/components/admin/SpaCalendarManager';
import NotificationsManager from '@/components/admin/NotificationsManager';
import UserManager from '@/components/admin/UserManager';

const Admin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        setLoading(true);
        console.log('Checking admin status...');
        
        // Check if user is logged in
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          console.log('No session found, redirecting to auth');
          toast.error('You must be logged in to access the admin area', { duration: 2000 });
          navigate('/auth');
          return;
        }
        
        console.log('User is logged in, bypassing admin check');
        
        // BYPASS: Set all authenticated users as admin automatically
        setIsAdmin(true);
        console.log('Admin access bypassed - all users granted access');

      } catch (error) {
        console.error('Error in admin check:', error);
        // Even on error, grant admin access (bypass)
        setIsAdmin(true);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin-slow h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // The following check is kept for code structure but will always pass
  // since isAdmin is forced to true above
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen flex-col">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You don't have permission to access the admin area.</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader onSignOut={handleSignOut} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="menu-items">
              <TabsList className="mb-6 flex flex-wrap">
                <TabsTrigger value="menu-items">Menu Items</TabsTrigger>
                <TabsTrigger value="spa-services">Spa Services</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="spa-calendar">Spa Calendar</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
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
