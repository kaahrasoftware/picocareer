
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/router/layouts';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatArea } from './components/ChatArea';
import { MinimizedChatButton } from './components/MinimizedChatButton';
import { useCareerChat } from './hooks/useCareerChat';
import { SessionManagementDialog } from './SessionManagementDialog';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function ChatLayout() {
  const {
    messages,
    sessionId,
    isLoading,
    pastSessions,
    fetchPastSessions,
    startNewSession,
    resumeSession,
    deleteSession,
    updateSessionTitle
  } = useCareerChat();

  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showSessionDialog, setShowSessionDialog] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMinimized) {
    return (
      <MinimizedChatButton 
        onMaximize={() => setIsMinimized(false)} 
        unreadCount={0} 
      />
    );
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-120px)] max-w-7xl mx-auto p-2 md:p-4 overflow-hidden">
        <div className="flex h-full rounded-lg shadow-lg border">
          {sidebarOpen && (
            <ChatSidebar 
              pastSessions={pastSessions}
              onFetchSessions={fetchPastSessions}
              onStartNewChat={startNewSession}
              onResumeSession={resumeSession}
              activeSessionId={sessionId}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              onManageSessions={() => setShowSessionDialog(true)}
            />
          )}
          
          <ChatArea 
            isMinimized={isMinimized}
            setIsMinimized={setIsMinimized}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onManageSessions={() => setShowSessionDialog(true)}
          />
        </div>

        <SessionManagementDialog
          open={showSessionDialog}
          onOpenChange={setShowSessionDialog}
          pastSessions={pastSessions}
          isFetchingPastSessions={false}
          onFetchPastSessions={fetchPastSessions}
          onResumeSession={resumeSession}
          onDeleteSession={deleteSession}
          onUpdateSessionTitle={updateSessionTitle}
        />
      </div>
    </MainLayout>
  );
}
