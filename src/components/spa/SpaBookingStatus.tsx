
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Bath, Sparkles, Timer } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SpaBooking } from '@/hooks/useSpaBookings';

interface SpaBookingStatusProps {
  bookingDetails: SpaBooking;
  showDetailsModal: () => void;
}

const SpaBookingStatus: React.FC<SpaBookingStatusProps> = ({ 
  bookingDetails,
  showDetailsModal
}) => {
  // Calculate booking progress
  const bookingDate = new Date(bookingDetails.date);
  const bookingTime = bookingDetails.time;
  const now = new Date();
  
  // Determine if the booking is today
  const isToday = now.toDateString() === bookingDate.toDateString();
  
  // Parse booking time (assuming format like "2:00 PM")
  const timeParts = bookingTime.match(/(\d+):(\d+) (\w+)/);
  let hours = parseInt(timeParts?.[1] || "0");
  const minutes = parseInt(timeParts?.[2] || "0");
  const period = timeParts?.[3];
  
  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  
  // Create a date object for the appointment time
  const appointmentTime = new Date(bookingDate);
  appointmentTime.setHours(hours, minutes, 0, 0);
  
  // Calculate time remaining
  const timeRemaining = appointmentTime.getTime() - now.getTime();
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  // Steps for the spa appointment
  const steps = [
    { id: 1, name: 'Booked', icon: <Calendar className="h-5 w-5" />, complete: true },
    { id: 2, name: 'Preparation', icon: <Bath className="h-5 w-5" />, complete: isToday },
    { id: 3, name: 'Ready', icon: <Sparkles className="h-5 w-5" />, complete: isToday && hoursRemaining <= 1 }
  ];
  
  // Determine current step
  let currentStep = 1;
  if (isToday) currentStep = 2;
  if (isToday && hoursRemaining <= 1) currentStep = 3;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <Bath className="h-5 w-5 text-primary" />
        Spa Appointment
      </h2>
      
      <Card className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/50 dark:to-blue-950/50 border shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{bookingDetails.serviceName}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(bookingDetails.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })} at {bookingDetails.time}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={showDetailsModal}>
              View Details
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Appointment progress bar */}
          <div className="relative mb-4 mt-2">
            <div className="overflow-hidden h-2 text-xs flex rounded bg-muted">
              <div 
                className="bg-primary rounded transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 3) * 100}%` }} 
              />
            </div>
            
            <div className="flex justify-between mt-2">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs mt-1 ${
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Time remaining */}
          {timeRemaining > 0 ? (
            <div className="bg-muted/30 p-3 rounded-md text-sm">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" />
                <p className="font-medium">Time Until Appointment</p>
              </div>
              <p className="text-muted-foreground pl-6">
                {hoursRemaining > 0 ? `${hoursRemaining} hours and ` : ''}
                {minutesRemaining} minutes remaining
              </p>
            </div>
          ) : (
            <div className="bg-primary/10 p-3 rounded-md text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <p className="font-medium">Your appointment is now!</p>
              </div>
              <p className="text-muted-foreground pl-6">
                Please proceed to the spa reception
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SpaBookingStatus;
