
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { QrCode, LogOut, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import QRScanner from '@/components/QRScanner';
import { useLanguage } from '@/contexts/LanguageContext';

const Waiter: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { formatPrice } = useLanguage();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Fetch recent transactions when component mounts
  React.useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = async () => {
    try {
      // In a real implementation, this would fetch from Supabase
      // For now, we'll use mock data
      const mockTransactions = [
        {
          id: '1',
          roomId: '101',
          amount: 25.50,
          description: 'Cocktail at the bar',
          timestamp: new Date().toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          roomId: '203',
          amount: 32.75,
          description: 'Lunch at restaurant',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed'
        }
      ];
      
      setRecentTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recent transactions',
        variant: 'destructive',
      });
    }
  };

  const handleScanSuccess = (roomId: string) => {
    setShowScanner(false);
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount greater than zero',
        variant: 'destructive',
      });
      return;
    }

    processPayment(roomId);
  };

  const processPayment = async (roomId: string) => {
    setLoading(true);
    
    try {
      // In a real implementation, this would call Supabase
      // For this demo, we'll simulate a successful transaction
      
      const newTransaction = {
        id: Math.random().toString(36).substring(2, 9),
        roomId,
        amount: parseFloat(amount),
        description: description || 'Payment',
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      // Add the new transaction to the recent transactions list
      setRecentTransactions([newTransaction, ...recentTransactions]);
      
      toast({
        title: 'Payment processed',
        description: `Successfully charged ${formatPrice(parseFloat(amount))} to Room ${roomId}`,
      });
      
      // Reset the form
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Payment failed',
        description: 'There was an error processing the payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-lg font-semibold">Waiter Panel</h1>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
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
                
                <Button 
                  className="w-full" 
                  onClick={() => setShowScanner(true)}
                  disabled={loading}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan Room QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">Room {transaction.roomId}</div>
                        <div className="text-sm text-muted-foreground">{transaction.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(transaction.timestamp)}
                        </div>
                      </div>
                      <div className="font-semibold">{formatPrice(transaction.amount)}</div>
                    </div>
                  ))}
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
      
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Room QR Code</DialogTitle>
          </DialogHeader>
          <div className="aspect-square overflow-hidden rounded-md">
            <QRScanner onResult={handleScanSuccess} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Waiter;
