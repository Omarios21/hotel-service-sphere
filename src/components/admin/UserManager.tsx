
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Plus, 
  User, 
  Key,
  Copy, 
  Trash2, 
  RefreshCw,
  QrCode,
  Mail,
  UserPlus
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';

interface GuestUser {
  id: string;
  email?: string;
  roomId: string;
  accessCode: string;
  name?: string;
  checkIn: string;
  checkOut: string;
  active: boolean;
}

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<GuestUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<GuestUser | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roomId, setRoomId] = useState('');
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  
  // Sample rooms
  const availableRooms = [
    '101', '103', '201', '204', '301', '302', '305'
  ];
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = async () => {
    setLoading(true);
    try {
      // For this demo, we're using sample data
      const sampleUsers: GuestUser[] = [
        {
          id: '1',
          email: 'john.doe@example.com',
          roomId: '102',
          accessCode: '1234-5678',
          name: 'John Doe',
          checkIn: '2023-09-15',
          checkOut: '2023-09-20',
          active: true
        },
        {
          id: '2',
          email: 'jane.smith@example.com',
          roomId: '104',
          accessCode: '5678-9012',
          name: 'Jane Smith',
          checkIn: '2023-09-16',
          checkOut: '2023-09-22',
          active: true
        },
        {
          id: '3',
          roomId: '105',
          accessCode: '9012-3456',
          name: 'Robert Johnson',
          checkIn: '2023-09-14',
          checkOut: '2023-09-18',
          active: false
        },
        {
          id: '4',
          email: 'emily.parker@example.com',
          roomId: '202',
          accessCode: '3456-7890',
          name: 'Emily Parker',
          checkIn: '2023-09-17',
          checkOut: '2023-09-25',
          active: true
        },
        {
          id: '5',
          roomId: '203',
          accessCode: '7890-1234',
          name: 'Michael Brown',
          checkIn: '2023-09-18',
          checkOut: '2023-09-21',
          active: true
        },
        {
          id: '6',
          email: 'sarah.wilson@example.com',
          roomId: '205',
          accessCode: '2345-6789',
          name: 'Sarah Wilson',
          checkIn: '2023-09-19',
          checkOut: '2023-09-24',
          active: true
        }
      ];
      
      setUsers(sampleUsers);
    } catch (error: any) {
      toast.error('Error loading users: ' + error.message, { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };
  
  const generateAccessCode = () => {
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    return `${part1}-${part2}`;
  };
  
  const handleCreateUser = () => {
    if (!roomId) {
      toast.error('Please select a room', { duration: 2000 });
      return;
    }
    
    const newAccessCode = generateAccessCode();
    
    const newUser: GuestUser = {
      id: (users.length + 1).toString(),
      name: name || undefined,
      email: email || undefined,
      roomId,
      accessCode: newAccessCode,
      checkIn,
      checkOut,
      active: true
    };
    
    setUsers([...users, newUser]);
    
    if (sendWelcomeEmail && email) {
      // Simulate sending welcome email
      toast.success(`Welcome email sent to ${email}`, { duration: 2000 });
    }
    
    toast.success(`User for Room ${roomId} created successfully with access code: ${newAccessCode}`, 
      { duration: 3000 });
    
    resetForm();
    setShowCreateDialog(false);
  };
  
  const handleDeactivateUser = (user: GuestUser) => {
    setUsers(users.map(u => 
      u.id === user.id ? { ...u, active: !u.active } : u
    ));
    
    toast.success(`User for Room ${user.roomId} ${user.active ? 'deactivated' : 'activated'}`, { duration: 2000 });
  };
  
  const handleDeleteUser = (user: GuestUser) => {
    if (!confirm(`Are you sure you want to delete the user for Room ${user.roomId}?`)) return;
    
    setUsers(users.filter(u => u.id !== user.id));
    toast.success(`User for Room ${user.roomId} deleted successfully`, { duration: 2000 });
  };
  
  const handleRegenerateCode = (user: GuestUser) => {
    const newCode = generateAccessCode();
    
    setUsers(users.map(u => 
      u.id === user.id ? { ...u, accessCode: newCode } : u
    ));
    
    toast.success(`New access code generated for Room ${user.roomId}: ${newCode}`, { duration: 2000 });
  };
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Access code copied to clipboard', { duration: 2000 });
  };
  
  const handleShowQR = (user: GuestUser) => {
    setSelectedUser(user);
    setShowQRDialog(true);
  };
  
  const resetForm = () => {
    setName('');
    setEmail('');
    setRoomId('');
    setCheckIn(new Date().toISOString().split('T')[0]);
    setCheckOut(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setSendWelcomeEmail(true);
  };
  
  const sendAccessCodeByEmail = (user: GuestUser) => {
    if (!user.email) {
      toast.error('No email address available for this user', { duration: 2000 });
      return;
    }
    
    // Simulate sending email
    toast.success(`Access code sent to ${user.email}`, { duration: 2000 });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        
        <Button onClick={() => setShowCreateDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Guest
        </Button>
      </div>
      
      <Tabs defaultValue="active">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Guests</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Guests</TabsTrigger>
          <TabsTrigger value="all">All Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <UserTable 
            users={users.filter(user => user.active)} 
            loading={loading}
            onDeactivate={handleDeactivateUser}
            onDelete={handleDeleteUser}
            onRegenerateCode={handleRegenerateCode}
            onCopyCode={handleCopyCode}
            onShowQR={handleShowQR}
            onSendEmail={sendAccessCodeByEmail}
          />
        </TabsContent>
        
        <TabsContent value="inactive">
          <UserTable 
            users={users.filter(user => !user.active)} 
            loading={loading}
            onDeactivate={handleDeactivateUser}
            onDelete={handleDeleteUser}
            onRegenerateCode={handleRegenerateCode}
            onCopyCode={handleCopyCode}
            onShowQR={handleShowQR}
            onSendEmail={sendAccessCodeByEmail}
          />
        </TabsContent>
        
        <TabsContent value="all">
          <UserTable 
            users={users} 
            loading={loading}
            onDeactivate={handleDeactivateUser}
            onDelete={handleDeleteUser}
            onRegenerateCode={handleRegenerateCode}
            onCopyCode={handleCopyCode}
            onShowQR={handleShowQR}
            onSendEmail={sendAccessCodeByEmail}
          />
        </TabsContent>
      </Tabs>
      
      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Guest</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Guest Name (Optional)</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guest@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="room">Room Number</Label>
                <select
                  id="room"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                >
                  <option value="">Select a room</option>
                  {availableRooms.map(room => (
                    <option key={room} value={room}>Room {room}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="check-in">Check-in Date</Label>
                  <Input
                    id="check-in"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="check-out">Check-out Date</Label>
                  <Input
                    id="check-out"
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="welcome-email" className="cursor-pointer">
                  Send welcome email with access code
                </Label>
                <Switch 
                  id="welcome-email"
                  checked={sendWelcomeEmail} 
                  onCheckedChange={setSendWelcomeEmail}
                  disabled={!email}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>
              Create Guest Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Access QR Code - Room {selectedUser?.roomId}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 flex flex-col items-center">
            <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center mb-4">
              {selectedUser && (
                <div className="text-center">
                  <QrCode className="h-32 w-32 mx-auto mb-2" />
                  <p className="font-medium">{selectedUser.accessCode}</p>
                </div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground text-center mb-4">
              Scan this QR code to log in to the hotel app. This code is unique to Room {selectedUser?.roomId}.
            </p>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowQRDialog(false)}>
                Close
              </Button>
              <Button onClick={() => window.print()}>
                Print QR Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface UserTableProps {
  users: GuestUser[];
  loading: boolean;
  onDeactivate: (user: GuestUser) => void;
  onDelete: (user: GuestUser) => void;
  onRegenerateCode: (user: GuestUser) => void;
  onCopyCode: (code: string) => void;
  onShowQR: (user: GuestUser) => void;
  onSendEmail: (user: GuestUser) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  onDeactivate,
  onDelete,
  onRegenerateCode,
  onCopyCode,
  onShowQR,
  onSendEmail
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin-slow h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No users found in this category.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {users.map(user => (
        <Card key={user.id} className={`overflow-hidden ${!user.active ? 'opacity-70' : ''}`}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-medium">
                    {user.name || `Guest (Room ${user.roomId})`}
                  </h4>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                  <span className="text-sm text-muted-foreground">
                    Room {user.roomId}
                  </span>
                  
                  {user.email && (
                    <span className="text-sm text-muted-foreground">
                      {user.email}
                    </span>
                  )}
                  
                  <span className="text-sm text-muted-foreground">
                    {user.checkIn} to {user.checkOut}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <div className="bg-muted text-sm px-3 py-1 rounded-lg flex items-center">
                    <Key className="h-3 w-3 mr-1" />
                    <span>{user.accessCode}</span>
                  </div>
                  
                  <Button 
                    size="sm"
                    variant="ghost" 
                    onClick={() => onCopyCode(user.accessCode)}
                    title="Copy code"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-end">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => onShowQR(user)}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
                
                {user.email && (
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => onSendEmail(user)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Code
                  </Button>
                )}
                
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => onRegenerateCode(user)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Code
                </Button>
                
                <Button 
                  size="sm"
                  variant={user.active ? 'outline' : 'default'}
                  onClick={() => onDeactivate(user)}
                >
                  {user.active ? 'Deactivate' : 'Activate'}
                </Button>
                
                <Button 
                  size="sm"
                  variant="outline"
                  className="border-red-200 hover:bg-red-50 hover:text-red-600"
                  onClick={() => onDelete(user)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserManager;
