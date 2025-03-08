
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Car, Clock, MapPin, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

const TaxiBooking: React.FC = () => {
  const { t, formatPrice } = useLanguage();
  const [bookingType, setBookingType] = useState<'now' | 'schedule'>('now');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success(
        bookingType === 'now' 
          ? t('taxi.bookingConfirmedNow') 
          : t('taxi.bookingConfirmedSchedule')
      );
      setIsSubmitting(false);
      
      // Reset form for "book now" option
      if (bookingType === 'now') {
        setPickup('');
        setDestination('');
        setPassengers('1');
      }
    }, 1500);
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
          <h1 className="text-3xl font-bold tracking-tight text-primary">{t('taxi.title')}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {t('taxi.subtitle')}
          </p>
        </motion.div>

        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <Tabs 
            defaultValue="now" 
            onValueChange={(value) => setBookingType(value as 'now' | 'schedule')}
            className="p-6"
          >
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="now">{t('taxi.bookNow')}</TabsTrigger>
              <TabsTrigger value="schedule">{t('taxi.scheduleRide')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="now">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="pickup">
                    {t('taxi.pickupLocation')}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      id="pickup"
                      className="pl-10"
                      placeholder={t('taxi.pickupPlaceholder')}
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="destination">
                    {t('taxi.destination')}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      id="destination"
                      className="pl-10"
                      placeholder={t('taxi.destinationPlaceholder')}
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="passengers">
                    {t('taxi.passengers')}
                  </label>
                  <select
                    id="passengers"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t('taxi.estimatedPrice')}: </span>
                      <span className="font-medium">{formatPrice(25)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t('taxi.estimatedTime')}: </span>
                      <span className="font-medium">5-10 min</span>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                        {t('taxi.processing')}
                      </span>
                    ) : (
                      t('taxi.bookNow')
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="schedule">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="pickup-scheduled">
                    {t('taxi.pickupLocation')}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      id="pickup-scheduled"
                      className="pl-10"
                      placeholder={t('taxi.pickupPlaceholder')}
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="destination-scheduled">
                    {t('taxi.destination')}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      id="destination-scheduled"
                      className="pl-10"
                      placeholder={t('taxi.destinationPlaceholder')}
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="date">
                      {t('taxi.date')}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <Input
                        id="date"
                        type="date"
                        className="pl-10"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="time">
                      {t('taxi.time')}
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <Input
                        id="time"
                        type="time"
                        className="pl-10"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="passengers-scheduled">
                    {t('taxi.passengers')}
                  </label>
                  <select
                    id="passengers-scheduled"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t('taxi.estimatedPrice')}: </span>
                      <span className="font-medium">{formatPrice(25)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                        {t('taxi.processing')}
                      </span>
                    ) : (
                      t('taxi.scheduleRide')
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default TaxiBooking;
