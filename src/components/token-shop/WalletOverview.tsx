
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, Clock, Zap } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function WalletOverview() {
  const { wallet, balance, isLoading } = useWalletBalance();

  // Fetch recent transactions
  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions', wallet?.id],
    queryFn: async () => {
      if (!wallet?.id) return [];
      
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !!wallet?.id
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getUsageRecommendation = () => {
    if (balance === 0) return { text: "Get started with tokens", color: "bg-blue-500" };
    if (balance < 10) return { text: "Low balance - consider refilling", color: "bg-yellow-500" };
    if (balance < 50) return { text: "Good for basic usage", color: "bg-green-500" };
    return { text: "Excellent balance!", color: "bg-emerald-500" };
  };

  const recommendation = getUsageRecommendation();

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          Your Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-4xl font-bold text-primary">{balance}</span>
            <span className="text-lg text-muted-foreground">tokens</span>
          </div>
          <Badge className={`${recommendation.color} text-white`}>
            {recommendation.text}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="text-2xl font-semibold text-gray-700">
              {recentTransactions?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              Recent activity
            </div>
          </div>
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="text-2xl font-semibold text-gray-700">
              ${(balance * 0.1).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Est. value
            </div>
          </div>
        </div>

        {/* Recent Activity Preview */}
        {recentTransactions && recentTransactions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Recent Activity</h4>
            <div className="space-y-1">
              {recentTransactions.slice(0, 2).map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center text-sm py-2 px-3 bg-white/30 rounded">
                  <span className="truncate">{transaction.description}</span>
                  <span className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Tips */}
        <div className="bg-white/30 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">💡 Quick Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use tokens for premium career insights</li>
            <li>• Book mentor sessions with tokens</li>
            <li>• Larger packages offer better value</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
