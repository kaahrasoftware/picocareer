
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, CreditCard, TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { useAuthSession } from "@/hooks/useAuthSession";

interface WalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletDialog({ isOpen, onClose }: WalletDialogProps) {
  const { session } = useAuthSession();
  const { wallet, balance, isLoading } = useWalletBalance();
  
  // Filter states
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Get date range based on filter
  const getDateRange = () => {
    const now = new Date();
    switch (dateFilter) {
      case "today":
        return { start: startOfDay(now), end: endOfDay(now) };
      case "week":
        return { start: startOfDay(subDays(now, 7)), end: endOfDay(now) };
      case "month":
        return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) };
      default:
        return { start: null, end: null };
    }
  };

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['wallet-transactions', wallet?.id, dateFilter, typeFilter, categoryFilter, searchQuery],
    queryFn: async () => {
      if (!wallet?.id) return [];
      
      let query = supabase
        .from('token_transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (typeFilter !== 'all') {
        query = query.eq('transaction_type', typeFilter);
      }
      
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { start, end } = getDateRange();
      if (start && end) {
        query = query.gte('created_at', start.toISOString())
                   .lte('created_at', end.toISOString());
      }

      if (searchQuery) {
        query = query.ilike('description', `%${searchQuery}%`);
      }

      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!wallet?.id && isOpen
  });

  // Calculate analytics
  const analytics = {
    totalSpent: transactions
      .filter(t => t.transaction_type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0),
    totalEarned: transactions
      .filter(t => t.transaction_type === 'credit' || t.transaction_type === 'refund')
      .reduce((sum, t) => sum + t.amount, 0),
    transactionCount: transactions.length,
    avgTransaction: transactions.length > 0 
      ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length 
      : 0
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'debit':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'refund':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
      case 'refund':
        return 'text-green-600';
      case 'debit':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      cancelled: "outline"
    };
    
    return (
      <Badge variant={variants[status] || "outline"} className="text-xs">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (!session?.user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            My Wallet
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Balance Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-primary">
                    {isLoading ? "..." : balance}
                  </div>
                  <div className="text-muted-foreground">tokens</div>
                  <div className="text-sm text-muted-foreground">
                    Estimated value: ${((balance || 0) * 0.1).toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    +{analytics.totalEarned}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Earned</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    -{analytics.totalSpent}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {analytics.transactionCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Transactions</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.transaction_type)}
                        <div>
                          <div className="font-medium text-sm">
                            {transaction.description || 'Transaction'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getTransactionColor(transaction.transaction_type)}`}>
                          {(transaction.transaction_type === 'credit' || transaction.transaction_type === 'refund') ? '+' : '-'}
                          {transaction.amount}
                        </div>
                        {getStatusBadge(transaction.transaction_status)}
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && !transactionsLoading && (
                    <div className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="credit">Credits</SelectItem>
                  <SelectItem value="debit">Debits</SelectItem>
                  <SelectItem value="refund">Refunds</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="purchase">Purchases</SelectItem>
                  <SelectItem value="session">Sessions</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="refund">Refunds</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Transaction List */}
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="p-6 space-y-4">
                    {transactionsLoading ? (
                      <div className="text-center py-8">Loading transactions...</div>
                    ) : transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between py-3 border-b last:border-0">
                          <div className="flex items-center gap-4">
                            {getTransactionIcon(transaction.transaction_type)}
                            <div className="flex-1">
                              <div className="font-medium">
                                {transaction.description || 'Transaction'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')} • 
                                Category: {transaction.category} •
                                Type: {transaction.transaction_type}
                              </div>
                              {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Additional info: {JSON.stringify(transaction.metadata)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                              {(transaction.transaction_type === 'credit' || transaction.transaction_type === 'refund') ? '+' : '-'}
                              {transaction.amount}
                            </div>
                            {getStatusBadge(transaction.transaction_status)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No transactions found matching your criteria
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    +{analytics.totalEarned}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${(analytics.totalEarned * 0.1).toFixed(2)} value
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Spent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    -{analytics.totalSpent}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${(analytics.totalSpent * 0.1).toFixed(2)} value
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Net Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${analytics.totalEarned >= analytics.totalSpent ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.totalEarned >= analytics.totalSpent ? '+' : '-'}
                    {Math.abs(analytics.totalEarned - analytics.totalSpent)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Current balance: {balance}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Transaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.avgTransaction.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    From {analytics.transactionCount} transactions
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Usage Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  • You've made {analytics.transactionCount} transactions so far
                </div>
                <div className="text-sm text-muted-foreground">
                  • Your current balance can cover approximately {Math.floor((balance || 0) / (analytics.avgTransaction || 1))} more average transactions
                </div>
                <div className="text-sm text-muted-foreground">
                  • Total token value: ${((balance || 0) * 0.1).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
