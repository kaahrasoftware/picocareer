
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedTokenEconomyOverview {
  totalTokens: number;
  activeWallets: number;
  totalWallets: number;
  dailyVolume: number;
  transactionsToday: number;
  averageBalance: number;
  medianBalance: number;
  topPercentileBalance: number;
  tokenUtilizationRate: number;
  systemHealthScore: number;
  growthTrend: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  distributionStats: {
    emptyWallets: number;
    lowBalance: number; // 1-50 tokens
    mediumBalance: number; // 51-200 tokens
    highBalance: number; // 200+ tokens
  };
}

export function useEnhancedTokenEconomyOverview() {
  return useQuery({
    queryKey: ['enhanced-token-economy-overview'],
    queryFn: async (): Promise<EnhancedTokenEconomyOverview> => {
      // Get all wallet data with enhanced metrics
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select(`
          balance,
          created_at,
          updated_at,
          profiles!inner(
            id,
            user_type,
            created_at
          )
        `);

      if (walletsError) throw walletsError;

      const totalWallets = walletsData?.length || 0;
      const balances = walletsData?.map(w => w.balance || 0) || [];
      const totalTokens = balances.reduce((sum, balance) => sum + balance, 0);
      const activeWallets = balances.filter(balance => balance > 0).length;
      const averageBalance = totalWallets > 0 ? totalTokens / totalWallets : 0;

      // Calculate median balance
      const sortedBalances = [...balances].sort((a, b) => a - b);
      const medianBalance = sortedBalances.length > 0 
        ? sortedBalances[Math.floor(sortedBalances.length / 2)] 
        : 0;

      // Calculate 90th percentile balance
      const topPercentileIndex = Math.floor(sortedBalances.length * 0.9);
      const topPercentileBalance = sortedBalances[topPercentileIndex] || 0;

      // Distribution stats
      const distributionStats = {
        emptyWallets: balances.filter(b => b === 0).length,
        lowBalance: balances.filter(b => b > 0 && b <= 50).length,
        mediumBalance: balances.filter(b => b > 50 && b <= 200).length,
        highBalance: balances.filter(b => b > 200).length,
      };

      // Token utilization rate (non-zero wallets / total wallets)
      const tokenUtilizationRate = totalWallets > 0 ? (activeWallets / totalWallets) * 100 : 0;

      // Get today's transaction data
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('token_transactions')
        .select('amount, created_at')
        .gte('created_at', today.toISOString());

      if (transactionsError) throw transactionsError;

      const dailyVolume = transactionsData?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
      const transactionsToday = transactionsData?.length || 0;

      // Calculate growth trends (simplified - would need historical data for accurate trends)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const { data: weeklyTxData } = await supabase
        .from('token_transactions')
        .select('amount')
        .gte('created_at', weekAgo.toISOString());

      const { data: monthlyTxData } = await supabase
        .from('token_transactions')
        .select('amount')
        .gte('created_at', monthAgo.toISOString());

      const weeklyVolume = weeklyTxData?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
      const monthlyVolume = monthlyTxData?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

      // Simple system health score based on activity and utilization
      const activityScore = Math.min((transactionsToday / 10) * 100, 100); // Target: 10+ transactions/day
      const utilizationScore = tokenUtilizationRate;
      const balanceDistributionScore = activeWallets > 0 ? (distributionStats.mediumBalance / activeWallets) * 100 : 0;
      
      const systemHealthScore = Math.round((activityScore + utilizationScore + balanceDistributionScore) / 3);

      return {
        totalTokens,
        activeWallets,
        totalWallets,
        dailyVolume,
        transactionsToday,
        averageBalance: Math.round(averageBalance * 100) / 100,
        medianBalance,
        topPercentileBalance,
        tokenUtilizationRate: Math.round(tokenUtilizationRate * 100) / 100,
        systemHealthScore: Math.min(systemHealthScore, 100),
        growthTrend: {
          daily: dailyVolume,
          weekly: weeklyVolume,
          monthly: monthlyVolume
        },
        distributionStats
      };
    },
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });
}
