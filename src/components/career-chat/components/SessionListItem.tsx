
import React from 'react';
import { MessageSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface SessionListItemProps {
  session: any;
  isActive: boolean;
  onClick: () => void;
}

export function SessionListItem({ session, isActive, onClick }: SessionListItemProps) {
  const getDefaultTitle = (session: any) => {
    return session.title || `Conversation on ${new Date(session.created_at).toLocaleDateString()}`;
  };

  return (
    <div 
      className={cn(
        "p-3 rounded-md hover:bg-accent flex flex-col cursor-pointer transition-colors",
        isActive && "bg-accent border-l-4 border-primary"
      )}
      onClick={onClick}
    >
      <div className="font-medium truncate">{getDefaultTitle(session)}</div>
      
      <div className="flex items-center text-xs text-muted-foreground mt-1 justify-between">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          <span>{session.message_count} messages</span>
        </div>
      </div>
    </div>
  );
}
