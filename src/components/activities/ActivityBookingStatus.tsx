
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, MapPin, Timer, Trophy } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivityBooking } from '@/hooks/useActivityBookings';
import { useLanguage } from '@/contexts/LanguageContext';

interface ActivityBookingStatusProps {
  bookingDetails: ActivityBooking;
  showDetailsModal: () => void;
}

const ActivityBookingStatus: React.FC<ActivityBookingStatusProps> = ({ 
  bookingDetails,
  showDetailsModal
}) => {
  const { t } = useLanguage();
  
  // Calculate activity time details
  const activityDate = new Date(bookingDetails.date);
  const now = new Date();
  
  // Determine if the activity is today
  const isToday = now.toDateString() === activityDate.toDateString();
  
  // Calculate hours until activity (rough estimate)
  const timeUntilActivity = activityDate.getTime() - now.getTime();
  const hoursUntil = Math.floor(timeUntilActivity / (1000 * 60 * 60));
  const minutesUntil = Math.floor((timeUntilActivity % (1000 * 60 * 60)) / (1000 * 60));
  
  // Steps for the activity preparation
  const steps = [
    { id: 1, name: t('status.booked'), icon: <Calendar className="h-5 w-5" />, complete: true },
    { id: 2, name: t('roomService.preparingOrder'), icon: <Users className="h-5 w-5" />, complete: isToday },
    { id: 3, name: t('status.upcoming'), icon: <Trophy className="h-5 w-5" />, complete: isToday && hoursUntil <= 1 }
  ];
  
  // Determine current step
  let currentStep = 1;
  if (isToday) currentStep = 2;
  if (isToday && hoursUntil <= 1) currentStep = 3;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        {t('nav.activities')}
      </h2>
      
      <Card className="bg-gradient-to-r from-green-50/50 to-blue-50/50 dark:from-green-900/50 dark:to-blue-950/50 border shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{bookingDetails.activityName}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(bookingDetails.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={showDetailsModal}>
              {t('button.view')}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Activity progress bar */}
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
          
          {/* Activity details */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-muted/30 p-3 rounded-md text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <p className="font-medium">{t('taxi.pickupLocation')}</p>
              </div>
              <p className="text-muted-foreground pl-6">
                {bookingDetails.location}
              </p>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-md text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <p className="font-medium">{t('taxi.passengers')}</p>
              </div>
              <p className="text-muted-foreground pl-6">
                {bookingDetails.guestCount} {bookingDetails.guestCount === 1 ? t('button.book') : t('taxi.passengers')}
              </p>
            </div>
          </div>
          
          {/* Time until activity */}
          {timeUntilActivity > 0 ? (
            <div className="bg-muted/30 p-3 rounded-md text-sm">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" />
                <p className="font-medium">{t('taxi.estimatedTime')}</p>
              </div>
              <p className="text-muted-foreground pl-6">
                {hoursUntil > 0 ? `${hoursUntil} ${t('taxi.time')} ${t('roomService.and')} ` : ''}
                {minutesUntil} {t('taxi.time')} {t('status.upcoming')}
              </p>
            </div>
          ) : (
            <div className="bg-primary/10 p-3 rounded-md text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <p className="font-medium">{t('taxi.bookingConfirmedNow')}</p>
              </div>
              <p className="text-muted-foreground pl-6">
                {t('activities.cancelSuccess')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActivityBookingStatus;
