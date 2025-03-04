
import React from 'react';
import { History, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface ChatHeaderActionsProps {
  onStartNewChat: () => void;
  onShowSessions: () => void;
}

export function ChatHeaderActions({ onStartNewChat, onShowSessions }: ChatHeaderActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <History className="h-4 w-4" />
          Manage
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onStartNewChat}>
          <RefreshCw className="h-4 w-4 mr-2" />
          New Conversation
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShowSessions}>
          <History className="h-4 w-4 mr-2" />
          Past Conversations
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
