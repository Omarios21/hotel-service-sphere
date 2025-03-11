
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Search, ArrowDownUp, Clock, CheckCircle2, XCircle, Check, Clipboard, Lock, Unlock, Calendar, DollarSign, User, FileText, Filter, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { motion } from 'framer-motion';

interface Transaction {
  id: string;
  room_id: string;
  guest_name: string | null;
  amount: number;
  description: string | null;
  location: string;
  date: string;
  status: 'pending' | 'paid' | 'cancelled';
  admin_status: 'open' | 'closed';
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
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { formatPrice } = useLanguage();
  const { theme } = useTheme();
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [adminName, setAdminName] = useState<string>(localStorage.getItem('adminName') || 'Admin');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'paid' | 'cancelled' | ''>('');
  const [isAdminStatusDialogOpen, setIsAdminStatusDialogOpen] = useState(false);
  const [bulkAdminStatus, setBulkAdminStatus] = useState<'open' | 'closed'>('open');
  const [showTransactionLogs, setShowTransactionLogs] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<string>('');
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    fetchTransactions();
    
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
    
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        tx.room_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.waiter_name && tx.waiter_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.guest_name && tx.guest_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }
    
    if (adminStatusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.admin_status === adminStatusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }
    
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, statusFilter, adminStatusFilter, typeFilter, sortOrder]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'failed': 
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  const getAdminStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'closed': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
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

  const handleStatusFilterChange = (value: string) => {
    if (value === 'pending' || value === 'paid' || value === 'cancelled' || value === 'all') {
      setStatusFilter(value);
    }
  };

  const handleAdminStatusFilterChange = (value: string) => {
    if (value === 'open' || value === 'closed' || value === 'all') {
      setAdminStatusFilter(value);
    }
  };

  const handleBulkActionChange = (value: string) => {
    if (value === 'paid' || value === 'cancelled') {
      setBulkAction(value as 'paid' | 'cancelled' | '');
    }
  };

  const handleBulkAdminStatusChange = (value: string) => {
    if (value === 'open' || value === 'closed') {
      setBulkAdminStatus(value as 'open' | 'closed');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'paid' | 'cancelled') => {
    try {
      if (!adminName) {
        setShowNamePrompt(true);
        return;
      }
      
      const transaction = transactions.find(tx => tx.id === id);
      if (!transaction) {
        toast.error('Transaction not found');
        return;
      }
      
      const previousStatus = transaction.status;
      
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      const { error: logError } = await supabase
        .from('transaction_logs')
        .insert({
          transaction_id: id,
          changed_by_name: adminName,
          previous_status: previousStatus,
          new_status: newStatus
        });
      
      if (logError) throw logError;
      
      setTransactions(prev => 
        prev.map(tx => tx.id === id ? { ...tx, status: newStatus } : tx)
      );
      
      toast.success(`Transaction status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating transaction status:', error);
      toast.error('Failed to update transaction status');
    }
  };

  const handleUpdateAdminStatus = async (id: string, newAdminStatus: 'open' | 'closed') => {
    try {
      if (!adminName) {
        setShowNamePrompt(true);
        return;
      }
      
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ admin_status: newAdminStatus })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      setTransactions(prev => 
        prev.map(tx => tx.id === id ? { ...tx, admin_status: newAdminStatus } : tx)
      );
      
      toast.success(`Transaction admin status updated to ${newAdminStatus}`);
    } catch (error) {
      console.error('Error updating transaction admin status:', error);
      toast.error('Failed to update transaction admin status');
    }
  };
  
  const handleBulkStatusUpdate = async () => {
    if (!bulkAction || selectedTransactions.length === 0) {
      toast.error('Please select transactions and an action to perform');
      return;
    }
    
    if (!adminName) {
      setShowNamePrompt(true);
      return;
    }
    
    setLoading(true);
    
    try {
      for (const txId of selectedTransactions) {
        const transaction = transactions.find(tx => tx.id === txId);
        if (!transaction) continue;
        
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
            changed_by_name: adminName,
            previous_status: previousStatus,
            new_status: bulkAction
          });
        
        if (logError) throw logError;
      }
      
      setTransactions(prev => 
        prev.map(tx => selectedTransactions.includes(tx.id) ? { ...tx, status: bulkAction } : tx)
      );
      
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

  const handleBulkAdminStatusUpdate = async () => {
    if (!bulkAdminStatus || selectedTransactions.length === 0) {
      toast.error('Please select transactions and an action to perform');
      return;
    }
    
    if (!adminName) {
      setShowNamePrompt(true);
      return;
    }
    
    setLoading(true);
    
    try {
      for (const txId of selectedTransactions) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ admin_status: bulkAdminStatus })
          .eq('id', txId);
        
        if (updateError) throw updateError;
      }
      
      setTransactions(prev => 
        prev.map(tx => selectedTransactions.includes(tx.id) ? { ...tx, admin_status: bulkAdminStatus } : tx)
      );
      
      setSelectedTransactions([]);
      setBulkAdminStatus('open');
      setIsAdminStatusDialogOpen(false);
      
      toast.success(`Updated admin status to ${bulkAdminStatus} for ${selectedTransactions.length} transactions`);
    } catch (error) {
      console.error('Error updating transaction admin status:', error);
      toast.error('Failed to update transaction admin status');
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
  
  const totalTransactions = filteredTransactions.length;
  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const pendingTransactions = filteredTransactions.filter(tx => tx.status === 'pending').length;
  const cancelledTransactions = filteredTransactions.filter(tx => tx.status === 'cancelled').length;
  
  const statusData = [
    { name: 'Pending', value: filteredTransactions.filter(tx => tx.status === 'pending').length },
    { name: 'Paid', value: filteredTransactions.filter(tx => tx.status === 'paid').length },
    { name: 'Cancelled', value: filteredTransactions.filter(tx => tx.status === 'cancelled').length },
  ];

  const adminStatusData = [
    { name: 'Open', value: filteredTransactions.filter(tx => tx.admin_status === 'open').length },
    { name: 'Closed', value: filteredTransactions.filter(tx => tx.admin_status === 'closed').length },
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden border-none shadow-md dark:bg-slate-900/60 dark:backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
            <div>
              <CardTitle className="text-2xl">Transaction Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and monitor all transactions
              </p>
            </div>
            {selectedTransactions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm font-medium">{selectedTransactions.length} selected</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsDialogOpen(true);
                  }}
                  className="border-primary/20 hover:border-primary/40"
                >
                  <Check size={16} className="mr-1" />
                  Update Status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAdminStatusDialogOpen(true);
                  }}
                  className="border-primary/20 hover:border-primary/40"
                >
                  <Lock size={16} className="mr-1" />
                  Update Admin Status
                </Button>
              </motion.div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="list" className="w-full">
              <div className="px-6 pt-2 border-b">
                <TabsList className="mb-2 w-full justify-start h-10 p-1 bg-secondary/30">
                  <TabsTrigger value="list" className="flex gap-2 data-[state=active]:bg-background">
                    <FileText size={16} />
                    Transaction List
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex gap-2 data-[state=active]:bg-background">
                    <BarChart size={16} />
                    Analytics
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-6">
                <TabsContent value="list" className="mt-0">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                      <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search transactions..."
                          className="pl-8 border-primary/20 focus-visible:ring-primary/30"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="border-primary/20 hover:border-primary/40"
                      >
                        <Filter size={16} className="mr-1" />
                        Filters
                        <ChevronDown size={14} className={`ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                      </Button>
                    </div>
                    
                    {showFilters && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-3 pb-2"
                      >
                        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                          <SelectTrigger className="w-[130px] border-primary/20">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={adminStatusFilter} onValueChange={handleAdminStatusFilterChange}>
                          <SelectTrigger className="w-[150px] border-primary/20">
                            <SelectValue placeholder="Admin Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Admin Status</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger className="w-[130px] border-primary/20">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="payment">Payment</SelectItem>
                            <SelectItem value="topup">Top-up</SelectItem>
                            <SelectItem value="access">Access</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="outline"
                          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                          className="flex items-center gap-1 border-primary/20 hover:border-primary/40"
                        >
                          <ArrowDownUp size={16} />
                          <span className="hidden sm:inline">{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
                        </Button>
                      </motion.div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="col-span-1"
                      >
                        <Card className="bg-primary/5 border-primary/10 hover:shadow-lg transition-all">
                          <CardContent className="flex items-center justify-between pt-6">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                              <h3 className="text-2xl font-bold mt-1">{totalTransactions}</h3>
                            </div>
                            <div className="bg-primary/10 p-3 rounded-full">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="col-span-1"
                      >
                        <Card className="bg-green-500/5 border-green-500/10 hover:shadow-lg transition-all">
                          <CardContent className="flex items-center justify-between pt-6">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                              <h3 className="text-2xl font-bold mt-1">{formatPrice(totalAmount)}</h3>
                            </div>
                            <div className="bg-green-500/10 p-3 rounded-full">
                              <DollarSign className="h-5 w-5 text-green-500" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="col-span-1"
                      >
                        <Card className="bg-yellow-500/5 border-yellow-500/10 hover:shadow-lg transition-all">
                          <CardContent className="flex items-center justify-between pt-6">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Pending</p>
                              <h3 className="text-2xl font-bold mt-1">{pendingTransactions}</h3>
                            </div>
                            <div className="bg-yellow-500/10 p-3 rounded-full">
                              <Clock className="h-5 w-5 text-yellow-500" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="col-span-1"
                      >
                        <Card className="bg-blue-500/5 border-blue-500/10 hover:shadow-lg transition-all">
                          <CardContent className="flex items-center justify-between pt-6">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Unique Rooms</p>
                              <h3 className="text-2xl font-bold mt-1">
                                {new Set(filteredTransactions.map(item => item.room_id)).size}
                              </h3>
                            </div>
                            <div className="bg-blue-500/10 p-3 rounded-full">
                              <User className="h-5 w-5 text-blue-500" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                    
                    {loading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      <>
                        {filteredTransactions.length === 0 ? (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16 bg-secondary/10 rounded-lg border border-dashed"
                          >
                            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-40" />
                            <p className="text-lg font-medium text-muted-foreground">No transactions found</p>
                            <p className="text-sm text-muted-foreground/80 mt-1">Try adjusting your search or filters</p>
                          </motion.div>
                        ) : (
                          <Card className="overflow-hidden border-none shadow-md">
                            <div className="rounded-md overflow-x-auto">
                              <Table>
                                <TableHeader className="bg-muted/30">
                                  <TableRow>
                                    <TableHead className="w-10">
                                      <Checkbox 
                                        checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                                        onCheckedChange={handleSelectAll}
                                        className="rounded-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                      />
                                    </TableHead>
                                    <TableHead className="w-48">Date & Time</TableHead>
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
                                  {filteredTransactions.map((transaction, index) => (
                                    <TableRow key={transaction.id}>
                                      <TableCell className="py-3">
                                        <Checkbox 
                                          checked={selectedTransactions.includes(transaction.id)}
                                          onCheckedChange={(checked) => handleSelectTransaction(transaction.id, !!checked)}
                                          className="rounded-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center">
                                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                                          <Badge variant="outline" className="font-medium whitespace-nowrap">
                                            {format(new Date(transaction.date), 'MMM d, yyyy HH:mm')}
                                          </Badge>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="bg-secondary/20 hover:bg-secondary/30 transition-colors">
                                          Room {transaction.room_id}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center">
                                          <User className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                                          <span className="font-medium">{transaction.guest_name || '-'}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="max-w-xs truncate">
                                        {transaction.description ? (
                                          <div className="flex items-center">
                                            <FileText className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                                            <span className="truncate">{transaction.description}</span>
                                          </div>
                                        ) : '-'}
                                      </TableCell>
                                      <TableCell>
                                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                          {transaction.location}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {transaction.waiter_name ? (
                                          <Badge variant="outline" className="font-medium">
                                            {transaction.waiter_name}
                                          </Badge>
                                        ) : '-'}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center font-medium">
                                          <DollarSign className="h-4 w-4 mr-1 text-green-500 flex-shrink-0" />
                                          {formatPrice(transaction.amount)}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAdminStatusColor(transaction.admin_status)}`}>
                                          {transaction.admin_status.charAt(0).toUpperCase() + transaction.admin_status.slice(1)}
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex space-x-1">
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="h-8 px-2 text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800/60"
                                            onClick={() => fetchTransactionLogs(transaction.id)}
                                            title="View History"
                                          >
                                            <Clipboard className="h-4 w-4" />
                                          </Button>
                                          
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className={`h-8 px-2 ${
                                              transaction.admin_status === 'open' 
                                                ? 'text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800/60'
                                                : 'text-slate-400 dark:text-slate-600'
                                            }`}
                                            onClick={() => handleUpdateAdminStatus(
                                              transaction.id, 
                                              transaction.admin_status === 'open' ? 'closed' : 'open'
                                            )}
                                            disabled={transaction.admin_status === 'closed'}
                                            title={transaction.admin_status === 'open' ? 'Close Transaction' : 'Transaction Closed'}
                                          >
                                            {transaction.admin_status === 'open' ? (
                                              <Lock className="h-4 w-4" />
                                            ) : (
                                              <Unlock className="h-4 w-4" />
                                            )}
                                          </Button>
                                          
                                          {transaction.status === 'pending' && (
                                            <>
                                              <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
                                                onClick={() => handleUpdateStatus(transaction.id, 'paid')}
                                                title="Mark as Paid"
                                              >
                                                <CheckCircle2 className="h-4 w-4" />
                                              </Button>
                                              
                                              <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                                onClick={() => handleUpdateStatus(transaction.id, 'cancelled')}
                                                title="Mark as Cancelled"
                                              >
                                                <XCircle className="h-4 w-4" />
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </Card>
                        )}
                      </>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="analytics" className="mt-0">
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Transaction Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={statusData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Legend />
                                <RechartsTooltip 
                                  formatter={(value, name) => [`${value} Transactions`, `Status: ${name}`]}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Admin Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={adminStatusData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  {adminStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Legend />
                                <RechartsTooltip 
                                  formatter={(value, name) => [`${value} Transactions`, `Admin Status: ${name}`]}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="lg:col-span-2">
                        <CardHeader>
                          <CardTitle className="text-lg">Revenue by Location</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={locationData}>
                                <XAxis dataKey="name" />
                                <YAxis 
                                  tickFormatter={(value) => formatPrice(value)}
                                />
                                <RechartsTooltip 
                                  formatter={(value) => [formatPrice(value as number), 'Revenue']}
                                />
                                <Legend />
                                <Bar dataKey="value" name="Revenue" fill="#4f46e5">
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
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Admin Name Dialog */}
      <Dialog open={showNamePrompt} onOpenChange={setShowNamePrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Your Name</DialogTitle>
            <DialogDescription>
              Your name will be recorded when you make changes to transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Your name"
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button onClick={saveAdminName}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Status Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Transaction Status</DialogTitle>
            <DialogDescription>
              Change the status for {selectedTransactions.length} selected transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={bulkAction} onValueChange={handleBulkActionChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Mark as Paid</SelectItem>
                <SelectItem value="cancelled">Mark as Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkStatusUpdate} disabled={!bulkAction}>
              Update {selectedTransactions.length} transactions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Admin Status Update Dialog */}
      <Dialog open={isAdminStatusDialogOpen} onOpenChange={setIsAdminStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Admin Status</DialogTitle>
            <DialogDescription>
              Change the admin status for {selectedTransactions.length} selected transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={bulkAdminStatus} onValueChange={handleBulkAdminStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select new admin status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdminStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAdminStatusUpdate}>
              Update {selectedTransactions.length} transactions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Transaction History Dialog */}
      <Dialog open={showTransactionLogs} onOpenChange={setShowTransactionLogs}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
            <DialogDescription>
              View the history of status changes for this transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[400px] overflow-y-auto">
            {transactionLogs.length === 0 ? (
              <p className="text-center text-muted-foreground">No history available</p>
            ) : (
              <div className="space-y-4">
                {transactionLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-3 bg-secondary/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{log.changed_by_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.changed_at), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(log.previous_status)}>
                        {log.previous_status.charAt(0).toUpperCase() + log.previous_status.slice(1)}
                      </Badge>
                      <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className={getStatusColor(log.new_status)}>
                        {log.new_status.charAt(0).toUpperCase() + log.new_status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransactionLogs(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionManager;
