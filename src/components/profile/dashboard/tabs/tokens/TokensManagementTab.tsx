
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Users, TrendingUp, Activity, RefreshCw } from "lucide-react";
import { WalletOverviewTable } from './WalletOverviewTable';
import { TokenOperationsPanel } from './TokenOperationsPanel';
import { SystemTransactionHistory } from './SystemTransactionHistory';
import { EnhancedTokenAnalyticsDashboard } from './EnhancedTokenAnalyticsDashboard';
import { useEnhancedTokenEconomyOverview } from '@/hooks/useEnhancedTokenEconomyOverview';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function TokensManagementTab() {
  const [activeTab, setActiveTab] = useState('wallets');
  const { data: overview, isLoading, refetch } = useEnhancedTokenEconomyOverview();
  const queryClient = useQueryClient();

  const refreshAllData = async () => {
    toast.info('Refreshing token data...');
    try {
      // Invalidate all related queries to force refresh
      await queryClient.invalidateQueries({ queryKey: ['enhanced-token-economy-overview'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-wallet-management'] });
      await queryClient.invalidateQueries({ queryKey: ['system-transaction-history'] });
      
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  const overviewCards = [
    {
      title: "Total Tokens in Circulation",
      value: overview?.totalTokens || 0,
      icon: Coins,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: `Distributed across ${overview?.totalWallets || 0} wallets`
    },
    {
      title: "Active Wallets",
      value: overview?.activeWallets || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: `${overview?.tokenUtilizationRate || 0}% utilization rate`
    },
    {
      title: "Daily Transaction Volume",
      value: overview?.dailyVolume || 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: `From ${overview?.transactionsToday || 0} transactions today`
    },
    {
      title: "System Health Score",
      value: `${overview?.systemHealthScore || 0}%`,
      icon: Activity,
      color: overview?.systemHealthScore && overview.systemHealthScore >= 70 ? "text-green-600" : 
             overview?.systemHealthScore && overview.systemHealthScore >= 50 ? "text-yellow-600" : "text-red-600",
      bgColor: overview?.systemHealthScore && overview.systemHealthScore >= 70 ? "bg-green-100" : 
               overview?.systemHealthScore && overview.systemHealthScore >= 50 ? "bg-yellow-100" : "bg-red-100",
      description: `Avg balance: ${overview?.averageBalance || 0} tokens`
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Token Management</h2>
            <p className="text-muted-foreground">Comprehensive token economy administration</p>
          </div>
          <Button variant="outline" disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Token Management</h2>
          <p className="text-muted-foreground">
            Comprehensive token economy administration - {overview?.totalWallets || 0} total wallets
          </p>
        </div>
        <Button variant="outline" onClick={refreshAllData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Alert for System Health */}
      {overview?.systemHealthScore && overview.systemHealthScore < 50 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-800">System Health Attention Needed</h4>
                <p className="text-sm text-yellow-700">
                  Current health score is {overview.systemHealthScore}%. Consider reviewing token distribution and user engagement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wallets">
            Wallets ({overview?.totalWallets || 0})
          </TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Wallets Management</CardTitle>
              <CardDescription>
                View and manage all {overview?.totalWallets || 0} user wallets, balances, and account status. 
                {overview?.activeWallets} wallets currently have token balances.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WalletOverviewTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Token Operations</CardTitle>
              <CardDescription>
                Add, transfer, and adjust tokens across user accounts. 
                Total circulation: {overview?.totalTokens.toLocaleString() || 0} tokens.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TokenOperationsPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System-wide Transactions</CardTitle>
              <CardDescription>
                Monitor all token transactions across the platform. 
                {overview?.transactionsToday || 0} transactions processed today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemTransactionHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <EnhancedTokenAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
