import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";

export function UserActivityTimeline() {
  const { data: activityData } = useQuery({
    queryKey: ['user-activity-timeline'],
    queryFn: async () => {
      const { data: pageViews } = await supabase
        .from('user_page_views')
        .select('entry_time')
        .gte('entry_time', subDays(new Date(), 7).toISOString())
        .order('entry_time', { ascending: true });

      // Group page views by day
      const dailyViews = pageViews?.reduce((acc: any, curr) => {
        const day = format(new Date(curr.entry_time), 'MMM dd');
        if (!acc[day]) {
          acc[day] = {
            date: day,
            views: 0
          };
        }
        acc[day].views += 1;
        return acc;
      }, {});

      return Object.values(dailyViews);
    }
  });

  if (!activityData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="views" stroke="#0EA5E9" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}