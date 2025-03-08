
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, X } from 'lucide-react';
import { SpaBooking } from '@/hooks/useSpaBookings';
import { useLanguage } from '@/contexts/LanguageContext';

interface SpaBookingDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails?: SpaBooking;
  onCancelBooking?: () => void;
}

const SpaBookingDetails: React.FC<SpaBookingDetailsProps> = ({ 
  isOpen, 
  onClose,
  bookingDetails,
  onCancelBooking
}) => {
  const { formatPrice } = useLanguage();
  
  if (!bookingDetails) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Spa Appointment Details</span>
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
              Booked
            </span>
          </DialogTitle>
          <DialogDescription>
            Booking ID: {bookingDetails.bookingId}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-medium">{bookingDetails.serviceName}</h4>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {new Date(bookingDetails.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>{bookingDetails.time}</span>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Service price</span>
              <span>{formatPrice(bookingDetails.price)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPrice(bookingDetails.price)}</span>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-3">
              Booked at {bookingDetails.bookingTime}
            </p>
            
            {onCancelBooking && (
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={onCancelBooking}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Appointment
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpaBookingDetails;
