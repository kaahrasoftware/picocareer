
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, GraduationCap, Building, Calendar, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

export function OverviewTab() {
  const { session } = useAuthSession();
  
  // Always call all hooks unconditionally
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [
        profilesRes,
        careersRes,
        majorsRes,
        schoolsRes,
        feedRes,
        opportunitiesRes
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('careers').select('id', { count: 'exact' }),
        supabase.from('majors').select('id', { count: 'exact' }),
        supabase.from('schools').select('id', { count: 'exact' }),
        supabase.from('feed_content').select('id', { count: 'exact' }),
        supabase.from('opportunities').select('id', { count: 'exact' })
      ]);

      return {
        profiles: profilesRes.count || 0,
        careers: careersRes.count || 0,
        majors: majorsRes.count || 0,
        schools: schoolsRes.count || 0,
        feedContent: feedRes.count || 0,
        opportunities: opportunitiesRes.count || 0
      };
    }
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, created_at, user_type')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    }
  });

  const { data: mentoringSessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ['mentoring-sessions', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('mentor_sessions')
        .select(`
          id,
          session_date,
          status,
          mentee_id,
          mentor_id
        `)
        .or(`mentor_id.eq.${session.user.id},mentee_id.eq.${session.user.id}`)
        .order('session_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id
  });

  const statsCards = [
    {
      title: "Total Users",
      value: stats?.profiles || 0,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Careers",
      value: stats?.careers || 0,
      icon: Building,
      color: "text-green-600"
    },
    {
      title: "Academic Majors",
      value: stats?.majors || 0,
      icon: GraduationCap,
      color: "text-purple-600"
    },
    {
      title: "Schools",
      value: stats?.schools || 0,
      icon: Building,
      color: "text-orange-600"
    },
    {
      title: "Feed Content",
      value: stats?.feedContent || 0,
      icon: BookOpen,
      color: "text-indigo-600"
    },
    {
      title: "Opportunities",
      value: stats?.opportunities || 0,
      icon: TrendingUp,
      color: "text-red-600"
    }
  ];

  if (statsLoading || activityLoading || isLoadingSessions) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{activity.full_name || 'Unknown User'}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {activity.user_type || 'User'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mentoringSessions && Array.isArray(mentoringSessions) && mentoringSessions.length > 0 ? (
                mentoringSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Session #{session.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.session_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant={session.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {session.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No sessions found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
