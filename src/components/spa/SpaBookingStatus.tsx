
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SpaBooking } from '@/hooks/useSpaBookings';

interface SpaBookingStatusProps {
  bookingDetails: SpaBooking;
  showDetailsModal: () => void;
}

const SpaBookingStatus: React.FC<SpaBookingStatusProps> = ({ 
  bookingDetails,
  showDetailsModal
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="p-4 border-primary/20 shadow-sm bg-primary/5">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg flex items-center">
              <Clock className="h-5 w-5 text-primary mr-2" />
              Upcoming Spa Appointment
            </h3>
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
              Booked
            </span>
          </div>
          
          <div className="mb-3">
            <p className="font-medium">{bookingDetails.serviceName}</p>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {new Date(bookingDetails.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })} at {bookingDetails.time}
              </span>
            </div>
          </div>
          
          <button
            onClick={showDetailsModal}
            className="text-primary text-sm self-end hover:underline underline-offset-4"
          >
            View Details
          </button>
        </div>
      </Card>
    </motion.div>
  );
};

export default SpaBookingStatus;
