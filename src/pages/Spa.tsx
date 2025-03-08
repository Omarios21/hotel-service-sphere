
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Calendar, Clock, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSpaBookings } from '@/hooks/useSpaBookings';
import SpaBookingStatus from '@/components/spa/SpaBookingStatus';
import SpaBookingDetails from '@/components/spa/SpaBookingDetails';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface SpaService {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  image: string;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

const Spa: React.FC = () => {
  const {
    currentBooking,
    isBookingDetailsOpen,
    setIsBookingDetailsOpen,
    createBooking,
    clearBooking
  } = useSpaBookings();
  
  const [selectedService, setSelectedService] = useState<SpaService | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("services");
  
  // Sample spa services
  const spaServices: SpaService[] = [
    {
      id: '1',
      name: 'Swedish Massage',
      description: 'A classic massage technique that uses long, flowing strokes to promote relaxation and wellbeing.',
      duration: '60 min',
      price: 120,
      image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '2',
      name: 'Deep Tissue Massage',
      description: 'Focuses on realigning deeper layers of muscles. It helps with chronic muscle tension and pain.',
      duration: '60 min',
      price: 140,
      image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '3',
      name: 'Aromatherapy Massage',
      description: 'Combines massage therapy with the therapeutic benefits of essential oils.',
      duration: '75 min',
      price: 160,
      image: 'https://images.unsplash.com/photo-1571375390890-0323e21e0528?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '4',
      name: 'Hot Stone Massage',
      description: 'Uses heated stones to promote deep relaxation and ease muscle tension.',
      duration: '90 min',
      price: 180,
      image: 'https://images.unsplash.com/photo-1554057009-8da3c333a053?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '5',
      name: 'Facial Treatment',
      description: 'Cleanses, exfoliates, and nourishes the skin to promote clear, well-hydrated skin.',
      duration: '60 min',
      price: 130,
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '6',
      name: 'Couples Massage',
      description: 'Enjoy a relaxing massage experience with a partner in the same room.',
      duration: '60 min',
      price: 240,
      image: 'https://images.unsplash.com/photo-1591343395082-e120087004b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ];
  
  // Sample time slots
  const timeSlots: TimeSlot[] = [
    { id: '1', time: '9:00 AM', available: true },
    { id: '2', time: '10:00 AM', available: true },
    { id: '3', time: '11:00 AM', available: false },
    { id: '4', time: '12:00 PM', available: true },
    { id: '5', time: '1:00 PM', available: true },
    { id: '6', time: '2:00 PM', available: false },
    { id: '7', time: '3:00 PM', available: true },
    { id: '8', time: '4:00 PM', available: true },
    { id: '9', time: '5:00 PM', available: true }
  ];
  
  const handleSelectService = (service: SpaService) => {
    setSelectedService(service);
    setActiveTab("booking");
    // Reset time slot selection when selecting a new service
    setSelectedTimeSlot(null);
  };
  
  const handleSelectTimeSlot = (slotId: string) => {
    setSelectedTimeSlot(slotId);
  };
  
  const handleBooking = () => {
    if (!selectedService || !selectedTimeSlot) return;
    
    setIsBooking(true);
    
    // Get the selected time
    const selectedTime = timeSlots.find(slot => slot.id === selectedTimeSlot)?.time || '';
    
    // Simulate API call
    setTimeout(() => {
      createBooking({
        name: selectedService.name,
        price: selectedService.price,
        date: selectedDate,
        time: selectedTime
      });
      
      setIsBooking(false);
      setSelectedService(null);
      setSelectedTimeSlot(null);
      setActiveTab("services");
    }, 1500);
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleCancelBooking = () => {
    clearBooking();
    setIsBookingDetailsOpen(false);
    toast.success('Spa appointment cancelled successfully');
  };

  const handleBackToServices = () => {
    setSelectedService(null);
    setActiveTab("services");
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
          <h1 className="text-3xl font-bold tracking-tight text-primary">Spa & Wellness</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Relax and rejuvenate with our selection of spa treatments
          </p>
        </motion.div>
        
        {/* Display current booking status if it exists */}
        {currentBooking && (
          <SpaBookingStatus 
            bookingDetails={currentBooking}
            showDetailsModal={() => setIsBookingDetailsOpen(true)}
          />
        )}
        
        <Tabs 
          defaultValue="services" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6 w-full justify-start">
            <TabsTrigger value="services">Services</TabsTrigger>
            {selectedService && (
              <TabsTrigger value="booking">Booking</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="services">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spaServices.map(service => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleSelectService(service)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img 
                      src={service.image} 
                      alt={service.name} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg">{service.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1 mb-3 line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{service.duration}</span>
                      <span className="font-medium text-primary">${service.price}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="booking">
            {selectedService && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-border rounded-xl shadow-sm overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Service details */}
                  <div className="w-full md:w-1/2 p-6">
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-bold">{selectedService.name}</h2>
                      <button
                        onClick={handleBackToServices}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="mt-4 aspect-[16/9] overflow-hidden rounded-lg bg-muted">
                      <img 
                        src={selectedService.image} 
                        alt={selectedService.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-muted-foreground">{selectedService.description}</p>
                      
                      <div className="flex items-center mt-4 text-muted-foreground">
                        <Clock className="h-5 w-5 mr-2" />
                        <span>{selectedService.duration}</span>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="font-medium mb-2">Price</h3>
                        <span className="text-2xl font-bold text-primary">
                          ${selectedService.price}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Booking form */}
                  <div className="w-full md:w-1/2 bg-secondary/30 p-6">
                    <h3 className="font-bold mb-4">Select Date & Time</h3>
                    
                    {/* Date picker */}
                    <div className="mb-6">
                      <label className="block text-sm mb-2">Date</label>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-2 rounded-md border border-border bg-background"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {formatDate(selectedDate)}
                      </p>
                    </div>
                    
                    {/* Time slots */}
                    <div className="mb-6">
                      <label className="block text-sm mb-2">Available Times</label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map(slot => (
                          <button
                            key={slot.id}
                            disabled={!slot.available}
                            onClick={() => handleSelectTimeSlot(slot.id)}
                            className={`py-2 px-1 text-sm rounded-md transition-colors ${
                              !slot.available
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : selectedTimeSlot === slot.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-background border border-border hover:bg-secondary'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Booking button */}
                    <button
                      onClick={handleBooking}
                      disabled={!selectedTimeSlot || isBooking}
                      className={`w-full py-3 rounded-lg font-medium text-center transition-all ${
                        !selectedTimeSlot || isBooking
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : 'bg-primary text-primary-foreground hover:opacity-90'
                      }`}
                    >
                      {isBooking ? 'Processing...' : 'Book Appointment'}
                    </button>
                    
                    {/* Additional information */}
                    <p className="text-xs text-muted-foreground mt-4">
                      Cancellations must be made at least 4 hours in advance to avoid charges.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Booking details modal */}
        <SpaBookingDetails
          isOpen={isBookingDetailsOpen}
          onClose={() => setIsBookingDetailsOpen(false)}
          bookingDetails={currentBooking || undefined}
          onCancelBooking={handleCancelBooking}
        />
      </div>
    </Layout>
  );
};

export default Spa;
