
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Search, ArrowDownUp, Clock, CheckCircle2, XCircle, Check, Clipboard } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';

interface Transaction {
  id: string;
  room_id: string;
  guest_name: string | null;
  amount: number;
  description: string | null;
  location: string;
  date: string;
  status: 'pending' | 'paid' | 'cancelled' | 'approved';
  waiter_name: string | null;
  type: string;
}

interface TransactionLog {
  id: string;
  transaction_id: string;
  changed_by_name: string;
  previous_status: string;
  new_status: string;
  changed_at: string;
}

const TransactionManager: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { formatPrice } = useLanguage();
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [adminName, setAdminName] = useState<string>(localStorage.getItem('adminName') || 'Admin');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'paid' | 'cancelled' | 'approved' | ''>('');
  const [showTransactionLogs, setShowTransactionLogs] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<string>('');
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);
  
  useEffect(() => {
    fetchTransactions();
    
    // Check if admin name is set
    if (!localStorage.getItem('adminName')) {
      setShowNamePrompt(true);
    }
  }, []);
  
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setTransactions(data as Transaction[]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
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
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let filtered = [...transactions];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        tx.room_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.waiter_name && tx.waiter_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.guest_name && tx.guest_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, statusFilter, typeFilter, sortOrder]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': 
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'topup': return <ArrowDownUp className="h-4 w-4 text-green-500" />;
      case 'access': return <Clock className="h-4 w-4 text-purple-500" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'paid' | 'cancelled' | 'approved') => {
    try {
      // If admin name is not set, prompt for it
      if (!adminName) {
        setShowNamePrompt(true);
        return;
      }
      
      // Get the current status for logging
      const transaction = transactions.find(tx => tx.id === id);
      if (!transaction) {
        toast.error('Transaction not found');
        return;
      }
      
      const previousStatus = transaction.status;
      
      // Update transaction status
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Log the status change
      const { error: logError } = await supabase
        .from('transaction_logs')
        .insert({
          transaction_id: id,
          changed_by_name: adminName,
          previous_status: previousStatus,
          new_status: newStatus
        });
      
      if (logError) throw logError;
      
      // Update local state
      setTransactions(prev => 
        prev.map(tx => tx.id === id ? { ...tx, status: newStatus } : tx)
      );
      
      toast.success(`Transaction status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating transaction status:', error);
      toast.error('Failed to update transaction status');
    }
  };
  
  const handleBulkStatusUpdate = async () => {
    if (!bulkAction || selectedTransactions.length === 0) {
      toast.error('Please select transactions and an action to perform');
      return;
    }
    
    // If admin name is not set, prompt for it
    if (!adminName) {
      setShowNamePrompt(true);
      return;
    }
    
    setLoading(true);
    
    try {
      // For each selected transaction
      for (const txId of selectedTransactions) {
        // Get the current status for logging
        const transaction = transactions.find(tx => tx.id === txId);
        if (!transaction) continue;
        
        const previousStatus = transaction.status;
        
        // Update transaction status
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ status: bulkAction })
          .eq('id', txId);
        
        if (updateError) throw updateError;
        
        // Log the status change
        const { error: logError } = await supabase
          .from('transaction_logs')
          .insert({
            transaction_id: txId,
            changed_by_name: adminName,
            previous_status: previousStatus,
            new_status: bulkAction
          });
        
        if (logError) throw logError;
      }
      
      // Update local state
      setTransactions(prev => 
        prev.map(tx => selectedTransactions.includes(tx.id) ? { ...tx, status: bulkAction } : tx)
      );
      
      // Reset selections
      setSelectedTransactions([]);
      setBulkAction('');
      setIsDialogOpen(false);
      
      toast.success(`Updated ${selectedTransactions.length} transactions to ${bulkAction}`);
    } catch (error) {
      console.error('Error updating transaction status:', error);
      toast.error('Failed to update transaction status');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(filteredTransactions.map(tx => tx.id));
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
  
  const saveAdminName = () => {
    if (adminName.trim()) {
      localStorage.setItem('adminName', adminName);
      setShowNamePrompt(false);
    } else {
      toast.error('Please enter your name');
    }
  };
  
  // Calculate summary statistics
  const totalTransactions = filteredTransactions.length;
  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const pendingTransactions = filteredTransactions.filter(tx => tx.status === 'pending').length;
  const cancelledTransactions = filteredTransactions.filter(tx => tx.status === 'cancelled').length;
  
  // Prepare data for charts
  const statusData = [
    { name: 'Pending', value: filteredTransactions.filter(tx => tx.status === 'pending').length },
    { name: 'Paid', value: filteredTransactions.filter(tx => tx.status === 'paid').length },
    { name: 'Cancelled', value: filteredTransactions.filter(tx => tx.status === 'cancelled').length },
    { name: 'Approved', value: filteredTransactions.filter(tx => tx.status === 'approved').length },
  ];
  
  const locationData = filteredTransactions.reduce((acc, tx) => {
    const existingLocation = acc.find(item => item.name === tx.location);
    if (existingLocation) {
      existingLocation.value += tx.amount;
    } else {
      acc.push({ name: tx.location, value: tx.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transaction Management</CardTitle>
          {selectedTransactions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{selectedTransactions.length} selected</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDialogOpen(true);
                }}
              >
                Update Status
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list">
            <TabsList className="mb-4">
              <TabsTrigger value="list">Transaction List</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="topup">Top-up</SelectItem>
                        <SelectItem value="access">Access</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <button
                      onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="flex items-center gap-1 px-3 py-2 border rounded-md hover:bg-slate-100"
                    >
                      <ArrowDownUp className="h-4 w-4" />
                      <span className="hidden sm:inline">{sortOrder === 'asc' ? 'Oldest' : 'Newest'}</span>
                    </button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <>
                    {filteredTransactions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No transactions found matching your filters.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 w-10">
                                <Checkbox 
                                  checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                                  onCheckedChange={handleSelectAll}
                                />
                              </th>
                              <th className="text-left py-3 px-4">Date & Time</th>
                              <th className="text-left py-3 px-4">Room</th>
                              <th className="text-left py-3 px-4">Guest</th>
                              <th className="text-left py-3 px-4">Description</th>
                              <th className="text-left py-3 px-4">Location</th>
                              <th className="text-left py-3 px-4">Waiter</th>
                              <th className="text-left py-3 px-4">Amount</th>
                              <th className="text-left py-3 px-4">Status</th>
                              <th className="text-left py-3 px-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTransactions.map(transaction => (
                              <tr key={transaction.id} className="border-b hover:bg-slate-50">
                                <td className="py-3 px-4">
                                  <Checkbox 
                                    checked={selectedTransactions.includes(transaction.id)}
                                    onCheckedChange={(checked) => handleSelectTransaction(transaction.id, !!checked)}
                                  />
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  {format(new Date(transaction.date), 'MMM d, yyyy h:mm a')}
                                </td>
                                <td className="py-3 px-4 font-medium">{transaction.room_id}</td>
                                <td className="py-3 px-4">{transaction.guest_name || '-'}</td>
                                <td className="py-3 px-4">{transaction.description || '-'}</td>
                                <td className="py-3 px-4">{transaction.location}</td>
                                <td className="py-3 px-4">{transaction.waiter_name || '-'}</td>
                                <td className="py-3 px-4 font-medium">
                                  {transaction.amount > 0 ? formatPrice(transaction.amount) : '-'}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
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
                                          className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                          onClick={() => handleUpdateStatus(transaction.id, 'approved')}
                                          title="Approve Transaction"
                                        >
                                          <Check className="h-4 w-4" />
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
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="border-t bg-muted/50">
                            <tr>
                              <td colSpan={7} className="py-3 px-4 text-right font-medium">
                                Total:
                              </td>
                              <td className="py-3 px-4 font-bold text-primary">
                                {formatPrice(totalAmount)}
                              </td>
                              <td colSpan={2}></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-slate-50">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{totalTransactions}</div>
                    <p className="text-muted-foreground">Total Transactions</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-50">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{formatPrice(totalAmount)}</div>
                    <p className="text-muted-foreground">Total Amount</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-50">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{pendingTransactions}</div>
                    <p className="text-muted-foreground">Pending Transactions</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} transactions`, 'Count']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={locationData}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [formatPrice(value as number), 'Amount']} />
                          <Bar dataKey="value" fill="#4f46e5">
                            {locationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Admin Name Dialog */}
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
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={saveAdminName}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Transaction Status</DialogTitle>
            <DialogDescription>
              Change the status for {selectedTransactions.length} selected transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={bulkAction} onValueChange={(value: any) => setBulkAction(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkStatusUpdate} disabled={!bulkAction || loading}>
              {loading ? 'Processing...' : 'Update Status'}
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
                          {format(new Date(log.changed_at), 'MMM d, yyyy h:mm a')}
                        </td>
                        <td className="py-2 px-4">{log.changed_by_name}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.previous_status)}`}>
                            {log.previous_status === 'created' 
                              ? 'Created' 
                              : log.previous_status.charAt(0).toUpperCase() + log.previous_status.slice(1)}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.new_status)}`}>
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

export default TransactionManager;
