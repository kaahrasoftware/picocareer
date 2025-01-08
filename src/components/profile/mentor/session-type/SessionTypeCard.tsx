import { Button } from "@/components/ui/button";
import { Clock, DollarSign, FileText, Trash2, Video, MessageSquare, Phone } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type SessionType = Database["public"]["Tables"]["mentor_session_types"]["Row"];

interface SessionTypeCardProps {
  sessionType: SessionType;
  onDelete: (id: string) => void;
}

export function SessionTypeCard({ sessionType, onDelete }: SessionTypeCardProps) {
  return (
    <div className="bg-card border rounded-lg p-3 space-y-2 relative group hover:shadow-md transition-shadow">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => onDelete(sessionType.id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      
      <h4 className="font-medium text-base pr-8">{sessionType.type}</h4>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {sessionType.duration} min
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="h-3.5 w-3.5" />
          ${sessionType.price}
        </div>
      </div>
      {sessionType.description && (
        <div className="flex items-start gap-1 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <p className="line-clamp-2">{sessionType.description}</p>
        </div>
      )}
      {sessionType.meeting_platform && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start gap-1 text-xs text-muted-foreground">
            <Video className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1">
              {sessionType.meeting_platform.map((platform, index) => (
                <span key={platform}>
                  {platform}
                  {index < sessionType.meeting_platform.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
          </div>
          
          {sessionType.telegram_username && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
              <span>@{sessionType.telegram_username}</span>
            </div>
          )}
          
          {sessionType.phone_number && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{sessionType.phone_number}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}