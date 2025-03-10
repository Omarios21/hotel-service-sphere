
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Clock, Check, X, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SpaBooking {
  id: string;
  service_name: string;
  date: string;
  time: string;
  booking_id: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  price: number;
}

const SpaCalendarManager: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<SpaBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingDates, setBookingDates] = useState<string[]>([]);
  
  useEffect(() => {
    if (date) {
      fetchBookingsForDate(format(date, 'yyyy-MM-dd'));
    }
    fetchBookingDates();
  }, [date]);
  
  const fetchBookingDates = async () => {
    try {
      const { data, error } = await supabase
        .from('spa_bookings')
        .select('date')
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        const uniqueDates = Array.from(new Set(data.map(booking => booking.date)));
        setBookingDates(uniqueDates);
      }
    } catch (error: any) {
      toast.error('Error loading booking dates: ' + error.message, { duration: 2000 });
    }
  };
  
  const fetchBookingsForDate = async (dateStr: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('spa_bookings')
        .select('*')
        .eq('date', dateStr)
        .order('time', { ascending: true });
      
      if (error) throw error;
      
      setBookings(data || []);
    } catch (error: any) {
      toast.error('Error loading bookings: ' + error.message, { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (booking: SpaBooking, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('spa_bookings')
        .update({ status: newStatus })
        .eq('id', booking.id);
      
      if (error) throw error;
      
      setBookings(bookings.map(b => 
        b.id === booking.id ? { ...b, status: newStatus } : b
      ));
      
      toast.success(`Booking status updated to ${newStatus}`, { duration: 2000 });
    } catch (error: any) {
      toast.error('Error updating booking status: ' + error.message, { duration: 2000 });
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Spa Calendar</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className={cn("p-3 pointer-events-auto")}
              modifiers={{
                booked: (date) => bookingDates.includes(format(date, 'yyyy-MM-dd')),
              }}
              modifiersStyles={{
                booked: { fontWeight: 'bold', backgroundColor: 'rgba(59, 130, 246, 0.1)' }
              }}
            />
          </CardContent>
        </Card>
        
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">
            {date ? `Bookings for ${format(date, 'MMMM d, yyyy')}` : 'Select a date'}
          </h3>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin-slow h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No bookings for this date.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-medium">{booking.service_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" /> {booking.time}
                          </span>
                          <span className="text-sm flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" /> Room {booking.booking_id}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          booking.status === 'confirmed' ? 'bg-blue-50 text-blue-600' :
                          booking.status === 'completed' ? 'bg-green-50 text-green-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        
                        <div className="flex gap-1 ml-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(booking, 'confirmed')}
                            disabled={booking.status === 'confirmed'}
                            className="h-8"
                          >
                            Confirm
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(booking, 'completed')}
                            disabled={booking.status === 'completed'}
                            className="h-8"
                          >
                            Complete
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(booking, 'cancelled')}
                            disabled={booking.status === 'cancelled'}
                            className="h-8 border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpaCalendarManager;
