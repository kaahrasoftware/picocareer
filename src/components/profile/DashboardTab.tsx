import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnalyticsOverview } from "./dashboard/analytics/AnalyticsOverview";
import { ContentStatusCard } from "./dashboard/ContentStatusCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardTab() {
  const { data: contentStats, refetch: refetchContent } = useQuery({
    queryKey: ['dashboard-content'],
    queryFn: async () => {
      const [blogs, videos, sessions] = await Promise.all([
        supabase.from('blogs').select('status'),
        supabase.from('videos').select('status'),
        supabase.from('mentor_sessions').select('scheduled_at')
      ]);

      // Calculate total and upcoming sessions
      const now = new Date();
      const totalSessions = sessions.data?.length || 0;
      const upcomingSessions = sessions.data?.filter(s => 
        new Date(s.scheduled_at) > now
      ).length || 0;
      const completedSessions = totalSessions - upcomingSessions;

      return {
        blogs: {
          total: blogs.data?.length || 0,
          pending: blogs.data?.filter(b => b.status === 'Pending').length || 0,
          approved: blogs.data?.filter(b => b.status === 'Approved').length || 0,
          rejected: blogs.data?.filter(b => b.status === 'Rejected').length || 0
        },
        videos: {
          total: videos.data?.length || 0,
          pending: videos.data?.filter(v => v.status === 'Pending').length || 0,
          approved: videos.data?.filter(v => v.status === 'Approved').length || 0,
          rejected: videos.data?.filter(v => v.status === 'Rejected').length || 0
        },
        sessions: {
          total: totalSessions,
          upcoming: upcomingSessions,
          completed: completedSessions
        }
      };
    }
  });

  const handleStatusChange = () => {
    refetchContent();
  };

  if (!contentStats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Analytics Overview */}
      <AnalyticsOverview />

      {/* Content Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Content Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ContentStatusCard
              title="Blogs"
              total={contentStats?.blogs.total || 0}
              approved={contentStats?.blogs.approved || 0}
              pending={contentStats?.blogs.pending || 0}
              rejected={contentStats?.blogs.rejected || 0}
              tableName="blogs"
              itemId="blog-id"
              onStatusChange={handleStatusChange}
            />
            <ContentStatusCard
              title="Videos"
              total={contentStats?.videos.total || 0}
              approved={contentStats?.videos.approved || 0}
              pending={contentStats?.videos.pending || 0}
              rejected={contentStats?.videos.rejected || 0}
              tableName="videos"
              itemId="video-id"
              onStatusChange={handleStatusChange}
            />
            <ContentStatusCard
              title="Sessions"
              total={contentStats?.sessions.total || 0}
              approved={contentStats?.sessions.completed || 0}
              pending={contentStats?.sessions.upcoming || 0}
              tableName="mentor_sessions"
              itemId="session-id"
              onStatusChange={handleStatusChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}