import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Clock, Users, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalAssessments: number;
  avgResponseTime: number;
  totalDataTransfer: number;
  topOrganizations: {
    name: string;
    requests: number;
    assessments: number;
  }[];
  recentErrors: {
    endpoint: string;
    error: string;
    count: number;
  }[];
  usageByEndpoint: {
    endpoint: string;
    requests: number;
    avgResponseTime: number;
  }[];
}

interface Organization {
  id: string;
  name: string;
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([fetchAnalytics(), fetchOrganizations()]);
  }, [selectedOrg, timeRange]);

  const fetchAnalytics = async () => {
    try {
      // Fetch usage aggregates
      const { data: aggregates, error: aggregatesError } = await supabase
        .from('api_usage_aggregates')
        .select('*')
        .order('date_period', { ascending: false })
        .limit(30);

      if (aggregatesError) throw aggregatesError;

      // Fetch recent logs for error analysis
      const { data: logs, error: logsError } = await supabase
        .from('api_usage_logs')
        .select('endpoint, status_code, error_message, response_time_ms, created_at')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (logsError) throw logsError;

      // Process analytics data
      const processedData = processAnalyticsData(aggregates || [], logs || []);
      setAnalytics(processedData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('api-organizations');
      
      if (error) throw error;
      
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const processAnalyticsData = (aggregates: any[], logs: any[]): AnalyticsData => {
    // Calculate totals from aggregates
    const totalRequests = aggregates.reduce((sum, agg) => sum + (agg.total_requests || 0), 0);
    const successfulRequests = aggregates.reduce((sum, agg) => sum + (agg.successful_requests || 0), 0);
    const failedRequests = aggregates.reduce((sum, agg) => sum + (agg.failed_requests || 0), 0);
    const totalAssessments = aggregates.reduce((sum, agg) => sum + (agg.total_assessments || 0), 0);
    const avgResponseTime = aggregates.length > 0 
      ? aggregates.reduce((sum, agg) => sum + (agg.avg_response_time_ms || 0), 0) / aggregates.length 
      : 0;
    const totalDataTransfer = aggregates.reduce((sum, agg) => sum + (agg.total_data_transfer_bytes || 0), 0);

    // Process endpoint usage
    const endpointUsage = logs.reduce((acc: any, log) => {
      const endpoint = log.endpoint;
      if (!acc[endpoint]) {
        acc[endpoint] = { requests: 0, totalResponseTime: 0, count: 0 };
      }
      acc[endpoint].requests++;
      if (log.response_time_ms) {
        acc[endpoint].totalResponseTime += log.response_time_ms;
        acc[endpoint].count++;
      }
      return acc;
    }, {});

    const usageByEndpoint = Object.entries(endpointUsage).map(([endpoint, data]: [string, any]) => ({
      endpoint,
      requests: data.requests,
      avgResponseTime: data.count > 0 ? data.totalResponseTime / data.count : 0
    })).sort((a, b) => b.requests - a.requests);

    // Process errors
    const errorCounts = logs
      .filter(log => log.status_code >= 400 && log.error_message)
      .reduce((acc: any, log) => {
        const key = `${log.endpoint}:${log.error_message}`;
        if (!acc[key]) {
          acc[key] = { endpoint: log.endpoint, error: log.error_message, count: 0 };
        }
        acc[key].count++;
        return acc;
      }, {});

    const recentErrors = Object.values(errorCounts)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5) as any[];

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      totalAssessments,
      avgResponseTime,
      totalDataTransfer,
      topOrganizations: [], // Would need organization join to populate
      recentErrors,
      usageByEndpoint: usageByEndpoint.slice(0, 10)
    };
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-8">No analytics data available</div>;
  }

  const successRate = analytics.totalRequests > 0 
    ? (analytics.successfulRequests / analytics.totalRequests) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex space-x-4">
        <Select value={selectedOrg} onValueChange={setSelectedOrg}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Organizations</SelectItem>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalRequests)}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant={successRate > 95 ? "default" : "destructive"}>
                {successRate.toFixed(1)}% success rate
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalAssessments)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalRequests > 0 
                ? `${((analytics.totalAssessments / analytics.totalRequests) * 100).toFixed(1)}% conversion`
                : 'No data'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.avgResponseTime)}ms</div>
            <Progress 
              value={Math.min((analytics.avgResponseTime / 1000) * 100, 100)} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Transfer</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(analytics.totalDataTransfer)}</div>
            <p className="text-xs text-muted-foreground">
              Total bandwidth used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Usage */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint Usage</CardTitle>
          <CardDescription>Most frequently used endpoints and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.usageByEndpoint.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{endpoint.endpoint}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatNumber(endpoint.requests)} requests • {Math.round(endpoint.avgResponseTime)}ms avg
                  </div>
                </div>
                <div className="w-24">
                  <Progress 
                    value={(endpoint.requests / analytics.usageByEndpoint[0]?.requests || 1) * 100} 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Analysis */}
      {analytics.recentErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span>Recent Errors</span>
            </CardTitle>
            <CardDescription>Most common errors in the selected time period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentErrors.map((error, index) => (
                <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{error.endpoint}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {error.error}
                    </div>
                  </div>
                  <Badge variant="destructive">
                    {error.count} times
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request/Response Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Success vs Errors</CardTitle>
            <CardDescription>Request outcome distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Successful</span>
                </div>
                <div className="text-sm font-medium">
                  {formatNumber(analytics.successfulRequests)} ({successRate.toFixed(1)}%)
                </div>
              </div>
              <Progress value={successRate} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Failed</span>
                </div>
                <div className="text-sm font-medium">
                  {formatNumber(analytics.failedRequests)} ({(100 - successRate).toFixed(1)}%)
                </div>
              </div>
              <Progress value={100 - successRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Fast responses (&lt;200ms)</span>
                <Badge variant="default">
                  {analytics.avgResponseTime < 200 ? 'Good' : 'Needs improvement'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Error rate</span>
                <Badge variant={successRate > 99 ? "default" : successRate > 95 ? "secondary" : "destructive"}>
                  {successRate > 99 ? 'Excellent' : successRate > 95 ? 'Good' : 'Poor'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Assessment completion rate</span>
                <Badge variant="secondary">
                  {analytics.totalRequests > 0 
                    ? `${((analytics.totalAssessments / analytics.totalRequests) * 100).toFixed(1)}%`
                    : 'N/A'
                  }
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}