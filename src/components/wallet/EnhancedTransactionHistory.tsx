
import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionFilters } from "./TransactionFilters";
import { TransactionSummary } from "./TransactionSummary";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";

interface EnhancedTransactionHistoryProps {
  profileId: string;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  transaction_type: string;
  transaction_status: string;
  category: string;
  created_at: string;
  metadata?: any;
}

export function EnhancedTransactionHistory({ profileId }: EnhancedTransactionHistoryProps) {
  const [filters, setFilters] = useState({
    category: 'all',
    transactionType: 'all',
    status: 'all',
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    searchQuery: ''
  });

  const { data: walletData } = useQuery({
    queryKey: ['wallet', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('id')
        .eq('profile_id', profileId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profileId
  });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', walletData?.id, filters],
    queryFn: async () => {
      if (!walletData?.id) return [];

      let query = supabase
        .from('token_transactions')
        .select('*')
        .eq('wallet_id', walletData.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters.transactionType !== 'all') {
        query = query.eq('transaction_type', filters.transactionType);
      }
      if (filters.status !== 'all') {
        query = query.eq('transaction_status', filters.status);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }
      if (filters.searchQuery) {
        query = query.ilike('description', `%${filters.searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!walletData?.id
  });

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      transactionType: 'all',
      status: 'all',
      dateFrom: null,
      dateTo: null,
      searchQuery: ''
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowUpCircle className="h-4 w-4 text-green-600" />;
      case 'debit':
        return <ArrowDownCircle className="h-4 w-4 text-red-600" />;
      case 'refund':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <ArrowUpCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!walletData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">Loading wallet information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <TransactionSummary 
        walletId={walletData.id}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
      />
      
      <TransactionFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearFilters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found with the current filters.
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id}>
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.transaction_type)}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')}</span>
                          <Badge variant="outline" className="text-xs">
                            {transaction.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        transaction.transaction_type === 'credit' ? 'text-green-600' : 
                        transaction.transaction_type === 'debit' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {transaction.transaction_type === 'credit' ? '+' : 
                         transaction.transaction_type === 'debit' ? '-' : ''}
                        {transaction.amount} tokens
                      </div>
                      <Badge className={`text-xs ${getStatusColor(transaction.transaction_status)}`}>
                        {transaction.transaction_status}
                      </Badge>
                    </div>
                  </div>
                  <Separator className="last:hidden" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
