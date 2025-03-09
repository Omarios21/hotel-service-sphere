import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Wifi, Star, ChevronRight, Gem, UtensilsCrossed, Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import DeliveryStatus from '@/components/home/DeliveryStatus';
import DeliveryFollowUp from '@/components/room-service/DeliveryFollowUp';
import SpaBookingStatus from '@/components/spa/SpaBookingStatus';
import SpaBookingDetails from '@/components/spa/SpaBookingDetails';
import ActivityBookingStatus from '@/components/activities/ActivityBookingStatus';
import ActivityBookingDetails from '@/components/activities/ActivityBookingDetails';
import TaxiBookingStatus from '@/components/taxi/TaxiBookingStatus';
import { SpaBooking } from '@/hooks/useSpaBookings';
import { ActivityBooking } from '@/hooks/useActivityBookings';
import { useLanguage } from '@/contexts/LanguageContext';

interface Activity {
  id: string;
  title: string;
  time: string;
  location: string;
  status: 'upcoming' | 'ongoing';
}

interface TaxiBooking {
  bookingId: string;
  pickupTime: string;
  destination: string;
  pickupLocation: string;
  bookingTime: string;
  status: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t, formatPrice } = useLanguage();
  const roomId = localStorage.getItem('roomId');
  const [isDeliveryDetailsOpen, setIsDeliveryDetailsOpen] = useState(false);
  const [isSpaDetailsOpen, setIsSpaDetailsOpen] = useState(false);
  const [isActivityDetailsOpen, setIsActivityDetailsOpen] = useState(false);
  
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [currentSpaBooking, setCurrentSpaBooking] = useState<SpaBooking | null>(null);
  const [currentActivityBooking, setCurrentActivityBooking] = useState<ActivityBooking | null>(null);
  const [currentTaxiBooking, setCurrentTaxiBooking] = useState<TaxiBooking | null>(null);
  const [showTaxiAnimation, setShowTaxiAnimation] = useState(false);
  const [showOrderAnimation, setShowOrderAnimation] = useState(false);
  const [showSpaAnimation, setShowSpaAnimation] = useState(false);
  const [showActivityAnimation, setShowActivityAnimation] = useState(false);
  
  const hotelInfo = {
    name: "Grand Azure Resort & Spa",
    tagline: "Where luxury meets tranquility",
    checkoutTime: "11:00 AM",
    wifiCode: "AZURE2025",
    breakfastTime: {
      weekday: "7:00 AM - 10:30 AM",
      weekend: "7:30 AM - 11:00 AM",
      location: "Azure Restaurant, Level 2"
    }
  };
  
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      title: 'Morning Yoga',
      time: '8:00 AM - 9:00 AM',
      location: 'Beach Deck',
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Wine Tasting',
      time: '7:00 PM - 9:00 PM',
      location: 'Wine Cellar',
      status: 'upcoming'
    },
    {
      id: '3',
      title: 'Pool Tournament',
      time: 'Now - 4:00 PM',
      location: 'Game Room',
      status: 'ongoing'
    }
  ]);

  useEffect(() => {
    const sortedActivities = [...activities].sort((a, b) => {
      if (a.status === 'ongoing' && b.status !== 'ongoing') {
        return -1;
      } else if (a.status !== 'ongoing' && b.status === 'ongoing') {
        return 1;
      }
      return 0;
    });
    
    if (JSON.stringify(sortedActivities) !== JSON.stringify(activities)) {
      setActivities(sortedActivities);
    }
  }, [activities]);
  
  useEffect(() => {
    const checkCurrentBookings = () => {
      // Check for room service orders
      const savedOrder = localStorage.getItem('currentRoomServiceOrder');
      const prevOrder = currentOrder ? JSON.stringify(currentOrder) : null;
      
      if (savedOrder) {
        try {
          const parsedOrder = JSON.parse(savedOrder);
          setCurrentOrder(parsedOrder);
          
          // Show animation only if this is a new order
          if (prevOrder !== savedOrder) {
            setShowOrderAnimation(true);
            setTimeout(() => setShowOrderAnimation(false), 3000);
          }
        } catch (e) {
          console.error('Error parsing saved order', e);
          setCurrentOrder(null);
        }
      } else {
        setCurrentOrder(null);
      }
      
      // Check for spa bookings
      const savedSpaBooking = localStorage.getItem('currentSpaBooking');
      const prevSpaBooking = currentSpaBooking ? JSON.stringify(currentSpaBooking) : null;
      
      if (savedSpaBooking) {
        try {
          const parsedBooking = JSON.parse(savedSpaBooking);
          setCurrentSpaBooking(parsedBooking);
          
          // Show animation only if this is a new booking
          if (prevSpaBooking !== savedSpaBooking) {
            setShowSpaAnimation(true);
            setTimeout(() => setShowSpaAnimation(false), 3000);
          }
        } catch (e) {
          console.error('Error parsing saved spa booking', e);
          setCurrentSpaBooking(null);
        }
      } else {
        setCurrentSpaBooking(null);
      }
      
      // Check for activity bookings
      const savedActivityBooking = localStorage.getItem('currentActivityBooking');
      const prevActivityBooking = currentActivityBooking ? JSON.stringify(currentActivityBooking) : null;
      
      if (savedActivityBooking) {
        try {
          const parsedBooking = JSON.parse(savedActivityBooking);
          setCurrentActivityBooking(parsedBooking);
          
          // Show animation only if this is a new booking
          if (prevActivityBooking !== savedActivityBooking) {
            setShowActivityAnimation(true);
            setTimeout(() => setShowActivityAnimation(false), 3000);
          }
        } catch (e) {
          console.error('Error parsing saved activity booking', e);
          setCurrentActivityBooking(null);
        }
      } else {
        setCurrentActivityBooking(null);
      }
      
      // Check for taxi bookings
      const savedTaxiBooking = localStorage.getItem('currentTaxiBooking');
      const prevTaxiBooking = currentTaxiBooking ? JSON.stringify(currentTaxiBooking) : null;
      
      if (savedTaxiBooking) {
        try {
          const parsedBooking = JSON.parse(savedTaxiBooking);
          setCurrentTaxiBooking(parsedBooking);
          
          // Show animation only if this is a new booking
          if (prevTaxiBooking !== savedTaxiBooking) {
            setShowTaxiAnimation(true);
            setTimeout(() => setShowTaxiAnimation(false), 3000);
          }
        } catch (e) {
          console.error('Error parsing saved taxi booking', e);
          setCurrentTaxiBooking(null);
        }
      } else {
        setCurrentTaxiBooking(null);
      }
    };
    
    checkCurrentBookings();
    
    window.addEventListener('storage', checkCurrentBookings);
    
    const handleOrderUpdate = () => checkCurrentBookings();
    window.addEventListener('orderUpdated', handleOrderUpdate);
    window.addEventListener('spaBookingUpdated', handleOrderUpdate);
    window.addEventListener('activityBookingUpdated', handleOrderUpdate);
    window.addEventListener('taxiBookingUpdated', handleOrderUpdate);
    
    return () => {
      window.removeEventListener('storage', checkCurrentBookings);
      window.removeEventListener('orderUpdated', handleOrderUpdate);
      window.removeEventListener('spaBookingUpdated', handleOrderUpdate);
      window.removeEventListener('activityBookingUpdated', handleOrderUpdate);
      window.removeEventListener('taxiBookingUpdated', handleOrderUpdate);
    };
  }, [currentOrder, currentSpaBooking, currentActivityBooking, currentTaxiBooking]);
  
  const clearSpaBooking = () => {
    localStorage.removeItem('currentSpaBooking');
    setCurrentSpaBooking(null);
    setIsSpaDetailsOpen(false);
    toast.success(t('spa.cancelSuccess') || 'Spa appointment cancelled successfully');
  };
  
  const clearActivityBooking = () => {
    localStorage.removeItem('currentActivityBooking');
    setCurrentActivityBooking(null);
    setIsActivityDetailsOpen(false);
    toast.success(t('activities.cancelSuccess') || 'Activity booking cancelled successfully');
  };
  
  const clearTaxiBooking = () => {
    localStorage.removeItem('currentTaxiBooking');
    setCurrentTaxiBooking(null);
    toast.success(t('taxi.cancelSuccess') || 'Taxi booking cancelled successfully');
  };
  
  useEffect(() => {
    if (!roomId) {
      navigate('/');
    }
  }, [roomId, navigate]);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const hasAnyReservations = currentOrder || currentSpaBooking || currentActivityBooking || currentTaxiBooking;
  
  return (
    <Layout>
      <div className="py-8 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-light tracking-wide bg-gradient-to-r from-black via-stone-800 to-amber-700 bg-clip-text text-transparent sm:text-5xl mb-2 font-serif">
            {t('home.welcomeTitle')} {roomId}
          </h1>
          <p className="text-muted-foreground font-light italic">
            {t('home.welcomeText')}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-indigo-950 overflow-hidden border-none shadow-md rounded-2xl">
            <div className="relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/20 dark:bg-amber-900/20 rounded-bl-full"></div>
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col">
                  <h2 className="text-3xl font-serif font-light bg-gradient-to-r from-black to-amber-700 bg-clip-text text-transparent mb-1">{hotelInfo.name}</h2>
                  <p className="text-muted-foreground/80 mb-6 font-light italic">{hotelInfo.tagline}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3 bg-white/80 dark:bg-white/5 p-4 rounded-xl shadow-sm">
                      <div className="flex items-center justify-center w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-full">
                        <Clock className="h-5 w-5 text-amber-800 dark:text-amber-400" />
                      </div>
                      <div>
                        <span className="text-muted-foreground font-light">{t('home.checkout')}</span>
                        <p className="font-medium text-base">{hotelInfo.checkoutTime}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/80 dark:bg-white/5 p-4 rounded-xl shadow-sm">
                      <div className="flex items-center justify-center w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-full">
                        <Wifi className="h-5 w-5 text-amber-800 dark:text-amber-400" />
                      </div>
                      <div>
                        <span className="text-muted-foreground font-light">{t('home.wifiAccess')}</span>
                        <p className="font-medium font-mono text-base">{hotelInfo.wifiCode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>
        
        {/* Breakfast Information Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900 overflow-hidden border border-amber-100 dark:border-amber-900/30 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 p-2.5 rounded-full">
                  <UtensilsCrossed className="h-6 w-6 text-amber-800 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">{t('home.breakfastTime') || 'Breakfast Time'}</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">{t('home.weekdays') || 'Weekdays'}: </span>
                      <span className="text-muted-foreground">{hotelInfo.breakfastTime.weekday}</span>
                    </div>
                    <div>
                      <span className="font-medium">{t('home.weekends') || 'Weekends'}: </span>
                      <span className="text-muted-foreground">{hotelInfo.breakfastTime.weekend}</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-muted-foreground italic flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {hotelInfo.breakfastTime.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {!hasAnyReservations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <Card className="p-6 bg-white border border-amber-100/50 dark:bg-black/20 dark:border-amber-900/20 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-amber-800 dark:text-amber-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">{t('home.noReservations')}</h3>
                <p className="text-muted-foreground font-light mb-4">
                  {t('home.noReservationsDesc')}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
        
        {/* Order Status with Animation */}
        <AnimatePresence>
          {currentOrder && (
            <motion.div
              initial={showOrderAnimation ? { opacity: 0, scale: 0.95, y: 20 } : false}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`mb-4 ${showOrderAnimation ? 'ring-2 ring-amber-300 dark:ring-amber-700' : ''}`}
              key="order-status"
            >
              <DeliveryStatus 
                orderDetails={currentOrder} 
                showDetailsModal={() => setIsDeliveryDetailsOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Spa Booking Status with Animation */}
        <AnimatePresence>
          {currentSpaBooking && (
            <motion.div
              initial={showSpaAnimation ? { opacity: 0, scale: 0.95, y: 20 } : false}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`mb-4 ${showSpaAnimation ? 'ring-2 ring-amber-300 dark:ring-amber-700' : ''}`}
              key="spa-status"
            >
              <SpaBookingStatus
                bookingDetails={currentSpaBooking}
                showDetailsModal={() => setIsSpaDetailsOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Activity Booking Status with Animation */}
        <AnimatePresence>
          {currentActivityBooking && (
            <motion.div
              initial={showActivityAnimation ? { opacity: 0, scale: 0.95, y: 20 } : false}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`mb-4 ${showActivityAnimation ? 'ring-2 ring-amber-300 dark:ring-amber-700' : ''}`}
              key="activity-status"
            >
              <ActivityBookingStatus
                bookingDetails={currentActivityBooking}
                showDetailsModal={() => setIsActivityDetailsOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Taxi Booking Status with Animation */}
        <AnimatePresence>
          {currentTaxiBooking && (
            <motion.div
              initial={showTaxiAnimation ? { opacity: 0, scale: 0.95, y: 20 } : false}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`mb-4 ${showTaxiAnimation ? 'ring-2 ring-amber-300 dark:ring-amber-700' : ''}`}
              key="taxi-status"
            >
              <TaxiBookingStatus
                bookingDetails={currentTaxiBooking}
                onCancelBooking={clearTaxiBooking}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-serif font-light text-black dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-800 dark:text-amber-400" />
              {t('home.todayActivities')}
            </h2>
            <Button 
              variant="ghost" 
              className="text-muted-foreground font-light hover:text-amber-800 dark:hover:text-amber-400 text-sm"
              onClick={() => navigate('/activities')}
            >
              {t('home.viewAll')} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {activities.map((activity) => (
              <motion.div 
                key={activity.id}
                whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
                className={`p-4 rounded-xl border shadow-sm ${
                  activity.status === 'ongoing' 
                    ? 'bg-gradient-to-r from-amber-50 to-white border-amber-100 dark:from-amber-950/30 dark:to-slate-900 dark:border-amber-900/30' 
                    : 'bg-white border-slate-100 dark:bg-black/10 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                    activity.status === 'ongoing' 
                      ? 'bg-amber-100 dark:bg-amber-900/30' 
                      : 'bg-slate-50 dark:bg-white/5'
                  }`}>
                    {activity.status === 'ongoing' ? (
                      <Gem className="h-6 w-6 text-amber-800 dark:text-amber-400" />
                    ) : (
                      <Star className="h-6 w-6 text-slate-400/80" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-black dark:text-white">{activity.title}</h3>
                      {activity.status === 'ongoing' && (
                        <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400 px-2 py-0.5 rounded-full">
                          {t('status.ongoing')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground/80 font-light mt-1">
                      <span>{activity.time}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1 inline-block" /> 
                        {activity.location}
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-amber-800 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 mt-1"
                  onClick={() => navigate('/activities')}
                >
                  {t('button.view')}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <DeliveryFollowUp
          isOpen={isDeliveryDetailsOpen}
          onClose={() => setIsDeliveryDetailsOpen(false)}
          orderDetails={currentOrder || undefined}
        />
        
        <SpaBookingDetails
          isOpen={isSpaDetailsOpen}
          onClose={() => setIsSpaDetailsOpen(false)}
          bookingDetails={currentSpaBooking || undefined}
          onCancelBooking={clearSpaBooking}
        />
        
        <ActivityBookingDetails
          isOpen={isActivityDetailsOpen}
          onClose={() => setIsActivityDetailsOpen(false)}
          bookingDetails={currentActivityBooking || undefined}
          onCancelBooking={clearActivityBooking}
        />
      </div>
    </Layout>
  );
};

export default Home;
