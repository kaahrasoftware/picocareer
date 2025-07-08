import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, Clock, Target, Download, Filter,
  Activity, Zap, Globe, AlertCircle
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalSessions: number;
    completedAssessments: number;
    completionRate: number;
    averageResponseTime: number;
    activeOrganizations: number;
    apiCalls: number;
  };
  trends: Array<{
    date: string;
    sessions: number;
    completions: number;
    apiCalls: number;
  }>;
  performance: Array<{
    endpoint: string;
    avgResponseTime: number;
    successRate: number;
    calls: number;
  }>;
  organizations: Array<{
    id: string;
    name: string;
    sessions: number;
    completions: number;
    lastActivity: string;
    tier: string;
  }>;
  userJourney: Array<{
    step: string;
    users: number;
    dropoffRate: number;
  }>;
  topCareers: Array<{
    career: string;
    count: number;
    percentage: number;
  }>;
}

export function AdvancedAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedOrg, setSelectedOrg] = useState("all");

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, selectedOrg]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      setData({
        overview: {
          totalSessions: 1248,
          completedAssessments: 1067,
          completionRate: 85.5,
          averageResponseTime: 240,
          activeOrganizations: 12,
          apiCalls: 15432
        },
        trends: [
          { date: "2024-01-01", sessions: 45, completions: 38, apiCalls: 234 },
          { date: "2024-01-02", sessions: 52, completions: 44, apiCalls: 287 },
          { date: "2024-01-03", sessions: 48, completions: 41, apiCalls: 256 },
          { date: "2024-01-04", sessions: 61, completions: 52, apiCalls: 312 },
          { date: "2024-01-05", sessions: 58, completions: 49, apiCalls: 298 },
          { date: "2024-01-06", sessions: 65, completions: 56, apiCalls: 334 },
          { date: "2024-01-07", sessions: 72, completions: 63, apiCalls: 367 }
        ],
        performance: [
          { endpoint: "/api-assessments", avgResponseTime: 180, successRate: 99.2, calls: 8932 },
          { endpoint: "/api-results", avgResponseTime: 220, successRate: 98.8, calls: 6500 },
          { endpoint: "/api-organizations", avgResponseTime: 95, successRate: 99.8, calls: 234 },
          { endpoint: "/api-keys", avgResponseTime: 105, successRate: 99.5, calls: 456 }
        ],
        organizations: [
          { id: "1", name: "EduTech Corp", sessions: 234, completions: 198, lastActivity: "2024-01-08T10:30:00Z", tier: "Professional" },
          { id: "2", name: "Career Institute", sessions: 189, completions: 162, lastActivity: "2024-01-08T09:15:00Z", tier: "Enterprise" },
          { id: "3", name: "University of Tech", sessions: 156, completions: 134, lastActivity: "2024-01-08T08:45:00Z", tier: "Basic" }
        ],
        userJourney: [
          { step: "Session Created", users: 1248, dropoffRate: 0 },
          { step: "Assessment Started", users: 1156, dropoffRate: 7.4 },
          { step: "50% Complete", users: 1089, dropoffRate: 5.8 },
          { step: "Assessment Completed", users: 1067, dropoffRate: 2.0 },
          { step: "Results Viewed", users: 1034, dropoffRate: 3.1 }
        ],
        topCareers: [
          { career: "Software Engineer", count: 234, percentage: 21.9 },
          { career: "Data Scientist", count: 189, percentage: 17.7 },
          { career: "Product Manager", count: 156, percentage: 14.6 },
          { career: "UX Designer", count: 134, percentage: 12.6 },
          { career: "Marketing Manager", count: 112, percentage: 10.5 }
        ]
      });
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // Implementation for exporting analytics data
    console.log("Exporting analytics data...");
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center h-64">Failed to load analytics data</div>;
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">
            Deep insights into API usage and assessment performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{data.overview.totalSessions.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completions</p>
                <p className="text-2xl font-bold">{data.overview.completedAssessments.toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{data.overview.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{data.overview.averageResponseTime}ms</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Orgs</p>
                <p className="text-2xl font-bold">{data.overview.activeOrganizations}</p>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">API Calls</p>
                <p className="text-2xl font-bold">{data.overview.apiCalls.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">Usage Trends</TabsTrigger>
          <TabsTrigger value="performance">API Performance</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="user-journey">User Journey</TabsTrigger>
          <TabsTrigger value="insights">Career Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends Over Time</CardTitle>
              <CardDescription>Sessions, completions, and API calls</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="sessions" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="completions" stackId="2" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Calls Trend</CardTitle>
              <CardDescription>Daily API call volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="apiCalls" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint Performance</CardTitle>
              <CardDescription>Response times and success rates by endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.performance.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-medium">{endpoint.endpoint}</code>
                        <Badge variant={endpoint.successRate >= 99 ? "default" : "destructive"}>
                          {endpoint.successRate}% success
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>Response Time</span>
                          <span>{endpoint.avgResponseTime}ms</span>
                        </div>
                        <Progress value={(endpoint.avgResponseTime / 500) * 100} className="h-2" />
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-semibold">{endpoint.calls.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">calls</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Time Distribution</CardTitle>
              <CardDescription>Average response times by endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="endpoint" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgResponseTime" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Usage</CardTitle>
              <CardDescription>Assessment activity by organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.organizations.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{org.name}</h4>
                        <Badge variant="outline">{org.tier}</Badge>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Last activity: {new Date(org.lastActivity).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{org.sessions}</div>
                      <div className="text-sm text-muted-foreground">sessions</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-semibold">{org.completions}</div>
                      <div className="text-sm text-muted-foreground">completions</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-semibold">
                        {((org.completions / org.sessions) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-journey" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment User Journey</CardTitle>
              <CardDescription>User progression through the assessment flow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.userJourney.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{step.step}</h4>
                          <div className="text-sm text-muted-foreground">
                            {step.users.toLocaleString()} users
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {step.dropoffRate > 0 && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium text-yellow-600">
                              {step.dropoffRate}% drop-off
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {index < data.userJourney.length - 1 && (
                      <div className="ml-4 w-px h-4 bg-border"></div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Visual representation of user progression</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.userJourney} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="step" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="users" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Career Recommendations</CardTitle>
              <CardDescription>Most frequently recommended careers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {data.topCareers.map((career, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">{career.career}</div>
                        <div className="text-sm text-muted-foreground">
                          {career.count} recommendations
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={career.percentage} className="w-20 h-2" />
                        <span className="text-sm font-medium w-12">
                          {career.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={data.topCareers}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ career, percentage }) => `${career}: ${percentage}%`}
                      >
                        {data.topCareers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}