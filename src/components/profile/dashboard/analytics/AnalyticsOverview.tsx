import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EngagementMetrics } from "./EngagementMetrics";
import { SearchAnalytics } from "./SearchAnalytics";
import { UserActivityTimeline } from "./UserActivityTimeline";

export function AnalyticsOverview() {
  const { data: analyticsStats } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const [pageViews, searches, interactions] = await Promise.all([
        supabase.from('user_page_views').select('id', { count: 'exact' }),
        supabase.from('search_history').select('id', { count: 'exact' }),
        supabase.from('user_interactions').select('id', { count: 'exact' })
      ]);

      return {
        totalPageViews: pageViews.count || 0,
        totalSearches: searches.count || 0,
        totalInteractions: interactions.count || 0
      };
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analyticsStats?.totalPageViews}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analyticsStats?.totalSearches}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analyticsStats?.totalInteractions}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementMetrics />
        <SearchAnalytics />
      </div>

      <UserActivityTimeline />
    </div>
  );
}