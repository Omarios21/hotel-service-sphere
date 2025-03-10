
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
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TimePicker } from "@/components/admin/TimePicker";

const SettingsManager = () => {
  // Currency rates
  const [rates, setRates] = useState<Record<Currency, number>>({...currencyRates});
  const { loadAvailableLanguages } = useLanguage();
  
  // Service availability times
  const [serviceHours, setServiceHours] = useState({
    roomService: {
      enabled: true,
      startTime: "07:00",
      endTime: "22:00"
    },
    reception: {
      enabled: true,
      startTime: "00:00",
      endTime: "23:59"
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
          
          ratesData.forEach((rate) => {
            if (rate.currency in ratesObj) {
              ratesObj[rate.currency as Currency] = rate.rate;
            }
          });
          
          setRates(ratesObj);
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
              hoursObj[service.service_type as keyof typeof hoursObj] = {
                enabled: service.enabled,
                startTime: service.start_time,
                endTime: service.end_time
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
  
  // Handle currency rate change
  const handleRateChange = (currency: Currency, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setRates(prev => ({
        ...prev,
        [currency]: numValue
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
        [field]: value
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
  
  // Save all settings
  const handleSaveSettings = async () => {
    try {
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
          
        if (error) throw error;
      }
      
      // Save service hours
      for (const service in serviceHours) {
        const { error } = await supabase
          .from('service_hours')
          .upsert(
            { 
              service_type: service, 
              enabled: serviceHours[service as keyof typeof serviceHours].enabled,
              start_time: serviceHours[service as keyof typeof serviceHours].startTime,
              end_time: serviceHours[service as keyof typeof serviceHours].endTime,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'service_type' }
          );
          
        if (error) throw error;
      }
      
      toast.success('Settings saved successfully');
      
      // Reload language context to apply new currency rates
      loadAvailableLanguages();
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (error: any) {
      console.error('Error saving settings:', error.message);
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
            All rates should be set relative to 1 MAD.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Rate (1 MAD =)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Object.keys(rates) as Array<Currency>).map((currency) => (
                <TableRow key={currency}>
                  <TableCell className="font-medium">{currency}</TableCell>
                  <TableCell>
                    <div className="flex items-center max-w-[180px]">
                      <span className="mr-2">1 MAD =</span>
                      <Input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={rates[currency as Currency] === 0 ? '' : (1 / rates[currency as Currency]).toFixed(4)}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && value > 0) {
                            handleRateChange(currency, (1 / value).toString());
                          }
                        }}
                      />
                      <span className="ml-2">{currency}</span>
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
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="roomServiceEnabled" 
                  checked={serviceHours.roomService.enabled}
                  onCheckedChange={() => handleServiceToggle('roomService')}
                />
                <Label htmlFor="roomServiceEnabled">Enabled</Label>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roomServiceStart">Start Time</Label>
                <TimePicker
                  id="roomServiceStart"
                  value={serviceHours.roomService.startTime}
                  onChange={(val) => handleTimeChange('roomService', 'startTime', val)}
                  disabled={!serviceHours.roomService.enabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomServiceEnd">End Time</Label>
                <TimePicker
                  id="roomServiceEnd"
                  value={serviceHours.roomService.endTime}
                  onChange={(val) => handleTimeChange('roomService', 'endTime', val)}
                  disabled={!serviceHours.roomService.enabled}
                />
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-base font-medium">Reception Service</h4>
                <p className="text-sm text-muted-foreground">Hours when reception staff is available</p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="receptionEnabled" 
                  checked={serviceHours.reception.enabled}
                  onCheckedChange={() => handleServiceToggle('reception')}
                />
                <Label htmlFor="receptionEnabled">Enabled</Label>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receptionStart">Start Time</Label>
                <TimePicker
                  id="receptionStart"
                  value={serviceHours.reception.startTime}
                  onChange={(val) => handleTimeChange('reception', 'startTime', val)}
                  disabled={!serviceHours.reception.enabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receptionEnd">End Time</Label>
                <TimePicker
                  id="receptionEnd"
                  value={serviceHours.reception.endTime}
                  onChange={(val) => handleTimeChange('reception', 'endTime', val)}
                  disabled={!serviceHours.reception.enabled}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManager;
