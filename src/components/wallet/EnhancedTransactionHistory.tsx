
import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Plus, Minus, Gift } from "lucide-react";
import { format } from "date-fns";
import { TransactionFilters } from "./TransactionFilters";
import { TransactionSummary } from "./TransactionSummary";

interface EnhancedTransactionHistoryProps {
  walletId: string;
}

export function EnhancedTransactionHistory({ walletId }: EnhancedTransactionHistoryProps) {
  const [filters, setFilters] = useState({
    category: 'all',
    transactionType: 'all',
    status: 'all',
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    searchQuery: ''
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['enhanced-transactions', walletId, filters],
    queryFn: async () => {
      let query = supabase
        .from('token_transactions')
        .select(`
          *,
          wallets!inner(profile_id)
        `)
        .eq('wallet_id', walletId)
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
      return data;
    },
    enabled: !!walletId
  });

  const getTransactionIcon = (type: string, category: string) => {
    switch (type) {
      case 'credit':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'debit':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'refund':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'adjustment':
        return <Plus className="h-4 w-4 text-yellow-600" />;
      case 'bonus':
        return <Gift className="h-4 w-4 text-purple-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary", 
      failed: "destructive",
      cancelled: "outline"
    };
    
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      purchase: "bg-green-100 text-green-800",
      session: "bg-blue-100 text-blue-800",
      content: "bg-purple-100 text-purple-800",
      refund: "bg-yellow-100 text-yellow-800",
      adjustment: "bg-gray-100 text-gray-800",
      bonus: "bg-pink-100 text-pink-800"
    };

    return (
      <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
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

  return (
    <div className="space-y-6">
      {/* Transaction Summary */}
      <TransactionSummary 
        walletId={walletId}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
      />

      {/* Filters */}
      <TransactionFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full"></div>
                      <div>
                        <div className="w-32 h-4 bg-muted rounded mb-1"></div>
                        <div className="w-24 h-3 bg-muted rounded"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-4 bg-muted rounded mb-1"></div>
                      <div className="w-12 h-3 bg-muted rounded"></div>
                    </div>
                  </div>
                ))
              ) : transactions && transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-muted p-2">
                        {getTransactionIcon(transaction.transaction_type, transaction.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">
                            {transaction.description || 
                              (transaction.transaction_type === 'credit' ? 'Tokens Added' : 'Tokens Used')}
                          </p>
                          {getCategoryBadge(transaction.category)}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')}
                          </p>
                          {getStatusBadge(transaction.transaction_status)}
                        </div>
                        {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {JSON.stringify(transaction.metadata, null, 2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        transaction.transaction_type === 'credit' || transaction.transaction_type === 'refund' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {(transaction.transaction_type === 'credit' || transaction.transaction_type === 'refund') ? '+' : '-'}
                        {transaction.amount}
                      </div>
                      {transaction.reference_id && (
                        <p className="text-xs text-muted-foreground">
                          Ref: {transaction.reference_id.slice(0, 8)}...
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No transactions found matching your criteria
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
