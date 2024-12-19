import { Users, Clock, Video } from "lucide-react";

interface ProfileStatsProps {
  menteeCount: number;
  connectionCount: number;
  recordingCount: number;
}

export function ProfileStats({ menteeCount, connectionCount, recordingCount }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 py-4">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold">{menteeCount}</span>
        </div>
        <span className="text-sm text-muted-foreground">Mentees</span>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold">{connectionCount}</span>
        </div>
        <span className="text-sm text-muted-foreground">Connections</span>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold">{recordingCount}</span>
        </div>
        <span className="text-sm text-muted-foreground">Recordings</span>
      </div>
    </div>
  );
}