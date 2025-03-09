
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, CreditCard, Clock, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  location: string;
  status: 'completed' | 'pending' | 'failed';
}

const WalletPage: React.FC = () => {
  const roomId = localStorage.getItem('roomId') || '101';
  const [balance, setBalance] = useState(500); // Example balance in $
  const [showTopUp, setShowTopUp] = useState(false);
  const { formatPrice, t } = useLanguage();
  
  // Sample transactions data
  const transactions: Transaction[] = [
    {
      id: 't1',
      date: '2023-11-15T19:30:00',
      amount: 45.50,
      location: 'Hotel Restaurant',
      status: 'completed'
    },
    {
      id: 't2',
      date: '2023-11-14T14:20:00',
      amount: 12.00,
      location: 'Pool Bar',
      status: 'completed'
    },
    {
      id: 't3',
      date: '2023-11-13T10:45:00',
      amount: 35.00,
      location: 'Spa',
      status: 'completed'
    },
    {
      id: 't4',
      date: '2023-11-12T21:15:00',
      amount: 28.75,
      location: 'Hotel Bar',
      status: 'completed'
    }
  ];
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };
  
  const handleTopUp = (amount: number) => {
    setBalance(prevBalance => prevBalance + amount);
    setShowTopUp(false);
    toast.success(`Successfully added ${formatPrice(amount)} to your wallet`);
  };
  
  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  
  return (
    <Layout>
      <div className="py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold tracking-tight text-primary">My Wallet</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Manage your payments and view transaction history
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground p-6">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">Room {roomId}</CardTitle>
                  <CardDescription className="text-primary-foreground/80 mt-1">
                    Balance: {formatPrice(balance)}
                  </CardDescription>
                </div>
                <Wallet className="h-12 w-12 opacity-80" />
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="border-4 border-primary p-3 rounded-xl mb-4 bg-white">
                {/* QR Code - using a placeholder that would be generated with actual wallet ID */}
                <svg 
                  className="h-64 w-64" 
                  viewBox="0 0 200 200" 
                  style={{ background: 'white' }}
                >
                  {/* Simple QR code styling for demo purposes */}
                  <rect x="40" y="40" width="120" height="120" fill="none" stroke="black" strokeWidth="4" />
                  <g fill="black">
                    {/* QR positioning patterns */}
                    <rect x="50" y="50" width="20" height="20" />
                    <rect x="130" y="50" width="20" height="20" />
                    <rect x="50" y="130" width="20" height="20" />
                    
                    {/* QR data pattern - simplified for illustration */}
                    <rect x="80" y="50" width="10" height="10" />
                    <rect x="100" y="50" width="10" height="10" />
                    <rect x="50" y="80" width="10" height="10" />
                    <rect x="70" y="80" width="10" height="10" />
                    <rect x="90" y="80" width="10" height="10" />
                    <rect x="130" y="80" width="10" height="10" />
                    <rect x="60" y="90" width="10" height="10" />
                    <rect x="100" y="90" width="10" height="10" />
                    <rect x="120" y="90" width="10" height="10" />
                    <rect x="50" y="100" width="10" height="10" />
                    <rect x="70" y="100" width="10" height="10" />
                    <rect x="90" y="100" width="10" height="10" />
                    <rect x="110" y="100" width="10" height="10" />
                    <rect x="130" y="100" width="10" height="10" />
                    <rect x="60" y="110" width="10" height="10" />
                    <rect x="80" y="110" width="10" height="10" />
                    <rect x="120" y="110" width="10" height="10" />
                    <rect x="70" y="120" width="10" height="10" />
                    <rect x="90" y="120" width="10" height="10" />
                    <rect x="110" y="120" width="10" height="10" />
                    <rect x="80" y="130" width="10" height="10" />
                    <rect x="100" y="130" width="10" height="10" />
                    <rect x="130" y="130" width="10" height="10" />
                  </g>
                </svg>
                <p className="text-center mt-2 font-medium">Room {roomId} Payment QR</p>
              </div>
              
              <div className="flex gap-4 w-full">
                <Button 
                  className="flex-1"
                  onClick={() => setShowTopUp(true)}
                  variant="outline"
                >
                  Top Up
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => toast.info('Please contact reception for assistance')}
                >
                  Need Help
                </Button>
              </div>
              
              {showTopUp && (
                <div className="mt-6 w-full border border-border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Add funds to your wallet</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[50, 100, 200, 500].map(amount => (
                      <Button 
                        key={amount} 
                        variant="outline" 
                        className="py-6"
                        onClick={() => handleTopUp(amount)}
                      >
                        {formatPrice(amount)}
                      </Button>
                    ))}
                  </div>
                  <Button 
                    className="w-full mt-3" 
                    variant="ghost"
                    onClick={() => setShowTopUp(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map(transaction => (
                <Card key={transaction.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full mt-1">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.location}</p>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatDate(transaction.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(transaction.amount)}</p>
                        <span className={`text-xs font-medium mt-1 px-2 py-1 rounded-full inline-block ${getStatusColor(transaction.status)}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-center">No transactions yet</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default WalletPage;
