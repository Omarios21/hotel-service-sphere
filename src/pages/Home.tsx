
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ServiceCard from '../components/ServiceCard';
import { motion } from 'framer-motion';
import { Utensils, Scissors, MapPin, UserIcon, Calendar, Clock, Wifi, Coffee, Sun } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
  
  useEffect(() => {
    // If no roomId is found in localStorage, redirect to authentication page
    if (!roomId) {
      navigate('/');
    }
  }, [roomId, navigate]);
  
  const services = [
    {
      id: 'room-service',
      title: 'Room Service',
      description: 'Order food and beverages directly to your room',
      icon: <Utensils className="h-6 w-6" />,
      path: '/room-service'
    },
    {
      id: 'spa',
      title: 'Spa & Wellness',
      description: 'Book relaxing spa treatments and massages',
      icon: <Scissors className="h-6 w-6" />,
      path: '/spa'
    },
    {
      id: 'activities',
      title: 'Activities',
      description: 'Discover and book exciting activities and experiences',
      icon: <MapPin className="h-6 w-6" />,
      path: '/activities'
    },
    {
      id: 'profile',
      title: 'My Profile',
      description: 'View your orders, bookings and preferences',
      icon: <UserIcon className="h-6 w-6" />,
      path: '/profile'
    }
  ];
  
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
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="bg-gradient-to-r from-blue-500/90 to-indigo-600/90 text-white p-6 md:p-8">
              <div className="max-w-lg">
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-3xl md:text-4xl font-bold tracking-tight"
                >
                  Welcome to Room {roomId}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="mt-3 text-blue-50"
                >
                  {hotelInfo.tagline}
                </motion.p>
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* Hotel Information Cards */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-none shadow-md">
            <CardContent className="p-5">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-2">
                  <Sun className="h-5 w-5 text-amber-500" />
                  <h3 className="font-medium">Hotel</h3>
                </div>
                <p className="text-lg font-medium text-primary">{hotelInfo.name}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-none shadow-md">
            <CardContent className="p-5">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-teal-500" />
                  <h3 className="font-medium">Checkout Time</h3>
                </div>
                <p className="text-lg font-medium text-primary">{hotelInfo.checkoutTime}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-none shadow-md">
            <CardContent className="p-5">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-2">
                  <Wifi className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">WiFi Code</h3>
                </div>
                <p className="text-lg font-medium text-primary font-mono">{hotelInfo.wifiCode}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Activities Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Today's Activities</h2>
          </div>
          
          <div className="space-y-3">
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className={`p-4 rounded-xl border shadow-sm transition-all ${
                  activity.status === 'ongoing' 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-card hover:bg-secondary/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{activity.title}</h3>
                      {activity.status === 'ongoing' && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full animate-pulse">
                          Now
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.time} • {activity.location}</p>
                  </div>
                  <button 
                    onClick={() => navigate('/activities')}
                    className="text-primary text-sm flex items-center gap-1 underline-offset-4 hover:underline"
                  >
                    Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Services Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
        >
          <div className="flex items-center gap-2 mb-4">
            <Coffee className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Our Services</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <motion.div key={service.id} variants={item}>
                <ServiceCard
                  title={service.title}
                  description={service.description}
                  icon={service.icon}
                  onClick={() => navigate(service.path)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Home;
