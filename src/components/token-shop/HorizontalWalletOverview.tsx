
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, Clock, Zap, ChevronDown } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function HorizontalWalletOverview() {
  const { wallet, balance, isLoading } = useWalletBalance();
  const [showTransactions, setShowTransactions] = useState(false);

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
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="animate-pulse flex items-center space-x-8">
            <div className="h-16 bg-gray-200 rounded w-48"></div>
            <div className="flex space-x-8 flex-1">
              <div className="h-12 bg-gray-200 rounded w-32"></div>
              <div className="h-12 bg-gray-200 rounded w-32"></div>
              <div className="h-12 bg-gray-200 rounded w-32"></div>
            </div>
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
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-lg">
      <CardContent className="p-6">
        {/* Main horizontal layout */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Balance Section - Left */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                <span className="text-3xl font-bold text-primary">{balance}</span>
                <span className="text-lg text-muted-foreground">tokens</span>
              </div>
            </div>
          </div>

          {/* Quick Stats - Center */}
          <div className="flex flex-wrap gap-4 lg:gap-6">
            <div className="text-center p-3 bg-white/50 rounded-lg min-w-[120px]">
              <div className="text-xl font-semibold text-gray-700">
                {recentTransactions?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Recent activity
              </div>
            </div>
            
            <div className="text-center p-3 bg-white/50 rounded-lg min-w-[120px]">
              <div className="text-xl font-semibold text-gray-700">
                ${(balance * 0.1).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Est. value
              </div>
            </div>

            <div className="text-center p-3 bg-white/50 rounded-lg min-w-[140px]">
              <Badge className={`${recommendation.color} text-white text-xs`}>
                {recommendation.text}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">
                Status
              </div>
            </div>
          </div>

          {/* Quick Tips & Actions - Right */}
          <div className="lg:text-right">
            <div className="bg-white/30 rounded-lg p-3 max-w-xs">
              <h4 className="font-medium text-sm mb-2">💡 Quick Tips</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Premium career insights</li>
                <li>• Book mentor sessions</li>
                <li>• Better value in larger packages</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Collapsible Recent Activity */}
        {recentTransactions && recentTransactions.length > 0 && (
          <Collapsible open={showTransactions} onOpenChange={setShowTransactions}>
            <CollapsibleTrigger className="flex items-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className={`h-4 w-4 transition-transform ${showTransactions ? 'rotate-180' : ''}`} />
              Recent Activity
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentTransactions.slice(0, 3).map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center text-sm py-2 px-3 bg-white/30 rounded">
                    <span className="truncate flex-1">{transaction.description}</span>
                    <span className={`font-medium ml-2 ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
