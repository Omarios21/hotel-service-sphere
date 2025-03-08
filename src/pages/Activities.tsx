
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, Clock, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useActivityBookings } from '@/hooks/useActivityBookings';
import ActivityBookingStatus from '@/components/activities/ActivityBookingStatus';
import ActivityBookingDetails from '@/components/activities/ActivityBookingDetails';

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
  
  // Sample activities
  const activities: Activity[] = [
    {
      id: '1',
      name: 'Guided Snorkeling Tour',
      description: 'Explore the vibrant coral reefs and underwater life with an experienced guide.',
      location: 'Hotel Beach',
      duration: '2 hours',
      price: 75,
      image: 'https://images.unsplash.com/photo-1560275619-4cc5fa59d3be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      availableDates: ['2023-10-05', '2023-10-06', '2023-10-08']
    },
    {
      id: '2',
      name: 'Sunset Sailing Cruise',
      description: 'Enjoy the spectacular sunset views while cruising on a luxury catamaran.',
      location: 'Marina Dock',
      duration: '3 hours',
      price: 120,
      image: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      availableDates: ['2023-10-05', '2023-10-07', '2023-10-09']
    },
    {
      id: '3',
      name: 'Wine Tasting Experience',
      description: 'Sample a selection of premium local and international wines with our sommelier.',
      location: 'Hotel Wine Cellar',
      duration: '1.5 hours',
      price: 90,
      image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      availableDates: ['2023-10-06', '2023-10-08', '2023-10-10']
    },
    {
      id: '4',
      name: 'Helicopter Island Tour',
      description: 'See the island from above with breathtaking aerial views of beaches and mountains.',
      location: 'Helipad',
      duration: '45 minutes',
      price: 350,
      image: 'https://images.unsplash.com/photo-1608322368986-0cc6274ae0c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      availableDates: ['2023-10-07', '2023-10-09', '2023-10-11']
    },
    {
      id: '5',
      name: 'Cooking Class with Chef',
      description: 'Learn to prepare local dishes with our executive chef using fresh, local ingredients.',
      location: 'Hotel Kitchen',
      duration: '2.5 hours',
      price: 110,
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      availableDates: ['2023-10-06', '2023-10-08', '2023-10-10']
    },
    {
      id: '6',
      name: 'Guided Hiking Tour',
      description: 'Explore scenic mountain trails with stunning views of the coastline.',
      location: 'Mountain Trails',
      duration: '4 hours',
      price: 65,
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      availableDates: ['2023-10-05', '2023-10-07', '2023-10-09']
    }
  ];
  
  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setSelectedDate('');
    setGuestCount(1);
  };
  
  const handleBooking = () => {
    if (!selectedActivity || !selectedDate) return;
    
    setIsBooking(true);
    
    // Simulate API call
    setTimeout(() => {
      createBooking({
        name: selectedActivity.name,
        date: selectedDate,
        location: selectedActivity.location,
        guestCount: guestCount,
        price: selectedActivity.price
      });
      
      setIsBooking(false);
      setSelectedActivity(null);
      setSelectedDate('');
      setGuestCount(1);
    }, 1500);
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
        
        {!selectedActivity ? (
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
