
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWalletTransactions, WalletTransaction } from '@/hooks/useWalletTransactions';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, DollarSign, History, LogOut } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Receptionist: React.FC = () => {
  const [roomId, setRoomId] = useState<string>('');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const { transactions, fetchTransactions } = useWalletTransactions();
  const [roomTransactions, setRoomTransactions] = useState<WalletTransaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const navigate = useNavigate();

  // Filter transactions when roomId changes
  useEffect(() => {
    if (roomId) {
      const filtered = transactions.filter(tx => tx.roomId === roomId);
      setRoomTransactions(filtered);
      
      // Calculate total balance (sum of all transactions)
      const total = filtered.reduce((sum, tx) => {
        if (tx.status === 'completed') {
          if (tx.type === 'payment' || tx.type === 'access') {
            return sum - tx.amount;
          } else if (tx.type === 'topup') {
            return sum + tx.amount;
          }
        }
        return sum;
      }, 0);
      
      setTotalBalance(total);
    } else {
      setRoomTransactions([]);
      setTotalBalance(0);
    }
  }, [roomId, transactions]);

  // Load transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleClearBalance = async () => {
    if (!roomId) {
      toast.error('Please select a room first');
      return;
    }

    try {
      // In a real implementation, this would use the actual user ID
      // For demo, we'll use a fixed ID
      const receptionistId = '00000000-0000-0000-0000-000000000000';
      
      // Record the clearing in our transaction_clearing table
      // This would be a real Supabase call in production
      /*
      const { error } = await supabase
        .from('transaction_clearing')
        .insert({
          room_id: roomId,
          cleared_by: receptionistId,
          cleared_amount: totalBalance,
          notes: notes
        });
      
      if (error) throw error;
      */
      
      // For demo, we'll just update the local state
      setRoomTransactions([]);
      setTotalBalance(0);
      
      toast.success(`Balance cleared for Room ${roomId}`);
      setClearDialogOpen(false);
      setNotes('');
    } catch (error) {
      console.error('Error clearing balance:', error);
      toast.error('Failed to clear balance');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-2xl font-bold">Hotel Receptionist Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="grid gap-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="room-id">Room Number</Label>
              <Input
                id="room-id"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room number"
              />
            </div>
            <Button 
              onClick={() => setClearDialogOpen(true)}
              disabled={!roomId || totalBalance === 0}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Clear Balance
            </Button>
          </div>

          {roomId ? (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <span>Room {roomId} Balance</span>
                    <Badge variant={totalBalance >= 0 ? "outline" : "destructive"} className="text-lg">
                      ${Math.abs(totalBalance).toFixed(2)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  {roomTransactions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roomTransactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell>
                              {format(new Date(tx.date), 'MMM dd, yyyy HH:mm')}
                            </TableCell>
                            <TableCell>{tx.description}</TableCell>
                            <TableCell>{tx.location}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {tx.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={tx.status === 'completed' ? 'default' : 
                                         tx.status === 'pending' ? 'outline' : 'destructive'}
                              >
                                {tx.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {tx.type === 'topup' ? '+' : '-'}${tx.amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">
                      No transactions found for this room.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Room Selected</h3>
                <p className="text-muted-foreground">Enter a room number to view its transactions and balance.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Balance for Room {roomId}</DialogTitle>
            <DialogDescription>
              This will mark all transactions as cleared. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between">
              <span>Total amount to clear:</span>
              <span className="font-bold">${Math.abs(totalBalance).toFixed(2)}</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this balance clearing"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleClearBalance}>
              Clear Balance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Receptionist;
