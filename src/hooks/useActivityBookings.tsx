
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface ActivityBooking {
  bookingId: string;
  activityName: string;
  date: string;
  location: string;
  guestCount: number;
  totalPrice: number;
  bookingTime: string;
}

export const useActivityBookings = () => {
  const [currentBooking, setCurrentBooking] = useState<ActivityBooking | null>(null);
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  
  useEffect(() => {
    const savedBooking = localStorage.getItem('currentActivityBooking');
    if (savedBooking) {
      try {
        setCurrentBooking(JSON.parse(savedBooking));
      } catch (e) {
        console.error('Error parsing saved activity booking', e);
      }
    }
  }, []);

  const createBooking = (activityDetails: {
    name: string;
    date: string;
    location: string;
    guestCount: number;
    price: number;
  }) => {
    const bookingId = `ACT-${Math.floor(Math.random() * 10000)}`;
    const now = new Date();
    
    const bookingDetails: ActivityBooking = {
      bookingId,
      activityName: activityDetails.name,
      date: activityDetails.date,
      location: activityDetails.location,
      guestCount: activityDetails.guestCount,
      totalPrice: activityDetails.price * activityDetails.guestCount,
      bookingTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setCurrentBooking(bookingDetails);
    localStorage.setItem('currentActivityBooking', JSON.stringify(bookingDetails));
    
    window.dispatchEvent(new Event('activityBookingUpdated'));
    
    toast.success('Your activity has been booked successfully!', {
      duration: 2000
    });
  };

  const clearBooking = () => {
    setCurrentBooking(null);
    localStorage.removeItem('currentActivityBooking');
    window.dispatchEvent(new Event('activityBookingUpdated'));
  };

  return {
    currentBooking,
    isBookingDetailsOpen,
    setIsBookingDetailsOpen,
    createBooking,
    clearBooking
  };
};
