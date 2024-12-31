import React from "react";
import { Card } from "@/components/ui/card";
import { Bookmark, Calendar, Clock, Star, Users } from "lucide-react";

interface Stats {
  total_sessions: number;
  completed_sessions: number;
  upcoming_sessions: number;
  cancelled_sessions: number;
  unique_mentees: number;
  total_hours: number;
  session_data: {
    name: string;
    sessions: number;
  }[];
}

interface MentorshipStatsProps {
  stats: Stats;
}

export function MentorshipStats({ stats }: MentorshipStatsProps) {
  const cancellationRate = stats.total_sessions > 0
    ? ((stats.cancelled_sessions / stats.total_sessions) * 100).toFixed(1)
    : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Total Sessions</h3>
        </div>
        <p className="text-2xl font-bold mt-2">{stats.total_sessions}</p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Completed</h3>
        </div>
        <p className="text-2xl font-bold mt-2">{stats.completed_sessions}</p>
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
        <p className="text-2xl font-bold mt-2">{stats.unique_mentees}</p>
      </Card>
    </div>
  );
}