
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const navigate = useNavigate();
  
  const handleGuestLogin = () => {
    // Temporarily setting a default room ID without QR scanning
    localStorage.setItem('roomId', '101');
    
    // Show success toast
    toast.success('Welcome to your luxurious stay');
    
    // Navigate to the home page
    navigate('/home');
  };
  
  return (
    <Layout hideHeader>
      <div className="h-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl font-playfair">
            Grand Azure Experience
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            Welcome to your tranquil sanctuary of luxury and comfort
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl px-8 py-12 sm:px-12 sm:py-16 border border-amber-100">
            <div className="flex flex-col items-center space-y-6">
              <p className="text-center text-gray-600">
                Experience the epitome of luxury during your stay with us.
              </p>
              <Button 
                onClick={handleGuestLogin}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6"
              >
                Enter Your Suite
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
          For assistance, please contact our concierge at extension 0
        </motion.p>
      </div>
    </Layout>
  );
};

export default Index;
