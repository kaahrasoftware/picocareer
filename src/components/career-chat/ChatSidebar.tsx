
import React, { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, History, X, MessagesSquare } from 'lucide-react';
import { useCareerChat } from './hooks/useCareerChat';
import { useAuthSession } from '@/hooks/useAuthSession';
import { ProfileAvatar } from '@/components/ui/profile-avatar';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionItem } from './session-management/SessionItem';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface ChatSidebarProps {
  onClose?: () => void;
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
  
  const { session } = useAuthSession();
  const { data: profile, isLoading: isProfileLoading } = useUserProfile(session);
  const { toast } = useToast();

  // Fetch sessions when component mounts
  useEffect(() => {
    if (session?.user) {
      fetchPastSessions();
    }
  }, [session, fetchPastSessions]);

  const handleNewChat = () => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start a new career assessment."
      });
      return;
    }
    
    handleStartNewChat();
    if (onClose) onClose();
  };

  const handleResumeSession = async (sessionId: string) => {
    await resumeSession(sessionId);
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold flex items-center gap-2">
          <MessagesSquare className="h-5 w-5 text-primary" />
          Career Chats
        </h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* User profile section */}
      <div className="p-4 border-b">
        {isProfileLoading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ) : profile ? (
          <div className="flex items-center gap-3">
            <ProfileAvatar
              avatarUrl={profile.avatar_url}
              imageAlt={profile.full_name || profile.email || "User"}
              size="md"
              userId={profile.id}
              editable={false}
            />
            <div>
              <p className="font-medium text-sm">{profile.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[180px]">{profile.email}</p>
            </div>
          </div>
        ) : (
          <div className="text-center p-2 text-sm text-muted-foreground">
            Sign in to save your chat history
          </div>
        )}
      </div>
      
      {/* New chat button */}
      <div className="p-4">
        <Button 
          onClick={handleNewChat} 
          className="w-full flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Career Chat
        </Button>
      </div>

      {/* Past sessions */}
      <div className="flex-1 overflow-hidden">
        {session?.user ? (
          <Tabs defaultValue="all" className="w-full">
            <div className="px-4 pt-2">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="h-full">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="p-4 space-y-3">
                  {isFetchingPastSessions ? (
                    Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-28 w-full rounded-lg" />
                    ))
                  ) : pastSessions.length > 0 ? (
                    pastSessions.map(session => (
                      <SessionItem
                        key={session.id}
                        session={session}
                        onResumeSession={handleResumeSession}
                        onDeleteSession={deleteSession}
                        onUpdateSessionTitle={updateSessionTitle}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <History className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                      <p className="text-muted-foreground">No chat history yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your completed chats will appear here
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="completed" className="h-full">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="p-4 space-y-3">
                  {isFetchingPastSessions ? (
                    Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-28 w-full rounded-lg" />
                    ))
                  ) : pastSessions.filter(s => s.status === 'completed').length > 0 ? (
                    pastSessions
                      .filter(s => s.status === 'completed')
                      .map(session => (
                        <SessionItem
                          key={session.id}
                          session={session}
                          onResumeSession={handleResumeSession}
                          onDeleteSession={deleteSession}
                          onUpdateSessionTitle={updateSessionTitle}
                        />
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <MessagesSquare className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                      <p className="text-muted-foreground">No completed chats yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Finish a chat to see it here
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <MessagesSquare className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
            <p className="text-muted-foreground">Sign in to view your chat history</p>
            <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">
              All your chat sessions will be saved and you can resume them anytime
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
