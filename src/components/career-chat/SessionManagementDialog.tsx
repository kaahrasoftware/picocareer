
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Loader2, Trash2, Edit2, RefreshCw, Clock, Calendar, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface SessionManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pastSessions: any[];
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
  const [sessionToEdit, setSessionToEdit] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      onFetchPastSessions();
    }
  }, [open, onFetchPastSessions]);

  const handleResumeSession = async (sessionId: string) => {
    setIsProcessing(true);
    try {
      await onResumeSession(sessionId);
      toast.success('Resumed previous conversation');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to resume conversation');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await onDeleteSession(sessionId);
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete conversation');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateTitle = async (sessionId: string) => {
    if (!newTitle.trim()) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await onUpdateSessionTitle(sessionId, newTitle.trim());
      toast.success('Conversation renamed');
      setSessionToEdit(null);
      setNewTitle('');
    } catch (error) {
      toast.error('Failed to rename conversation');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getDefaultTitle = (session: any) => {
    const date = new Date(session.created_at);
    return session.title || `Conversation on ${date.toLocaleDateString()}`;
  };

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
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All Conversations</TabsTrigger>
              <TabsTrigger value="completed">Completed Only</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {renderSessionList(pastSessions)}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-4">
              {renderSessionList(pastSessions.filter(s => s.status === 'completed'))}
            </TabsContent>
          </Tabs>
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

  function renderSessionList(sessions: any[]) {
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
            <div 
              key={session.id} 
              className="border rounded-lg p-4 hover:bg-accent/40 transition-colors"
            >
              {sessionToEdit === session.id ? (
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Enter new title"
                    autoFocus
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleUpdateTitle(session.id)}
                    disabled={isProcessing || !newTitle.trim()}
                  >
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setSessionToEdit(null);
                      setNewTitle('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{getDefaultTitle(session)}</h3>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => {
                        setSessionToEdit(session.id);
                        setNewTitle(session.title || '');
                      }}
                      title="Rename"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      onClick={() => handleDeleteSession(session.id)}
                      disabled={isProcessing}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
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
              
              <Button 
                size="sm" 
                onClick={() => handleResumeSession(session.id)}
                disabled={isProcessing}
                className="w-full"
              >
                Resume Conversation
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  }
}
