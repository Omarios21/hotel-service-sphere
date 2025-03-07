
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import QRScanner from '../components/QRScanner';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const handleQRScan = (roomId: string) => {
    // In a real app, this would validate with a backend
    setIsAuthenticated(true);
    
    // Store the room ID in localStorage
    localStorage.setItem('roomId', roomId);
    
    // Show success toast
    toast.success(`Successfully authenticated for Room ${roomId}`);
    
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
            Scan your QR code to unlock room service, spa bookings, and activities
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card shadow-lg rounded-2xl px-8 py-12 sm:px-12 sm:py-16">
            <div className="flex flex-col items-center">
              <QRScanner onScan={handleQRScan} />
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
