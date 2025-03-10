
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WalletTransaction {
  id: string;
  date: string;
  amount: number;
  location: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  type: 'payment' | 'topup' | 'access';
  description: string;
  roomId: string;
}

export const useWalletTransactions = () => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roomId = localStorage.getItem('roomId') || '101';

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would fetch from Supabase
      // For now, we'll use mock data
      const mockTransactions: WalletTransaction[] = [
        {
          id: 't1',
          date: '2023-11-15T19:30:00',
          amount: 45.50,
          location: 'Hotel Restaurant',
          status: 'completed',
          type: 'payment',
          description: 'Dinner at hotel restaurant',
          roomId: roomId
        },
        {
          id: 't2',
          date: '2023-11-14T14:20:00',
          amount: 12.00,
          location: 'Pool Bar',
          status: 'completed',
          type: 'payment',
          description: 'Drinks at pool bar',
          roomId: roomId
        },
        {
          id: 't3',
          date: '2023-11-13T10:45:00',
          amount: 35.00,
          location: 'Spa',
          status: 'completed',
          type: 'access',
          description: 'Spa access fee',
          roomId: roomId
        },
        {
          id: 't4',
          date: '2023-11-12T21:15:00',
          amount: 28.75,
          location: 'Hotel Bar',
          status: 'completed',
          type: 'payment',
          description: 'Evening drinks',
          roomId: roomId
        },
        {
          id: 't5',
          date: '2023-11-11T08:30:00',
          amount: 0,
          location: 'Breakfast Hall',
          status: 'completed',
          type: 'access',
          description: 'Breakfast access',
          roomId: roomId
        },
        {
          id: 't6',
          date: '2023-11-10T16:45:00',
          amount: 100.00,
          location: 'Reception',
          status: 'completed',
          type: 'topup',
          description: 'Wallet top-up',
          roomId: roomId
        },
        {
          id: 't7',
          date: '2023-11-10T12:30:00',
          amount: 15.25,
          location: 'Gift Shop',
          status: 'cancelled',
          type: 'payment',
          description: 'Purchase cancelled',
          roomId: roomId
        },
        // Add transactions for other rooms
        {
          id: 't8',
          date: '2023-11-15T18:20:00',
          amount: 55.25,
          location: 'Hotel Restaurant',
          status: 'completed',
          type: 'payment',
          description: 'Dinner at hotel restaurant',
          roomId: '102'
        },
        {
          id: 't9',
          date: '2023-11-14T11:30:00',
          amount: 22.50,
          location: 'Pool Bar',
          status: 'completed',
          type: 'payment',
          description: 'Drinks at pool bar',
          roomId: '102'
        },
        {
          id: 't10',
          date: '2023-11-13T09:15:00',
          amount: 150.00,
          location: 'Spa',
          status: 'completed',
          type: 'payment',
          description: 'Massage treatment',
          roomId: '103'
        }
      ];
      
      setTransactions(mockTransactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<WalletTransaction, 'id' | 'date'>) => {
    try {
      // Generate a random ID and current date
      const newTransaction: WalletTransaction = {
        ...transaction,
        id: `t${Math.floor(Math.random() * 10000)}`,
        date: new Date().toISOString(),
      };
      
      // In a real implementation, this would save to Supabase
      // For now, we'll just update the local state
      setTransactions(prev => [newTransaction, ...prev]);
      
      if (transaction.type === 'topup') {
        toast.success(`Successfully added ${transaction.amount} to your wallet`);
      } else if (transaction.type === 'payment') {
        toast.success(`Payment of ${transaction.amount} processed successfully`);
      } else {
        toast.success(`Access granted to ${transaction.location}`);
      }
      
      return newTransaction;
    } catch (err) {
      console.error('Error adding transaction:', err);
      toast.error('Transaction failed');
      throw err;
    }
  };
  
  const cancelTransaction = async (transactionId: string) => {
    try {
      // In a real implementation, this would update Supabase
      // For now, we'll just update the local state
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === transactionId 
            ? { ...tx, status: 'cancelled' } 
            : tx
        )
      );
      
      toast.success('Transaction cancelled successfully');
    } catch (err) {
      console.error('Error cancelling transaction:', err);
      toast.error('Failed to cancel transaction');
      throw err;
    }
  };

  const clearTransactionsForRoom = async (roomId: string, notes?: string) => {
    try {
      // In a real implementation, this would update Supabase
      // For now, we'll just remove the transactions from local state
      setTransactions(prev => prev.filter(tx => tx.roomId !== roomId));
      
      toast.success(`Transactions cleared for room ${roomId}`);
      return true;
    } catch (err) {
      console.error('Error clearing transactions:', err);
      toast.error('Failed to clear transactions');
      throw err;
    }
  };

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    cancelTransaction,
    clearTransactionsForRoom
  };
};
