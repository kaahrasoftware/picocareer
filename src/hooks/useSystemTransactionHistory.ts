
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TransactionFilters {
  search: string;
  type: string;
  category: string;
  status: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface SystemTransactionData {
  id: string;
  walletId: string;
  userEmail: string;
  userName: string;
  userType: string;
  transactionType: string;
  amount: number;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  metadata: any;
  referenceId?: string;
}

export function useSystemTransactionHistory(filters: TransactionFilters) {
  return useQuery({
    queryKey: ['system-transaction-history', filters],
    queryFn: async (): Promise<SystemTransactionData[]> => {
      // First check if current user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile || profile.user_type !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

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
          reference_id,
          wallets!inner(
            id,
            profiles!inner(
              id,
              first_name,
              last_name,
              email,
              user_type
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(1000); // Limit for performance

      // Apply filters
      if (filters.type !== 'all') {
        query = query.eq('transaction_type', filters.type as any);
      }

      if (filters.category !== 'all') {
        query = query.eq('category', filters.category as any);
      }

      if (filters.status !== 'all') {
        query = query.eq('transaction_status', filters.status as any);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data
      const transactions: SystemTransactionData[] = data?.map(tx => ({
        id: tx.id,
        walletId: tx.wallet_id,
        userEmail: tx.wallets.profiles.email || '',
        userName: `${tx.wallets.profiles.first_name || ''} ${tx.wallets.profiles.last_name || ''}`.trim(),
        userType: tx.wallets.profiles.user_type || 'mentee',
        transactionType: tx.transaction_type,
        amount: tx.amount,
        description: tx.description,
        category: tx.category,
        status: tx.transaction_status,
        createdAt: tx.created_at,
        metadata: tx.metadata,
        referenceId: tx.reference_id
      })) || [];

      // Apply search filter on processed data
      if (filters.search) {
        return transactions.filter(tx => 
          tx.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
          tx.userEmail.toLowerCase().includes(filters.search.toLowerCase()) ||
          tx.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      return transactions;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
