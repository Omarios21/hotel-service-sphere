
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage, Currency, currencyRates } from '@/contexts/LanguageContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TimePicker } from "@/components/admin/TimePicker";
import { Switch } from "@/components/ui/switch";
import { Info, AlertCircle, Hotel, Clock, Coffee, Wifi, Waves } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface HotelInfo {
  id: string;
  name: string;
  tagline: string;
  checkout_time: string;
  breakfast_time: string;
  wifi_code: string;
  pool_hours: string;
}

const SettingsManager = () => {
  // Currency rates
  const [rates, setRates] = useState<Record<Currency, number>>({...currencyRates});
  const { loadAvailableLanguages } = useLanguage();
  
  // Display values for the UI (MAD per 1 unit of foreign currency)
  const [displayRates, setDisplayRates] = useState<Record<Currency, string>>({} as Record<Currency, string>);
  
  // Service availability times
  const [serviceHours, setServiceHours] = useState({
    roomService: {
      enabled: true,
      startTime: "07:00",
      endTime: "22:00",
      is24Hours: false
    },
    reception: {
      enabled: true,
      startTime: "00:00",
      endTime: "23:59",
      is24Hours: true
    }
  });

  // Hotel information
  const [hotelInfo, setHotelInfo] = useState<HotelInfo>({
    id: '',
    name: 'Grand Azure Resort',
    tagline: 'Where luxury meets tranquility',
    checkout_time: '11:00 AM',
    breakfast_time: '7:00 AM - 10:30 AM',
    wifi_code: 'AZURE2025',
    pool_hours: '8:00 AM - 8:00 PM'
  });

  // Error state
  const [error, setError] = useState<string | null>(null);
  // Loading state
  const [isSaving, setIsSaving] = useState(false);
  
  // Load currency rates, service hours, and hotel info from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setError(null);
        
        // Load currency rates
        const { data: ratesData, error: ratesError } = await supabase
          .from('currency_rates')
          .select('*');
          
        if (ratesError) {
          console.error('Error loading currency rates:', ratesError);
          // Don't fail completely, just show a warning
          toast.warning('Could not load currency rates from database');
        }
        
        if (ratesData && ratesData.length > 0) {
          const ratesObj: Record<Currency, number> = {...currencyRates};
          const displayObj: Record<Currency, string> = {} as Record<Currency, string>;
          
          ratesData.forEach((rate) => {
            if (rate.currency in ratesObj) {
              ratesObj[rate.currency as Currency] = rate.rate;
              // Calculate display value (MAD per 1 unit of foreign currency)
              displayObj[rate.currency as Currency] = rate.rate === 0 ? 
                '' : (1 / rate.rate).toFixed(4);
            }
          });
          
          setRates(ratesObj);
          setDisplayRates(displayObj);
        } else {
          // Initialize display rates if we don't have data
          const displayObj: Record<Currency, string> = {} as Record<Currency, string>;
          Object.keys(rates).forEach((currency) => {
            const rate = rates[currency as Currency];
            displayObj[currency as Currency] = rate === 0 ? '' : (1 / rate).toFixed(4);
          });
          setDisplayRates(displayObj);
        }
        
        // Load service hours
        const { data: hoursData, error: hoursError } = await supabase
          .from('service_hours')
          .select('*');
          
        if (hoursError) {
          console.error('Error loading service hours:', hoursError);
          // Don't fail completely, just show a warning
          toast.warning('Could not load service hours from database');
        }
        
        if (hoursData && hoursData.length > 0) {
          const hoursObj = {...serviceHours};
          
          hoursData.forEach((service) => {
            if (service.service_type in hoursObj) {
              const is24Hours = service.start_time === "00:00" && service.end_time === "23:59";
              
              hoursObj[service.service_type as keyof typeof hoursObj] = {
                enabled: service.enabled,
                startTime: service.start_time,
                endTime: service.end_time,
                is24Hours
              };
            }
          });
          
          setServiceHours(hoursObj);
        }

        // Load hotel info
        const { data: hotelData, error: hotelError } = await supabase
          .from('hotel_info')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (hotelError) {
          console.error('Error loading hotel info:', hotelError);
          toast.warning('Could not load hotel information from database');
        }

        if (hotelData && hotelData.length > 0) {
          setHotelInfo(hotelData[0] as HotelInfo);
        }
      } catch (error: any) {
        console.error('Error loading settings:', error);
        setError('Failed to load settings. Please try again later.');
        toast.error('Failed to load settings');
      }
    };
    
    loadSettings();
  }, []);
  
  // Handle currency rate change (from MAD per 1 unit display value to storage rate)
  const handleRateChange = (currency: Currency, value: string) => {
    const numValue = parseFloat(value);
    
    // Update display value
    setDisplayRates(prev => ({
      ...prev,
      [currency]: value
    }));
    
    // Only update actual rate if value is valid
    if (!isNaN(numValue) && numValue > 0) {
      // Convert to storage format (1/value)
      setRates(prev => ({
        ...prev,
        [currency]: 1 / numValue
      }));
    }
  };
  
  // Handle service time change
  const handleTimeChange = (
    service: keyof typeof serviceHours,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setServiceHours(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        [field]: value,
        is24Hours: false // If manually setting times, turn off 24-hour mode
      }
    }));
  };
  
  // Handle service availability toggle
  const handleServiceToggle = (service: keyof typeof serviceHours) => {
    setServiceHours(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        enabled: !prev[service].enabled
      }
    }));
  };
  
  // Handle 24/7 toggle
  const handle24HoursToggle = (service: keyof typeof serviceHours) => {
    const is24Hours = !serviceHours[service].is24Hours;
    
    setServiceHours(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        is24Hours,
        startTime: is24Hours ? "00:00" : prev[service].startTime,
        endTime: is24Hours ? "23:59" : prev[service].endTime
      }
    }));
  };

  // Handle hotel info changes
  const handleHotelInfoChange = (field: keyof HotelInfo, value: string) => {
    setHotelInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Save using upsert but with a local-first strategy to avoid permissions issues
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      console.log('Saving rates:', rates);
      
      // For each currency, try to update first, and if it fails, try to insert
      for (const currency in rates) {
        try {
          // Try update first
          const { error: updateError } = await supabase
            .from('currency_rates')
            .update({ 
              rate: rates[currency as Currency],
              updated_at: new Date().toISOString()
            })
            .eq('currency', currency);
          
          // If update fails (likely due to no existing row), try insert
          if (updateError) {
            console.log(`Failed to update ${currency}, trying insert instead:`, updateError);
            
            const { error: insertError } = await supabase
              .from('currency_rates')
              .insert({ 
                currency, 
                rate: rates[currency as Currency],
                updated_at: new Date().toISOString()
              });
            
            if (insertError) {
              console.error(`Failed to insert ${currency}:`, insertError);
              throw insertError;
            }
          }
        } catch (error) {
          console.error(`Error saving currency rate for ${currency}:`, error);
          throw error;
        }
      }
      
      // Save service hours with the same approach
      for (const service in serviceHours) {
        const serviceData = serviceHours[service as keyof typeof serviceHours];
        
        try {
          // Try update first
          const { error: updateError } = await supabase
            .from('service_hours')
            .update({ 
              enabled: serviceData.enabled,
              start_time: serviceData.startTime,
              end_time: serviceData.endTime,
              updated_at: new Date().toISOString()
            })
            .eq('service_type', service);
          
          // If update fails, try insert
          if (updateError) {
            console.log(`Failed to update ${service}, trying insert instead:`, updateError);
            
            const { error: insertError } = await supabase
              .from('service_hours')
              .insert({ 
                service_type: service,
                enabled: serviceData.enabled,
                start_time: serviceData.startTime,
                end_time: serviceData.endTime,
                updated_at: new Date().toISOString()
              });
            
            if (insertError) {
              console.error(`Failed to insert ${service}:`, insertError);
              throw insertError;
            }
          }
        } catch (error) {
          console.error(`Error saving service hours for ${service}:`, error);
          throw error;
        }
      }

      // Save hotel info
      try {
        if (hotelInfo.id) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('hotel_info')
            .update({
              name: hotelInfo.name,
              tagline: hotelInfo.tagline,
              checkout_time: hotelInfo.checkout_time,
              breakfast_time: hotelInfo.breakfast_time,
              wifi_code: hotelInfo.wifi_code,
              pool_hours: hotelInfo.pool_hours,
              updated_at: new Date().toISOString()
            })
            .eq('id', hotelInfo.id);

          if (updateError) throw updateError;
        } else {
          // Insert new record
          const { data, error: insertError } = await supabase
            .from('hotel_info')
            .insert({
              name: hotelInfo.name,
              tagline: hotelInfo.tagline,
              checkout_time: hotelInfo.checkout_time,
              breakfast_time: hotelInfo.breakfast_time,
              wifi_code: hotelInfo.wifi_code,
              pool_hours: hotelInfo.pool_hours
            })
            .select();

          if (insertError) throw insertError;
          
          if (data && data.length > 0) {
            setHotelInfo(data[0] as HotelInfo);
          }
        }
      } catch (error) {
        console.error('Error saving hotel info:', error);
        throw error;
      }
      
      toast.success('Settings saved successfully');
      
      // Reload language context to apply new currency rates
      loadAvailableLanguages();
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setError(`Failed to save settings: ${error.message || 'Unknown error'}`);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">System Settings</h3>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Hotel Information</CardTitle>
          <CardDescription>
            Configure the hotel information displayed on the Home page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="hotelName">Hotel Name</Label>
              <div className="flex items-center">
                <Hotel className="h-4 w-4 mr-2 text-muted-foreground" />
                <Input
                  id="hotelName"
                  value={hotelInfo.name}
                  onChange={(e) => handleHotelInfoChange('name', e.target.value)}
                  className="border-primary/20 focus-visible:ring-primary/30"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hotelTagline">Tagline</Label>
              <Input
                id="hotelTagline"
                value={hotelInfo.tagline}
                onChange={(e) => handleHotelInfoChange('tagline', e.target.value)}
                className="border-primary/20 focus-visible:ring-primary/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="checkoutTime">Checkout Time</Label>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <Input
                  id="checkoutTime"
                  value={hotelInfo.checkout_time}
                  onChange={(e) => handleHotelInfoChange('checkout_time', e.target.value)}
                  className="border-primary/20 focus-visible:ring-primary/30"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="breakfastTime">Breakfast Time</Label>
              <div className="flex items-center">
                <Coffee className="h-4 w-4 mr-2 text-muted-foreground" />
                <Input
                  id="breakfastTime"
                  value={hotelInfo.breakfast_time}
                  onChange={(e) => handleHotelInfoChange('breakfast_time', e.target.value)}
                  className="border-primary/20 focus-visible:ring-primary/30"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wifiCode">WiFi Access Code</Label>
              <div className="flex items-center">
                <Wifi className="h-4 w-4 mr-2 text-muted-foreground" />
                <Input
                  id="wifiCode"
                  value={hotelInfo.wifi_code}
                  onChange={(e) => handleHotelInfoChange('wifi_code', e.target.value)}
                  className="border-primary/20 focus-visible:ring-primary/30"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="poolHours">Swimming Pool Hours</Label>
              <div className="flex items-center">
                <Waves className="h-4 w-4 mr-2 text-muted-foreground" />
                <Input
                  id="poolHours"
                  value={hotelInfo.pool_hours}
                  onChange={(e) => handleHotelInfoChange('pool_hours', e.target.value)}
                  className="border-primary/20 focus-visible:ring-primary/30"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Currency Conversion Rates</CardTitle>
          <CardDescription>
            Set the conversion rates based on Moroccan Dirham (MAD).
            All rates should be set relative to 1 foreign currency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Rate (1 Foreign Currency =)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Object.keys(rates) as Array<Currency>).map((currency) => (
                <TableRow key={currency}>
                  <TableCell className="font-medium">{currency}</TableCell>
                  <TableCell>
                    <div className="flex items-center max-w-[180px]">
                      <span className="mr-2">1 {currency} =</span>
                      <Input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={displayRates[currency] || ''}
                        onChange={(e) => handleRateChange(currency, e.target.value)}
                      />
                      <span className="ml-2">MAD</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Service Availability Hours</CardTitle>
          <CardDescription>
            Set the hours of operation for hotel services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-base font-medium">Room Service</h4>
                <p className="text-sm text-muted-foreground">Hours when room service is available</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="roomServiceEnabled" 
                    checked={serviceHours.roomService.enabled}
                    onCheckedChange={() => handleServiceToggle('roomService')}
                  />
                  <Label htmlFor="roomServiceEnabled">Enabled</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="roomService24h"
                    checked={serviceHours.roomService.is24Hours}
                    onCheckedChange={() => handle24HoursToggle('roomService')}
                    disabled={!serviceHours.roomService.enabled}
                  />
                  <Label htmlFor="roomService24h">24h/24h</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enable this for 24-hour service</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
            
            {!serviceHours.roomService.is24Hours && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomServiceStart">Start Time</Label>
                  <TimePicker
                    id="roomServiceStart"
                    value={serviceHours.roomService.startTime}
                    onChange={(val) => handleTimeChange('roomService', 'startTime', val)}
                    disabled={!serviceHours.roomService.enabled || serviceHours.roomService.is24Hours}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomServiceEnd">End Time</Label>
                  <TimePicker
                    id="roomServiceEnd"
                    value={serviceHours.roomService.endTime}
                    onChange={(val) => handleTimeChange('roomService', 'endTime', val)}
                    disabled={!serviceHours.roomService.enabled || serviceHours.roomService.is24Hours}
                  />
                </div>
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-base font-medium">Reception Service</h4>
                <p className="text-sm text-muted-foreground">Hours when reception staff is available</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="receptionEnabled" 
                    checked={serviceHours.reception.enabled}
                    onCheckedChange={() => handleServiceToggle('reception')}
                  />
                  <Label htmlFor="receptionEnabled">Enabled</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="reception24h"
                    checked={serviceHours.reception.is24Hours}
                    onCheckedChange={() => handle24HoursToggle('reception')}
                    disabled={!serviceHours.reception.enabled}
                  />
                  <Label htmlFor="reception24h">24h/24h</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enable this for 24-hour service</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
            
            {!serviceHours.reception.is24Hours && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receptionStart">Start Time</Label>
                  <TimePicker
                    id="receptionStart"
                    value={serviceHours.reception.startTime}
                    onChange={(val) => handleTimeChange('reception', 'startTime', val)}
                    disabled={!serviceHours.reception.enabled || serviceHours.reception.is24Hours}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receptionEnd">End Time</Label>
                  <TimePicker
                    id="receptionEnd"
                    value={serviceHours.reception.endTime}
                    onChange={(val) => handleTimeChange('reception', 'endTime', val)}
                    disabled={!serviceHours.reception.enabled || serviceHours.reception.is24Hours}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManager;
