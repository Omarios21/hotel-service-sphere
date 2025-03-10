
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
  FileText 
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

interface Transaction {
  id: string;
  roomId: string;
  amount: number;
  description: string;
  date: string;
  type: string;
  location: string;
  status: string;
}

const Receptionist: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { formatPrice } = useLanguage();
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [roomId, setRoomId] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearingNotes, setClearingNotes] = useState('');
  
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
    fetchRoomTransactions(roomSearchQuery);
  };
  
  const fetchRoomTransactions = async (room: string) => {
    setLoading(true);
    
    try {
      // In a real implementation, this would fetch from Supabase
      // For now, we'll use mock data
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          roomId: room,
          amount: 25.50,
          description: 'Cocktail at the bar',
          date: new Date().toISOString(),
          type: 'payment',
          location: 'Hotel Bar',
          status: 'completed'
        },
        {
          id: '2',
          roomId: room,
          amount: 32.75,
          description: 'Lunch at restaurant',
          date: new Date(Date.now() - 3600000).toISOString(),
          type: 'payment',
          location: 'Hotel Restaurant',
          status: 'completed'
        },
        {
          id: '3',
          roomId: room,
          amount: 45.00,
          description: 'Spa Treatment',
          date: new Date(Date.now() - 7200000).toISOString(),
          type: 'payment',
          location: 'Hotel Spa',
          status: 'completed'
        }
      ];
      
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching room transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load room transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
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
          <CardHeader>
            <CardTitle>Find Room</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter room number"
                  value={roomSearchQuery}
                  onChange={(e) => setRoomSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchRoom()}
                />
              </div>
              <Button onClick={handleSearchRoom}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {roomId && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Room {roomId}</h2>
              
              {transactions.length > 0 && (
                <Button 
                  onClick={() => setShowClearDialog(true)}
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Clear Balance ({formatPrice(calculateTotalAmount())})
                </Button>
              )}
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{transaction.description}</h3>
                          <div className="text-sm text-muted-foreground">{transaction.location}</div>
                          <div className="text-xs text-muted-foreground flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(transaction.date)}
                          </div>
                        </div>
                        <div className="font-semibold">{formatPrice(transaction.amount)}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No transactions found for this room.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
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
    </div>
  );
};

export default Receptionist;
