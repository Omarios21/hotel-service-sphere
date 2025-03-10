
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
import { Calendar, DollarSign, User, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const { formatPrice } = useLanguage();

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

  const filteredHistory = clearingHistory.filter(item => 
    item.roomId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.clearedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const calculateTotalCleared = () => {
    return filteredHistory.reduce((sum, item) => sum + item.clearedAmount, 0);
  };

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle className="text-xl font-bold">Balance Clearing History</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search rooms, staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-[200px]"
            />
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="bg-slate-50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{filteredHistory.length}</div>
                <p className="text-muted-foreground">Total Clearings</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{formatPrice(calculateTotalCleared())}</div>
                <p className="text-muted-foreground">Total Amount Cleared</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {new Set(filteredHistory.map(item => item.clearedBy)).size}
                </div>
                <p className="text-muted-foreground">Unique Staff Members</p>
              </CardContent>
            </Card>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin-slow h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredHistory.length > 0 ? (
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
                {filteredHistory.map((item) => (
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
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        {item.clearedBy}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center font-medium">
                        <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                        {formatPrice(item.clearedAmount)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.notes ? (
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          {item.notes}
                        </div>
                      ) : (
                        '-'
                      )}
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
