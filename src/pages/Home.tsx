import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Calendar, Clock, Wifi, ChevronRight, Coffee, Waves } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase, HotelInfo } from '@/integrations/supabase/client';
import DeliveryStatus from '@/components/home/DeliveryStatus';
import DeliveryFollowUp from '@/components/room-service/DeliveryFollowUp';
import SpaBookingStatus from '@/components/spa/SpaBookingStatus';
import SpaBookingDetails from '@/components/spa/SpaBookingDetails';
import ActivityBookingStatus from '@/components/activities/ActivityBookingStatus';
import ActivityBookingDetails from '@/components/activities/ActivityBookingDetails';
import HomeActivity from '@/components/home/HomeActivity';
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

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const roomId = localStorage.getItem('roomId');
  const [isDeliveryDetailsOpen, setIsDeliveryDetailsOpen] = useState(false);
  const [isSpaDetailsOpen, setIsSpaDetailsOpen] = useState(false);
  const [isActivityDetailsOpen, setIsActivityDetailsOpen] = useState(false);
  
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [currentSpaBooking, setCurrentSpaBooking] = useState<SpaBooking | null>(null);
  const [currentActivityBooking, setCurrentActivityBooking] = useState<ActivityBooking | null>(null);
  
  const [hotelInfo, setHotelInfo] = useState<HotelInfo>({
    id: '',
    name: "Grand Azure Resort",
    tagline: "Where luxury meets tranquility",
    checkout_time: "11:00 AM",
    breakfast_time: "7:00 AM - 10:30 AM",
    wifi_code: "AZURE2025",
    pool_hours: "8:00 AM - 8:00 PM"
  });
  
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
    const fetchHotelInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('hotel_info')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          console.error('Error fetching hotel info:', error);
          return;
        }
        
        if (data) {
          setHotelInfo(data as HotelInfo);
        }
      } catch (err) {
        console.error('Error fetching hotel info:', err);
      }
    };
    
    fetchHotelInfo();
    
    const handleSettingsUpdate = () => {
      fetchHotelInfo();
    };
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

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
      const savedOrder = localStorage.getItem('currentRoomServiceOrder');
      if (savedOrder) {
        try {
          setCurrentOrder(JSON.parse(savedOrder));
        } catch (e) {
          console.error('Error parsing saved order', e);
          setCurrentOrder(null);
        }
      } else {
        setCurrentOrder(null);
      }
      
      const savedSpaBooking = localStorage.getItem('currentSpaBooking');
      if (savedSpaBooking) {
        try {
          setCurrentSpaBooking(JSON.parse(savedSpaBooking));
        } catch (e) {
          console.error('Error parsing saved spa booking', e);
          setCurrentSpaBooking(null);
        }
      } else {
        setCurrentSpaBooking(null);
      }
      
      const savedActivityBooking = localStorage.getItem('currentActivityBooking');
      if (savedActivityBooking) {
        try {
          setCurrentActivityBooking(JSON.parse(savedActivityBooking));
        } catch (e) {
          console.error('Error parsing saved activity booking', e);
          setCurrentActivityBooking(null);
        }
      } else {
        setCurrentActivityBooking(null);
      }
    };
    
    checkCurrentBookings();
    
    window.addEventListener('storage', checkCurrentBookings);
    
    const handleOrderUpdate = () => checkCurrentBookings();
    window.addEventListener('orderUpdated', handleOrderUpdate);
    window.addEventListener('spaBookingUpdated', handleOrderUpdate);
    window.addEventListener('activityBookingUpdated', handleOrderUpdate);
    
    return () => {
      window.removeEventListener('storage', checkCurrentBookings);
      window.removeEventListener('orderUpdated', handleOrderUpdate);
      window.removeEventListener('spaBookingUpdated', handleOrderUpdate);
      window.removeEventListener('activityBookingUpdated', handleOrderUpdate);
    };
  }, []);
  
  const clearSpaBooking = () => {
    localStorage.removeItem('currentSpaBooking');
    setCurrentSpaBooking(null);
    setIsSpaDetailsOpen(false);
    toast.success(t('spa.cancelSuccess'));
  };
  
  const clearActivityBooking = () => {
    localStorage.removeItem('currentActivityBooking');
    setCurrentActivityBooking(null);
    setIsActivityDetailsOpen(false);
    toast.success(t('activities.cancelSuccess'));
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

  const hasAnyReservations = currentOrder || currentSpaBooking || currentActivityBooking;
  
  return (
    <Layout>
      <div className="py-8 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-light tracking-wide text-primary sm:text-5xl mb-2 font-serif">
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
          <Card className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-indigo-950 overflow-hidden border-none shadow-md rounded-2xl">
            <div className="relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full"></div>
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col">
                  <h2 className="text-3xl font-serif font-light text-primary mb-1">{hotelInfo.name}</h2>
                  <p className="text-muted-foreground/80 mb-6 font-light italic">{hotelInfo.tagline}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3 bg-white/40 dark:bg-white/5 p-4 rounded-xl">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                        <Clock className="h-5 w-5 text-primary/80" />
                      </div>
                      <div>
                        <span className="text-muted-foreground font-light">{t('home.checkout')}</span>
                        <p className="font-medium text-base">{hotelInfo.checkout_time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/40 dark:bg-white/5 p-4 rounded-xl">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                        <Wifi className="h-5 w-5 text-primary/80" />
                      </div>
                      <div>
                        <span className="text-muted-foreground font-light">{t('home.wifiAccess')}</span>
                        <p className="font-medium font-mono text-base">{hotelInfo.wifi_code}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/40 dark:bg-white/5 p-4 rounded-xl">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                        <Coffee className="h-5 w-5 text-primary/80" />
                      </div>
                      <div>
                        <span className="text-muted-foreground font-light">{t('home.breakfast')}</span>
                        <p className="font-medium text-base">{hotelInfo.breakfast_time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/40 dark:bg-white/5 p-4 rounded-xl">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                        <Waves className="h-5 w-5 text-primary/80" />
                      </div>
                      <div>
                        <span className="text-muted-foreground font-light">Swimming Pool</span>
                        <p className="font-medium text-base">{hotelInfo.pool_hours}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>
        
        {!hasAnyReservations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <Card className="p-6 bg-primary/5 border border-primary/10 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 bg-primary/10 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-primary/80" />
                </div>
                <h3 className="text-lg font-medium mb-2">{t('home.noReservations')}</h3>
                <p className="text-muted-foreground font-light mb-4">
                  {t('home.noReservationsDesc')}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
        
        {currentOrder && (
          <DeliveryStatus 
            orderDetails={currentOrder} 
            showDetailsModal={() => setIsDeliveryDetailsOpen(true)}
          />
        )}
        
        {currentSpaBooking && (
          <SpaBookingStatus
            bookingDetails={currentSpaBooking}
            showDetailsModal={() => setIsSpaDetailsOpen(true)}
          />
        )}
        
        {currentActivityBooking && (
          <ActivityBookingStatus
            bookingDetails={currentActivityBooking}
            showDetailsModal={() => setIsActivityDetailsOpen(true)}
          />
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-serif font-light text-primary flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary/70" />
              {t('home.todayActivities')}
            </h2>
            <Button 
              variant="ghost" 
              className="text-muted-foreground font-light hover:text-primary text-sm"
              onClick={() => navigate('/activities')}
            >
              {t('home.viewAll')} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {activities.map((activity) => (
              <HomeActivity key={activity.id} activity={activity} />
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
