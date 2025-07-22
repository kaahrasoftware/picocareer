
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Users, TrendingUp, Activity } from "lucide-react";
import { WalletOverviewTable } from './WalletOverviewTable';
import { TokenOperationsPanel } from './TokenOperationsPanel';
import { SystemTransactionHistory } from './SystemTransactionHistory';
import { TokenAnalyticsDashboard } from './TokenAnalyticsDashboard';
import { useTokenEconomyOverview } from '@/hooks/useTokenEconomyOverview';

export function TokensManagementTab() {
  const [activeTab, setActiveTab] = useState('wallets');
  const { data: overview, isLoading } = useTokenEconomyOverview();

  const overviewCards = [
    {
      title: "Total Tokens in Circulation",
      value: overview?.totalTokens || 0,
      icon: Coins,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Active Wallets",
      value: overview?.activeWallets || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Daily Transaction Volume",
      value: overview?.dailyVolume || 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Transactions Today",
      value: overview?.transactionsToday || 0,
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
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
      {/* Overview Cards */}
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
                {card.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Wallets Management</CardTitle>
              <CardDescription>
                View and manage all user wallets, balances, and account status
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
                Add, transfer, and adjust tokens across user accounts
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
                Monitor all token transactions across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemTransactionHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <TokenAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
