
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface SpaBooking {
  bookingId: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
  bookingTime: string;
}

export const useSpaBookings = () => {
  const [currentBooking, setCurrentBooking] = useState<SpaBooking | null>(null);
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  
  useEffect(() => {
    const savedBooking = localStorage.getItem('currentSpaBooking');
    if (savedBooking) {
      try {
        setCurrentBooking(JSON.parse(savedBooking));
      } catch (e) {
        console.error('Error parsing saved spa booking', e);
      }
    }
  }, []);

  const createBooking = (serviceDetails: {
    name: string;
    price: number;
    date: string;
    time: string;
  }) => {
    const bookingId = `SPA-${Math.floor(Math.random() * 10000)}`;
    const now = new Date();
    
    const bookingDetails: SpaBooking = {
      bookingId,
      serviceName: serviceDetails.name,
      date: serviceDetails.date,
      time: serviceDetails.time,
      price: serviceDetails.price,
      bookingTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setCurrentBooking(bookingDetails);
    localStorage.setItem('currentSpaBooking', JSON.stringify(bookingDetails));
    
    window.dispatchEvent(new Event('spaBookingUpdated'));
    
    toast.success('Your spa appointment has been booked successfully!', {
      duration: 2000
    });
  };

  const clearBooking = () => {
    setCurrentBooking(null);
    localStorage.removeItem('currentSpaBooking');
    window.dispatchEvent(new Event('spaBookingUpdated'));
  };

  return {
    currentBooking,
    isBookingDetailsOpen,
    setIsBookingDetailsOpen,
    createBooking,
    clearBooking
  };
};
