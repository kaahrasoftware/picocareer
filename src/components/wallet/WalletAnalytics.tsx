
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Calendar, DollarSign } from "lucide-react";

interface WalletAnalyticsProps {
  walletId: string;
}

export function WalletAnalytics({ walletId }: WalletAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+127</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-89</div>
            <p className="text-xs text-muted-foreground">
              -5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Days</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">23</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Growth</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">+38</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Token Usage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Token Usage Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Mentorship Sessions</span>
              <span className="text-sm text-muted-foreground">45% (89 tokens)</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Premium Content</span>
              <span className="text-sm text-muted-foreground">30% (59 tokens)</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">AI Assessments</span>
              <span className="text-sm text-muted-foreground">25% (49 tokens)</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earning Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Token Earning Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Daily Logins</span>
              <span className="text-sm text-green-600">+115 tokens</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Event Participation</span>
              <span className="text-sm text-green-600">+75 tokens</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Referrals</span>
              <span className="text-sm text-green-600">+45 tokens</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Bonuses</span>
              <span className="text-sm text-green-600">+25 tokens</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
