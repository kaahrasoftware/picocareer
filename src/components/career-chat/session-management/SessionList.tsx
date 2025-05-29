import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageSquare } from 'lucide-react';
import { SessionItem } from './SessionItem';
import { ChatSession } from './types';

interface SessionListProps {
  sessions: ChatSession[];
  isFetchingPastSessions: boolean;
  onResumeSession: (sessionId: string) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
  onUpdateSessionTitle: (sessionId: string, title: string) => Promise<void>;
}

export function SessionList({
  sessions,
  isFetchingPastSessions,
  onResumeSession,
  onDeleteSession,
  onUpdateSessionTitle
}: SessionListProps) {
  if (isFetchingPastSessions) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground">No past conversations found</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Start a new conversation and finish it to see it here
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-3">
        {sessions.map(session => (
          <SessionItem 
            key={session.id} 
            session={session} 
            onResumeSession={onResumeSession}
            onDeleteSession={onDeleteSession}
            onUpdateSessionTitle={onUpdateSessionTitle}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
