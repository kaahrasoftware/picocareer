import React from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bookmark, Calendar, Clock, Star, Users } from "lucide-react";

interface MentorshipStatsProps {
  profileId: string;
}

export function MentorshipStats({ profileId }: MentorshipStatsProps) {
  const { data: stats } = useQuery({
    queryKey: ['mentorship-stats', profileId],
    queryFn: async () => {
      try {
        const [sessionsResponse, bookmarksResponse] = await Promise.all([
          supabase
            .from('mentor_sessions')
            .select('id, status')
            .eq('mentor_id', profileId),
          supabase
            .from('user_bookmarks')
            .select('id')
            .eq('profile_id', profileId)
        ]);

        if (sessionsResponse.error) throw sessionsResponse.error;
        if (bookmarksResponse.error) throw bookmarksResponse.error;

        const sessions = sessionsResponse.data || [];
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter(s => s.status === 'completed').length;
        const cancelledSessions = sessions.filter(s => s.status === 'cancelled').length;
        const bookmarksCount = bookmarksResponse.data?.length || 0;

        return {
          totalSessions,
          completedSessions,
          cancelledSessions,
          bookmarksCount
        };
      } catch (error) {
        console.error('Error fetching mentorship stats:', error);
        return null;
      }
    },
    enabled: !!profileId,
  });

  if (!stats) return null;

  const cancellationRate = stats.totalSessions > 0
    ? ((stats.cancelledSessions / stats.totalSessions) * 100).toFixed(1)
    : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Total Sessions</h3>
        </div>
        <p className="text-2xl font-bold mt-2">{stats.totalSessions}</p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Completed</h3>
        </div>
        <p className="text-2xl font-bold mt-2">{stats.completedSessions}</p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Cancellation Rate</h3>
        </div>
        <p className="text-2xl font-bold mt-2">{cancellationRate}%</p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Rating</h3>
        </div>
        <p className="text-2xl font-bold mt-2">-</p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Bookmark className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Bookmarks</h3>
        </div>
        <p className="text-2xl font-bold mt-2">{stats.bookmarksCount}</p>
      </Card>
    </div>
  );
}