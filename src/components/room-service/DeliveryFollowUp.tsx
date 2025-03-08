
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Timer, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeliveryFollowUpProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails?: {
    orderId: string;
    estimatedDelivery: {
      min: string;
      max: string;
    };
    items: { name: string; quantity: number }[];
    orderTime: string;
  };
}

const DeliveryFollowUp: React.FC<DeliveryFollowUpProps> = ({
  isOpen,
  onClose,
  orderDetails
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Simulate order progress
  useEffect(() => {
    if (!isOpen) return;
    
    const timer1 = setTimeout(() => {
      setCurrentStep(2); // Order being prepared
    }, 30000); // 30 seconds
    
    const timer2 = setTimeout(() => {
      setCurrentStep(3); // Order on the way
    }, 60000); // 60 seconds
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen]);
  
  if (!isOpen || !orderDetails) return null;
  
  const steps = [
    { id: 1, name: 'Order Received', icon: <Package className="h-6 w-6" />, color: 'bg-primary' },
    { id: 2, name: 'Preparing Order', icon: <Timer className="h-6 w-6" />, color: 'bg-muted-foreground' },
    { id: 3, name: 'Order on the Way', icon: <MapPin className="h-6 w-6" />, color: 'bg-muted-foreground' },
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md bg-background rounded-lg shadow-lg p-6 m-4"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Order Tracking</h2>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="text-sm text-muted-foreground mb-2">Order ID: {orderDetails.orderId}</div>
          <div className="text-sm text-muted-foreground">Ordered at: {orderDetails.orderTime}</div>
        </div>
        
        {/* Order progress steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => {
            const isActive = currentStep >= step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center h-10 w-10 rounded-full ${isActive ? 'bg-primary' : 'bg-muted'} text-primary-foreground`}>
                  {step.icon}
                </div>
                
                <div className="ml-4 flex-1">
                  <h3 className={`font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.name}
                  </h3>
                  
                  {step.id === 1 && (
                    <p className="text-sm text-muted-foreground">
                      Your order has been received and is being processed.
                    </p>
                  )}
                  
                  {step.id === 2 && (
                    <p className="text-sm text-muted-foreground">
                      Our staff is preparing your items with care.
                    </p>
                  )}
                  
                  {step.id === 3 && (
                    <p className="text-sm text-muted-foreground">
                      Your order is on its way to your room!
                    </p>
                  )}
                </div>
                
                {index < steps.length - 1 && (
                  <div className="ml-5 h-12 border-l border-muted" />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Estimated delivery time */}
        <div className="p-4 bg-muted/50 rounded-lg border border-border mb-6">
          <h3 className="font-medium mb-2">Estimated Delivery Time</h3>
          <p className="text-muted-foreground">
            Between {orderDetails.estimatedDelivery.min} and {orderDetails.estimatedDelivery.max}
          </p>
        </div>
        
        {/* Order items */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Order Items</h3>
          <ul className="space-y-2">
            {orderDetails.items.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span>{item.name}</span>
                <span className="text-muted-foreground">x{item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <Button onClick={onClose} className="w-full">
          Close
        </Button>
      </motion.div>
    </div>
  );
};

export default DeliveryFollowUp;
