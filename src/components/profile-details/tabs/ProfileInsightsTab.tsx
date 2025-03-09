
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Users, Clock, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileInsightsTabProps {
  profileId: string;
}

export function ProfileInsightsTab({ profileId }: ProfileInsightsTabProps) {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['profile-insights', profileId],
    queryFn: async () => {
      // First get the mentor's session data
      const { data: sessions, error: sessionError } = await supabase
        .from('mentor_sessions')
        .select('*')
        .eq('mentor_id', profileId);
      
      if (sessionError) throw sessionError;
      
      // Get feedback data
      const { data: feedback, error: feedbackError } = await supabase
        .from('session_feedback')
        .select('*')
        .eq('to_profile_id', profileId);
      
      if (feedbackError) throw feedbackError;
      
      // Calculate insights
      const totalSessions = sessions?.length || 0;
      const completedSessions = sessions?.filter(s => s.status === 'completed')?.length || 0;
      
      // Aggregate ratings
      let totalRating = 0;
      const validRatings = feedback?.filter(f => f.rating !== null) || [];
      validRatings.forEach(f => {
        totalRating += f.rating || 0;
      });
      const averageRating = validRatings.length > 0 ? totalRating / validRatings.length : 0;
      
      // Calculate session months for chart
      const monthlySessionsMap = new Map();
      const last6Months = Array.from({length: 6}, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toLocaleString('default', { month: 'short' });
      }).reverse();
      
      last6Months.forEach(month => {
        monthlySessionsMap.set(month, 0);
      });
      
      sessions?.forEach(session => {
        const date = new Date(session.created_at);
        const month = date.toLocaleString('default', { month: 'short' });
        if (monthlySessionsMap.has(month)) {
          monthlySessionsMap.set(month, monthlySessionsMap.get(month) + 1);
        }
      });
      
      const sessionChartData = Array.from(monthlySessionsMap.entries()).map(([month, count]) => ({
        month,
        sessions: count
      }));
      
      return {
        totalSessions,
        completedSessions,
        averageRating,
        totalFeedback: validRatings.length,
        sessionChartData
      };
    },
    enabled: !!profileId
  });

  return (
    <ScrollArea className="h-full">
      <div className="px-1 sm:px-2 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {isLoading ? (
            <>
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Total Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{insights?.totalSessions || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    Completed Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{insights?.completedSessions || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Average Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {insights?.averageRating ? insights.averageRating.toFixed(1) : '0.0'}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({insights?.totalFeedback || 0} reviews)
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-purple-500" />
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {insights?.totalSessions 
                      ? Math.round((insights.completedSessions / insights.totalSessions) * 100)
                      : 0}%
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Session Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={insights?.sessionChartData || []}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    formatter={(value) => [`${value} sessions`, 'Sessions']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="sessions" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
