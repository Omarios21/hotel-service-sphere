
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign } from 'lucide-react';

interface TransactionClearing {
  id: string;
  roomId: string;
  clearedBy: string;
  clearedAmount: number;
  clearedAt: string;
  notes?: string;
}

const TransactionClearingManager: React.FC = () => {
  const [clearingHistory, setClearingHistory] = useState<TransactionClearing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClearingHistory = async () => {
      setLoading(true);
      
      try {
        // In a real implementation, this would fetch from Supabase
        // For now, we'll use mock data
        const mockHistory: TransactionClearing[] = [
          {
            id: 'cl1',
            roomId: '101',
            clearedBy: 'John Smith',
            clearedAmount: 245.50,
            clearedAt: '2023-11-10T14:30:00',
            notes: 'Guest checkout - paid by credit card'
          },
          {
            id: 'cl2',
            roomId: '203',
            clearedBy: 'Maria Johnson',
            clearedAmount: 128.75,
            clearedAt: '2023-11-09T11:15:00',
            notes: 'Guest checkout - paid by cash'
          },
          {
            id: 'cl3',
            roomId: '105',
            clearedBy: 'John Smith',
            clearedAmount: 315.20,
            clearedAt: '2023-11-08T16:45:00',
          },
          {
            id: 'cl4',
            roomId: '302',
            clearedBy: 'Maria Johnson',
            clearedAmount: 85.30,
            clearedAt: '2023-11-07T09:30:00',
            notes: 'Partial payment - remaining balance on credit'
          },
        ];
        
        setClearingHistory(mockHistory);
      } catch (error) {
        console.error('Error fetching clearing history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClearingHistory();
  }, []);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Balance Clearing History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin-slow h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : clearingHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Cleared By</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clearingHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {format(new Date(item.clearedAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Room {item.roomId}</Badge>
                    </TableCell>
                    <TableCell>{item.clearedBy}</TableCell>
                    <TableCell>
                      <div className="flex items-center font-medium">
                        <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                        {item.clearedAmount.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No clearing history found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionClearingManager;
