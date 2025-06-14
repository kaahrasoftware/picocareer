
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, History, BarChart3, Zap, TrendingUp, Calendar, Coffee, Gift } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedTransactionHistory } from "./EnhancedTransactionHistory";
import { EarnUseTokensTab } from "./EarnUseTokensTab";

interface WalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletDialog({ isOpen, onClose }: WalletDialogProps) {
  const { wallet, balance, isLoading } = useWalletBalance();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch recent transactions for quick stats
  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions', wallet?.id],
    queryFn: async () => {
      if (!wallet?.id) return [];
      
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!wallet?.id
  });

  // Calculate quick stats
  const totalSpent = recentTransactions?.reduce((sum, tx) => sum + (tx.amount < 0 ? Math.abs(tx.amount) : 0), 0) || 0;
  const totalEarned = recentTransactions?.reduce((sum, tx) => sum + (tx.amount > 0 ? tx.amount : 0), 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Your Wallet
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="earn-use">Earn & Use</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Balance Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-2">
                  {isLoading ? "..." : balance} tokens
                </div>
                <p className="text-muted-foreground">
                  Estimated value: ${(balance * 0.1).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentTransactions?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">transactions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Tokens Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">+{totalEarned}</div>
                  <p className="text-xs text-muted-foreground">recent period</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{totalSpent}</div>
                  <p className="text-xs text-muted-foreground">recent period</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common ways to earn and use tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-4">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">Daily Check-in</span>
                    <Badge variant="secondary" className="text-xs">+5 tokens</Badge>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-4">
                    <Coffee className="h-4 w-4" />
                    <span className="text-xs">Join Event</span>
                    <Badge variant="secondary" className="text-xs">+25-100</Badge>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-4">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs">AI Assessment</span>
                    <Badge variant="secondary" className="text-xs">30 tokens</Badge>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-4">
                    <Gift className="h-4 w-4" />
                    <span className="text-xs">View All</span>
                    <Badge variant="secondary" className="text-xs">Earn & Use</Badge>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earn-use">
            <EarnUseTokensTab />
          </TabsContent>

          <TabsContent value="history">
            <EnhancedTransactionHistory />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Token Analytics
                </CardTitle>
                <CardDescription>
                  Detailed insights into your token usage patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Analytics feature coming soon!</p>
                  <p className="text-sm">Track your earning and spending patterns.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
