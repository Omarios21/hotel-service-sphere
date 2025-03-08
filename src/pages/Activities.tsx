
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, Clock, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useActivityBookings } from '@/hooks/useActivityBookings';
import ActivityBookingStatus from '@/components/activities/ActivityBookingStatus';
import ActivityBookingDetails from '@/components/activities/ActivityBookingDetails';
import { supabase } from '@/integrations/supabase/client';

interface Activity {
  id: string;
  name: string;
  description: string;
  location: string;
  duration: string;
  price: number;
  image: string;
  availableDates: string[];
}

const Activities: React.FC = () => {
  const {
    currentBooking,
    isBookingDetailsOpen,
    setIsBookingDetailsOpen,
    createBooking,
    clearBooking
  } = useActivityBookings();
  
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [guestCount, setGuestCount] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        // Fetch activities
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activities')
          .select('*')
          .eq('available', true);
        
        if (activitiesError) {
          throw activitiesError;
        }

        // For each activity, fetch its available dates
        const activitiesWithDates = await Promise.all(
          activitiesData.map(async (activity) => {
            const { data: datesData, error: datesError } = await supabase
              .from('activity_dates')
              .select('date')
              .eq('activity_id', activity.id);
            
            if (datesError) {
              console.error('Error fetching dates for activity:', datesError);
              return {
                ...activity,
                availableDates: []
              };
            }

            return {
              ...activity,
              availableDates: datesData.map(d => d.date)
            };
          })
        );

        setActivities(activitiesWithDates);
      } catch (error) {
        console.error('Error fetching activities:', error);
        toast.error('Failed to load activities. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);
  
  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setSelectedDate('');
    setGuestCount(1);
  };
  
  const handleBooking = () => {
    if (!selectedActivity || !selectedDate) return;
    
    setIsBooking(true);
    
    // Create booking
    createBooking({
      id: selectedActivity.id,
      name: selectedActivity.name,
      date: selectedDate,
      location: selectedActivity.location,
      guestCount: guestCount,
      price: selectedActivity.price
    }).then(() => {
      setIsBooking(false);
      setSelectedActivity(null);
      setSelectedDate('');
      setGuestCount(1);
    }).catch(() => {
      setIsBooking(false);
    });
  };
  
  const handleCancelBooking = () => {
    clearBooking();
    setIsBookingDetailsOpen(false);
    toast.success('Activity booking cancelled successfully');
  };
  
  return (
    <Layout>
      <div className="py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight text-primary">Activities</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Discover exciting experiences and adventures during your stay
          </p>
        </motion.div>
        
        {/* Display current booking status if it exists */}
        {currentBooking && (
          <ActivityBookingStatus 
            bookingDetails={currentBooking}
            showDetailsModal={() => setIsBookingDetailsOpen(true)}
          />
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : !selectedActivity ? (
          // Activity selection view
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map(activity => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleSelectActivity(activity)}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img 
                    src={activity.image} 
                    alt={activity.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg">{activity.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1 mb-3 line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{activity.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{activity.duration}</span>
                  </div>
                  <div className="flex justify-end">
                    <span className="font-medium text-primary">${activity.price} per person</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Booking view
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-border rounded-xl shadow-sm overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Activity details */}
              <div className="w-full md:w-1/2 p-6">
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="text-sm text-muted-foreground hover:text-primary mb-4 flex items-center"
                >
                  ← Back to activities
                </button>
                
                <h2 className="text-2xl font-bold">{selectedActivity.name}</h2>
                
                <div className="mt-4 aspect-[16/9] overflow-hidden rounded-lg bg-muted">
                  <img 
                    src={selectedActivity.image} 
                    alt={selectedActivity.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="mt-4">
                  <p className="text-muted-foreground">{selectedActivity.description}</p>
                  
                  <div className="flex items-center mt-4 text-muted-foreground">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{selectedActivity.location}</span>
                  </div>
                  
                  <div className="flex items-center mt-2 text-muted-foreground">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{selectedActivity.duration}</span>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Price</h3>
                    <span className="text-2xl font-bold text-primary">
                      ${selectedActivity.price}
                    </span>
                    <span className="text-sm text-muted-foreground"> per person</span>
                  </div>
                </div>
              </div>
              
              {/* Booking form */}
              <div className="w-full md:w-1/2 bg-secondary/30 p-6">
                <h3 className="font-bold mb-4">Make a Reservation</h3>
                
                {/* Date picker */}
                <div className="mb-6">
                  <label className="block text-sm mb-2">Available Dates</label>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-2 rounded-md border border-border bg-background"
                    >
                      <option value="">Select a date</option>
                      {selectedActivity.availableDates.map(date => (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Guest count */}
                <div className="mb-6">
                  <label className="block text-sm mb-2">Number of Guests</label>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value))}
                      className="w-full p-2 rounded-md border border-border bg-background"
                    />
                  </div>
                </div>
                
                {/* Total calculation */}
                <div className="mb-6 p-4 bg-background rounded-lg border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Activity price</span>
                    <span>${selectedActivity.price} x {guestCount}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span>${selectedActivity.price * guestCount}</span>
                  </div>
                </div>
                
                {/* Booking button */}
                <button
                  onClick={handleBooking}
                  disabled={!selectedDate || isBooking}
                  className={`w-full py-3 rounded-lg font-medium text-center transition-all ${
                    !selectedDate || isBooking
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}
                >
                  {isBooking ? 'Processing...' : 'Book Activity'}
                </button>
                
                {/* Cancellation policy */}
                <p className="text-xs text-muted-foreground mt-4">
                  Cancellations must be made at least 24 hours in advance for a full refund.
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Booking details modal */}
        <ActivityBookingDetails
          isOpen={isBookingDetailsOpen}
          onClose={() => setIsBookingDetailsOpen(false)}
          bookingDetails={currentBooking || undefined}
          onCancelBooking={handleCancelBooking}
        />
      </div>
    </Layout>
  );
};

export default Activities;
