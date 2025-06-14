
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, ArrowUpRight, ArrowDownRight, Gift } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { EnhancedTransactionHistory } from "./EnhancedTransactionHistory";
import { EarnUseTokensTab } from "./EarnUseTokensTab";

interface WalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatTokenBalance = (balance: number): string => {
  if (balance < 1000) {
    return balance.toString();
  } else if (balance < 1000000) {
    return Math.floor(balance / 1000) + 'K+';
  } else if (balance < 1000000000) {
    return Math.floor(balance / 1000000) + 'M+';
  } else {
    return Math.floor(balance / 1000000000) + 'B+';
  }
};

export function WalletDialog({ isOpen, onClose }: WalletDialogProps) {
  const { balance, isLoading } = useWalletBalance();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for demonstration
  const recentTransactions = [
    { id: 1, type: "earned", amount: 25, description: "Webinar attendance", date: "2024-01-15" },
    { id: 2, type: "spent", amount: 50, description: "Mentor session", date: "2024-01-14" },
    { id: 3, type: "earned", amount: 5, description: "Daily login", date: "2024-01-14" },
  ];

  const stats = {
    totalEarned: 145,
    totalSpent: 95,
    thisWeekEarned: 35,
    pendingRewards: 15
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            Token Wallet
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="earn-use">Earn & Use</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Balance Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Balance</span>
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    Active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <Coins className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">
                      {isLoading ? "..." : formatTokenBalance(balance)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isLoading ? "Loading..." : `${balance} tokens available`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="text-lg font-semibold">{stats.totalEarned}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
                    <ArrowDownRight className="h-4 w-4" />
                    <span className="text-lg font-semibold">{stats.totalSpent}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-lg font-semibold">{stats.thisWeekEarned}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-orange-600 mb-2">
                    <Gift className="h-4 w-4" />
                    <span className="text-lg font-semibold">{stats.pendingRewards}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Activity
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab("transactions")}
                  >
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'earned' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'earned' ? 
                            <ArrowUpRight className="h-4 w-4" /> : 
                            <ArrowDownRight className="h-4 w-4" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earn-use">
            <EarnUseTokensTab />
          </TabsContent>

          <TabsContent value="transactions">
            <EnhancedTransactionHistory />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Token Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Detailed analytics coming soon</p>
                  <p className="text-sm">Track your earning patterns and spending habits</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
