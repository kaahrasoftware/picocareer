
import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Calendar, MessageSquare, Clock } from 'lucide-react';
import { CareerChatSession } from '@/types/database/analytics';

interface SessionMetadataProps {
  session: CareerChatSession;
}

export function SessionMetadata({ session }: SessionMetadataProps) {
  const getLastActive = () => {
    try {
      const lastActiveTime = new Date(session.last_active_at || session.created_at);
      return formatDistanceToNow(lastActiveTime, { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const getCreatedAt = () => {
    try {
      const createdAt = new Date(session.created_at);
      return format(createdAt, 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };

  const messageCount = session.total_messages || 0;

  return (
    <div className="flex flex-col space-y-1 mb-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{getCreatedAt()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Updated {getLastActive()}</span>
        </div>
      </div>
      <div className="flex items-center text-xs text-muted-foreground">
        <MessageSquare className="h-3 w-3 mr-1" />
        <span>{messageCount} {messageCount === 1 ? 'message' : 'messages'}</span>
      </div>
    </div>
  );
}
