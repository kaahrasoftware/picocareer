import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, Clock, MessageSquare } from 'lucide-react';
import { ChatSession } from './types';

interface SessionMetadataProps {
  session: ChatSession;
}

export function SessionMetadata({ session }: SessionMetadataProps) {
  return (
    <div className="flex gap-x-4 text-sm text-muted-foreground mb-3">
      <div className="flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" />
        <span>{new Date(session.created_at).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        <span>{formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}</span>
      </div>
      <div className="flex items-center gap-1">
        <MessageSquare className="h-3.5 w-3.5" />
        <span>{session.message_count} messages</span>
      </div>
    </div>
  );
}
