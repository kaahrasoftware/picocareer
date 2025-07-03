import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionList } from './SessionList';
import { ChatSession } from './types';

interface SessionTabsProps {
  pastSessions: ChatSession[];
  isFetchingPastSessions: boolean;
  onResumeSession: (sessionId: string) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
  onUpdateSessionTitle: (sessionId: string, title: string) => Promise<void>;
}

export function SessionTabs({
  pastSessions,
  isFetchingPastSessions,
  onResumeSession,
  onDeleteSession,
  onUpdateSessionTitle
}: SessionTabsProps) {
  return (
    <Tabs defaultValue="all">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="all">All Conversations</TabsTrigger>
        <TabsTrigger value="completed">Completed Only</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-4">
        <SessionList 
          sessions={pastSessions}
          isFetchingPastSessions={isFetchingPastSessions}
          onResumeSession={onResumeSession}
          onDeleteSession={onDeleteSession}
          onUpdateSessionTitle={onUpdateSessionTitle}
        />
      </TabsContent>
      
      <TabsContent value="completed" className="mt-4">
        <SessionList 
          sessions={pastSessions.filter(s => s.status === 'completed')}
          isFetchingPastSessions={isFetchingPastSessions}
          onResumeSession={onResumeSession}
          onDeleteSession={onDeleteSession}
          onUpdateSessionTitle={onUpdateSessionTitle}
        />
      </TabsContent>
    </Tabs>
  );
}
