
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const mockBarData = [
  {
    "sessionType": "Career Advice",
    "menteeCount": 45,
  },
  {
    "sessionType": "Resume Review",
    "menteeCount": 62,
  },
  {
    "sessionType": "Mock Interview",
    "menteeCount": 23,
  },
  {
    "sessionType": "Personal Branding",
    "menteeCount": 78,
  },
  {
    "sessionType": "Networking Tips",
    "menteeCount": 34,
  }
];

const mockLineData = [
  { "month": "Jan", "newMentees": 23 },
  { "month": "Feb", "newMentees": 45 },
  { "month": "Mar", "newMentees": 12 },
  { "month": "Apr", "newMentees": 56 },
  { "month": "May", "newMentees": 34 },
  { "month": "Jun", "newMentees": 67 },
  { "month": "Jul", "newMentees": 28 },
  { "month": "Aug", "newMentees": 51 },
  { "month": "Sep", "newMentees": 39 },
  { "month": "Oct", "newMentees": 62 },
  { "month": "Nov", "newMentees": 48 },
  { "month": "Dec", "newMentees": 71 }
];

const mockPieData = [
  {
    "name": "Positive",
    "value": 75,
    "color": "#10b981"
  },
  {
    "name": "Neutral",
    "value": 15,
    "color": "#f59e0b"
  },
  {
    "name": "Negative",
    "value": 10,
    "color": "#ef4444"
  }
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

interface MentorPerformanceTabProps {
  profileId: string;
}

export function MentorPerformanceTab({ profileId }: MentorPerformanceTabProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeFilter, setTimeFilter] = useState<"all" | "year" | "month" | "quarter">("month");
  
  // Mock stats data since the hook doesn't exist
  const stats = {
    totalMentees: 150,
    totalSessions: 320,
    averageRating: 4.7
  };
  const isLoading = false;
  const error = null;

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value as "all" | "year" | "month" | "quarter");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Mentor Performance Analytics</h2>
        <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Mentees</CardTitle>
                <CardDescription>Number of unique mentees</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {stats?.totalMentees || 0}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Sessions</CardTitle>
                <CardDescription>Number of sessions conducted</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {stats?.totalSessions || 0}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Rating</CardTitle>
                <CardDescription>Average feedback rating</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {stats?.averageRating?.toFixed(1) || 0}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Session Types</CardTitle>
              <CardDescription>Distribution of session types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sessionType" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="menteeCount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>New Mentees Over Time</CardTitle>
              <CardDescription>Number of new mentees acquired over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockLineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="newMentees" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Distribution</CardTitle>
              <CardDescription>Distribution of feedback ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
