import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SessionStats {
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
  stats: SessionStats;
}

export function MentorshipStats({ stats }: MentorshipStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
          <p className="text-2xl font-bold">{stats.total_sessions}</p>
          <p className="text-xs text-muted-foreground">
            {stats.total_hours} hours total
          </p>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold">{stats.completed_sessions}</p>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
          <p className="text-2xl font-bold">{stats.upcoming_sessions}</p>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
          <p className="text-2xl font-bold">{stats.cancelled_sessions}</p>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Unique Mentees</p>
          <p className="text-2xl font-bold">{stats.unique_mentees}</p>
        </div>
      </Card>

      <Card className="col-span-full p-4">
        <div className="space-y-2">
          <h3 className="font-medium">Session Activity</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.session_data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}