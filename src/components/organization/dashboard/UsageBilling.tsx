import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface UsageBillingProps {
  organization: any;
}

export function UsageBilling({ organization }: UsageBillingProps) {
  const [billingPeriod, setBillingPeriod] = useState('current');

  const currentUsage = {
    apiCalls: 8543,
    quota: 10000,
    percentage: 85.43,
    assessments: 347,
    assessmentQuota: 500,
    assessmentPercentage: 69.4
  };

  const billingHistory = [
    {
      id: 'inv_001',
      period: 'December 2023',
      amount: 149.00,
      status: 'paid',
      dueDate: '2024-01-01',
      usage: {
        apiCalls: 9876,
        assessments: 445
      }
    },
    {
      id: 'inv_002',
      period: 'November 2023',
      amount: 149.00,
      status: 'paid',
      dueDate: '2023-12-01',
      usage: {
        apiCalls: 8234,
        assessments: 398
      }
    }
  ];

  const pricingTiers = [
    {
      name: 'Free',
      price: 0,
      apiCalls: 1000,
      assessments: 50,
      features: ['Basic API access', 'Standard templates', 'Email support'],
      current: organization.subscription_tier === 'free'
    },
    {
      name: 'Professional',
      price: 149,
      apiCalls: 10000,
      assessments: 500,
      features: ['Advanced API access', 'Custom templates', 'Priority support', 'Analytics dashboard'],
      current: organization.subscription_tier === 'professional'
    },
    {
      name: 'Enterprise',
      price: 499,
      apiCalls: 50000,
      assessments: 2500,
      features: ['Unlimited API access', 'White-label solutions', 'Dedicated support', 'Custom integrations'],
      current: organization.subscription_tier === 'enterprise'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usage & Billing</h1>
          <p className="text-muted-foreground">Monitor your API usage and manage billing</p>
        </div>
        <Button>
          <CreditCard className="h-4 w-4 mr-2" />
          Manage Billing
        </Button>
      </div>

      <Tabs defaultValue="usage" className="w-full">
        <TabsList>
          <TabsTrigger value="usage">Current Usage</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription and limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold capitalize">
                    {organization.subscription_tier || 'Free'} Plan
                  </h3>
                  <p className="text-muted-foreground">
                    {organization.subscription_tier === 'free' ? 'No monthly charge' : '$149/month'}
                  </p>
                </div>
                <Badge variant="outline" className="text-green-600">
                  Active
                </Badge>
              </div>
              {currentUsage.percentage > 80 && (
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    You've used {currentUsage.percentage}% of your monthly quota. Consider upgrading to avoid service interruption.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">API Calls</CardTitle>
                <CardDescription>Monthly API usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {currentUsage.apiCalls.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {currentUsage.quota.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={currentUsage.percentage} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    {currentUsage.percentage.toFixed(1)}% of monthly limit used
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assessments</CardTitle>
                <CardDescription>Monthly assessment completions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {currentUsage.assessments.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {currentUsage.assessmentQuota.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={currentUsage.assessmentPercentage} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    {currentUsage.assessmentPercentage.toFixed(1)}% of monthly limit used
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Breakdown</CardTitle>
              <CardDescription>Detailed breakdown of your API usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">2,156</div>
                    <p className="text-sm text-muted-foreground">Sessions Created</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">1,843</div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">313</div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Your past invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingHistory.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">
                        {invoice.id}
                      </TableCell>
                      <TableCell>{invoice.period}</TableCell>
                      <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {pricingTiers.map((tier) => (
              <Card key={tier.name} className={tier.current ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{tier.name}</CardTitle>
                    {tier.current && (
                      <Badge>Current Plan</Badge>
                    )}
                  </div>
                  <CardDescription>
                    <span className="text-3xl font-bold">${tier.price}</span>
                    {tier.price > 0 && <span className="text-muted-foreground">/month</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>API Calls</span>
                      <span>{tier.apiCalls.toLocaleString()}/month</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Assessments</span>
                      <span>{tier.assessments.toLocaleString()}/month</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full" 
                    variant={tier.current ? 'outline' : 'default'}
                    disabled={tier.current}
                  >
                    {tier.current ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}