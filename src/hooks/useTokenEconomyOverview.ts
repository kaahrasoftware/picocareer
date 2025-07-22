
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TokenEconomyOverview {
  totalTokens: number;
  activeWallets: number;
  dailyVolume: number;
  transactionsToday: number;
  averageBalance: number;
}

export function useTokenEconomyOverview() {
  return useQuery({
    queryKey: ['token-economy-overview'],
    queryFn: async (): Promise<TokenEconomyOverview> => {
      // Get total tokens in circulation
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select('balance');

      if (walletsError) throw walletsError;

      const totalTokens = walletsData?.reduce((sum, wallet) => sum + (wallet.balance || 0), 0) || 0;
      const activeWallets = walletsData?.filter(wallet => wallet.balance > 0).length || 0;
      const averageBalance = activeWallets > 0 ? totalTokens / activeWallets : 0;

      // Get today's transaction volume
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('token_transactions')
        .select('amount')
        .gte('created_at', today.toISOString());

      if (transactionsError) throw transactionsError;

      const dailyVolume = transactionsData?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
      const transactionsToday = transactionsData?.length || 0;

      return {
        totalTokens,
        activeWallets,
        dailyVolume,
        transactionsToday,
        averageBalance
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}
