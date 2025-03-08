
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const navigate = useNavigate();
  
  const handleAuthentication = () => {
    // Set a default room ID
    const defaultRoomId = "101";
    
    // Store the room ID in localStorage
    localStorage.setItem('roomId', defaultRoomId);
    
    // Show success toast
    toast.success(`Successfully authenticated for Room ${defaultRoomId}`, { duration: 2000 });
    
    // Navigate to the home page after a short delay
    setTimeout(() => {
      navigate('/home');
    }, 1000);
  };
  
  return (
    <Layout hideHeader>
      <div className="h-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Hotel Service Sphere
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience premium room service, spa bookings, and activities
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card shadow-lg rounded-2xl px-8 py-12 sm:px-12 sm:py-16">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl font-semibold mb-6">Welcome to Your Stay</h2>
              <p className="mb-8 text-muted-foreground">
                QR code authentication is temporarily disabled. Click the button below to continue.
              </p>
              <Button 
                size="lg"
                onClick={handleAuthentication}
                className="w-full"
              >
                Enter Hotel Services
              </Button>
            </div>
          </div>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          Need assistance? Please contact the reception desk
        </motion.p>
      </div>
    </Layout>
  );
};

export default Index;
