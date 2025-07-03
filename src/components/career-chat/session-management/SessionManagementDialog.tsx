import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { SessionTabs } from './SessionTabs';
import { ChatSession } from './types';

interface SessionManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pastSessions: ChatSession[];
  isFetchingPastSessions: boolean;
  onFetchPastSessions: () => Promise<void>;
  onResumeSession: (sessionId: string) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
  onUpdateSessionTitle: (sessionId: string, title: string) => Promise<void>;
}

export function SessionManagementDialog({
  open,
  onOpenChange,
  pastSessions,
  isFetchingPastSessions,
  onFetchPastSessions,
  onResumeSession,
  onDeleteSession,
  onUpdateSessionTitle
}: SessionManagementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Past Conversations</DialogTitle>
          <DialogDescription>
            View and manage your previous career conversations
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <SessionTabs
            pastSessions={pastSessions}
            isFetchingPastSessions={isFetchingPastSessions}
            onResumeSession={onResumeSession}
            onDeleteSession={onDeleteSession}
            onUpdateSessionTitle={onUpdateSessionTitle}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onFetchPastSessions()} disabled={isFetchingPastSessions}>
            {isFetchingPastSessions ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
