
import { Users, Clock, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileStatsProps {
  menteeCount: number;
  connectionCount: number;
  recordingCount: number;
}

export function ProfileStats({
  menteeCount,
  connectionCount,
  recordingCount
}: ProfileStatsProps) {
  const stats = [
    {
      icon: Users,
      label: "Mentees",
      value: menteeCount,
      color: "text-blue-600"
    },
    {
      icon: Users,
      label: "Connections",
      value: connectionCount,
      color: "text-green-600"
    },
    {
      icon: Video,
      label: "Sessions",
      value: recordingCount,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="flex gap-4 mt-4">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
          <stat.icon className={`h-4 w-4 ${stat.color}`} />
          <div className="text-sm">
            <div className="font-semibold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
