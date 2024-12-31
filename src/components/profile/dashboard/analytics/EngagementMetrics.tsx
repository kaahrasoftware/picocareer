import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function EngagementMetrics() {
  const { data: engagementData } = useQuery({
    queryKey: ['engagement-metrics'],
    queryFn: async () => {
      const { data: contentEngagement } = await supabase
        .from('content_engagement')
        .select('content_type, time_spent, scroll_depth')
        .order('created_at', { ascending: false })
        .limit(100);

      // Process data for visualization
      const aggregatedData = contentEngagement?.reduce((acc: any, curr) => {
        if (!acc[curr.content_type]) {
          acc[curr.content_type] = {
            type: curr.content_type,
            avgTimeSpent: 0,
            avgScrollDepth: 0,
            count: 0
          };
        }
        acc[curr.content_type].avgTimeSpent += curr.time_spent || 0;
        acc[curr.content_type].avgScrollDepth += curr.scroll_depth || 0;
        acc[curr.content_type].count += 1;
        return acc;
      }, {});

      return Object.values(aggregatedData).map((item: any) => ({
        type: item.type,
        avgTimeSpent: Math.round(item.avgTimeSpent / item.count),
        avgScrollDepth: Math.round(item.avgScrollDepth / item.count)
      }));
    }
  });

  if (!engagementData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Engagement Metrics</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="avgTimeSpent" fill="#0EA5E9" name="Avg Time Spent (s)" />
            <Bar dataKey="avgScrollDepth" fill="#10B981" name="Avg Scroll Depth (%)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}