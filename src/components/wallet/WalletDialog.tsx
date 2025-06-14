
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Filter,
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface WalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: 'credit' | 'debit' | 'refund';
  transaction_status: 'completed' | 'pending' | 'failed';
  category: string;
  description: string;
  created_at: string;
  reference_id?: string;
  metadata?: any;
}

export function WalletDialog({ isOpen, onClose }: WalletDialogProps) {
  const { wallet, balance, isLoading: walletLoading } = useWalletBalance();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<string>("all");

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['token-transactions', wallet?.id, selectedFilter, dateRange],
    queryFn: async () => {
      if (!wallet?.id) return [];
      
      let query = supabase
        .from('token_transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (selectedFilter !== "all") {
        if (selectedFilter === "income") {
          query = query.eq('transaction_type', 'credit');
        } else if (selectedFilter === "expense") {
          query = query.eq('transaction_type', 'debit');
        } else if (selectedFilter === "refund") {
          query = query.eq('transaction_type', 'refund');
        } else {
          query = query.eq('category', selectedFilter);
        }
      }

      // Apply date range filter
      if (dateRange !== "all") {
        const now = new Date();
        let startDate: Date;

        switch (dateRange) {
          case "today":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "year":
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!wallet?.id
  });

  // Filter transactions by search query
  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate analytics
  const analytics = {
    totalIncome: transactions
      .filter(t => t.transaction_type === 'credit' && t.transaction_status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: transactions
      .filter(t => t.transaction_type === 'debit' && t.transaction_status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    totalRefunds: transactions
      .filter(t => t.transaction_type === 'refund' && t.transaction_status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    transactionCount: transactions.length,
    averageTransaction: transactions.length > 0 
      ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length 
      : 0
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case 'debit':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'refund':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl h-[90vh] overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            My Wallet
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Balance Card */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Current Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {walletLoading ? "Loading..." : `${balance} tokens`}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Available for purchases and sessions
                  </p>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">+{analytics.totalIncome}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">-{analytics.totalExpenses}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.transactionCount}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredTransactions.slice(0, 5).length > 0 ? (
                    <div className="space-y-3">
                      {filteredTransactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(transaction.transaction_type)}
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-medium ${transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.transaction_type === 'credit' ? '+' : '-'}{Math.abs(transaction.amount)} tokens
                            </div>
                            <Badge className={getStatusColor(transaction.transaction_status)}>
                              {transaction.transaction_status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No transactions yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expenses</SelectItem>
                    <SelectItem value="refund">Refunds</SelectItem>
                    <SelectItem value="purchase">Purchases</SelectItem>
                    <SelectItem value="session">Sessions</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transactions List */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Transaction History</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div>
                              <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                              <div className="w-24 h-3 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="w-16 h-6 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {filteredTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(transaction.transaction_type)}
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}</span>
                                <span>•</span>
                                <span className="capitalize">{transaction.category}</span>
                                {transaction.reference_id && (
                                  <>
                                    <span>•</span>
                                    <span>ID: {transaction.reference_id.slice(-8)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-medium ${transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.transaction_type === 'credit' ? '+' : '-'}{Math.abs(transaction.amount)} tokens
                            </div>
                            <Badge className={getStatusColor(transaction.transaction_status)}>
                              {transaction.transaction_status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No transactions found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">+{analytics.totalIncome}</div>
                    <p className="text-xs text-muted-foreground">All time earnings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">-{analytics.totalExpenses}</div>
                    <p className="text-xs text-muted-foreground">All time spending</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.totalIncome - analytics.totalExpenses}
                    </div>
                    <p className="text-xs text-muted-foreground">Income - expenses</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {analytics.averageTransaction.toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">Per transaction</p>
                  </CardContent>
                </Card>
              </div>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(
                        transactions
                          .filter(t => t.transaction_type === 'debit' && t.transaction_status === 'completed')
                          .reduce((acc, t) => {
                            acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
                            return acc;
                          }, {} as Record<string, number>)
                      )
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, amount]) => {
                          const percentage = analytics.totalExpenses > 0 
                            ? (amount / analytics.totalExpenses) * 100 
                            : 0;
                          
                          return (
                            <div key={category} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                                <span className="capitalize font-medium">{category}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{amount} tokens</div>
                                <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No spending data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
