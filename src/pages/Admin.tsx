
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
        console.log('Checking admin status...');
        
        // Check if user is logged in
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          console.log('No session found, redirecting to auth');
          toast.error('You must be logged in to access the admin area');
          navigate('/auth');
          return;
        }
        
        console.log('User is logged in:', session.session.user.id);
        
        // Always create admin record for any logged in user
        // Skip checking if record exists and just try to insert
        try {
          const { error: insertError } = await supabase
            .from('admins')
            .insert({ user_id: session.session.user.id })
            .select();
          
          if (insertError) {
            // If error is about duplicate, that's fine - user is already an admin
            console.log('Insert result:', insertError);
            if (insertError.code === '23505') { // Unique violation error
              console.log('User is already an admin (duplicate key)');
              setIsAdmin(true);
            } else {
              console.error('Error creating admin:', insertError);
              toast.error('Error setting up admin access');
              setIsAdmin(false);
            }
          } else {
            console.log('Admin record created successfully');
            setIsAdmin(true);
            toast.success('You have been granted admin access');
          }
        } catch (error) {
          console.error('Admin creation error:', error);
          toast.error('Error checking admin status');
          setIsAdmin(false);
        }
        
        // Double-check that admin access is set properly
        if (!isAdmin) {
          const { data: adminCheck } = await supabase
            .from('admins')
            .select('*')
            .eq('user_id', session.session.user.id)
            .maybeSingle();
          
          console.log('Double-checking admin status:', adminCheck);
          if (adminCheck) {
            setIsAdmin(true);
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
