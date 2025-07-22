
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TransactionFilters {
  search: string;
  type: string;
  category: string;
  status: string;
}

interface TransactionData {
  id: string;
  walletId: string;
  userEmail: string;
  userName: string;
  transactionType: string;
  amount: number;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  metadata: any;
}

export function useSystemTransactionHistory(filters: TransactionFilters) {
  return useQuery({
    queryKey: ['system-transaction-history', filters],
    queryFn: async (): Promise<TransactionData[]> => {
      let query = supabase
        .from('token_transactions')
        .select(`
          id,
          wallet_id,
          transaction_type,
          amount,
          description,
          category,
          transaction_status,
          created_at,
          metadata,
          wallets!inner(
            profile_id,
            profiles!inner(
              first_name,
              last_name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      // Apply filters
      if (filters.type !== 'all') {
        query = query.eq('transaction_type', filters.type);
      }

      if (filters.category !== 'all') {
        query = query.eq('category', filters.category as any);
      }

      if (filters.status !== 'all') {
        query = query.eq('transaction_status', filters.status as any);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transactions = data?.map(tx => ({
        id: tx.id,
        walletId: tx.wallet_id,
        userEmail: tx.wallets.profiles.email || '',
        userName: `${tx.wallets.profiles.first_name || ''} ${tx.wallets.profiles.last_name || ''}`.trim() || 'Unknown User',
        transactionType: tx.transaction_type,
        amount: tx.amount,
        description: tx.description,
        category: tx.category,
        status: tx.transaction_status,
        createdAt: tx.created_at,
        metadata: tx.metadata
      })) || [];

      // Apply search filter on processed data
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return transactions.filter(tx => 
          tx.userName.toLowerCase().includes(searchTerm) ||
          tx.userEmail.toLowerCase().includes(searchTerm) ||
          tx.description.toLowerCase().includes(searchTerm)
        );
      }

      return transactions;
    },
    staleTime: 30000, // 30 seconds
  });
}
