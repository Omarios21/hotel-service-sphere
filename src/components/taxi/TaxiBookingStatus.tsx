
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, Clock, MapPin, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TaxiBookingDetails {
  bookingId: string;
  pickupTime: string;
  destination: string;
  pickupLocation: string;
  bookingTime: string;
  status: string;
}

interface TaxiBookingStatusProps {
  bookingDetails: TaxiBookingDetails;
  onCancelBooking: () => void;
}

const TaxiBookingStatus: React.FC<TaxiBookingStatusProps> = ({ 
  bookingDetails,
  onCancelBooking
}) => {
  const { t } = useLanguage();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="overflow-hidden border border-amber-100 dark:border-amber-900/30 shadow-md">
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
              <Car className="h-6 w-6 text-amber-800 dark:text-amber-400" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">{t('taxi.bookingTitle') || 'Taxi Reservation'}</h3>
                <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400 px-2 py-0.5 rounded-full">
                  {bookingDetails.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm mb-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{bookingDetails.pickupTime}</span>
                </div>
                
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">{t('taxi.to') || 'To'}: {bookingDetails.destination}</div>
                    <div>{t('taxi.from') || 'From'}: {bookingDetails.pickupLocation}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={onCancelBooking}
                >
                  <X className="h-4 w-4 mr-1" />
                  {t('button.cancel')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default TaxiBookingStatus;
