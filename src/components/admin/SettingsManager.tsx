
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
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  
  // Load currency rates and service hours from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load currency rates
        const { data: ratesData, error: ratesError } = await supabase
          .from('currency_rates')
          .select('*');
          
        if (ratesError) throw ratesError;
        
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
        }
        
        // Load service hours
        const { data: hoursData, error: hoursError } = await supabase
          .from('service_hours')
          .select('*');
          
        if (hoursError) throw hoursError;
        
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
      } catch (error: any) {
        console.error('Error loading settings:', error.message);
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
  
  // Save all settings
  const handleSaveSettings = async () => {
    try {
      console.log('Saving rates:', rates);
      
      // Save currency rates
      for (const currency in rates) {
        const { error } = await supabase
          .from('currency_rates')
          .upsert(
            { 
              currency, 
              rate: rates[currency as Currency],
              updated_at: new Date().toISOString()
            },
            { onConflict: 'currency' }
          );
          
        if (error) {
          console.error('Error saving currency rate:', error);
          throw error;
        }
      }
      
      // Save service hours
      for (const service in serviceHours) {
        const serviceData = serviceHours[service as keyof typeof serviceHours];
        const { error } = await supabase
          .from('service_hours')
          .upsert(
            { 
              service_type: service, 
              enabled: serviceData.enabled,
              start_time: serviceData.startTime,
              end_time: serviceData.endTime,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'service_type' }
          );
          
        if (error) {
          console.error('Error saving service hours:', error);
          throw error;
        }
      }
      
      toast.success('Settings saved successfully');
      
      // Reload language context to apply new currency rates
      loadAvailableLanguages();
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">System Settings</h3>
        <Button onClick={handleSaveSettings}>Save All Settings</Button>
      </div>
      
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
