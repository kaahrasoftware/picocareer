import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Key, 
  Users, 
  BarChart3, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText
} from 'lucide-react';

interface OrganizationOverviewProps {
  organization: any;
}

export function OrganizationOverview({ organization }: OrganizationOverviewProps) {
  const metrics = [
    {
      title: "API Calls This Month",
      value: "12,543",
      change: "+23%",
      icon: BarChart3,
      color: "text-blue-600"
    },
    {
      title: "Active API Keys",
      value: "3",
      change: "+1",
      icon: Key,
      color: "text-green-600"
    },
    {
      title: "Assessment Sessions",
      value: "847",
      change: "+15%",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Success Rate",
      value: "98.2%",
      change: "+0.5%",
      icon: TrendingUp,
      color: "text-emerald-600"
    }
  ];

  const recentActivity = [
    {
      type: "API Key Created",
      message: "Production API key created",
      time: "2 hours ago",
      status: "success"
    },
    {
      type: "Template Updated",
      message: "Default assessment template modified",
      time: "1 day ago",
      status: "info"
    },
    {
      type: "Quota Alert",
      message: "80% of monthly quota reached",
      time: "2 days ago",
      status: "warning"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back to your PicoCareer organization portal</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{metric.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Organization Status */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Status</CardTitle>
            <CardDescription>Your account and subscription details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Subscription Tier</span>
              <Badge variant="outline">{organization.subscription_tier || 'Free'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Account Status</span>
              <Badge variant={organization.status === 'Approved' ? 'default' : 'secondary'}>
                {organization.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Monthly Quota Usage</span>
                <span>8,543 / 10,000</span>
              </div>
              <Progress value={85} className="w-full" />
            </div>
            <Button className="w-full" variant="outline">
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {activity.status === 'success' && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                    {activity.status === 'info' && (
                      <Clock className="h-4 w-4 text-blue-600" />
                    )}
                    {activity.status === 'warning' && (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="justify-start">
              <Key className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              New Template
            </Button>
            <Button variant="outline" className="justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}