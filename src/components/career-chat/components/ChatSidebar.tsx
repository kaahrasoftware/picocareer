
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronLeft, Search, Plus, History, ArrowRightCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SessionListItem } from './SessionListItem';
import { useAuthSession } from '@/hooks/useAuthSession';

interface ChatSidebarProps {
  pastSessions: any[];
  onFetchSessions: () => Promise<void>;
  onStartNewChat: () => Promise<void>;
  onResumeSession: (sessionId: string) => Promise<void>;
  activeSessionId: string | null;
  onToggleSidebar: () => void;
  onManageSessions: () => void;
}

export function ChatSidebar({
  pastSessions,
  onFetchSessions,
  onStartNewChat,
  onResumeSession,
  activeSessionId,
  onToggleSidebar,
  onManageSessions
}: ChatSidebarProps) {
  const { session } = useAuthSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user && pastSessions.length === 0) {
      onFetchSessions();
    }
  }, [session, pastSessions.length, onFetchSessions]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSessions(pastSessions);
    } else {
      const filtered = pastSessions.filter((s) => {
        const title = s.title || new Date(s.created_at).toLocaleDateString();
        return title.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredSessions(filtered);
    }
  }, [searchQuery, pastSessions]);

  const handleStartNewChat = async () => {
    await onStartNewChat();
  };

  return (
    <div className="w-80 flex-shrink-0 border-r bg-white flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <h2 className="font-semibold text-lg">Chat Sessions</h2>
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="md:hidden">
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            className="pl-8 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="p-3 border-b">
        <Button 
          onClick={handleStartNewChat} 
          className="w-full gap-2"
          variant="default"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>
      
      <Tabs defaultValue="recent" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mx-3 mt-2">
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="flex-1 pt-2">
          <ScrollArea className="h-[calc(100%-1rem)]">
            <div className="px-3 space-y-2">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <SessionListItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    onClick={() => onResumeSession(session.id)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <History className="h-12 w-12 mb-2 opacity-20" />
                  <p className="text-sm">No past conversations found</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="mt-2" 
                    onClick={handleStartNewChat}
                  >
                    Start a new conversation
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="archived" className="flex-1 pt-2">
          <ScrollArea className="h-[calc(100%-1rem)]">
            <div className="px-3 py-2 text-center text-muted-foreground">
              <p className="text-sm">Archived conversations will appear here</p>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      <div className="p-3 border-t">
        <Button 
          variant="outline" 
          className="w-full text-sm" 
          onClick={onManageSessions}
          size="sm"
        >
          <ArrowRightCircle className="h-4 w-4 mr-2" />
          Manage All Sessions
        </Button>
      </div>
    </div>
  );
}
