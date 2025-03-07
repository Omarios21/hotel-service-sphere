
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ServiceCard from '../components/ServiceCard';
import { motion } from 'framer-motion';
import { Utensils, Scissors, MapPin, UserIcon } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const roomId = localStorage.getItem('roomId');
  
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
      <div className="py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Welcome to Room {roomId}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our exclusive services designed for your comfort and enjoyment
          </p>
        </motion.div>
        
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
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
        </motion.div>
      </div>
    </Layout>
  );
};

export default Home;
