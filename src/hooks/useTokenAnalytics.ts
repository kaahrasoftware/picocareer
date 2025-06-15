
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "./useAuthSession";

interface TokenUsageData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export function useTokenAnalytics() {
  const { session } = useAuthSession();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['token-analytics', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      // Get user's wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('profile_id', session.user.id)
        .single();

      if (!wallet) return null;

      // Get transaction data grouped by category
      const { data: transactions, error } = await supabase
        .from('token_transactions')
        .select('category, amount')
        .eq('wallet_id', wallet.id)
        .eq('transaction_type', 'debit');

      if (error) throw error;

      // Process the data
      const categoryTotals = transactions?.reduce((acc, transaction) => {
        const category = transaction.category || 'other';
        acc[category] = (acc[category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>) || {};

      const totalSpent = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

      // Define colors for categories
      const categoryColors: Record<string, string> = {
        session: '#8B5CF6',
        content: '#06B6D4', 
        refund: '#10B981',
        purchase: '#F59E0B',
        adjustment: '#EF4444',
        bonus: '#84CC16',
        other: '#6B7280'
      };

      // Convert to the format expected by the component
      const usageData: TokenUsageData[] = Object.entries(categoryTotals).map(([category, amount]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        amount,
        percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
        color: categoryColors[category] || categoryColors.other
      }));

      return {
        usageData,
        totalSpent,
        transactionCount: transactions?.length || 0
      };
    },
    enabled: !!session?.user?.id
  });

  return {
    analytics,
    isLoading,
    error
  };
}
