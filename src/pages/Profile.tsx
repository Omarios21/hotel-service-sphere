
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { User, Clock, Calendar, LogOut, Settings, Bell, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  type: 'room-service' | 'spa' | 'activity';
  title: string;
  date: string;
  status: 'confirmed' | 'processing' | 'completed' | 'cancelled';
  price: number;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const roomId = localStorage.getItem('roomId') || '101';
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Sample orders
  const orders: Order[] = [
    {
      id: 'o1',
      type: 'room-service',
      title: 'Continental Breakfast',
      date: '2023-10-05T08:30:00',
      status: 'completed',
      price: 24.99
    },
    {
      id: 'o2',
      type: 'spa',
      title: 'Swedish Massage',
      date: '2023-10-06T14:00:00',
      status: 'confirmed',
      price: 120
    },
    {
      id: 'o3',
      type: 'activity',
      title: 'Sunset Sailing Cruise',
      date: '2023-10-07T16:30:00',
      status: 'confirmed',
      price: 120
    }
  ];
  
  const handleSignOut = () => {
    // Clear localStorage
    localStorage.removeItem('roomId');
    
    // Show toast
    toast.success('Signed out successfully');
    
    // Navigate to authentication page
    setTimeout(() => {
      navigate('/');
    }, 500);
  };
  
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(`Notifications ${notificationsEnabled ? 'disabled' : 'enabled'}`);
  };
  
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return 'text-blue-600 bg-blue-50';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };
  
  return (
    <Layout>
      <div className="py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight text-primary">My Profile</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Manage your orders, bookings and preferences
          </p>
        </motion.div>
        
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Profile header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center">
              <div className="bg-secondary rounded-full p-3 mr-4">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Room {roomId}</h2>
                <p className="text-muted-foreground text-sm">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-auto flex items-center text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="h-5 w-5 mr-1" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Orders & Bookings
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Settings
            </button>
          </div>
          
          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-medium text-lg mb-4">Your Recent Orders</h3>
                
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div
                        key={order.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="mb-3 sm:mb-0">
                          <h4 className="font-medium">{order.title}</h4>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{formatDate(order.date)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
                          <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <span className="font-medium ml-4">${order.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">No orders yet</h3>
                    <p className="text-muted-foreground">
                      Your orders and bookings will appear here
                    </p>
                  </div>
                )}
              </motion.div>
            )}
            
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-medium text-lg mb-4">Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about your orders and bookings
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={toggleNotifications}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationsEnabled ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center">
                      <Settings className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Language</h4>
                        <p className="text-sm text-muted-foreground">
                          Choose your preferred language
                        </p>
                      </div>
                    </div>
                    <select className="py-1 px-2 rounded border border-border bg-background">
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="es">Español</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
