
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import MenuItemsManager from '@/components/admin/MenuItemsManager';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';

const Admin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast.error('Authentication error. Please log in again.');
          navigate('/auth');
          return;
        }
        
        if (!sessionData.session) {
          toast.error('Please log in to access the admin panel');
          navigate('/auth');
          return;
        }
        
        // Check if user is an admin
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', sessionData.session.user.id)
          .single();
        
        if (adminError && adminError.code !== 'PGRST116') { // Not found error
          console.error('Error checking admin status:', adminError);
          toast.error('Error checking admin status');
          return;
        }
        
        if (adminData) {
          setIsAdmin(true);
        } else {
          // First user to login becomes an admin automatically (for demo purposes)
          const { count, error: countError } = await supabase
            .from('admins')
            .select('*', { count: 'exact', head: true });
          
          if (countError) {
            console.error('Error checking admin count:', countError);
            toast.error('Error checking admin status');
            return;
          }
          
          if (count === 0) {
            // Make the first user an admin
            const { error: insertError } = await supabase
              .from('admins')
              .insert({
                user_id: sessionData.session.user.id
              });
              
            if (insertError) {
              console.error('Error creating admin:', insertError);
              toast.error('Error creating admin');
              return;
            }
            
            setIsAdmin(true);
            toast.success('You have been made an admin as the first user');
          } else {
            toast.error('You are not authorized to access the admin panel');
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Error in admin authentication:', error);
        toast.error('An error occurred while checking admin status');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader onSignOut={handleSignOut} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="menu-items">
              <TabsList className="mb-6">
                <TabsTrigger value="menu-items">Menu Items</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="menu-items">
                <MenuItemsManager />
              </TabsContent>
              
              <TabsContent value="orders">
                <div className="text-center p-12">
                  <h3 className="text-lg font-medium mb-2">Orders Management</h3>
                  <p className="text-muted-foreground">Orders management functionality coming soon.</p>
                </div>
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
