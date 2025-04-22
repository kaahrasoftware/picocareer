
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
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { DateRangeFilter } from "@/components/admin/filters/DateRangeFilter";
import { startOfDay, endOfDay, format, subMonths } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

// Helper function to sanitize numeric values
const sanitizeNumber = (value: any, defaultValue = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return Number.isNaN(num) ? defaultValue : num;
};

export function MentorPerformanceTab() {
  const [timeRange, setTimeRange] = useState<"all" | "month" | "quarter" | "year">("all");
  const [sortMetric, setSortMetric] = useState<"sessions" | "rating" | "hours">("sessions");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch mentor performance data
  const { data: mentorData = [], isLoading } = useQuery({
    queryKey: ['mentor-performance', timeRange, startDate, endDate],
    queryFn: async () => {
      try {
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
          setError(`Error fetching mentors: ${error.message}`);
          return [];
        }
        
        // If no mentors found, return empty array to avoid processing
        if (!mentors || mentors.length === 0) {
          return [];
        }
        
        // Fetch additional statistics for each mentor
        const mentorsWithStats = await Promise.all(
          mentors.map(async (mentor) => {
            try {
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
              
              if (sessionsError) {
                console.error('Error fetching mentor sessions:', sessionsError);
              }
              
              if (feedbackError) {
                console.error('Error fetching feedback:', feedbackError);
              }

              const sessionsArray = sessions || [];
              const feedbackArray = feedback || [];
              
              const totalSessions = sanitizeNumber(sessionsArray.length);
              const completedSessions = sanitizeNumber(sessionsArray.filter(s => s.status === 'completed').length);
              const cancelledSessions = sanitizeNumber(sessionsArray.filter(s => s.status === 'cancelled').length);
              const noShowSessions = sanitizeNumber(feedbackArray.filter(f => f.did_not_show_up).length);
              
              // Calculate completion rate - ensure we don't divide by zero
              const completionRate = totalSessions > 0 
                ? Math.round((completedSessions / totalSessions) * 100) 
                : 0;

              // Calculate average rating - ensure we handle empty arrays and filter out null values
              const validRatings = feedbackArray
                .map(f => f.rating)
                .filter((rating): rating is number => rating != null && !isNaN(Number(rating)));
              
              const averageRating = validRatings.length > 0 
                ? Number((validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length).toFixed(1))
                : 0;

              // Count unique mentees - ensure we have an array to work with
              const menteeIds = sessionsArray.map(s => s.mentee_id).filter(Boolean);
              const uniqueMentees = new Set(menteeIds);
              
              // Calculate total hours - default to 0 if no data
              let totalHours = 0;
              if (sessionsArray.length > 0) {
                for (const session of sessionsArray) {
                  if (session.status === 'completed' && session.session_type_id) {
                    try {
                      const { data: sessionType } = await supabase
                        .from('mentor_session_types')
                        .select('duration')
                        .eq('id', session.session_type_id)
                        .single();
                        
                      if (sessionType && sessionType.duration) {
                        totalHours += sanitizeNumber(sessionType.duration) / 60;
                      }
                    } catch (error) {
                      console.error('Error fetching session duration:', error);
                    }
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
                total_hours: sanitizeNumber(Number(totalHours.toFixed(1)))
              };
            } catch (err) {
              console.error('Error processing mentor data:', err);
              // Return mentor with default values
              return {
                ...mentor,
                total_sessions: 0,
                completed_sessions: 0,
                cancelled_sessions: 0,
                no_show_sessions: 0,
                completion_rate: 0,
                average_rating: 0,
                total_mentees: 0,
                total_hours: 0
              };
            }
          })
        );
        
        // Sort data based on selected metric
        return mentorsWithStats.sort((a, b) => {
          if (sortMetric === "sessions") return sanitizeNumber(b.total_sessions) - sanitizeNumber(a.total_sessions);
          if (sortMetric === "rating") return sanitizeNumber(b.average_rating) - sanitizeNumber(a.average_rating);
          if (sortMetric === "hours") return sanitizeNumber(b.total_hours) - sanitizeNumber(a.total_hours);
          return 0;
        });
      } catch (err) {
        console.error('Error in mentor performance query:', err);
        setError('Error loading mentor performance data. Please try again later.');
        return [];
      }
    }
  });

  // Generate session trend data (for line chart) - safe fallback for empty data
  const generateSessionTrendData = (): SessionData[] => {
    // If we have actual data, we could transform it here
    // For now, use placeholder data that is guaranteed to be valid
    return Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      const month = format(date, 'MMM');
      return {
        month,
        sessions: Math.floor(Math.random() * 30) + 10 // Placeholder data (guaranteed to be a valid number)
      };
    });
  };

  const sessionTrendData = generateSessionTrendData();

  // Generate rating distribution data (for pie chart) with safe defaults
  const generateRatingDistribution = (): RatingDistribution[] => {
    const distribution = [
      { rating: 5, count: 0 },
      { rating: 4, count: 0 },
      { rating: 3, count: 0 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 },
    ];

    // Calculate rating distribution safely
    if (mentorData && mentorData.length > 0) {
      mentorData.forEach(mentor => {
        const rating = sanitizeNumber(mentor.average_rating);
        if (rating >= 4.5) distribution[0].count++;
        else if (rating >= 3.5) distribution[1].count++;
        else if (rating >= 2.5) distribution[2].count++;
        else if (rating >= 1.5) distribution[3].count++;
        else if (rating > 0) distribution[4].count++;
      });
    }

    return distribution;
  };

  const ratingDistribution = generateRatingDistribution();

  // Only use the pie chart data if there's actual data to display
  const validRatingData = ratingDistribution.filter(item => item.count > 0);

  // Get performance statistics with safe defaults
  const calculateStatistics = () => {
    if (!mentorData || mentorData.length === 0) {
      return {
        totalMentors: 0,
        totalSessions: 0,
        averageRating: '0.0',
        totalHours: '0.0',
        completionRate: 0,
        qoqGrowth: 0
      };
    }

    const totalMentors = mentorData.length;
    const totalSessions = mentorData.reduce((sum, mentor) => sum + sanitizeNumber(mentor.total_sessions), 0);
    
    let avgRating = 0;
    if (totalMentors > 0) {
      const ratingSum = mentorData.reduce((sum, mentor) => sum + sanitizeNumber(mentor.average_rating), 0);
      avgRating = ratingSum / totalMentors;
    }
    
    const totalHours = mentorData.reduce((sum, mentor) => sum + sanitizeNumber(mentor.total_hours), 0);
    
    let completionRate = 0;
    if (totalMentors > 0) {
      const rateSum = mentorData.reduce((sum, mentor) => sum + sanitizeNumber(mentor.completion_rate), 0);
      completionRate = Math.round(rateSum / totalMentors);
    }

    return {
      totalMentors,
      totalSessions,
      averageRating: isNaN(avgRating) ? '0.0' : avgRating.toFixed(1),
      totalHours: isNaN(totalHours) ? '0.0' : totalHours.toFixed(1),
      completionRate: isNaN(completionRate) ? 0 : completionRate,
      qoqGrowth: 15 // Placeholder
    };
  };

  const statistics = calculateStatistics();

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
          <div className="font-medium">{sanitizeNumber(row.original.total_sessions)}</div>
          <div className="text-xs text-muted-foreground">
            {sanitizeNumber(row.original.completed_sessions)} completed
          </div>
        </div>
      ),
    },
    {
      accessorKey: "completion_rate",
      header: "Completion Rate",
      cell: ({ row }) => {
        const rate = sanitizeNumber(row.original.completion_rate);
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
        const rating = sanitizeNumber(row.original.average_rating);
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
        <div className="font-medium">{sanitizeNumber(row.original.total_mentees)}</div>
      ),
    },
    {
      accessorKey: "total_hours",
      header: "Hours",
      cell: ({ row }) => (
        <div className="font-medium">{sanitizeNumber(row.original.total_hours)}</div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => {
        try {
          return new Date(row.original.created_at).toLocaleDateString();
        } catch (err) {
          return "Invalid date";
        }
      },
    },
  ];

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Determine if we have enough data to show charts
  const hasEnoughData = mentorData && mentorData.length > 0;

  // Show error if present
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

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
                      +{statistics.qoqGrowth}%
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
                    {hasEnoughData ? (
                      <LineChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          allowDataOverflow={false}
                        />
                        <YAxis 
                          allowDecimals={false}
                          domain={[0, 'auto']}
                        />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="sessions" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                          isAnimationActive={false}
                          data={sessionTrendData}
                        />
                      </LineChart>
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        Not enough data to display chart
                      </div>
                    )}
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
                    {validRatingData.length > 0 ? (
                      <PieChart>
                        <Pie
                          data={validRatingData}
                          dataKey="count"
                          nameKey="rating"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ rating }) => `${rating} ★`}
                          isAnimationActive={false}
                        >
                          {validRatingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} mentors`, `${name} stars`]} />
                        <Legend />
                      </PieChart>
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No rating data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Mentor Table */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Mentor Rankings</h3>
              {mentorData && mentorData.length > 0 ? (
                <DataTable columns={columns} data={mentorData} />
              ) : (
                <div className="text-center p-8 border rounded text-muted-foreground">
                  No mentor data available for the selected filters
                </div>
              )}
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
                  {hasEnoughData && mentorData.length > 0 ? (
                    <BarChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number"
                        domain={[0, 100]}
                        allowDataOverflow={false}
                      />
                      <YAxis 
                        dataKey="full_name" 
                        type="category" 
                        width={100} 
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                      <Legend />
                      <Bar 
                        dataKey="completion_rate" 
                        fill="#8884d8" 
                        name="Completion Rate (%)"
                        isAnimationActive={false}
                        data={mentorData.slice(0, 10).map(mentor => ({
                          full_name: mentor.full_name || "Unknown",
                          completion_rate: sanitizeNumber(mentor.completion_rate)
                        }))}
                      />
                    </BarChart>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      Not enough data to display chart
                    </div>
                  )}
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
