
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MemberGrowth, AnalyticsSummary } from '@/types/database/analytics';
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';
import { MemberActivityList } from './MemberActivityList';
import { EngagementMetrics } from './EngagementMetrics';
import { format, subDays, subWeeks, subMonths, subYears, startOfDay, endOfDay, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, eachYearOfInterval, endOfMonth, endOfWeek, endOfYear } from 'date-fns';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface HubAnalyticsProps {
  hubId: string;
}

type TimePeriod = 'day' | 'week' | 'month' | 'year';

export function HubAnalytics({ hubId }: HubAnalyticsProps) {
  const [memberGrowth, setMemberGrowth] = useState<MemberGrowth[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalMembers: 0,
    activeMembers: 0,
    resourceCount: 0,
    announcementCount: 0
  });
  const { toast } = useToast();

  const getTimeRangeFilter = (period: TimePeriod) => {
    const now = new Date();
    switch (period) {
      case 'day':
        return subDays(now, 29); // Last 30 days including today
      case 'week':
        return subWeeks(now, 11); // Last 12 weeks including current week
      case 'month':
        return subMonths(now, 11); // Last 12 months including current month
      case 'year':
        return subYears(now, 4); // Last 5 years including current year
      default:
        return subMonths(now, 11);
    }
  };

  const formatDate = (date: string, period: TimePeriod) => {
    switch (period) {
      case 'day':
        return format(new Date(date), 'MMM d');
      case 'week':
        return format(new Date(date), 'MMM d');
      case 'month':
        return format(new Date(date), 'MMM yyyy');
      case 'year':
        return format(new Date(date), 'yyyy');
      default:
        return format(new Date(date), 'MMM yyyy');
    }
  };

  const generateEmptyDataPoints = (startDate: Date, endDate: Date, period: TimePeriod) => {
    const datePoints = [];
    let interval;
    
    // Adjust end date based on period to include current period
    switch (period) {
      case 'day':
        interval = { start: startDate, end: endDate };
        break;
      case 'week':
        interval = { start: startDate, end: endOfWeek(endDate) };
        break;
      case 'month':
        interval = { start: startDate, end: endOfMonth(endDate) };
        break;
      case 'year':
        interval = { start: startDate, end: endOfYear(endDate) };
        break;
      default:
        interval = { start: startDate, end: endDate };
    }

    let dates;
    switch (period) {
      case 'day':
        dates = eachDayOfInterval(interval);
        break;
      case 'week':
        dates = eachWeekOfInterval(interval);
        break;
      case 'month':
        dates = eachMonthOfInterval(interval);
        break;
      case 'year':
        dates = eachYearOfInterval(interval);
        break;
      default:
        dates = eachMonthOfInterval(interval);
    }

    const dateFormat = period === 'day' ? 'yyyy-MM-dd' : 
                      period === 'week' ? 'yyyy-MM-dd' :
                      period === 'month' ? 'yyyy-MM' : 'yyyy';

    dates.forEach(date => {
      datePoints.push({
        month: format(date, dateFormat),
        new_members: 0,
        hub_id: hubId
      });
    });

    return datePoints;
  };

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const startDate = getTimeRangeFilter(timePeriod);
        const endDate = new Date();
        
        // Generate empty data points for all possible dates in the range
        const emptyDataPoints = generateEmptyDataPoints(startDate, endDate, timePeriod);
        
        // Fetch members join dates
        const { data: memberData, error: memberError } = await supabase
          .from('hub_members')
          .select('join_date')
          .eq('hub_id', hubId)
          .eq('status', 'Approved')
          .gte('join_date', startOfDay(startDate).toISOString())
          .lte('join_date', endOfDay(endDate).toISOString());

        if (memberError) throw memberError;

        // Process member data into growth data
        const growthMap = new Map<string, number>();
        const dateFormat = timePeriod === 'day' ? 'yyyy-MM-dd' : 
                         timePeriod === 'week' ? 'yyyy-MM-dd' :
                         timePeriod === 'month' ? 'yyyy-MM' : 'yyyy';

        // Initialize the map with empty data points
        emptyDataPoints.forEach(point => {
          growthMap.set(point.month, 0);
        });

        // Add the actual member counts
        memberData.forEach(member => {
          const date = format(new Date(member.join_date), dateFormat);
          growthMap.set(date, (growthMap.get(date) || 0) + 1);
        });

        // Convert the map to array and sort
        const growthData = emptyDataPoints.map(point => ({
          ...point,
          new_members: growthMap.get(point.month) || 0
        }));

        setMemberGrowth(growthData);

        // Fetch summary data
        const { data: members, error: membersError } = await supabase
          .from('hub_members')
          .select('id', { count: 'exact' })
          .eq('hub_id', hubId)
          .eq('status', 'Approved');

        const { data: resources, error: resourcesError } = await supabase
          .from('hub_resources')
          .select('id', { count: 'exact' })
          .eq('hub_id', hubId);

        const { data: announcements, error: announcementsError } = await supabase
          .from('hub_announcements')
          .select('id', { count: 'exact' })
          .eq('hub_id', hubId);

        if (membersError || resourcesError || announcementsError) 
          throw membersError || resourcesError || announcementsError;

        setSummary({
          totalMembers: members?.length || 0,
          activeMembers: members?.length || 0,
          resourceCount: resources?.length || 0,
          announcementCount: announcements?.length || 0
        });

      } catch (error: any) {
        toast({
          title: "Error fetching analytics",
          description: error.message,
          variant: "destructive"
        });
      }
    }

    fetchAnalytics();
  }, [hubId, timePeriod, toast]);

  return (
    <div className="space-y-6">
      <AnalyticsSummaryCards summary={summary} />
      
      <Tabs defaultValue="growth" className="w-full">
        <TabsList>
          <TabsTrigger value="growth">Member Growth</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Member Growth Over Time</CardTitle>
                <ToggleGroup type="single" value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
                  <ToggleGroupItem value="day" aria-label="View daily data">
                    Daily
                  </ToggleGroupItem>
                  <ToggleGroupItem value="week" aria-label="View weekly data">
                    Weekly
                  </ToggleGroupItem>
                  <ToggleGroupItem value="month" aria-label="View monthly data">
                    Monthly
                  </ToggleGroupItem>
                  <ToggleGroupItem value="year" aria-label="View yearly data">
                    Yearly
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => formatDate(value, timePeriod)}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value, timePeriod)}
                    formatter={(value) => [`${value} new members`]}
                  />
                  <Bar 
                    dataKey="new_members" 
                    fill="#8884d8" 
                    name="New Members"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <EngagementMetrics hubId={hubId} />
        </TabsContent>

        <TabsContent value="activity">
          <MemberActivityList hubId={hubId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
