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
  XCircle,
  Clipboard,
  Check,
  AlertTriangle
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
import { Checkbox } from '@/components/ui/checkbox';

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
  admin_status: 'open' | 'closed';
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
  const [filterAdminStatus, setFilterAdminStatus] = useState<string>('all');
  const [filterWaiter, setFilterWaiter] = useState<string>('all');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterGuest, setFilterGuest] = useState('');
  const [uniqueWaiters, setUniqueWaiters] = useState<string[]>([]);
  const [uniqueRooms, setUniqueRooms] = useState<string[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'paid' | 'cancelled' | ''>();
  const [receptionistName, setReceptionistName] = useState<string>(localStorage.getItem('receptionistName') || 'Receptionist');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [showTransactionLogs, setShowTransactionLogs] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<string>('');
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };
  
  useEffect(() => {
    if (!localStorage.getItem('receptionistName')) {
      setShowNamePrompt(true);
    }
  }, []);
  
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
    const roomTransactions = allTransactions.filter(tx => tx.roomId === roomSearchQuery);
    setTransactions(roomTransactions);
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
          admin_status: tx.admin_status as 'open' | 'closed',
          waiter_name: tx.waiter_name || ''
        }));
        
        setAllTransactions(formattedTransactions);
        
        const waiters = [...new Set(formattedTransactions.map(tx => tx.waiter_name).filter(Boolean))];
        const rooms = [...new Set(formattedTransactions.map(tx => tx.roomId))];
        
        setUniqueWaiters(waiters);
        setUniqueRooms(rooms);
        
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
  
  const handleDynamicSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setRoomSearchQuery(searchValue);
    
    if (searchValue.trim()) {
      const searchResults = allTransactions.filter(tx => 
        tx.roomId.toLowerCase().includes(searchValue.toLowerCase()) ||
        (tx.guest_name && tx.guest_name.toLowerCase().includes(searchValue.toLowerCase())) ||
        (tx.waiter_name && tx.waiter_name.toLowerCase().includes(searchValue.toLowerCase())) ||
        (tx.description && tx.description.toLowerCase().includes(searchValue.toLowerCase())) ||
        tx.location.toLowerCase().includes(searchValue.toLowerCase())
      );
      
      setTransactions(searchResults);
    } else {
      setTransactions(allTransactions);
      setRoomId('');
    }
  };
  
  useEffect(() => {
    fetchAllTransactions();
    
    const interval = setInterval(fetchAllTransactions, 30000);
    
    return () => clearInterval(interval);
  }, [roomId]);
  
  const calculateTotalAmount = () => {
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  };
  
  const handleClearBalance = async () => {
    setLoading(true);
    
    try {
      const totalAmount = calculateTotalAmount();
      
      const receptionistUserId = '00000000-0000-0000-0000-000000000000';
      
      const clearingRecord = {
        id: Math.random().toString(36).substring(2, 9),
        roomId,
        clearedBy: receptionistUserId,
        clearedAmount: totalAmount,
        clearedAt: new Date().toISOString(),
        notes: clearingNotes || 'Balance cleared at checkout'
      };
      
      console.log('Balance cleared:', clearingRecord);
      
      toast({
        title: 'Balance Cleared',
        description: `Successfully cleared ${formatPrice(totalAmount)} for Room ${roomId}`,
      });
      
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
    const transaction = allTransactions.find(tx => tx.id === transactionId);
    if (!transaction) {
      toast({
        title: 'Error',
        description: 'Transaction not found',
        variant: 'destructive',
      });
      return;
    }
    
    if (transaction.admin_status === 'closed') {
      toast({
        title: 'Action Denied',
        description: 'Cannot update closed transactions',
        variant: 'destructive',
      });
      return;
    }
    
    if (!receptionistName) {
      setShowNamePrompt(true);
      return;
    }
    
    setLoading(true);
    
    try {
      const previousStatus = transaction.status;
      
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', transactionId);
      
      if (updateError) throw updateError;
      
      const { error: logError } = await supabase
        .from('transaction_logs')
        .insert({
          transaction_id: transactionId,
          changed_by_name: receptionistName,
          previous_status: previousStatus,
          new_status: newStatus
        });
      
      if (logError) throw logError;
      
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
  
  const handleBulkStatusUpdate = async () => {
    if (!bulkAction || selectedTransactions.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select transactions and an action to perform',
        variant: 'destructive',
      });
      return;
    }
    
    if (!receptionistName) {
      setShowNamePrompt(true);
      return;
    }
    
    setLoading(true);
    
    try {
      let updatedCount = 0;
      let skippedCount = 0;
      
      for (const txId of selectedTransactions) {
        const transaction = allTransactions.find(tx => tx.id === txId);
        if (!transaction) continue;
        
        if (transaction.admin_status === 'closed') {
          skippedCount++;
          continue;
        }
        
        const previousStatus = transaction.status;
        
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ status: bulkAction })
          .eq('id', txId);
        
        if (updateError) throw updateError;
        
        const { error: logError } = await supabase
          .from('transaction_logs')
          .insert({
            transaction_id: txId,
            changed_by_name: receptionistName,
            previous_status: previousStatus,
            new_status: bulkAction
          });
        
        if (logError) throw logError;
        
        updatedCount++;
      }
      
      setAllTransactions(prev => 
        prev.map(tx => {
          if (selectedTransactions.includes(tx.id) && tx.admin_status === 'open') {
            return { ...tx, status: bulkAction };
          }
          return tx;
        })
      );
      
      setTransactions(prev => 
        prev.map(tx => {
          if (selectedTransactions.includes(tx.id) && tx.admin_status === 'open') {
            return { ...tx, status: bulkAction };
          }
          return tx;
        })
      );
      
      setSelectedTransactions([]);
      setBulkAction(undefined);
      setIsBulkActionDialogOpen(false);
      
      if (skippedCount > 0) {
        toast({
          title: 'Partial Update',
          description: `Updated ${updatedCount} transactions. Skipped ${skippedCount} closed transactions.`,
        });
      } else {
        toast({
          title: 'Status Updated',
          description: `Updated ${updatedCount} transactions to ${bulkAction}`,
        });
      }
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
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(transactions.map(tx => tx.id));
    } else {
      setSelectedTransactions([]);
    }
  };
  
  const handleSelectTransaction = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions(prev => [...prev, id]);
    } else {
      setSelectedTransactions(prev => prev.filter(txId => txId !== id));
    }
  };
  
  const saveReceptionistName = () => {
    if (receptionistName.trim()) {
      localStorage.setItem('receptionistName', receptionistName);
      setShowNamePrompt(false);
    } else {
      toast({
        title: 'Error',
        description: 'Please enter your name',
        variant: 'destructive',
      });
    }
  };
  
  const applyFilters = () => {
    let filtered = [...allTransactions];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tx => tx.status === filterStatus);
    }
    
    if (filterAdminStatus !== 'all') {
      filtered = filtered.filter(tx => tx.admin_status === filterAdminStatus);
    }
    
    if (filterWaiter !== 'all') {
      filtered = filtered.filter(tx => tx.waiter_name === filterWaiter);
    }
    
    if (filterRoom !== 'all') {
      filtered = filtered.filter(tx => tx.roomId === filterRoom);
    }
    
    if (filterGuest.trim()) {
      filtered = filtered.filter(tx => 
        tx.guest_name.toLowerCase().includes(filterGuest.toLowerCase())
      );
    }
    
    setTransactions(filtered);
    
    if (filterRoom !== 'all') {
      setRoomId(filterRoom);
      setRoomSearchQuery(filterRoom);
    } else if (roomId) {
      setRoomId('');
      setRoomSearchQuery('');
    }
    
    setShowFilterDialog(false);
  };
  
  const resetFilters = () => {
    setFilterStatus('all');
    setFilterAdminStatus('all');
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

  const getAdminStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-slate-100 text-slate-800';
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
              {selectedTransactions.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{selectedTransactions.length} selected</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBulkActionDialogOpen(true)}
                  >
                    Update Status
                  </Button>
                </div>
              )}
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
                        <TableHead className="w-10">
                          <Checkbox
                            checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                            onCheckedChange={handleSelectAll}
                            className="rounded-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          />
                        </TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Waiter</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Admin Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedTransactions.includes(transaction.id)}
                              onCheckedChange={(checked) => handleSelectTransaction(transaction.id, !!checked)}
                              className="rounded-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                          </TableCell>
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
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAdminStatusBadgeClass(transaction.admin_status)}`}>
                              {transaction.admin_status.charAt(0).toUpperCase() + transaction.admin_status.slice(1)}
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
                                <>
                                  {transaction.admin_status === 'closed' ? (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="h-8 px-2 text-slate-400 cursor-not-allowed"
                                      title="Transaction is closed"
                                      disabled
                                    >
                                      <AlertTriangle className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <>
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
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={7} className="text-right font-medium">
                          Total:
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          {formatPrice(calculateTotalAmount())}
                        </TableCell>
                        <TableCell colSpan={3}></TableCell>
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
              <Label htmlFor="adminStatus">Admin Status</Label>
              <Select value={filterAdminStatus} onValueChange={setFilterAdminStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select admin status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Admin Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
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
      
      <Dialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Transaction Status</DialogTitle>
            <DialogDescription>
              Change the status for {selectedTransactions.length} selected transactions.
              <p className="mt-2 text-yellow-600">
                <AlertTriangle className="h-4 w-4 inline-block mr-1" />
                Note: Closed transactions will be skipped
              </p>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select value={bulkAction} onValueChange={(value: any) => setBulkAction(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkStatusUpdate} disabled={!bulkAction || loading}>
              {loading ? 'Processing...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showNamePrompt} onOpenChange={setShowNamePrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Your Name</DialogTitle>
            <DialogDescription>
              Please provide your name for transaction logging purposes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="Your name"
              value={receptionistName}
              onChange={(e) => setReceptionistName(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button onClick={saveReceptionistName}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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

export default Receptionist;
