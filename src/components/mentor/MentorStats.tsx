import { Users, Star, BookOpen, Calendar } from "lucide-react";

interface MentorStatsProps {
  stats: {
    mentees: string;
    connected: string;
    recordings: string;
  };
  sessions_held?: string;
}

export function MentorStats({ stats, sessions_held }: MentorStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-kahra-darker p-4 rounded-lg">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Users size={16} />
          <span>Mentees</span>
        </div>
        <p className="text-xl font-semibold">{stats.mentees}</p>
      </div>
      <div className="bg-kahra-darker p-4 rounded-lg">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Star size={16} />
          <span>Connected</span>
        </div>
        <p className="text-xl font-semibold">{stats.connected}</p>
      </div>
      <div className="bg-kahra-darker p-4 rounded-lg">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <BookOpen size={16} />
          <span>Recordings</span>
        </div>
        <p className="text-xl font-semibold">{stats.recordings}</p>
      </div>
      <div className="bg-kahra-darker p-4 rounded-lg">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Calendar size={16} />
          <span>Sessions</span>
        </div>
        <p className="text-xl font-semibold">{sessions_held || "0"}</p>
      </div>
    </div>
  );
}