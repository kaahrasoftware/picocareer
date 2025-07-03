
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CareerChatSession } from '@/types/database/analytics';

interface SessionItemProps {
  session: CareerChatSession;
  onResume: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onRename: (sessionId: string, newTitle: string) => void;
}

export function SessionItem({ session, onResume, onDelete, onRename }: SessionItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(session.session_metadata?.title || `Session ${session.id.slice(0, 8)}`);

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onRename(session.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  const getLastActiveTime = () => {
    try {
      const lastActiveTime = new Date(session.last_active_at || session.created_at || new Date());
      return formatDistanceToNow(lastActiveTime, { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Safe progress calculation
  const getOverallProgress = () => {
    if (!session.progress_data || typeof session.progress_data !== 'object') {
      return 0;
    }
    
    const progressData = session.progress_data;
    const categories = ['education', 'skills', 'workstyle', 'goals'];
    let totalProgress = 0;
    let validCategories = 0;
    
    categories.forEach(category => {
      const value = progressData[category];
      if (typeof value === 'number' && !isNaN(value)) {
        totalProgress += value;
        validCategories++;
      }
    });
    
    return validCategories > 0 ? Math.round(totalProgress / validCategories) : 0;
  };

  const messageCount = typeof session.total_messages === 'number' ? session.total_messages : 0;

  return (
    <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') {
                setIsEditing(false);
                setEditTitle(session.session_metadata?.title || `Session ${session.id.slice(0, 8)}`);
              }
            }}
            className="text-sm font-medium bg-transparent border-b border-border focus:outline-none focus:border-primary"
            autoFocus
          />
        ) : (
          <h3 
            className="text-sm font-medium cursor-pointer hover:text-primary"
            onClick={() => setIsEditing(true)}
          >
            {session.session_metadata?.title || `Session ${session.id.slice(0, 8)}`}
          </h3>
        )}
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-6 w-6 p-0"
          >
            <Settings className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(session.id)}
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <div className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          <span>{messageCount} message{messageCount === 1 ? '' : 's'}</span>
        </div>
        <span>Updated {getLastActiveTime()}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-xs text-muted-foreground mb-1">
            Progress: {getOverallProgress()}%
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${getOverallProgress()}%` }}
            />
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onResume(session.id)}
          className="ml-3 h-7 text-xs"
        >
          Resume
        </Button>
      </div>
    </div>
  );
}
