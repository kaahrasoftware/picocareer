import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

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
  // Calculate cancellation score
  const cancellationScore = stats.total_sessions > 0 
    ? (stats.cancelled_sessions / stats.total_sessions) * 100 
    : 0;
  
  // Determine status and styling based on score
  const getCancellationStatus = (score: number) => {
    if (score <= 5) {
      return {
        label: "Excellent",
        color: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: <CheckCircle className="w-4 h-4 text-green-500" />
      };
    } else if (score <= 15) {
      return {
        label: "Good",
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        icon: <AlertCircle className="w-4 h-4 text-yellow-500" />
      };
    } else {
      return {
        label: "Fair",
        color: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: <XCircle className="w-4 h-4 text-red-500" />
      };
    }
  };

  const cancellationStatus = getCancellationStatus(cancellationScore);

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-3 sm:p-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
          <p className="text-xl sm:text-2xl font-bold">{stats.total_sessions}</p>
          <p className="text-xs text-muted-foreground">
            {stats.total_hours.toFixed(2)} hours total
          </p>
        </div>
      </Card>

      <Card className="p-3 sm:p-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">Completed</p>
          <p className="text-xl sm:text-2xl font-bold">{stats.completed_sessions}</p>
        </div>
      </Card>

      <Card className="p-3 sm:p-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
          <p className="text-xl sm:text-2xl font-bold">{stats.cancelled_sessions}</p>
        </div>
      </Card>

      <Card className={`p-3 sm:p-4 ${cancellationStatus.bgColor} ${cancellationStatus.borderColor} border-2`}>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Cancellation Score</p>
            {cancellationStatus.icon}
          </div>
          <p className={`text-xl sm:text-2xl font-bold ${cancellationStatus.color}`}>
            {cancellationScore.toFixed(1)}%
          </p>
          <p className={`text-xs sm:text-sm font-medium ${cancellationStatus.color}`}>
            {cancellationStatus.label}
          </p>
        </div>
      </Card>

      <Card className="p-3 sm:p-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">Unique Mentees</p>
          <p className="text-xl sm:text-2xl font-bold">{stats.unique_mentees}</p>
        </div>
      </Card>

      <Card className="col-span-2 lg:col-span-4 p-3 sm:p-4">
        <div className="space-y-2">
          <h3 className="font-medium text-sm sm:text-base">Session Activity</h3>
          <div className="h-[250px] sm:h-[300px]">
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