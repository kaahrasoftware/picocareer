
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Zap, TrendingUp, Download, Search, Filter, Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface WalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletDialog({ isOpen, onClose }: WalletDialogProps) {
  const navigate = useNavigate();
  const { wallet, balance, isLoading } = useWalletBalance();
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionType, setTransactionType] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['wallet-transactions', wallet?.id, searchQuery, transactionType, dateFilter],
    queryFn: async () => {
      if (!wallet?.id) return [];
      
      let query = supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('description', `%${searchQuery}%`);
      }

      if (transactionType !== 'all') {
        query = query.eq('category', transactionType);
      }

      if (dateFilter !== 'all') {
        const now = new Date();
        let dateThreshold;
        
        switch (dateFilter) {
          case 'week':
            dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'quarter':
            dateThreshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          default:
            dateThreshold = null;
        }
        
        if (dateThreshold) {
          query = query.gte('created_at', dateThreshold.toISOString());
        }
      }

      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!wallet?.id && isOpen
  });

  const handlePurchaseTokens = () => {
    onClose();
    navigate("/token-shop");
  };

  const getTransactionIcon = (amount: number, category: string) => {
    if (amount > 0) {
      return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
    }
    return <ArrowUpRight className="h-4 w-4 text-red-600" />;
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? "text-green-600" : "text-red-600";
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            My Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto">
          {/* Balance Overview */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Current Balance
                </div>
                <Button onClick={handlePurchaseTokens} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Buy Tokens
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-primary">{balance} tokens</div>
                  <div className="text-sm text-muted-foreground">≈ ${(balance * 0.1).toFixed(2)} USD</div>
                </div>
                <div className="text-right space-y-2">
                  <div className="text-sm text-muted-foreground">This Month</div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">
                      {transactions.filter(t => {
                        const transactionDate = new Date(t.created_at);
                        const now = new Date();
                        return transactionDate.getMonth() === now.getMonth() && 
                               transactionDate.getFullYear() === now.getFullYear() &&
                               t.amount > 0;
                      }).reduce((sum, t) => sum + t.amount, 0)} earned
                    </span>
                  </div>
                  <div className="text-sm text-red-600">
                    {Math.abs(transactions.filter(t => {
                      const transactionDate = new Date(t.created_at);
                      const now = new Date();
                      return transactionDate.getMonth() === now.getMonth() && 
                             transactionDate.getFullYear() === now.getFullYear() &&
                             t.amount < 0;
                    }).reduce((sum, t) => sum + t.amount, 0))} spent
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for different sections */}
          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transactions">Transaction History</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={transactionType} onValueChange={setTransactionType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="session">Session</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                    <SelectItem value="quarter">Past Quarter</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Transaction List */}
              <Card>
                <CardContent className="p-0">
                  {transactionsLoading ? (
                    <div className="p-6 space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                            <div className="space-y-1">
                              <div className="h-4 bg-gray-200 rounded w-32"></div>
                              <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="p-12 text-center">
                      <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery || transactionType !== 'all' || dateFilter !== 'all' 
                          ? "Try adjusting your filters to see more results."
                          : "Your transaction history will appear here once you start using tokens."}
                      </p>
                      <Button onClick={handlePurchaseTokens}>
                        Get Started with Tokens
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {transactions.map((transaction, index) => (
                        <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-full">
                              {getTransactionIcon(transaction.amount, transaction.category)}
                            </div>
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <span>{format(new Date(transaction.created_at), 'MMM dd, yyyy')}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {transaction.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className={`font-semibold ${getTransactionColor(transaction.amount)}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount} tokens
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      +{transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Monthly Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)) / 3)}
                    </div>
                    <p className="text-xs text-muted-foreground">Tokens per month</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Your most common transaction types:
                  </div>
                  {['content', 'session', 'purchase'].map((type) => {
                    const typeTransactions = transactions.filter(t => t.category === type);
                    const count = typeTransactions.length;
                    const total = Math.abs(typeTransactions.reduce((sum, t) => sum + (t.amount < 0 ? t.amount : 0), 0));
                    
                    if (count === 0) return null;
                    
                    return (
                      <div key={type} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="capitalize font-medium">{type}</div>
                        <div className="text-right">
                          <div className="font-semibold">{count} transactions</div>
                          <div className="text-sm text-muted-foreground">{total} tokens used</div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
