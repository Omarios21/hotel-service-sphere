
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Plus, 
  Send, 
  Bell, 
  Settings, 
  Users, 
  Calendar,
  CheckSquare
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
  type: 'welcome' | 'booking' | 'service' | 'promotion' | 'announcement';
}

const NotificationsManager: React.FC = () => {
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('announcement');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [welcomeEnabled, setWelcomeEnabled] = useState(true);
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const [roomServiceEnabled, setRoomServiceEnabled] = useState(true);
  const [promotionsEnabled, setPromotionsEnabled] = useState(true);
  
  // Sample notification templates
  const templates: NotificationTemplate[] = [
    {
      id: '1',
      title: 'Welcome to our Hotel',
      message: 'We hope you enjoy your stay! Use the app to discover all our services.',
      type: 'welcome'
    },
    {
      id: '2',
      title: 'Your Spa Booking Confirmation',
      message: 'Your spa appointment has been confirmed for {date} at {time}.',
      type: 'booking'
    },
    {
      id: '3',
      title: 'Room Service Update',
      message: 'Your room service order is on its way! Estimated arrival: {time}.',
      type: 'service'
    },
    {
      id: '4',
      title: 'Special Offer',
      message: 'Enjoy 20% off on all spa treatments this weekend!',
      type: 'promotion'
    }
  ];
  
  // Sample rooms
  const rooms = [
    { id: '101', occupied: true },
    { id: '102', occupied: true },
    { id: '103', occupied: false },
    { id: '104', occupied: true },
    { id: '105', occupied: true },
    { id: '201', occupied: false },
    { id: '202', occupied: true },
    { id: '203', occupied: true },
    { id: '204', occupied: false },
    { id: '205', occupied: true },
  ];
  
  const occupiedRooms = rooms.filter(room => room.occupied);
  
  const handleRoomSelection = (roomId: string) => {
    if (selectedRooms.includes(roomId)) {
      setSelectedRooms(selectedRooms.filter(id => id !== roomId));
    } else {
      setSelectedRooms([...selectedRooms, roomId]);
    }
  };
  
  const handleSelectAllRooms = () => {
    if (selectedRooms.length === occupiedRooms.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(occupiedRooms.map(room => room.id));
    }
  };
  
  const loadTemplate = (template: NotificationTemplate) => {
    setNotificationTitle(template.title);
    setNotificationMessage(template.message);
    setNotificationType(template.type);
  };
  
  const handleSendNotification = () => {
    if (!notificationTitle || !notificationMessage) {
      toast.error('Please provide both title and message for the notification', { duration: 2000 });
      return;
    }
    
    if (selectedRooms.length === 0) {
      toast.error('Please select at least one room to send the notification to', { duration: 2000 });
      return;
    }
    
    setIsSending(true);
    
    // Simulate sending notification
    setTimeout(() => {
      toast.success(`Notification sent to ${selectedRooms.length} room(s)`, { duration: 2000 });
      setIsSending(false);
      setNotificationTitle('');
      setNotificationMessage('');
      setSelectedRooms([]);
    }, 1500);
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Notifications</h2>
      
      <Tabs defaultValue="send">
        <TabsList className="mb-6">
          <TabsTrigger value="send">Send Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="send">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notification-title">Notification Title</Label>
                      <Input 
                        id="notification-title"
                        value={notificationTitle}
                        onChange={(e) => setNotificationTitle(e.target.value)}
                        placeholder="Enter notification title"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notification-message">Message</Label>
                      <Textarea 
                        id="notification-message"
                        value={notificationMessage}
                        onChange={(e) => setNotificationMessage(e.target.value)}
                        placeholder="Enter notification message"
                        rows={5}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notification-type">Notification Type</Label>
                      <select 
                        id="notification-type"
                        value={notificationType}
                        onChange={(e) => setNotificationType(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md"
                      >
                        <option value="welcome">Welcome</option>
                        <option value="booking">Booking</option>
                        <option value="service">Service</option>
                        <option value="promotion">Promotion</option>
                        <option value="announcement">Announcement</option>
                      </select>
                    </div>
                    
                    <div className="pt-2">
                      <Button
                        onClick={handleSendNotification}
                        disabled={isSending}
                        className="w-full"
                      >
                        {isSending ? (
                          <>Sending...</>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Notification
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Select Recipients</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      {selectedRooms.length} of {occupiedRooms.length} rooms selected
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllRooms}
                    >
                      {selectedRooms.length === occupiedRooms.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {occupiedRooms.map(room => (
                        <div 
                          key={room.id}
                          onClick={() => handleRoomSelection(room.id)}
                          className={`cursor-pointer border rounded-lg p-3 text-center transition-colors ${
                            selectedRooms.includes(room.id)
                              ? 'bg-primary/10 border-primary'
                              : 'bg-background border-border hover:bg-muted/50'
                          }`}
                        >
                          Room {room.id}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id} className="cursor-pointer hover:border-primary" onClick={() => loadTemplate(template)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{template.title}</h3>
                    <span className="bg-muted text-xs px-2 py-1 rounded-full">
                      {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{template.message}</p>
                  <Button size="sm" variant="outline" className="w-full">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            <Card className="border-dashed border-muted cursor-pointer hover:border-primary">
              <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[160px]">
                <Plus className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">Create New Template</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Bell className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Welcome Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Send automated welcome messages to guests upon check-in
                      </p>
                    </div>
                  </div>
                  <Switch checked={welcomeEnabled} onCheckedChange={setWelcomeEnabled} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Booking Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Send reminders about upcoming spa and activity bookings
                      </p>
                    </div>
                  </div>
                  <Switch checked={bookingEnabled} onCheckedChange={setBookingEnabled} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <CheckSquare className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Room Service Updates</h4>
                      <p className="text-sm text-muted-foreground">
                        Send status updates for room service orders
                      </p>
                    </div>
                  </div>
                  <Switch checked={roomServiceEnabled} onCheckedChange={setRoomServiceEnabled} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Settings className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Promotional Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Send special offers and promotions to guests
                      </p>
                    </div>
                  </div>
                  <Switch checked={promotionsEnabled} onCheckedChange={setPromotionsEnabled} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsManager;
