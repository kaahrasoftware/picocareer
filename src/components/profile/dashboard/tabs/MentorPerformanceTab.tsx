
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import {
  Bar,
  Line,
  Pie,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ChevronUp, 
  ChevronDown, 
  Calendar, 
  Users, 
  Clock, 
  Star, 
  TrendingUp 
} from "lucide-react";
import { useState } from "react";
import { DateRangeFilter } from "@/components/admin/filters/DateRangeFilter";
import { startOfDay, endOfDay, format, subMonths } from "date-fns";

interface MentorPerformanceData {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  total_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  no_show_sessions: number;
  completion_rate: number;
  average_rating: number;
  total_mentees: number;
  total_hours: number;
  created_at: string;
}

interface SessionData {
  month: string;
  sessions: number;
}

interface RatingDistribution {
  rating: number;
  count: number;
}

const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];
const STATUS_COLORS = {
  high: "text-green-500",
  medium: "text-yellow-500",
  low: "text-red-500"
};

export function MentorPerformanceTab() {
  const [timeRange, setTimeRange] = useState<"all" | "month" | "quarter" | "year">("all");
  const [sortMetric, setSortMetric] = useState<"sessions" | "rating" | "hours">("sessions");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);

  // Fetch mentor performance data
  const { data: mentorData = [], isLoading } = useQuery({
    queryKey: ['mentor-performance', timeRange, startDate, endDate],
    queryFn: async () => {
      console.log('Fetching mentor performance data with filters:', { timeRange, startDate, endDate });
      
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          avatar_url,
          created_at
        `)
        .eq('user_type', 'mentor');

      if (startDate) {
        query = query.gte('created_at', startOfDay(startDate).toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endOfDay(endDate).toISOString());
      }

      const { data: mentors, error } = await query;

      if (error) {
        console.error('Error fetching mentors:', error);
        throw error;
      }
      
      // Fetch additional statistics for each mentor
      const mentorsWithStats = await Promise.all(
        mentors.map(async (mentor) => {
          // Get sessions data
          const { data: sessions, error: sessionsError } = await supabase
            .from('mentor_sessions')
            .select('*')
            .eq('mentor_id', mentor.id);

          // Get feedback data
          const { data: feedback, error: feedbackError } = await supabase
            .from('session_feedback')
            .select('*')
            .eq('to_profile_id', mentor.id)
            .eq('feedback_type', 'mentee_feedback');
          
          if (sessionsError || feedbackError) {
            console.error('Error fetching mentor stats:', sessionsError || feedbackError);
          }

          const totalSessions = sessions?.length || 0;
          const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0;
          const cancelledSessions = sessions?.filter(s => s.status === 'cancelled').length || 0;
          const noShowSessions = feedback?.filter(f => f.did_not_show_up).length || 0;
          
          // Calculate completion rate
          const completionRate = totalSessions > 0 
            ? Math.round((completedSessions / totalSessions) * 100) 
            : 0;

          // Calculate average rating
          const ratings = feedback?.map(f => f.rating).filter(Boolean) || [];
          const averageRating = ratings.length > 0 
            ? Number((ratings.reduce((sum, rating) => sum + Number(rating), 0) / ratings.length).toFixed(1))
            : 0;

          // Count unique mentees
          const uniqueMentees = new Set(sessions?.map(s => s.mentee_id) || []);
          
          // Calculate total hours (assuming duration is stored in minutes in the session_type)
          let totalHours = 0;
          if (sessions) {
            for (const session of sessions) {
              const { data: sessionType } = await supabase
                .from('mentor_session_types')
                .select('duration')
                .eq('id', session.session_type_id)
                .single();
                
              if (sessionType && session.status === 'completed') {
                totalHours += (sessionType.duration || 0) / 60;
              }
            }
          }

          return {
            ...mentor,
            total_sessions: totalSessions,
            completed_sessions: completedSessions,
            cancelled_sessions: cancelledSessions,
            no_show_sessions: noShowSessions,
            completion_rate: completionRate,
            average_rating: averageRating,
            total_mentees: uniqueMentees.size,
            total_hours: Number(totalHours.toFixed(1))
          };
        })
      );
      
      // Sort data based on selected metric
      return mentorsWithStats.sort((a, b) => {
        if (sortMetric === "sessions") return b.total_sessions - a.total_sessions;
        if (sortMetric === "rating") return b.average_rating - a.average_rating;
        if (sortMetric === "hours") return b.total_hours - a.total_hours;
        return 0;
      });
    }
  });

  // Generate session trend data (for line chart)
  const sessionTrendData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const month = format(date, 'MMM');
    return {
      month,
      sessions: Math.floor(Math.random() * 30) + 10 // Placeholder data
    };
  });

  // Generate rating distribution data (for pie chart)
  const ratingDistribution: RatingDistribution[] = [
    { rating: 5, count: 0 },
    { rating: 4, count: 0 },
    { rating: 3, count: 0 },
    { rating: 2, count: 0 },
    { rating: 1, count: 0 },
  ];

  // Calculate rating distribution
  if (mentorData) {
    mentorData.forEach(mentor => {
      if (mentor.average_rating >= 4.5) ratingDistribution[0].count++;
      else if (mentor.average_rating >= 3.5) ratingDistribution[1].count++;
      else if (mentor.average_rating >= 2.5) ratingDistribution[2].count++;
      else if (mentor.average_rating >= 1.5) ratingDistribution[3].count++;
      else if (mentor.average_rating > 0) ratingDistribution[4].count++;
    });
  }

  // Get performance statistics
  const statistics = {
    totalMentors: mentorData.length,
    totalSessions: mentorData.reduce((sum, mentor) => sum + mentor.total_sessions, 0),
    averageRating: mentorData.length ? 
      (mentorData.reduce((sum, mentor) => sum + mentor.average_rating, 0) / mentorData.length).toFixed(1) : 
      '0.0',
    totalHours: mentorData.reduce((sum, mentor) => sum + mentor.total_hours, 0).toFixed(1),
    completionRate: mentorData.length ? 
      Math.round(mentorData.reduce((sum, mentor) => sum + mentor.completion_rate, 0) / mentorData.length) : 
      0
  };

  // Calculate quarter-over-quarter growth (placeholder)
  const qoqGrowth = 15; // Placeholder 15% growth

  // Table columns definition
  const columns = [
    {
      accessorKey: "full_name",
      header: "Mentor",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <img 
              src={row.original.avatar_url || "https://via.placeholder.com/40"} 
              alt={row.original.full_name || ""}
            />
          </Avatar>
          <div>
            <div className="font-medium">{row.original.full_name}</div>
            <div className="text-xs text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "total_sessions",
      header: "Sessions",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.total_sessions}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.completed_sessions} completed
          </div>
        </div>
      ),
    },
    {
      accessorKey: "completion_rate",
      header: "Completion Rate",
      cell: ({ row }) => {
        const rate = row.original.completion_rate;
        let statusColor = STATUS_COLORS.medium;
        if (rate >= 85) statusColor = STATUS_COLORS.high;
        if (rate < 70) statusColor = STATUS_COLORS.low;
        
        return (
          <div className={`font-medium ${statusColor}`}>
            {rate}%
          </div>
        );
      },
    },
    {
      accessorKey: "average_rating",
      header: "Rating",
      cell: ({ row }) => {
        const rating = row.original.average_rating;
        let statusColor = STATUS_COLORS.medium;
        if (rating >= 4.5) statusColor = STATUS_COLORS.high;
        if (rating < 3.5) statusColor = STATUS_COLORS.low;
        
        return (
          <div className="flex items-center">
            <Star className={`h-4 w-4 mr-1 ${statusColor}`} />
            <span className={`font-medium ${statusColor}`}>{rating}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "total_mentees",
      header: "Mentees",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.total_mentees}</div>
      ),
    },
    {
      accessorKey: "total_hours",
      header: "Hours",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.total_hours}</div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
  ];

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="analytics">Detailed Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Mentor Performance</h2>
              <div className="flex gap-3">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortMetric} onValueChange={setSortMetric}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sessions">Total Sessions</SelectItem>
                    <SelectItem value="rating">Average Rating</SelectItem>
                    <SelectItem value="hours">Total Hours</SelectItem>
                  </SelectContent>
                </Select>

                <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Mentors
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">{statistics.totalMentors}</div>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">{statistics.totalSessions}</div>
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average Rating
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-2xl font-bold">
                      {statistics.averageRating}
                      <Star className="h-4 w-4 text-yellow-400 ml-1" />
                    </div>
                    <Star className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">{statistics.totalHours}</div>
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    QoQ Growth
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-green-500">
                      +{qoqGrowth}%
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Session Trend (Line Chart) */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Session Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sessionTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="sessions" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Rating Distribution (Pie Chart) */}
              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ratingDistribution.filter(item => item.count > 0)}
                          dataKey="count"
                          nameKey="rating"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ rating }) => `${rating} ★`}
                        >
                          {ratingDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} mentors`, `${name} stars`]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Mentor Table */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Mentor Rankings</h3>
              {mentorData && <DataTable columns={columns} data={mentorData} />}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Detailed Analytics</h2>
            </div>
            
            <div className="space-y-6">
              {/* Completion Rate by Mentor (Bar Chart) */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Completion Rate by Mentor</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={mentorData.slice(0, 10)} 
                      layout="vertical" 
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis 
                        dataKey="full_name" 
                        type="category" 
                        width={100} 
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                      <Legend />
                      <Bar dataKey="completion_rate" fill="#8884d8" name="Completion Rate (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* More analytics would be added here */}
              <div className="p-8 border rounded-lg text-center text-muted-foreground">
                Additional analytics visualizations coming soon...
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
