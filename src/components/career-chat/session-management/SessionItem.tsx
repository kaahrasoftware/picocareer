import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Edit2, MessageSquare, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { SessionMetadata } from './SessionMetadata';
import { CareerChatSession } from '@/types/database/analytics';
import { Badge } from '@/components/ui/badge';

interface SessionItemProps {
  session: CareerChatSession;
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

  const getDefaultTitle = (session: CareerChatSession) => {
    if (session.session_metadata?.title) {
      return session.session_metadata.title;
    }
    
    const date = new Date(session.created_at);
    return `Conversation on ${date.toLocaleDateString()}`;
  };

  const getSessionProgress = (session: CareerChatSession) => {
    if (session.session_metadata?.isComplete) {
      return 100;
    }
    
    if (session.session_metadata?.overallProgress) {
      return session.session_metadata.overallProgress;
    }
    
    if (session.progress_data) {
      const total = Object.values(session.progress_data).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
      return Math.min(Math.round((total / 24) * 100), 100);
    }
    
    if (session.total_messages) {
      return Math.min(Math.round((session.total_messages / 20) * 100), 100);
    }
    
    return 0;
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
  const progress = getSessionProgress(session);
  const isComplete = progress === 100 || session.session_metadata?.isComplete;
  const isActive = session.status === 'active';

  return (
    <div className={`border rounded-lg p-4 hover:bg-accent/40 transition-colors ${isActive ? 'border-primary/30 bg-primary/5' : ''}`}>
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
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{getDefaultTitle(session)}</h3>
            {isComplete ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            ) : isActive ? (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-300">
                <Clock className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : null}
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => {
                setSessionToEdit(session.id);
                setNewTitle(session.session_metadata?.title || '');
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
      
      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
          <div 
            className={`h-1.5 rounded-full ${isComplete ? 'bg-green-500' : 'bg-primary'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      <Button 
        size="sm" 
        onClick={() => handleResumeSession(session.id)}
        disabled={isProcessing}
        className="w-full"
        variant={isActive ? "default" : "outline"}
      >
        {isActive ? (
          <>Continue Conversation</>
        ) : (
          <>Resume Conversation</>
        )}
      </Button>
    </div>
  );
}
