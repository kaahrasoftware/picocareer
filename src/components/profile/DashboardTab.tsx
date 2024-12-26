import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  BookOpen, 
  Video, 
  Calendar,
  GraduationCap,
  Building,
  School,
  Bell
} from "lucide-react";
import { StatsCard } from "./dashboard/StatsCard";
import { ContentStatusCard } from "./dashboard/ContentStatusCard";
import { ActivityChart } from "./dashboard/ActivityChart";
import { ContentDistributionChart } from "./dashboard/ContentDistributionChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentDetailsDialog } from "./dashboard/ContentDetailsDialog";

export function DashboardTab() {
  // Fetch users statistics
  const { data: userStats, refetch: refetchUsers } = useQuery({
    queryKey: ['dashboard-users'],
    queryFn: async () => {
      const { data: mentors } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_type', 'mentor');

      const { data: mentees } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_type', 'mentee');

      return {
        mentors: mentors?.length || 0,
        mentees: mentees?.length || 0
      };
    }
  });

  // Fetch content statistics
  const { data: contentStats, refetch: refetchContent } = useQuery({
    queryKey: ['dashboard-content'],
    queryFn: async () => {
      const [blogs, videos, sessions, careers, majors, schools, notifications] = await Promise.all([
        supabase.from('blogs').select('status'),
        supabase.from('videos').select('status'),
        supabase.from('mentor_sessions').select('scheduled_at'),
        supabase.from('careers').select('status'),
        supabase.from('majors').select('status'),
        supabase.from('schools').select('status'),
        supabase.from('notifications').select('read')
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
        },
        careers: {
          total: careers.data?.length || 0,
          pending: careers.data?.filter(c => c.status === 'Pending').length || 0,
          approved: careers.data?.filter(c => c.status === 'Approved').length || 0,
          rejected: careers.data?.filter(c => c.status === 'Rejected').length || 0
        },
        majors: {
          total: majors.data?.length || 0,
          pending: majors.data?.filter(m => m.status === 'Pending').length || 0,
          approved: majors.data?.filter(m => m.status === 'Approved').length || 0,
          rejected: majors.data?.filter(m => m.status === 'Rejected').length || 0
        },
        schools: {
          total: schools.data?.length || 0,
          pending: schools.data?.filter(s => s.status === 'Pending').length || 0,
          approved: schools.data?.filter(s => s.status === 'Approved').length || 0,
          rejected: schools.data?.filter(s => s.status === 'Rejected').length || 0
        },
        notifications: {
          total: notifications.data?.length || 0,
          unread: notifications.data?.filter(n => !n.read).length || 0,
          read: notifications.data?.filter(n => n.read).length || 0
        }
      };
    }
  });

  // Monthly session data for chart
  const { data: monthlyStats } = useQuery({
    queryKey: ['dashboard-monthly'],
    queryFn: async () => {
      const { data: sessions } = await supabase
        .from('mentor_sessions')
        .select('scheduled_at')
        .gte('scheduled_at', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString());

      const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('default', { month: 'short' });
        const sessionsInMonth = sessions?.filter(s => 
          new Date(s.scheduled_at).getMonth() === date.getMonth() &&
          new Date(s.scheduled_at).getFullYear() === date.getFullYear()
        );

        return {
          month,
          total: sessionsInMonth?.length || 0,
          completed: sessionsInMonth?.filter(s => new Date(s.scheduled_at) < new Date()).length || 0
        };
      }).reverse();

      return monthlyData;
    }
  });

  const handleStatusChange = () => {
    refetchContent();
    refetchUsers();
  };

  if (!contentStats || !userStats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={(userStats?.mentors || 0) + (userStats?.mentees || 0)}
          subtitle={`${userStats?.mentors || 0} mentors, ${userStats?.mentees || 0} mentees`}
          icon={Users}
        />
        <StatsCard
          title="Total Content"
          value={(contentStats?.blogs.total || 0) + (contentStats?.videos.total || 0)}
          subtitle={`${contentStats?.blogs.total || 0} blogs, ${contentStats?.videos.total || 0} videos`}
          icon={BookOpen}
          contentType="blogs"
        />
        <StatsCard
          title="Total Sessions"
          value={contentStats?.sessions.total || 0}
          subtitle={`${contentStats?.sessions.completed || 0} completed sessions`}
          icon={Calendar}
        />
        <StatsCard
          title="Pending Reviews"
          value={(contentStats?.blogs.pending || 0) + (contentStats?.videos.pending || 0)}
          subtitle={`${contentStats?.blogs.pending || 0} blogs, ${contentStats?.videos.pending || 0} videos`}
          icon={Video}
          contentType="videos"
        />
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Careers"
          value={contentStats?.careers.total || 0}
          subtitle={`${contentStats?.careers.pending || 0} pending approval`}
          icon={GraduationCap}
          contentType="careers"
        />
        <StatsCard
          title="Majors"
          value={contentStats?.majors.total || 0}
          subtitle={`${contentStats?.majors.pending || 0} pending approval`}
          icon={BookOpen}
          contentType="majors"
        />
        <StatsCard
          title="Schools"
          value={contentStats?.schools.total || 0}
          subtitle={`${contentStats?.schools.pending || 0} pending approval`}
          icon={School}
        />
        <StatsCard
          title="Notifications"
          value={contentStats?.notifications.total || 0}
          subtitle={`${contentStats?.notifications.unread || 0} unread`}
          icon={Bell}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart 
          data={monthlyStats || []}
          title="Session Activity (Last 6 Months)"
        />
        <ContentDistributionChart
          data={[
            { name: 'Approved Blogs', value: contentStats?.blogs.approved || 0 },
            { name: 'Pending Blogs', value: contentStats?.blogs.pending || 0 },
            { name: 'Approved Videos', value: contentStats?.videos.approved || 0 },
            { name: 'Pending Videos', value: contentStats?.videos.pending || 0 }
          ]}
          title="Content Distribution"
        />
      </div>

      {/* Content Status Section */}
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
