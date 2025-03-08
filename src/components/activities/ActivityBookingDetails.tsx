
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Users, MapPin, X } from 'lucide-react';
import { ActivityBooking } from '@/hooks/useActivityBookings';

interface ActivityBookingDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails?: ActivityBooking;
  onCancelBooking?: () => void;
}

const ActivityBookingDetails: React.FC<ActivityBookingDetailsProps> = ({ 
  isOpen, 
  onClose,
  bookingDetails,
  onCancelBooking
}) => {
  if (!bookingDetails) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Activity Booking Details</span>
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
            <h4 className="text-lg font-medium">{bookingDetails.activityName}</h4>
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
            <MapPin className="h-4 w-4 mr-2" />
            <span>{bookingDetails.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>{bookingDetails.guestCount} {bookingDetails.guestCount === 1 ? 'guest' : 'guests'}</span>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">
                Activity price (${(bookingDetails.totalPrice / bookingDetails.guestCount).toFixed(2)} × {bookingDetails.guestCount})
              </span>
              <span>${bookingDetails.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${bookingDetails.totalPrice.toFixed(2)}</span>
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
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityBookingDetails;
