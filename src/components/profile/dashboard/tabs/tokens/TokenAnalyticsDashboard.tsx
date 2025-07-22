
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

export function TokenAnalyticsDashboard() {
  // This would contain various analytics charts and metrics
  // For now, showing placeholder cards

  const analyticsCards = [
    {
      title: "Token Velocity",
      description: "Average time tokens stay in circulation",
      value: "7.2 days",
      icon: Activity,
      trend: "+5.2%"
    },
    {
      title: "Most Popular Category",
      description: "Highest token usage by category",
      value: "Content",
      icon: TrendingUp,
      trend: "42% of usage"
    },
    {
      title: "Average Transaction",
      description: "Mean token amount per transaction",
      value: "15 tokens",
      icon: DollarSign,
      trend: "+12%"
    },
    {
      title: "Daily Active Wallets",
      description: "Wallets with transactions today",
      value: "127",
      icon: TrendingDown,
      trend: "-3.1%"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
              <div className="text-xs text-green-600 mt-1">{card.trend}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Token Flow Trends</CardTitle>
            <CardDescription>
              Daily token transactions over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Charts integration coming soon...
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage by Category</CardTitle>
            <CardDescription>
              Token spending distribution by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Pie chart integration coming soon...
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Token Economy Health</CardTitle>
          <CardDescription>
            Key metrics and insights about the token ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Supply Metrics</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total Issued</span>
                  <span className="font-medium">12,450</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>In Circulation</span>
                  <span className="font-medium">9,823</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Burn Rate</span>
                  <span className="font-medium">2.3%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Usage Patterns</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Peak Hours</span>
                  <span className="font-medium">2-4 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Weekend Activity</span>
                  <span className="font-medium">-15%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg. Session</span>
                  <span className="font-medium">23 tokens</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">User Behavior</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>High Spenders</span>
                  <span className="font-medium">12%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Regular Users</span>
                  <span className="font-medium">68%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Inactive</span>
                  <span className="font-medium">20%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
