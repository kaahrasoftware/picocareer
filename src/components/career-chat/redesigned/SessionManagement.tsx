
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Calendar, Download, Trash2, PlayCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Session {
  id: string;
  session_metadata: any;
  created_at: string;
  status: string;
  total_messages: number;
}

interface SessionManagementProps {
  sessions: Session[];
  onResumeSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onDownloadSession: (sessionId: string) => void;
  isLoading: boolean;
}

export function SessionManagement({
  sessions,
  onResumeSession,
  onDeleteSession,
  onDownloadSession,
  isLoading
}: SessionManagementProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Previous Assessments
          </h3>
          <p className="text-gray-500">
            Start your first career assessment to see your results here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4">
        {sessions.map((session) => {
          const title = session.session_metadata?.title || 'Career Assessment';
          const isComplete = session.status === 'completed';
          const progress = session.session_metadata?.overallProgress || 0;
          
          return (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg truncate">{title}</CardTitle>
                  <Badge variant={isComplete ? 'default' : 'secondary'}>
                    {isComplete ? 'Complete' : `${progress}% Done`}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                  </div>
                  <span>{session.total_messages} messages</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => onResumeSession(session.id)}
                    size="sm"
                    variant={isComplete ? 'outline' : 'default'}
                    className="gap-1"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {isComplete ? 'View Results' : 'Continue'}
                  </Button>
                  
                  {isComplete && (
                    <Button
                      onClick={() => onDownloadSession(session.id)}
                      size="sm"
                      variant="outline"
                      className="gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => onDeleteSession(session.id)}
                    size="sm"
                    variant="outline"
                    className="gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
