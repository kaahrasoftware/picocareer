
import React, { useState } from 'react';
import { useCareerChat } from './hooks/useCareerChat';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { X, PlusCircle, RefreshCw, MessageSquare, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ChatSidebarProps {
  onClose: () => void;
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const { 
    pastSessions,
    isFetchingPastSessions,
    fetchPastSessions,
    resumeSession,
    deleteSession,
    updateSessionTitle,
    handleStartNewChat
  } = useCareerChat();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<string | null>(null);
  const [newSessionTitle, setNewSessionTitle] = useState('');

  const handleSessionClick = async (sessionId: string) => {
    try {
      await resumeSession(sessionId);
      toast.success('Resumed previous session');
    } catch (error) {
      console.error('Failed to resume session:', error);
      toast.error('Could not load this session');
    }
  };

  const handleRefreshClick = async () => {
    await fetchPastSessions();
  };

  const handleNewChat = () => {
    handleStartNewChat();
    toast.success('Started new assessment');
  };

  const confirmDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSession = async () => {
    if (sessionToDelete) {
      await deleteSession(sessionToDelete);
      setIsDeleteDialogOpen(false);
      toast.success('Session deleted');
    }
  };

  const openEditDialog = (sessionId: string, currentTitle: string) => {
    setSessionToEdit(sessionId);
    setNewSessionTitle(currentTitle);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTitle = async () => {
    if (sessionToEdit && newSessionTitle.trim()) {
      await updateSessionTitle(sessionToEdit, newSessionTitle);
      setIsEditDialogOpen(false);
      toast.success('Session renamed');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-medium text-lg">Your Assessments</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-3 border-b">
        <Button 
          variant="default" 
          className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={handleNewChat}
        >
          <PlusCircle className="h-4 w-4" />
          New Assessment
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {pastSessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No previous assessments</p>
            <p className="text-sm mt-1">Start a new assessment to see results here</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {pastSessions.map((session) => (
              <div 
                key={session.id}
                className="p-3 rounded-md hover:bg-blue-50 cursor-pointer transition-colors group"
              >
                <div 
                  className="flex justify-between items-start"
                  onClick={() => handleSessionClick(session.id)}
                >
                  <div className="flex-1 truncate">
                    <div className="font-medium truncate">{session.title || 'Unnamed Assessment'}</div>
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                      {session.metadata?.isComplete && (
                        <span className="ml-2 inline-flex text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                          Complete
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(session.id, session.title || 'Unnamed Assessment');
                    }}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7 text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteSession(session.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full gap-2"
          onClick={handleRefreshClick}
          disabled={isFetchingPastSessions}
        >
          <RefreshCw className={`h-4 w-4 ${isFetchingPastSessions ? 'animate-spin' : ''}`} />
          {isFetchingPastSessions ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assessment</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this assessment? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSession}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit title dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Assessment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="session-title">Assessment Name</Label>
              <Input 
                id="session-title"
                value={newSessionTitle} 
                onChange={(e) => setNewSessionTitle(e.target.value)}
                placeholder="Enter a name for this assessment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateTitle}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
