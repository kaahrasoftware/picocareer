
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquareIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MinimizedChatButtonProps {
  onMaximize: () => void;
  unreadCount?: number;
}

export function MinimizedChatButton({ onMaximize, unreadCount = 0 }: MinimizedChatButtonProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 shadow-lg">
      <Button 
        onClick={onMaximize}
        className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-white relative"
        size="icon"
      >
        <MessageSquareIcon className="h-7 w-7" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 bg-destructive"
            variant="destructive"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}
