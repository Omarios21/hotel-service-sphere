
import React from 'react';
import { motion } from 'framer-motion';
import { Package, Timer, MapPin, X } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface DeliveryStatusProps {
  orderDetails?: {
    orderId: string;
    estimatedDelivery: {
      min: string;
      max: string;
    };
    items: { name: string; quantity: number }[];
    orderTime: string;
  };
  showDetailsModal: () => void;
}

const DeliveryStatus: React.FC<DeliveryStatusProps> = ({ 
  orderDetails,
  showDetailsModal
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  if (!orderDetails) return null;
  
  // Calculate order progress based on time elapsed
  const orderTime = new Date(orderDetails.orderTime).getTime();
  const now = new Date().getTime();
  const elapsedMinutes = Math.floor((now - orderTime) / 60000);
  
  let currentStep = 1; // Order received
  if (elapsedMinutes >= 5) currentStep = 2; // Preparing (after 5 minutes)
  if (elapsedMinutes >= 10) currentStep = 3; // On the way (after 10 minutes)
  
  const steps = [
    { id: 1, name: t('roomService.orderReceived') || 'Order Received', icon: <Package className="h-5 w-5" />, color: 'bg-primary' },
    { id: 2, name: t('roomService.preparingOrder') || 'Preparing Order', icon: <Timer className="h-5 w-5" />, color: 'bg-muted-foreground' },
    { id: 3, name: t('roomService.orderOnWay') || 'Order on the Way', icon: <MapPin className="h-5 w-5" />, color: 'bg-muted-foreground' },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        {t('roomService.deliveryTitle') || 'Room Service Delivery'}
      </h2>
      
      <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-900 dark:to-indigo-950/50 border shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{t('roomService.orderNumber') || 'Order'} #{orderDetails.orderId}</h3>
              <p className="text-sm text-muted-foreground">{t('roomService.orderedAt') || 'Ordered at'}: {orderDetails.orderTime}</p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={showDetailsModal}>
              {t('button.view') || 'View Details'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Delivery progress bar */}
          <div className="relative mb-4 mt-2">
            <div className="overflow-hidden h-2 text-xs flex rounded bg-muted">
              <div 
                className="bg-primary rounded transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 3) * 100}%` }} 
              />
            </div>
            
            <div className="flex justify-between mt-2">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs mt-1 ${
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Delivery estimate */}
          <div className="bg-muted/30 p-3 rounded-md text-sm">
            <p className="font-medium">{t('roomService.estimatedDelivery') || 'Estimated Delivery'}</p>
            <p className="text-muted-foreground">
              {t('roomService.betweenTimes') || 'Between'} {orderDetails.estimatedDelivery.min} {t('roomService.and') || 'and'} {orderDetails.estimatedDelivery.max}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DeliveryStatus;
