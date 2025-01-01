import { Button } from "@/components/ui/button";
import { Clock, DollarSign, FileText, Trash2, Video } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type SessionType = Database["public"]["Tables"]["mentor_session_types"]["Row"];

interface SessionTypeCardProps {
  sessionType: SessionType;
  onDelete: (id: string) => void;
}

export function SessionTypeCard({ sessionType, onDelete }: SessionTypeCardProps) {
  return (
    <div className="bg-card border rounded-lg p-4 space-y-2 relative group hover:shadow-md transition-shadow">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => onDelete(sessionType.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      
      <h4 className="font-medium text-lg pr-8">{sessionType.type}</h4>
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {sessionType.duration} min
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          ${sessionType.price}
        </div>
      </div>
      {sessionType.description && (
        <div className="flex items-start gap-1 text-sm text-muted-foreground">
          <FileText className="h-4 w-4 mt-1 flex-shrink-0" />
          <p className="line-clamp-2">{sessionType.description}</p>
        </div>
      )}
      {sessionType.meeting_platform && (
        <div className="flex items-start gap-1 text-sm text-muted-foreground">
          <Video className="h-4 w-4 mt-1 flex-shrink-0" />
          <div className="flex flex-wrap gap-1">
            {sessionType.meeting_platform.map((platform, index) => (
              <span key={platform}>
                {platform}
                {index < sessionType.meeting_platform.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}