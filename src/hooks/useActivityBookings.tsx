
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
        console.log('Loaded activity booking from localStorage:', JSON.parse(savedBooking));
      } catch (e) {
        console.error('Error parsing saved activity booking', e);
      }
    } else {
      console.log('No saved activity booking found in localStorage');
    }
  }, []);

  const createBooking = async (activityDetails: {
    id: string;
    name: string;
    date: string;
    location: string;
    guestCount: number;
    price: number;
  }) => {
    const bookingId = `ACT-${Math.floor(Math.random() * 10000)}`;
    const now = new Date();
    const bookingTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const bookingDetails: ActivityBooking = {
      bookingId,
      activityName: activityDetails.name,
      date: activityDetails.date,
      location: activityDetails.location,
      guestCount: activityDetails.guestCount,
      totalPrice: activityDetails.price * activityDetails.guestCount,
      bookingTime
    };
    
    console.log('Creating activity booking:', bookingDetails);
    console.log('Activity ID:', activityDetails.id);
    
    // Save to Supabase
    try {
      const { error, data } = await supabase
        .from('activity_bookings')
        .insert({
          activity_id: activityDetails.id,
          booking_id: bookingId,
          activity_name: activityDetails.name,
          date: activityDetails.date,
          location: activityDetails.location,
          guest_count: activityDetails.guestCount,
          total_price: activityDetails.price * activityDetails.guestCount,
          booking_time: bookingTime
        })
        .select();

      console.log('Supabase insert response:', data, error);

      if (error) {
        console.error('Error saving booking to Supabase:', error);
        toast.error('Failed to save booking. Please try again.');
        return;
      }
      
      setCurrentBooking(bookingDetails);
      localStorage.setItem('currentActivityBooking', JSON.stringify(bookingDetails));
      
      window.dispatchEvent(new Event('activityBookingUpdated'));
      
      toast.success('Your activity has been booked successfully!', {
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
          .from('activity_bookings')
          .select('id')
          .eq('booking_id', currentBooking.bookingId)
          .single();
        
        console.log('Find booking response:', data, error);
        
        if (error) {
          console.error('Error finding booking to delete:', error);
        } else if (data) {
          // Delete from Supabase
          const { error: deleteError, data: deleteData } = await supabase
            .from('activity_bookings')
            .delete()
            .eq('id', data.id)
            .select();
          
          console.log('Delete booking response:', deleteData, deleteError);
          
          if (deleteError) {
            console.error('Error deleting booking from Supabase:', deleteError);
          }
        }
      } catch (error) {
        console.error('Error during booking cancellation:', error);
      }
    }
    
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
