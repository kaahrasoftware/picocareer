import { StatsCard } from "../StatsCard";
import { ActivityChart } from "../ActivityChart";
import { ContentDistributionChart } from "../ContentDistributionChart";
import { ContentStatusCard } from "../ContentStatusCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Video, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function OverviewTab() {
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

      // Calculate total notifications and unread count
      const totalNotifications = notifications.data?.length || 0;
      const unreadNotifications = notifications.data?.filter(n => !n.read).length || 0;

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
          total: totalNotifications,
          unread: unreadNotifications,
          read: totalNotifications - unreadNotifications
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
    <div className="space-y-8">
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
        <ContentStatusCard
          title="Careers"
          total={contentStats?.careers.total || 0}
          approved={contentStats?.careers.approved || 0}
          pending={contentStats?.careers.pending || 0}
          rejected={contentStats?.careers.rejected || 0}
          tableName="careers"
          itemId="career-id"
          onStatusChange={handleStatusChange}
        />
        <ContentStatusCard
          title="Majors"
          total={contentStats?.majors.total || 0}
          approved={contentStats?.majors.approved || 0}
          pending={contentStats?.majors.pending || 0}
          rejected={contentStats?.majors.rejected || 0}
          tableName="majors"
          itemId="major-id"
          onStatusChange={handleStatusChange}
        />
        <ContentStatusCard
          title="Schools"
          total={contentStats?.schools.total || 0}
          approved={contentStats?.schools.approved || 0}
          pending={contentStats?.schools.pending || 0}
          rejected={contentStats?.schools.rejected || 0}
          tableName="schools"
          itemId="school-id"
          onStatusChange={handleStatusChange}
        />
        <ContentStatusCard
          title="Notifications"
          total={contentStats?.notifications.total || 0}
          unread={contentStats?.notifications.unread || 0}
          read={contentStats?.notifications.read || 0}
          tableName="notifications"
          itemId="notification-id"
          onStatusChange={handleStatusChange}
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
    </div>
  );
}
