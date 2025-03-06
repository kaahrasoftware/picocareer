import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Edit2, MessageSquare, Calendar, Clock } from 'lucide-react';
import { SessionMetadata } from './SessionMetadata';
import { ChatSession } from './types';

interface SessionItemProps {
  session: ChatSession;
  onResumeSession: (sessionId: string) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
  onUpdateSessionTitle: (sessionId: string, title: string) => Promise<void>;
}

export function SessionItem({ 
  session, 
  onResumeSession, 
  onDeleteSession, 
  onUpdateSessionTitle 
}: SessionItemProps) {
  const [sessionToEdit, setSessionToEdit] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getDefaultTitle = (session: any) => {
    const date = new Date(session.created_at);
    return session.title || `Conversation on ${date.toLocaleDateString()}`;
  };

  const handleResumeSession = async (sessionId: string) => {
    setIsProcessing(true);
    try {
      await onResumeSession(sessionId);
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
      setSessionToEdit(null);
      setNewTitle('');
    } finally {
      setIsProcessing(false);
    }
  };

  const isEditing = sessionToEdit === session.id;

  return (
    <div className="border rounded-lg p-4 hover:bg-accent/40 transition-colors">
      {isEditing ? (
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
      
      <SessionMetadata session={session} />
      
      <Button 
        size="sm" 
        onClick={() => handleResumeSession(session.id)}
        disabled={isProcessing}
        className="w-full"
      >
        Resume Conversation
      </Button>
    </div>
  );
}
