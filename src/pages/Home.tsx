
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import DeliveryStatus from '@/components/home/DeliveryStatus';
import DeliveryFollowUp from '@/components/room-service/DeliveryFollowUp';

interface Activity {
  id: string;
  title: string;
  time: string;
  location: string;
  status: 'upcoming' | 'ongoing';
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const roomId = localStorage.getItem('roomId');
  const [isDeliveryDetailsOpen, setIsDeliveryDetailsOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  
  // Sample hotel information
  const hotelInfo = {
    name: "Grand Azure Resort & Spa",
    tagline: "Where luxury meets tranquility",
    checkoutTime: "11:00 AM",
    wifiCode: "AZURE2025"
  };
  
  // Sample upcoming and ongoing activities
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      title: 'Morning Yoga',
      time: '8:00 AM - 9:00 AM',
      location: 'Beach Deck',
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Wine Tasting',
      time: '7:00 PM - 9:00 PM',
      location: 'Wine Cellar',
      status: 'upcoming'
    },
    {
      id: '3',
      title: 'Pool Tournament',
      time: 'Now - 4:00 PM',
      location: 'Game Room',
      status: 'ongoing'
    }
  ]);
  
  // Listen for order updates
  useEffect(() => {
    const checkCurrentOrder = () => {
      const savedOrder = localStorage.getItem('currentRoomServiceOrder');
      if (savedOrder) {
        try {
          setCurrentOrder(JSON.parse(savedOrder));
        } catch (e) {
          console.error('Error parsing saved order', e);
          setCurrentOrder(null);
        }
      } else {
        setCurrentOrder(null);
      }
    };
    
    // Check on initial load
    checkCurrentOrder();
    
    // Listen for storage changes
    window.addEventListener('storage', checkCurrentOrder);
    
    // Listen for custom event when order is placed
    const handleOrderUpdate = () => checkCurrentOrder();
    window.addEventListener('orderUpdated', handleOrderUpdate);
    
    return () => {
      window.removeEventListener('storage', checkCurrentOrder);
      window.removeEventListener('orderUpdated', handleOrderUpdate);
    };
  }, []);
  
  useEffect(() => {
    // If no roomId is found in localStorage, redirect to authentication page
    if (!roomId) {
      navigate('/');
    }
  }, [roomId, navigate]);
  
  // Removed services array since we're not displaying any shortcuts anymore
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <Layout>
      <div className="py-6 md:py-8">
        {/* Welcome Message - Moved to top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Welcome to Room {roomId}
          </h1>
        </motion.div>
        
        {/* Hotel Information Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 p-4 md:p-6 border-none shadow-md">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-primary mb-1">{hotelInfo.name}</h2>
              <p className="text-muted-foreground italic mb-3">{hotelInfo.tagline}</p>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Checkout: {hotelInfo.checkoutTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">WiFi:</span>
                  <code className="bg-primary/10 px-2 py-0.5 rounded">{hotelInfo.wifiCode}</code>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* Delivery Status Section */}
        {currentOrder && (
          <DeliveryStatus 
            orderDetails={currentOrder} 
            showDetailsModal={() => setIsDeliveryDetailsOpen(true)}
          />
        )}
        
        {/* Activities Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Activities
          </h2>
          
          <div className="space-y-3">
            {activities.map((activity) => (
              <div 
                key={activity.id}
                className={`p-3 rounded-lg border flex justify-between items-center ${
                  activity.status === 'ongoing' 
                    ? 'bg-primary/10 border-primary/20' 
                    : 'bg-card border-border'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{activity.title}</h3>
                    {activity.status === 'ongoing' && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        Now
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.time} • {activity.location}</p>
                </div>
                <button 
                  onClick={() => navigate('/activities')}
                  className="text-primary text-sm underline-offset-4 hover:underline"
                >
                  Details
                </button>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Services grid - Completely removed since no services are showing */}
        
        {/* Delivery details modal */}
        <DeliveryFollowUp
          isOpen={isDeliveryDetailsOpen}
          onClose={() => setIsDeliveryDetailsOpen(false)}
          orderDetails={currentOrder || undefined}
        />
      </div>
    </Layout>
  );
};

export default Home;
