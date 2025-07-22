
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, Activity, Users, Wallet, BarChart3, Target } from "lucide-react";
import { useEnhancedTokenEconomyOverview } from '@/hooks/useEnhancedTokenEconomyOverview';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

export function EnhancedTokenAnalyticsDashboard() {
  const { data: overview, isLoading } = useEnhancedTokenEconomyOverview();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!overview) return null;

  const distributionData = [
    { name: 'Empty Wallets', value: overview.distributionStats.emptyWallets, color: '#ef4444' },
    { name: 'Low Balance (1-50)', value: overview.distributionStats.lowBalance, color: '#f59e0b' },
    { name: 'Medium Balance (51-200)', value: overview.distributionStats.mediumBalance, color: '#10b981' },
    { name: 'High Balance (200+)', value: overview.distributionStats.highBalance, color: '#8b5cf6' }
  ];

  const trendData = [
    { period: 'Daily', volume: overview.growthTrend.daily },
    { period: 'Weekly', volume: overview.growthTrend.weekly },
    { period: 'Monthly', volume: overview.growthTrend.monthly }
  ];

  const analyticsCards = [
    {
      title: "Total Users",
      description: "All registered wallets",
      value: overview.totalWallets.toLocaleString(),
      icon: Users,
      trend: `${overview.activeWallets} active`,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Token Utilization",
      description: "Percentage of wallets with tokens",
      value: `${overview.tokenUtilizationRate}%`,
      icon: Target,
      trend: `${overview.activeWallets}/${overview.totalWallets}`,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Average Balance",
      description: "Mean tokens per wallet",
      value: `${overview.averageBalance}`,
      icon: Wallet,
      trend: `Median: ${overview.medianBalance}`,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "System Health",
      description: "Overall platform health score",
      value: `${overview.systemHealthScore}%`,
      icon: Activity,
      trend: overview.systemHealthScore >= 70 ? "Healthy" : overview.systemHealthScore >= 50 ? "Fair" : "Needs Attention",
      color: overview.systemHealthScore >= 70 ? "text-green-600" : overview.systemHealthScore >= 50 ? "text-yellow-600" : "text-red-600",
      bgColor: overview.systemHealthScore >= 70 ? "bg-green-100" : overview.systemHealthScore >= 50 ? "bg-yellow-100" : "bg-red-100"
    },
    {
      title: "Daily Volume",
      description: "Tokens transacted today",
      value: overview.dailyVolume.toLocaleString(),
      icon: TrendingUp,
      trend: `${overview.transactionsToday} transactions`,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    },
    {
      title: "Top 10% Balance",
      description: "90th percentile wallet balance",
      value: `${overview.topPercentileBalance}`,
      icon: BarChart3,
      trend: "Power users",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Weekly Trend",
      description: "7-day transaction volume",
      value: overview.growthTrend.weekly.toLocaleString(),
      icon: TrendingUp,
      trend: overview.growthTrend.weekly > overview.growthTrend.daily * 7 ? "+Growth" : "Stable",
      color: "text-cyan-600",
      bgColor: "bg-cyan-100"
    },
    {
      title: "Monthly Trend",
      description: "30-day transaction volume",
      value: overview.growthTrend.monthly.toLocaleString(),
      icon: DollarSign,
      trend: "Long-term view",
      color: "text-pink-600",
      bgColor: "bg-pink-100"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
              <div className="text-xs mt-1 font-medium">{card.trend}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Health Progress */}
      <Card>
        <CardHeader>
          <CardTitle>System Health Indicators</CardTitle>
          <CardDescription>Key metrics for platform health monitoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Token Utilization Rate</span>
              <span>{overview.tokenUtilizationRate}%</span>
            </div>
            <Progress value={overview.tokenUtilizationRate} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Daily Activity Score</span>
              <span>{Math.min((overview.transactionsToday / 10) * 100, 100).toFixed(1)}%</span>
            </div>
            <Progress value={Math.min((overview.transactionsToday / 10) * 100, 100)} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall System Health</span>
              <span>{overview.systemHealthScore}%</span>
            </div>
            <Progress value={overview.systemHealthScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet Balance Distribution</CardTitle>
            <CardDescription>
              Distribution of users across balance ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction Volume Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume Trends</CardTitle>
            <CardDescription>
              Transaction volumes across different time periods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} tokens`, 'Volume']} />
                <Bar dataKey="volume" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Token Economy Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Token Economy Deep Dive</CardTitle>
          <CardDescription>
            Comprehensive analysis of the token ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Supply Metrics */}
            <div className="space-y-3">
              <h4 className="font-medium text-base">Supply Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total in Circulation</span>
                  <span className="font-medium">{overview.totalTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Wallets</span>
                  <span className="font-medium">{overview.activeWallets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Utilization Rate</span>
                  <span className="font-medium">{overview.tokenUtilizationRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg per Active Wallet</span>
                  <span className="font-medium">
                    {overview.activeWallets > 0 ? Math.round(overview.totalTokens / overview.activeWallets) : 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Distribution Analysis */}
            <div className="space-y-3">
              <h4 className="font-medium text-base">Distribution Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>High Balance Users</span>
                  <span className="font-medium">{overview.distributionStats.highBalance}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Medium Balance Users</span>
                  <span className="font-medium">{overview.distributionStats.mediumBalance}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Low Balance Users</span>
                  <span className="font-medium">{overview.distributionStats.lowBalance}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Empty Wallets</span>
                  <span className="font-medium">{overview.distributionStats.emptyWallets}</span>
                </div>
              </div>
            </div>

            {/* Activity Patterns */}
            <div className="space-y-3">
              <h4 className="font-medium text-base">Activity Patterns</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Daily Transactions</span>
                  <span className="font-medium">{overview.transactionsToday}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Daily Volume</span>
                  <span className="font-medium">{overview.dailyVolume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Weekly Volume</span>
                  <span className="font-medium">{overview.growthTrend.weekly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>System Health</span>
                  <span className={`font-medium ${
                    overview.systemHealthScore >= 70 ? 'text-green-600' : 
                    overview.systemHealthScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {overview.systemHealthScore}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
