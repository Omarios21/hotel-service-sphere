
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

  const createBooking = async (serviceDetails: {
    id: string;
    name: string;
    price: number;
    date: string;
    time: string;
  }) => {
    const bookingId = `SPA-${Math.floor(Math.random() * 10000)}`;
    const now = new Date();
    const bookingTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const bookingDetails: SpaBooking = {
      bookingId,
      serviceName: serviceDetails.name,
      date: serviceDetails.date,
      time: serviceDetails.time,
      price: serviceDetails.price,
      bookingTime
    };
    
    // Save to Supabase
    try {
      const { error } = await supabase
        .from('spa_bookings')
        .insert({
          service_id: serviceDetails.id,
          booking_id: bookingId,
          service_name: serviceDetails.name,
          date: serviceDetails.date,
          time: serviceDetails.time,
          price: serviceDetails.price,
          booking_time: bookingTime
        });

      if (error) {
        console.error('Error saving booking to Supabase:', error);
        toast.error('Failed to save booking. Please try again.');
        return;
      }
      
      setCurrentBooking(bookingDetails);
      localStorage.setItem('currentSpaBooking', JSON.stringify(bookingDetails));
      
      window.dispatchEvent(new Event('spaBookingUpdated'));
      
      toast.success('Your spa appointment has been booked successfully!', {
        duration: 2000
      });
    } catch (error) {
      console.error('Error saving booking:', error);
      toast.error('Failed to save booking. Please try again.');
    }
  };

  const clearBooking = async () => {
    if (currentBooking) {
      try {
        // Find the booking in Supabase to get its ID
        const { data, error } = await supabase
          .from('spa_bookings')
          .select('id')
          .eq('booking_id', currentBooking.bookingId)
          .single();
        
        if (error) {
          console.error('Error finding booking to delete:', error);
        } else if (data) {
          // Delete from Supabase
          const { error: deleteError } = await supabase
            .from('spa_bookings')
            .delete()
            .eq('id', data.id);
          
          if (deleteError) {
            console.error('Error deleting booking from Supabase:', deleteError);
          }
        }
      } catch (error) {
        console.error('Error during booking cancellation:', error);
      }
    }
    
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
