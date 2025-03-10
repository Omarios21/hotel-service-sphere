
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, CreditCard, Clock, Calendar, AlertCircle, Filter, QrCode, History } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWalletTransactions, WalletTransaction } from '@/hooks/useWalletTransactions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

const WalletPage: React.FC = () => {
  const roomId = localStorage.getItem('roomId') || '101';
  const [balance, setBalance] = useState(500); // Example balance in $
  const [showTopUp, setShowTopUp] = useState(false);
  const [showPaymentQR, setShowPaymentQR] = useState(false);
  const [showAccessQR, setShowAccessQR] = useState(false);
  const [selectedQRService, setSelectedQRService] = useState('');
  const { formatPrice, t } = useLanguage();
  const { transactions, loading, fetchTransactions, addTransaction } = useWalletTransactions();
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const handleTopUp = async (amount: number) => {
    try {
      await addTransaction({
        amount,
        location: 'Reception',
        status: 'completed',
        type: 'topup',
        description: 'Wallet top-up',
        roomId
      });
      
      setBalance(prevBalance => prevBalance + amount);
      setShowTopUp(false);
    } catch (error) {
      console.error('Error processing top-up:', error);
    }
  };
  
  const handleShowAccessQR = (service: string) => {
    setSelectedQRService(service);
    setShowAccessQR(true);
    setShowPaymentQR(false);
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };
  
  const getStatusColor = (status: WalletTransaction['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getTypeIcon = (type: WalletTransaction['type']) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'topup':
        return <Wallet className="h-4 w-4 text-green-500" />;
      case 'access':
        return <Clock className="h-4 w-4 text-purple-500" />;
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
            <CardContent className="p-6">
              <Tabs defaultValue="qr-code">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="qr-code" className="flex-1">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </TabsTrigger>
                  <TabsTrigger value="services" className="flex-1">
                    <Clock className="h-4 w-4 mr-2" />
                    Services
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="qr-code">
                  <div className="flex flex-col items-center">
                    {!showPaymentQR && !showAccessQR ? (
                      <div className="flex flex-col items-center mb-6">
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
                        
                        <div className="flex flex-col gap-2 w-full">
                          <Button 
                            variant="secondary"
                            onClick={() => {
                              setShowPaymentQR(true);
                              setShowAccessQR(false);
                            }}
                          >
                            Generate Payment QR
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setShowAccessQR(true);
                              setShowPaymentQR(false);
                            }}
                          >
                            Generate Access QR
                          </Button>
                        </div>
                      </div>
                    ) : showPaymentQR ? (
                      <div className="flex flex-col items-center mb-6">
                        <div className="border-4 border-blue-500 p-3 rounded-xl mb-4 bg-white">
                          {/* Payment QR Code */}
                          <svg 
                            className="h-64 w-64" 
                            viewBox="0 0 200 200" 
                            style={{ background: 'white' }}
                          >
                            {/* QR code for payment - different pattern */}
                            <rect x="40" y="40" width="120" height="120" fill="none" stroke="#3b82f6" strokeWidth="4" />
                            <g fill="#3b82f6">
                              <rect x="50" y="50" width="20" height="20" />
                              <rect x="130" y="50" width="20" height="20" />
                              <rect x="50" y="130" width="20" height="20" />
                              
                              {/* Different pattern for payment */}
                              <rect x="80" y="50" width="10" height="10" />
                              <rect x="100" y="60" width="10" height="10" />
                              <rect x="60" y="70" width="10" height="10" />
                              <rect x="90" y="70" width="10" height="10" />
                              <rect x="120" y="70" width="10" height="10" />
                              <rect x="50" y="80" width="10" height="10" />
                              <rect x="70" y="80" width="10" height="10" />
                              <rect x="110" y="80" width="10" height="10" />
                              <rect x="130" y="80" width="10" height="10" />
                              <rect x="90" y="90" width="10" height="10" />
                              <rect x="60" y="100" width="10" height="10" />
                              <rect x="100" y="100" width="10" height="10" />
                              <rect x="120" y="100" width="10" height="10" />
                              <rect x="70" y="110" width="10" height="10" />
                              <rect x="110" y="110" width="10" height="10" />
                              <rect x="80" y="120" width="10" height="10" />
                              <rect x="100" y="120" width="10" height="10" />
                              <rect x="130" y="120" width="10" height="10" />
                              <rect x="90" y="130" width="10" height="10" />
                            </g>
                          </svg>
                          <p className="text-center mt-2 font-medium text-blue-500">Room {roomId} Payment QR (expires in 5 min)</p>
                        </div>
                        <Button 
                          onClick={() => {
                            setShowPaymentQR(false);
                            setShowAccessQR(false);
                          }}
                        >
                          Back to Default QR
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center mb-6">
                        <div className="border-4 border-purple-500 p-3 rounded-xl mb-4 bg-white">
                          {/* Access QR Code */}
                          <svg 
                            className="h-64 w-64" 
                            viewBox="0 0 200 200" 
                            style={{ background: 'white' }}
                          >
                            {/* QR code for access - different pattern */}
                            <rect x="40" y="40" width="120" height="120" fill="none" stroke="#8b5cf6" strokeWidth="4" />
                            <g fill="#8b5cf6">
                              <rect x="50" y="50" width="20" height="20" />
                              <rect x="130" y="50" width="20" height="20" />
                              <rect x="50" y="130" width="20" height="20" />
                              
                              {/* Different pattern for access */}
                              <rect x="80" y="50" width="10" height="10" />
                              <rect x="100" y="50" width="10" height="10" />
                              <rect x="70" y="60" width="10" height="10" />
                              <rect x="110" y="60" width="10" height="10" />
                              <rect x="80" y="70" width="10" height="10" />
                              <rect x="100" y="70" width="10" height="10" />
                              <rect x="120" y="70" width="10" height="10" />
                              <rect x="50" y="80" width="10" height="10" />
                              <rect x="90" y="80" width="10" height="10" />
                              <rect x="130" y="90" width="10" height="10" />
                              <rect x="60" y="100" width="10" height="10" />
                              <rect x="80" y="100" width="10" height="10" />
                              <rect x="100" y="100" width="10" height="10" />
                              <rect x="70" y="110" width="10" height="10" />
                              <rect x="110" y="110" width="10" height="10" />
                              <rect x="90" y="120" width="10" height="10" />
                              <rect x="130" y="130" width="10" height="10" />
                            </g>
                          </svg>
                          <p className="text-center mt-2 font-medium text-purple-500">
                            {selectedQRService ? `${selectedQRService} Access QR` : `Room ${roomId} Access QR`} (expires in 5 min)
                          </p>
                        </div>
                        <Button 
                          onClick={() => {
                            setShowAccessQR(false);
                            setSelectedQRService('');
                          }}
                        >
                          Back to Default QR
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="services">
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleShowAccessQR('Breakfast')}>
                      <CardContent className="flex flex-col items-center justify-center p-4">
                        <div className="bg-amber-100 p-3 rounded-full mb-2">
                          <Calendar className="h-6 w-6 text-amber-600" />
                        </div>
                        <h3 className="font-medium text-center">Breakfast Access</h3>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleShowAccessQR('Gym')}>
                      <CardContent className="flex flex-col items-center justify-center p-4">
                        <div className="bg-green-100 p-3 rounded-full mb-2">
                          <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-medium text-center">Gym Access</h3>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleShowAccessQR('Pool')}>
                      <CardContent className="flex flex-col items-center justify-center p-4">
                        <div className="bg-blue-100 p-3 rounded-full mb-2">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-medium text-center">Pool Access</h3>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleShowAccessQR('Spa')}>
                      <CardContent className="flex flex-col items-center justify-center p-4">
                        <div className="bg-purple-100 p-3 rounded-full mb-2">
                          <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-medium text-center">Spa Access</h3>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex gap-4 mt-4">
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Transactions</h2>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <History className="h-4 w-4" />
              <span>All History</span>
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map(transaction => (
                <Card key={transaction.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full mt-1">
                          {getTypeIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span>{transaction.location}</span>
                            <span>•</span>
                            <span>{formatDate(transaction.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {transaction.type === 'topup' ? '+' : ''}{transaction.amount > 0 ? formatPrice(transaction.amount) : '-'}
                        </p>
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
