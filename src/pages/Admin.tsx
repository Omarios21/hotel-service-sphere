
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Settings, Bell, Users, Calendar, Menu as MenuIcon, BarChart3, CreditCard, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import UserManager from '@/components/admin/UserManager';
import NotificationsManager from '@/components/admin/NotificationsManager';
import SettingsManager from '@/components/admin/SettingsManager';
import MenuItemsManager from '@/components/admin/MenuItemsManager';
import SpaServicesManager from '@/components/admin/SpaServicesManager';
import SpaCalendarManager from '@/components/admin/SpaCalendarManager';
import ActivitiesManager from '@/components/admin/ActivitiesManager';
import LanguageManager from '@/components/admin/LanguageManager';
import EditableTransactionManager from '@/components/admin/EditableTransactionManager';
import TransactionClearingManager from '@/components/admin/TransactionClearingManager';

const Admin: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <AdminHeader 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        
        <main className="p-4 md:p-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
              <EditableTransactionManager />
            </TabsContent>
            
            {/* Users Tab */}
            <TabsContent value="users" className={activeTab === 'users' ? 'block' : 'hidden'}>
              <UserManager />
            </TabsContent>
            
            {/* Notifications Tab */}
            <TabsContent value="notifications" className={activeTab === 'notifications' ? 'block' : 'hidden'}>
              <NotificationsManager />
            </TabsContent>
            
            {/* Menu Items Tab */}
            <TabsContent value="menu-items" className={activeTab === 'menu-items' ? 'block' : 'hidden'}>
              <MenuItemsManager />
            </TabsContent>
            
            {/* SPA Services Tab */}
            <TabsContent value="spa-services" className={activeTab === 'spa-services' ? 'block' : 'hidden'}>
              <SpaServicesManager />
            </TabsContent>

            {/* SPA Calendar Tab */}
            <TabsContent value="spa-calendar" className={activeTab === 'spa-calendar' ? 'block' : 'hidden'}>
              <SpaCalendarManager />
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className={activeTab === 'activities' ? 'block' : 'hidden'}>
              <ActivitiesManager />
            </TabsContent>
            
            {/* Transaction Clearing Tab */}
            <TabsContent value="transaction-clearing" className={activeTab === 'transaction-clearing' ? 'block' : 'hidden'}>
              <TransactionClearingManager />
            </TabsContent>
            
            {/* Languages Tab */}
            <TabsContent value="languages" className={activeTab === 'languages' ? 'block' : 'hidden'}>
              <LanguageManager />
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings" className={activeTab === 'settings' ? 'block' : 'hidden'}>
              <SettingsManager />
            </TabsContent>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
