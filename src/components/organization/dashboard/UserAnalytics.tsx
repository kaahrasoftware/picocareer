import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Download, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface UserAnalyticsProps {
  organization: any;
}

export function UserAnalytics({ organization }: UserAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30d');

  const analyticsData = {
    totalUsers: 1247,
    activeUsers: 892,
    completionRate: 78.5,
    avgSessionTime: '12m 34s',
    assessmentsCompleted: 2156,
    growthRate: 23.4
  };

  const topCareers = [
    { name: 'Software Engineer', count: 342, percentage: 27.4 },
    { name: 'Data Scientist', count: 198, percentage: 15.9 },
    { name: 'Product Manager', count: 156, percentage: 12.5 },
    { name: 'UX Designer', count: 134, percentage: 10.7 },
    { name: 'Marketing Manager', count: 89, percentage: 7.1 }
  ];

  const recentUsers = [
    {
      id: 'usr_001',
      externalId: 'john.doe@company.com',
      assessmentsTaken: 2,
      lastAssessment: '2024-01-20',
      topCareer: 'Software Engineer',
      status: 'completed'
    },
    {
      id: 'usr_002',
      externalId: 'jane.smith@company.com',
      assessmentsTaken: 1,
      lastAssessment: '2024-01-19',
      topCareer: 'Data Scientist',
      status: 'in_progress'
    },
    {
      id: 'usr_003',
      externalId: 'mike.wilson@company.com',
      assessmentsTaken: 3,
      lastAssessment: '2024-01-18',
      topCareer: 'Product Manager',
      status: 'completed'
    }
  ];

  const handleExportData = () => {
    // Implementation for exporting user data
    console.log('Exporting user analytics data...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Analytics</h1>
          <p className="text-muted-foreground">Insights into your assessment users and their behavior</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{analyticsData.growthRate}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.avgSessionTime}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">+1m 12s</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Career Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Top Career Recommendations</CardTitle>
            <CardDescription>
              Most recommended careers from user assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCareers.map((career, index) => (
                <div key={career.name} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {career.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {career.count}
                      </p>
                    </div>
                    <Progress value={career.percentage} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Activity</CardTitle>
            <CardDescription>
              Daily assessment completions over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 border-2 border-dashed border-muted rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Interactive charts coming soon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>
            Latest users who have taken assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Assessments Taken</TableHead>
                <TableHead>Last Assessment</TableHead>
                <TableHead>Top Career Match</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-sm">
                    {user.externalId}
                  </TableCell>
                  <TableCell>{user.assessmentsTaken}</TableCell>
                  <TableCell>{user.lastAssessment}</TableCell>
                  <TableCell>{user.topCareer}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'completed' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}