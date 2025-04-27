import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MentorRankingsTab } from "./MentorRankingsTab";
import { format, subMonths } from "date-fns";
import type { MentorPerformanceData } from "./types";

const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];
const STATUS_COLORS = {
  high: "text-green-500",
  medium: "text-yellow-500",
  low: "text-red-500"
};

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
  const [error, setError] = useState<string | null>(null);

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
          query = query.gte('created_at', new Date(startDate.setHours(0, 0, 0, 0)).toISOString());
        }

        if (endDate) {
          query = query.lte('created_at', new Date(endDate.setHours(23, 59, 59, 999)).toISOString());
        }

        const { data: mentors, error } = await query;

        if (error) {
          console.error('Error fetching mentors:', error);
          setError(`Error fetching mentors: ${error.message}`);
          return [];
        }
        
        if (!mentors || mentors.length === 0) {
          return [];
        }
        
        const mentorsWithStats = await Promise.all(
          mentors.map(async (mentor) => {
            try {
              const { data: sessions } = await supabase
                .from('mentor_sessions')
                .select('*')
                .eq('mentor_id', mentor.id);

              const { data: feedback } = await supabase
                .from('session_feedback')
                .select('*')
                .eq('to_profile_id', mentor.id)
                .eq('feedback_type', 'mentee_feedback');
              
              const sessionsArray = sessions || [];
              const feedbackArray = feedback || [];
              
              const totalSessions = sanitizeNumber(sessionsArray.length);
              const completedSessions = sanitizeNumber(sessionsArray.filter(s => s.status === 'completed').length);
              const cancelledSessions = sanitizeNumber(sessionsArray.filter(s => s.status === 'cancelled').length);
              const noShowSessions = sanitizeNumber(feedbackArray.filter(f => f.did_not_show_up).length);
              
              const validRatings = feedbackArray
                .map(f => f.rating)
                .filter((rating): rating is number => 
                  rating != null && !isNaN(Number(rating)) && rating > 0
                );
              
              const averageRating = validRatings.length > 0 
                ? Number((validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length).toFixed(1))
                : undefined;
              
              const menteeIds = sessionsArray.map(s => s.mentee_id).filter(Boolean);
              const uniqueMentees = new Set(menteeIds);
              
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
                completion_rate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
                average_rating: averageRating,
                has_ratings: validRatings.length > 0,
                total_ratings: validRatings.length,
                total_mentees: uniqueMentees.size,
                total_hours: sanitizeNumber(Number(totalHours.toFixed(1)))
              };
            } catch (err) {
              console.error('Error processing mentor data:', err);
              return {
                ...mentor,
                total_sessions: 0,
                completed_sessions: 0,
                cancelled_sessions: 0,
                no_show_sessions: 0,
                completion_rate: 0,
                average_rating: undefined,
                has_ratings: false,
                total_ratings: 0,
                total_mentees: 0,
                total_hours: 0
              };
            }
          })
        );
        
        return mentorsWithStats.sort((a, b) => {
          if (sortMetric === "sessions") return b.total_sessions - a.total_sessions;
          if (sortMetric === "rating") {
            if (a.average_rating === undefined && b.average_rating === undefined) return 0;
            if (a.average_rating === undefined) return 1;
            if (b.average_rating === undefined) return -1;
            return b.average_rating - a.average_rating;
          }
          if (sortMetric === "hours") return b.total_hours - a.total_hours;
          return 0;
        });
      } catch (err) {
        console.error('Error in mentor performance query:', err);
        setError('Error loading mentor performance data. Please try again later.');
        return [];
      }
    }
  });

  const generateSessionTrendData = (): { month: string; sessions: number }[] => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      const month = format(date, 'MMM');
      return {
        month,
        sessions: Math.floor(Math.random() * 30) + 10
      };
    });
  };

  const sessionTrendData = generateSessionTrendData();

  const generateRatingDistribution = (): { rating: number; count: number }[] => {
    const distribution = [
      { rating: 5, count: 0 },
      { rating: 4, count: 0 },
      { rating: 3, count: 0 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 },
    ];

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

  const validRatingData = ratingDistribution.filter(item => item.count > 0);

  const calculateStatistics = () => {
    if (!mentorData || mentorData.length === 0) {
      return {
        totalMentors: 0,
        ratedMentors: 0,
        totalSessions: 0,
        averageRating: '0.0',
        totalHours: '0.0',
        completionRate: 0,
        qoqGrowth: 0
      };
    }

    const totalMentors = mentorData.length;
    const ratedMentors = mentorData.filter(mentor => mentor.has_ratings).length;
    const totalSessions = mentorData.reduce((sum, mentor) => sum + mentor.total_sessions, 0);
    
    const mentorsWithRatings = mentorData.filter(mentor => mentor.has_ratings);
    let avgRating = 0;
    if (mentorsWithRatings.length > 0) {
      const ratingSum = mentorsWithRatings.reduce((sum, mentor) => 
        sum + (mentor.average_rating || 0), 0);
      avgRating = ratingSum / mentorsWithRatings.length;
    }
    
    const totalHours = mentorData.reduce((sum, mentor) => sum + mentor.total_hours, 0);
    
    let completionRate = 0;
    if (totalMentors > 0) {
      const rateSum = mentorData.reduce((sum, mentor) => sum + mentor.completion_rate, 0);
      completionRate = Math.round(rateSum / totalMentors);
    }

    return {
      totalMentors,
      ratedMentors,
      totalSessions,
      averageRating: isNaN(avgRating) ? '0.0' : avgRating.toFixed(1),
      totalHours: isNaN(totalHours) ? '0.0' : totalHours.toFixed(1),
      completionRate: isNaN(completionRate) ? 0 : completionRate,
      qoqGrowth: 15
    };
  };

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  const statistics = calculateStatistics();

  const hasEnoughData = mentorData && mentorData.length > 0;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="rankings">Mentor Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Mentor Performance</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
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
                    Rated Mentors
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">{statistics.ratedMentors}</div>
                    <Star className="h-5 w-5 text-muted-foreground" />
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
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
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

              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    {mentorData.filter(m => m.has_ratings).length > 0 ? (
                      <PieChart>
                        <Pie
                          data={ratingDistribution.filter(item => item.count > 0)}
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
          </Card>
        </TabsContent>

        <TabsContent value="rankings">
          <MentorRankingsTab 
            mentorData={mentorData || []}
            isLoading={isLoading}
            timeRange={timeRange}
            sortMetric={sortMetric}
            onTimeRangeChange={setTimeRange}
            onSortMetricChange={setSortMetric}
            onDateRangeChange={handleDateRangeChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
