
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, ArrowUpDown, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface EnhancedTransactionHistoryProps {
  walletId: string;
}

type TransactionType = 'credit' | 'debit' | 'refund';
type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled';
type TransactionCategory = 'content' | 'session' | 'refund' | 'purchase' | 'adjustment' | 'bonus';

interface Transaction {
  id: string;
  transaction_type: TransactionType;
  amount: number;
  description: string;
  transaction_status: TransactionStatus;
  category: TransactionCategory;
  created_at: string;
  metadata?: any;
}

export function EnhancedTransactionHistory({ walletId }: EnhancedTransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['wallet-transactions', walletId, typeFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('token_transactions')
        .select('*')
        .eq('wallet_id', walletId)
        .order('created_at', { ascending: sortOrder === 'asc' });

      if (typeFilter !== 'all') {
        query = query.eq('transaction_type', typeFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('transaction_status', statusFilter as TransactionStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!walletId
  });

  const filteredTransactions = transactions?.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'credit':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'debit':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'refund':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <ArrowUpDown className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return variants[status] || variants.completed;
  };

  const getCategoryBadge = (category: TransactionCategory) => {
    const variants = {
      content: 'bg-blue-100 text-blue-800',
      session: 'bg-purple-100 text-purple-800',
      refund: 'bg-orange-100 text-orange-800',
      purchase: 'bg-green-100 text-green-800',
      adjustment: 'bg-gray-100 text-gray-800',
      bonus: 'bg-pink-100 text-pink-800'
    };
    return variants[category] || variants.content;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="credit">Credits</SelectItem>
              <SelectItem value="debit">Debits</SelectItem>
              <SelectItem value="refund">Refunds</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
          </Button>
        </div>

        {/* Transaction List */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getTransactionIcon(transaction.transaction_type)}
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(transaction.created_at), 'PPp')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <Badge className={getCategoryBadge(transaction.category)}>
                      {transaction.category}
                    </Badge>
                    <Badge className={getStatusBadge(transaction.transaction_status)}>
                      {transaction.transaction_status}
                    </Badge>
                  </div>
                  <div className={`font-semibold ${
                    transaction.transaction_type === 'credit' ? 'text-green-600' : 
                    transaction.transaction_type === 'refund' ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {transaction.transaction_type === 'credit' || transaction.transaction_type === 'refund' ? '+' : '-'}
                    {transaction.amount} tokens
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
