import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Users, 
  BookOpen, 
  Video, 
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";

export function DashboardTab() {
  // Fetch users statistics
  const { data: userStats } = useQuery({
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
  const { data: contentStats } = useQuery({
    queryKey: ['dashboard-content'],
    queryFn: async () => {
      const { data: blogs } = await supabase
        .from('blogs')
        .select('status');

      const { data: videos } = await supabase
        .from('videos')
        .select('status');

      const { data: sessions } = await supabase
        .from('mentor_sessions')
        .select('status');

      return {
        blogs: {
          total: blogs?.length || 0,
          pending: blogs?.filter(b => b.status === 'Pending').length || 0,
          approved: blogs?.filter(b => b.status === 'Approved').length || 0
        },
        videos: {
          total: videos?.length || 0,
          pending: videos?.filter(v => v.status === 'Pending').length || 0,
          approved: videos?.filter(v => v.status === 'Approved').length || 0
        },
        sessions: {
          total: sessions?.length || 0,
          pending: sessions?.filter(s => s.status === 'pending').length || 0,
          completed: sessions?.filter(s => s.status === 'completed').length || 0
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
        .select('scheduled_at, status')
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
          completed: sessionsInMonth?.filter(s => s.status === 'completed').length || 0
        };
      }).reverse();

      return monthlyData;
    }
  });

  const COLORS = ['#0EA5E9', '#8B5CF6', '#F97316', '#10B981'];

  return (
    <div className="space-y-8 p-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(userStats?.mentors || 0) + (userStats?.mentees || 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {userStats?.mentors || 0} mentors, {userStats?.mentees || 0} mentees
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Content
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(contentStats?.blogs.total || 0) + (contentStats?.videos.total || 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {contentStats?.blogs.total || 0} blogs, {contentStats?.videos.total || 0} videos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sessions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contentStats?.sessions.total || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {contentStats?.sessions.completed || 0} completed sessions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Reviews
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(contentStats?.blogs.pending || 0) + (contentStats?.videos.pending || 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {contentStats?.blogs.pending || 0} blogs, {contentStats?.videos.pending || 0} videos
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Activity (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#0EA5E9" name="Total Sessions" />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Approved Blogs', value: contentStats?.blogs.approved || 0 },
                    { name: 'Pending Blogs', value: contentStats?.blogs.pending || 0 },
                    { name: 'Approved Videos', value: contentStats?.videos.approved || 0 },
                    { name: 'Pending Videos', value: contentStats?.videos.pending || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Content Status Section */}
      <Card>
        <CardHeader>
          <CardTitle>Content Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Blogs</span>
                <span className="text-sm text-muted-foreground">
                  {contentStats?.blogs.total || 0} total
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm">
                  {contentStats?.blogs.approved || 0} approved
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm">
                  {contentStats?.blogs.pending || 0} pending
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Videos</span>
                <span className="text-sm text-muted-foreground">
                  {contentStats?.videos.total || 0} total
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm">
                  {contentStats?.videos.approved || 0} approved
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm">
                  {contentStats?.videos.pending || 0} pending
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sessions</span>
                <span className="text-sm text-muted-foreground">
                  {contentStats?.sessions.total || 0} total
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm">
                  {contentStats?.sessions.completed || 0} completed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm">
                  {contentStats?.sessions.pending || 0} pending
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}