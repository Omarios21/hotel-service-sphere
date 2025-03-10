
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  LogOut,
  Trash2,
  FileText,
  Filter,
  X,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useWalletTransactions } from '@/hooks/useWalletTransactions';

interface Transaction {
  id: string;
  roomId: string;
  guest_name: string;
  amount: number;
  description: string;
  date: string;
  type: string;
  location: string;
  status: string;
  waiter_name: string;
}

const Receptionist: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { formatPrice } = useLanguage();
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [roomId, setRoomId] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearingNotes, setClearingNotes] = useState('');
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterWaiter, setFilterWaiter] = useState<string>('all');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterGuest, setFilterGuest] = useState('');
  const [uniqueWaiters, setUniqueWaiters] = useState<string[]>([]);
  const [uniqueRooms, setUniqueRooms] = useState<string[]>([]);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };
  
  const handleSearchRoom = () => {
    if (!roomSearchQuery.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a room number',
        variant: 'destructive',
      });
      return;
    }
    
    setRoomId(roomSearchQuery);
    // Filter existing transactions for this room
    const roomTransactions = allTransactions.filter(tx => tx.roomId === roomSearchQuery);
    setTransactions(roomTransactions);
  };
  
  const fetchAllTransactions = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedTransactions = data.map(tx => ({
          id: tx.id,
          roomId: tx.room_id,
          guest_name: tx.guest_name || '',
          amount: tx.amount,
          description: tx.description || '',
          date: tx.date,
          type: tx.type,
          location: tx.location,
          status: tx.status,
          waiter_name: tx.waiter_name || ''
        }));
        
        setAllTransactions(formattedTransactions);
        
        // Extract unique waiters and rooms for filtering
        const waiters = [...new Set(formattedTransactions.map(tx => tx.waiter_name).filter(Boolean))];
        const rooms = [...new Set(formattedTransactions.map(tx => tx.roomId))];
        
        setUniqueWaiters(waiters);
        setUniqueRooms(rooms);
        
        // If a room is already selected, filter for that room
        if (roomId) {
          const roomTransactions = formattedTransactions.filter(tx => tx.roomId === roomId);
          setTransactions(roomTransactions);
        } else {
          setTransactions(formattedTransactions);
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Dynamic search function that triggers on input change
  const handleDynamicSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setRoomSearchQuery(searchValue);
    
    if (searchValue.trim()) {
      // Search for matching rooms, guests, and waiters
      const searchResults = allTransactions.filter(tx => 
        tx.roomId.toLowerCase().includes(searchValue.toLowerCase()) ||
        (tx.guest_name && tx.guest_name.toLowerCase().includes(searchValue.toLowerCase())) ||
        (tx.waiter_name && tx.waiter_name.toLowerCase().includes(searchValue.toLowerCase())) ||
        (tx.description && tx.description.toLowerCase().includes(searchValue.toLowerCase())) ||
        tx.location.toLowerCase().includes(searchValue.toLowerCase())
      );
      
      setTransactions(searchResults);
    } else {
      // If search is cleared, reset to all transactions
      setTransactions(allTransactions);
      setRoomId('');
    }
  };
  
  useEffect(() => {
    fetchAllTransactions();
    
    // Set up a polling interval to refresh data every 30 seconds
    const interval = setInterval(fetchAllTransactions, 30000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [roomId]);
  
  const calculateTotalAmount = () => {
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  };
  
  const handleClearBalance = async () => {
    setLoading(true);
    
    try {
      const totalAmount = calculateTotalAmount();
      
      // In a real implementation, this would call Supabase to record the clearing
      // and update the transaction statuses
      
      // Mock user ID for the receptionist
      const receptionistUserId = '00000000-0000-0000-0000-000000000000';
      
      const clearingRecord = {
        id: Math.random().toString(36).substring(2, 9),
        roomId,
        clearedBy: receptionistUserId,
        clearedAmount: totalAmount,
        clearedAt: new Date().toISOString(),
        notes: clearingNotes || 'Balance cleared at checkout'
      };
      
      // For demo purposes, just log the clearing record
      console.log('Balance cleared:', clearingRecord);
      
      toast({
        title: 'Balance Cleared',
        description: `Successfully cleared ${formatPrice(totalAmount)} for Room ${roomId}`,
      });
      
      // Reset the state
      setTransactions([]);
      setRoomId('');
      setRoomSearchQuery('');
      setClearingNotes('');
      setShowClearDialog(false);
    } catch (error) {
      console.error('Error clearing balance:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear room balance',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const handleUpdateStatus = async (transactionId: string, newStatus: 'paid' | 'cancelled') => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', transactionId);
      
      if (error) throw error;
      
      // Update the local state
      setAllTransactions(prev => 
        prev.map(tx => tx.id === transactionId ? { ...tx, status: newStatus } : tx)
      );
      
      setTransactions(prev => 
        prev.map(tx => tx.id === transactionId ? { ...tx, status: newStatus } : tx)
      );
      
      toast({
        title: 'Status Updated',
        description: `Transaction status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating transaction status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update transaction status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters to all transactions
  const applyFilters = () => {
    let filtered = [...allTransactions];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tx => tx.status === filterStatus);
    }
    
    // Apply waiter filter
    if (filterWaiter !== 'all') {
      filtered = filtered.filter(tx => tx.waiter_name === filterWaiter);
    }
    
    // Apply room filter
    if (filterRoom !== 'all') {
      filtered = filtered.filter(tx => tx.roomId === filterRoom);
    }
    
    // Apply guest name filter
    if (filterGuest.trim()) {
      filtered = filtered.filter(tx => 
        tx.guest_name.toLowerCase().includes(filterGuest.toLowerCase())
      );
    }
    
    // Update transactions with filtered results
    setTransactions(filtered);
    
    // If it's a room filter, also update the roomId state
    if (filterRoom !== 'all') {
      setRoomId(filterRoom);
      setRoomSearchQuery(filterRoom);
    } else if (roomId) {
      // If clearing the room filter but there was a room set
      setRoomId('');
      setRoomSearchQuery('');
    }
    
    setShowFilterDialog(false);
  };
  
  const resetFilters = () => {
    setFilterStatus('all');
    setFilterWaiter('all');
    setFilterRoom('all');
    setFilterGuest('');
    setRoomId('');
    setRoomSearchQuery('');
    setTransactions(allTransactions);
    setShowFilterDialog(false);
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-lg font-semibold">Receptionist Panel</h1>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>
      
      <main className="container py-6">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transaction Management</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setShowFilterDialog(true)} variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search room, guest, waiter..."
                    value={roomSearchQuery}
                    onChange={handleDynamicSearch}
                    className="min-w-[250px]"
                  />
                </div>
                <Button onClick={handleSearchRoom}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Room
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : transactions.length > 0 ? (
              <>
                {roomId && (
                  <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Room {roomId}</h2>
                    <Button 
                      onClick={() => setShowClearDialog(true)}
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Clear Balance ({formatPrice(calculateTotalAmount())})
                    </Button>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Waiter</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-sm">
                            {formatDate(transaction.date)}
                          </TableCell>
                          <TableCell className="font-medium">{transaction.roomId}</TableCell>
                          <TableCell>{transaction.guest_name || '-'}</TableCell>
                          <TableCell>{transaction.description || '-'}</TableCell>
                          <TableCell>{transaction.location}</TableCell>
                          <TableCell>{transaction.waiter_name || '-'}</TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(transaction.status)}`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {transaction.status === 'pending' && (
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleUpdateStatus(transaction.id, 'paid')}
                                  title="Mark as Paid"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleUpdateStatus(transaction.id, 'cancelled')}
                                  title="Cancel Transaction"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={6} className="text-right font-medium">
                          Total:
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          {formatPrice(calculateTotalAmount())}
                        </TableCell>
                        <TableCell colSpan={2}></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    {roomId 
                      ? `No transactions found for Room ${roomId}.` 
                      : 'No transactions match your filters or search criteria.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </main>
      
      {/* Clear Balance Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Room Balance</DialogTitle>
            <DialogDescription>
              This will clear all transactions for Room {roomId} with a total amount of {formatPrice(calculateTotalAmount())}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Payment method, checkout notes, etc."
                value={clearingNotes}
                onChange={(e) => setClearingNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleClearBalance} disabled={loading}>
              Clear Balance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Filters Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Transactions</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="waiter">Waiter</Label>
              <Select value={filterWaiter} onValueChange={setFilterWaiter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select waiter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Waiters</SelectItem>
                  {uniqueWaiters.map(waiter => (
                    <SelectItem key={waiter} value={waiter}>{waiter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="room">Room</Label>
              <Select value={filterRoom} onValueChange={setFilterRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  {uniqueRooms.map(room => (
                    <SelectItem key={room} value={room}>Room {room}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="guest">Guest Name</Label>
              <Input
                id="guest"
                placeholder="Search by guest name"
                value={filterGuest}
                onChange={(e) => setFilterGuest(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Receptionist;
