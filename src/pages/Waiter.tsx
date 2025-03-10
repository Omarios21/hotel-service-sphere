
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWalletTransactions } from '@/hooks/useWalletTransactions';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Scanner, DollarSign, Check, LogOut } from 'lucide-react';
import QRScanner from '@/components/QRScanner';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

const Waiter: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('Hotel Restaurant');
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [chargeSuccessDialogOpen, setChargeSuccessDialogOpen] = useState(false);
  const { addTransaction } = useWalletTransactions();
  const navigate = useNavigate();

  // Reset scan result when closing scanner
  useEffect(() => {
    if (!showScanner) {
      setScanResult(null);
    }
  }, [showScanner]);

  // When we get a scan result, open the confirmation dialog
  useEffect(() => {
    if (scanResult) {
      setShowScanner(false);
      setConfirmDialogOpen(true);
    }
  }, [scanResult]);

  const handleScanSuccess = (result: string) => {
    // For this demo, we'll assume the QR code contains the room number
    // In a real implementation, this would likely be a token or encrypted data
    setScanResult(result);
  };

  const handleChargeGuest = async () => {
    if (!scanResult || !amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      // Parse the scan result to get the room ID
      // In a real app, you'd likely decrypt or validate the QR data
      const roomId = scanResult;

      // Add the transaction
      await addTransaction({
        roomId,
        amount: parseFloat(amount),
        location,
        status: 'completed',
        type: 'payment',
        description: description || `Charge at ${location}`,
      });

      // Show success dialog
      setConfirmDialogOpen(false);
      setChargeSuccessDialogOpen(true);
      
      // Reset form
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error('Error charging guest:', error);
      toast.error('Failed to charge guest');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleNewCharge = () => {
    setChargeSuccessDialogOpen(false);
    setAmount('');
    setDescription('');
    setScanResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-2xl font-bold">Waiter Charging System</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="grid gap-6 max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Charge Guest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location (e.g. Restaurant, Bar)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter service description"
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                onClick={() => setShowScanner(true)}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                <Scanner className="h-4 w-4 mr-2" />
                Scan Guest QR Code
              </Button>
            </CardContent>
          </Card>

          {/* QR Scanner Dialog */}
          <Dialog open={showScanner} onOpenChange={setShowScanner}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Scan Guest QR Code</DialogTitle>
                <DialogDescription>
                  Ask the guest to show their room QR code.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-center py-4">
                <div className="w-full max-w-sm aspect-square">
                  <QRScanner onScanSuccess={handleScanSuccess} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowScanner(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Confirmation Dialog */}
          <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Charge</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p>You are about to charge Room <strong>{scanResult}</strong>.</p>
                
                <div className="flex justify-between font-medium">
                  <span>Amount:</span>
                  <span>${parseFloat(amount || '0').toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span>{location}</span>
                </div>
                
                {description && (
                  <div className="flex justify-between">
                    <span>Description:</span>
                    <span>{description}</span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleChargeGuest}>
                  Confirm Charge
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Success Dialog */}
          <Dialog open={chargeSuccessDialogOpen} onOpenChange={setChargeSuccessDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Charge Successful</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="rounded-full bg-green-100 p-4 mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Payment Processed</h3>
                <p className="text-center mb-2">
                  Room <strong>{scanResult}</strong> has been charged <strong>${parseFloat(amount).toFixed(2)}</strong>.
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  The charge has been added to the guest's account.
                </p>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  className="sm:flex-1"
                  onClick={() => setChargeSuccessDialogOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  className="sm:flex-1"
                  onClick={handleNewCharge}
                >
                  New Charge
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default Waiter;
