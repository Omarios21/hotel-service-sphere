import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import MenuItemsManager from '@/components/admin/MenuItemsManager';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';

const Admin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          toast.error('You must be logged in to access the admin area');
          navigate('/auth');
          return;
        }
        
        // Check if user is an admin
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', session.session.user.id)
          .maybeSingle();
        
        if (adminError) {
          console.error('Error checking admin status:', adminError);
          toast.error('Error checking admin status');
          setIsAdmin(false);
        } else if (adminData) {
          setIsAdmin(true);
        } else {
          // If no admin exists, create the first user as admin
          const { count, error: countError } = await supabase
            .from('admins')
            .select('*', { count: 'exact', head: true });
          
          if (countError) {
            console.error('Error checking admins count:', countError);
            setIsAdmin(false);
          } else if (count === 0) {
            // Make the first user who logs in an admin
            const { error: insertError } = await supabase
              .from('admins')
              .insert({ user_id: session.session.user.id });
            
            if (insertError) {
              console.error('Error creating admin:', insertError);
              toast.error('Error creating admin user');
            } else {
              setIsAdmin(true);
              toast.success('You have been made an admin as the first user');
            }
          } else {
            // Other users are not admins
            setIsAdmin(false);
            toast.error('You are not authorized to access the admin area');
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Admin check error:', error);
        toast.error('An error occurred checking admin status');
        setIsAdmin(false);
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
