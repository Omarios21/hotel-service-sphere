
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  LogOut, 
  CreditCard, 
  MapPin, 
  User, 
  Trash2,
  X,
  Search,
  Clipboard
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import QRScanner from '@/components/QRScanner';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface RoomAccount {
  id: string;
  room_id: string;
  guest_name: string;
  is_active: boolean;
}

interface Transaction {
  id: string;
  roomId: string;
  guest_name: string;
  amount: number;
  description: string;
  location: string;
  timestamp: string;
  status: 'pending' | 'paid' | 'cancelled' | 'approved';
  waiter_name: string;
}

interface TransactionLog {
  id: string;
  transaction_id: string;
  changed_by_name: string;
  previous_status: string;
  new_status: string;
  changed_at: string;
}

const Waiter: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { formatPrice } = useLanguage();
  
  // State variables
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showManualSelection, setShowManualSelection] = useState(false);
  const [activeRooms, setActiveRooms] = useState<RoomAccount[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedGuest, setSelectedGuest] = useState<string>('');
  const [waiterName, setWaiterName] = useState<string>(localStorage.getItem('waiterName') || '');
  const [showWaiterNamePrompt, setShowWaiterNamePrompt] = useState<boolean>(!localStorage.getItem('waiterName'));
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [transactionToCancel, setTransactionToCancel] = useState<string | null>(null);
  const [showTransactionLogs, setShowTransactionLogs] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<string>('');
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);
  
  // Fetch data when component mounts
  useEffect(() => {
    fetchCategories();
    fetchRecentTransactions();
    fetchActiveRooms();
  }, []);

  // Fetch location categories from Supabase
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('transaction_categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      if (data) {
        setCategories(data);
        if (data.length > 0 && !selectedCategory) {
          setSelectedCategory(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load location categories',
        variant: 'destructive',
      });
    }
  };

  // Fetch active room accounts from Supabase
  const fetchActiveRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('room_accounts')
        .select('*')
        .eq('is_active', true)
        .order('room_id');
        
      if (error) throw error;
      
      if (data) {
        setActiveRooms(data);
      }
    } catch (error) {
      console.error('Error fetching active rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load active rooms',
        variant: 'destructive',
      });
    }
  };

  // Fetch recent transactions from Supabase
  const fetchRecentTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          room_id,
          guest_name,
          amount,
          description,
          location,
          date,
          status,
          waiter_name
        `)
        .order('date', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      if (data) {
        const formattedTransactions = data.map(tx => ({
          id: tx.id,
          roomId: tx.room_id,
          guest_name: tx.guest_name || '',
          amount: tx.amount,
          description: tx.description || '',
          location: tx.location,
          timestamp: tx.date,
          status: tx.status as 'pending' | 'paid' | 'cancelled' | 'approved',
          waiter_name: tx.waiter_name || ''
        }));
        
        setRecentTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recent transactions',
        variant: 'destructive',
      });
    }
  };
  
  const fetchTransactionLogs = async (transactionId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transaction_logs')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('changed_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setTransactionLogs(data as TransactionLog[]);
        setCurrentTransactionId(transactionId);
        setShowTransactionLogs(true);
      }
    } catch (error) {
      console.error('Error fetching transaction logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transaction history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle QR scan success
  const handleScanSuccess = (roomId: string) => {
    setShowScanner(false);
    
    if (!selectedCategory) {
      toast({
        title: 'Location required',
        description: 'Please select a location first',
        variant: 'destructive',
      });
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount greater than zero',
        variant: 'destructive',
      });
      return;
    }

    // Find guest name from active rooms
    const room = activeRooms.find(r => r.room_id === roomId);
    const guestName = room ? room.guest_name : '';
    
    processPayment(roomId, guestName);
  };

  // Process the payment/transaction
  const processPayment = async (roomId: string, guestName: string) => {
    if (!selectedCategory) {
      toast({
        title: 'Location required',
        description: 'Please select a location first',
        variant: 'destructive',
      });
      return;
    }
    
    if (!waiterName) {
      setShowWaiterNamePrompt(true);
      return;
    }
    
    setLoading(true);
    
    try {
      // Get category name
      const category = categories.find(c => c.id === selectedCategory);
      if (!category) throw new Error('Selected category not found');
      
      // Insert transaction to Supabase
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          room_id: roomId,
          guest_name: guestName,
          amount: parseFloat(amount),
          description: description || 'Payment',
          category_id: selectedCategory,
          location: category.name,
          status: 'pending',
          waiter_id: null, // Would be set if we had waiter authentication
          waiter_name: waiterName,
          type: 'payment'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log the transaction creation
      if (data) {
        const { error: logError } = await supabase
          .from('transaction_logs')
          .insert({
            transaction_id: data.id,
            changed_by_name: waiterName,
            previous_status: 'created',
            new_status: 'pending'
          });
          
        if (logError) console.error('Error logging transaction creation:', logError);
      }
      
      toast({
        title: 'Transaction created',
        description: `Successfully charged ${formatPrice(parseFloat(amount))} to Room ${roomId}`,
      });
      
      // Reset the form
      setAmount('');
      setDescription('');
      
      // Refresh transactions list
      fetchRecentTransactions();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Transaction failed',
        description: 'There was an error processing the transaction',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle manual room selection
  const handleManualPayment = () => {
    if (!selectedRoom) {
      toast({
        title: 'Room selection required',
        description: 'Please select a room',
        variant: 'destructive',
      });
      return;
    }
    
    const room = activeRooms.find(r => r.id === selectedRoom);
    if (!room) {
      toast({
        title: 'Invalid room',
        description: 'Please select a valid room',
        variant: 'destructive',
      });
      return;
    }
    
    processPayment(room.room_id, room.guest_name);
    setShowManualSelection(false);
  };

  // Save waiter name
  const saveWaiterName = () => {
    if (!waiterName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }
    
    localStorage.setItem('waiterName', waiterName);
    setShowWaiterNamePrompt(false);
  };

  // Cancel a transaction
  const handleCancelTransaction = async () => {
    if (!transactionToCancel) return;
    
    setLoading(true);
    try {
      // Get the current status for logging
      const transaction = recentTransactions.find(tx => tx.id === transactionToCancel);
      if (!transaction) {
        toast({
          title: 'Error',
          description: 'Transaction not found',
          variant: 'destructive',
        });
        return;
      }
      
      const previousStatus = transaction.status;
      
      // Update transaction status
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: 'cancelled' })
        .eq('id', transactionToCancel);
      
      if (updateError) throw updateError;
      
      // Log the status change
      const { error: logError } = await supabase
        .from('transaction_logs')
        .insert({
          transaction_id: transactionToCancel,
          changed_by_name: waiterName,
          previous_status: previousStatus,
          new_status: 'cancelled'
        });
      
      if (logError) throw logError;
      
      toast({
        title: 'Transaction cancelled',
        description: 'The transaction has been cancelled successfully',
      });
      
      // Refresh transactions list
      fetchRecentTransactions();
      setIsConfirmCancelOpen(false);
      setTransactionToCancel(null);
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel transaction',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-lg font-semibold">Waiter Panel</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground mr-2">
              {waiterName ? `Logged in as: ${waiterName}` : ''}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container py-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Charge Guest</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 border rounded-l-md bg-muted">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="rounded-l-none"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Drinks, Food, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    className="w-full" 
                    onClick={() => setShowScanner(true)}
                    disabled={loading || !selectedCategory}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Scan QR Code
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowManualSelection(true)}
                    disabled={loading || !selectedCategory}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Select Room
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Room</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="font-medium">{transaction.roomId}</div>
                            <div className="text-xs text-muted-foreground">
                              {transaction.description}
                            </div>
                          </TableCell>
                          <TableCell>{formatPrice(transaction.amount)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(transaction.status)}`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 px-2 text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                                onClick={() => fetchTransactionLogs(transaction.id)}
                                title="View History"
                              >
                                <Clipboard className="h-4 w-4" />
                              </Button>
                              
                              {transaction.status === 'pending' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setTransactionToCancel(transaction.id);
                                    setIsConfirmCancelOpen(true);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No recent transactions
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* QR Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Room QR Code</DialogTitle>
          </DialogHeader>
          <div className="aspect-square overflow-hidden rounded-md">
            <QRScanner onScan={handleScanSuccess} />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Manual Room Selection Dialog */}
      <Dialog open={showManualSelection} onOpenChange={setShowManualSelection}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Room</DialogTitle>
            <DialogDescription>
              Choose a room to charge the transaction to
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="room">Room & Guest</Label>
              <Select 
                value={selectedRoom} 
                onValueChange={setSelectedRoom}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {activeRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.room_id} - {room.guest_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualSelection(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualPayment} disabled={loading || !selectedRoom}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Waiter Name Dialog */}
      <Dialog open={showWaiterNamePrompt} onOpenChange={setShowWaiterNamePrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Your Name</DialogTitle>
            <DialogDescription>
              Please enter your name for transaction tracking
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Your name"
              value={waiterName}
              onChange={(e) => setWaiterName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={saveWaiterName} disabled={!waiterName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cancel Confirmation Dialog */}
      <Dialog open={isConfirmCancelOpen} onOpenChange={setIsConfirmCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmCancelOpen(false)}>
              No, Keep It
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelTransaction}
              disabled={loading}
            >
              Yes, Cancel It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Transaction Logs Dialog */}
      <Dialog open={showTransactionLogs} onOpenChange={setShowTransactionLogs}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
            <DialogDescription>
              View the status change history for this transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {transactionLogs.length > 0 ? (
              <div className="overflow-y-auto max-h-96">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Date & Time</th>
                      <th className="text-left py-2 px-4">Changed By</th>
                      <th className="text-left py-2 px-4">From Status</th>
                      <th className="text-left py-2 px-4">To Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionLogs.map(log => (
                      <tr key={log.id} className="border-b hover:bg-slate-50">
                        <td className="py-2 px-4 text-sm">
                          {formatDate(log.changed_at)}
                        </td>
                        <td className="py-2 px-4">{log.changed_by_name}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(log.previous_status)}`}>
                            {log.previous_status === 'created' 
                              ? 'Created' 
                              : log.previous_status.charAt(0).toUpperCase() + log.previous_status.slice(1)}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(log.new_status)}`}>
                            {log.new_status.charAt(0).toUpperCase() + log.new_status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No transaction history found.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTransactionLogs(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Waiter;
