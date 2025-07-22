
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WalletData {
  id: string;
  profileId: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  balance: number;
  transactionCount: number;
  lastActivity: string | null;
  isActive: boolean;
}

export function useAdminWalletManagement(searchTerm: string = '') {
  return useQuery({
    queryKey: ['admin-wallet-management', searchTerm],
    queryFn: async (): Promise<WalletData[]> => {
      let query = supabase
        .from('wallets')
        .select(`
          id,
          profile_id,
          balance,
          updated_at,
          profiles!inner(
            id,
            first_name,
            last_name,
            email,
            user_type
          )
        `);

      // Apply search filter if provided
      if (searchTerm) {
        query = query.or(
          `profiles.first_name.ilike.%${searchTerm}%,profiles.last_name.ilike.%${searchTerm}%,profiles.email.ilike.%${searchTerm}%`,
          { foreignTable: 'profiles' }
        );
      }

      const { data: walletsData, error: walletsError } = await query;

      if (walletsError) throw walletsError;

      // Get transaction counts for each wallet
      const walletIds = walletsData?.map(w => w.id) || [];
      const { data: transactionCounts, error: transactionError } = await supabase
        .from('token_transactions')
        .select('wallet_id')
        .in('wallet_id', walletIds);

      if (transactionError) throw transactionError;

      // Count transactions per wallet
      const transactionCountMap = transactionCounts?.reduce((acc, tx) => {
        acc[tx.wallet_id] = (acc[tx.wallet_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get last activity for each wallet
      const { data: lastActivities, error: activityError } = await supabase
        .from('token_transactions')
        .select('wallet_id, created_at')
        .in('wallet_id', walletIds)
        .order('created_at', { ascending: false });

      if (activityError) throw activityError;

      // Get most recent activity per wallet
      const lastActivityMap = lastActivities?.reduce((acc, tx) => {
        if (!acc[tx.wallet_id]) {
          acc[tx.wallet_id] = tx.created_at;
        }
        return acc;
      }, {} as Record<string, string>) || {};

      return walletsData?.map(wallet => ({
        id: wallet.id,
        profileId: wallet.profile_id,
        firstName: wallet.profiles.first_name || '',
        lastName: wallet.profiles.last_name || '',
        email: wallet.profiles.email || '',
        userType: wallet.profiles.user_type || 'mentee',
        balance: wallet.balance || 0,
        transactionCount: transactionCountMap[wallet.id] || 0,
        lastActivity: lastActivityMap[wallet.id] || null,
        isActive: (wallet.balance || 0) > 0 || (transactionCountMap[wallet.id] || 0) > 0
      })) || [];
    },
    staleTime: 30000, // 30 seconds
  });
}
