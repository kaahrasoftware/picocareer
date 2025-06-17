
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionFilters } from "./TransactionFilters";
import { TransactionSummary } from "./TransactionSummary";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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

  const [retryCount, setRetryCount] = useState(0);
  const queryClient = useQueryClient();

  const { data: walletData, isLoading: walletLoading, error: walletError, refetch: refetchWallet } = useQuery({
    queryKey: ['wallet', profileId],
    queryFn: async () => {
      console.log('🔍 Fetching wallet for profile:', profileId);
      
      if (!profileId) {
        throw new Error('Profile ID is required');
      }

      try {
        // First, try to get existing wallet
        console.log('📋 Checking for existing wallet...');
        const { data: existingWallet, error: fetchError } = await supabase
          .from('wallets')
          .select('id, balance')
          .eq('profile_id', profileId)
          .maybeSingle();

        if (fetchError) {
          console.error('❌ Error fetching wallet:', fetchError);
          throw new Error(`Failed to fetch wallet: ${fetchError.message}`);
        }

        if (existingWallet) {
          console.log('✅ Found existing wallet:', existingWallet);
          return existingWallet;
        }

        // If no wallet exists, create one
        console.log('🔨 No wallet found, creating new wallet...');
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({
            profile_id: profileId,
            balance: 0
          })
          .select('id, balance')
          .single();

        if (createError) {
          console.error('❌ Error creating wallet:', createError);
          throw new Error(`Failed to create wallet: ${createError.message}`);
        }

        console.log('✅ Created new wallet:', newWallet);
        toast.success('Wallet created successfully!');
        return newWallet;

      } catch (error: any) {
        console.error('💥 Wallet operation failed:', error);
        throw error;
      }
    },
    enabled: !!profileId,
    retry: (failureCount, error) => {
      console.log(`🔄 Retry attempt ${failureCount} for wallet fetch:`, error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data: transactions = [], isLoading: transactionsLoading, error: transactionsError, refetch: refetchTransactions } = useQuery({
    queryKey: ['transactions', walletData?.id, filters],
    queryFn: async () => {
      if (!walletData?.id) {
        console.log('⚠️ No wallet ID available for transactions query');
        return [];
      }

      console.log('📊 Fetching transactions for wallet:', walletData.id);

      try {
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
        
        if (error) {
          console.error('❌ Error fetching transactions:', error);
          throw new Error(`Failed to fetch transactions: ${error.message}`);
        }

        console.log('✅ Fetched transactions:', data?.length || 0);
        return data as Transaction[];

      } catch (error: any) {
        console.error('💥 Transaction fetch failed:', error);
        throw error;
      }
    },
    enabled: !!walletData?.id,
    retry: 2,
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

  const handleRetry = () => {
    console.log('🔄 Manual retry triggered');
    setRetryCount(prev => prev + 1);
    refetchWallet();
    if (walletData?.id) {
      refetchTransactions();
    }
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

  // Show loading state
  const isLoading = walletLoading || transactionsLoading;
  
  // Show error state with retry option
  if (walletError || transactionsError) {
    const errorMessage = walletError?.message || transactionsError?.message || 'Unknown error occurred';
    
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
          <div className="text-center">
            <p className="text-red-600 mb-2 font-medium">Error loading wallet data</p>
            <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <p className="text-muted-foreground">Loading wallet information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show wallet not found state (this should rarely happen now)
  if (!walletData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
          <AlertCircle className="h-8 w-8 text-yellow-600" />
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Unable to load wallet. This might be a temporary issue.
            </p>
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading
            </Button>
          </div>
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
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Loading transactions...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>No transactions found.</p>
                  <p className="text-sm">Your transaction history will appear here once you start using tokens.</p>
                </div>
              )}
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
