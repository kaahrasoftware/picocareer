
import React, { useState } from 'react';
import { useCareerChat } from '@/components/career-chat/hooks/useCareerChat';
import { CareerChatWelcome } from '@/components/career-chat/redesigned/CareerChatWelcome';
import { ModernChatInterface } from '@/components/career-chat/redesigned/ModernChatInterface';
import { SessionManagement } from '@/components/career-chat/redesigned/SessionManagement';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, History } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { downloadPdfResults } from '@/components/career-chat/utils/pdfGenerator';
import { toast } from 'sonner';

type ViewMode = 'welcome' | 'chat' | 'sessions';

export default function CareerChat() {
  const [viewMode, setViewMode] = useState<ViewMode>('welcome');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  const {
    messages,
    inputMessage,
    isLoading,
    isTyping,
    isAnalyzing,
    currentCategory,
    questionProgress,
    isSessionComplete,
    pastSessions,
    isFetchingPastSessions,
    messagesEndRef,
    setInputMessage,
    sendMessage,
    handleStartNewChat,
    resumeSession,
    deleteSession,
    updateSessionTitle
  } = useCareerChat();

  const handleStartAssessment = () => {
    handleStartNewChat();
    setViewMode('chat');
  };

  const handleViewPastSessions = () => {
    setViewMode('sessions');
  };

  const handleResumeSession = (sessionId: string) => {
    resumeSession(sessionId);
    setViewMode('chat');
  };

  const handleDownloadResults = () => {
    try {
      downloadPdfResults(messages);
      toast.success("Download Complete", {
        description: "Your career assessment results have been downloaded."
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Download Error", {
        description: "There was a problem generating your results PDF."
      });
    }
  };

  const handleDownloadSession = (sessionId: string) => {
    // Implementation for downloading specific session
    toast.info("Feature Coming Soon", {
      description: "Session download will be available soon."
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isTyping || isAnalyzing) return;
    
    if (suggestion.toLowerCase().includes('new') || 
        suggestion.toLowerCase().includes('start')) {
      handleStartAssessment();
      return;
    }
    
    sendMessage(suggestion);
  };

  const handleBackToWelcome = () => {
    setViewMode('welcome');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {viewMode !== 'welcome' && (
              <Button
                onClick={handleBackToWelcome}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">Career Discovery</h1>
              <p className="text-muted-foreground">
                {viewMode === 'welcome' && 'Find your perfect career path'}
                {viewMode === 'chat' && 'AI-powered career assessment'}
                {viewMode === 'sessions' && 'Your assessment history'}
              </p>
            </div>
          </div>
          
          {viewMode === 'welcome' && (
            <div className="flex gap-2">
              <Button
                onClick={handleViewPastSessions}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <History className="h-4 w-4" />
                Past Assessments
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {viewMode === 'welcome' && (
            <CareerChatWelcome
              onStartAssessment={handleStartAssessment}
              onViewPastSessions={handleViewPastSessions}
              hasPastSessions={pastSessions.length > 0}
            />
          )}

          {viewMode === 'chat' && (
            <div className="h-[calc(100vh-200px)]">
              <ModernChatInterface
                messages={messages}
                inputMessage={inputMessage}
                isTyping={isTyping}
                isAnalyzing={isAnalyzing}
                currentCategory={currentCategory}
                questionProgress={questionProgress}
                isSessionComplete={isSessionComplete}
                messagesEndRef={messagesEndRef}
                onSuggestionClick={handleSuggestionClick}
                onSendMessage={sendMessage}
                onStartNewChat={handleStartAssessment}
                onDownloadResults={handleDownloadResults}
                setInputMessage={setInputMessage}
              />
            </div>
          )}

          {viewMode === 'sessions' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Assessment History</h2>
                <p className="text-muted-foreground">
                  Review your past career assessments and continue where you left off.
                </p>
              </div>
              
              <SessionManagement
                sessions={pastSessions}
                onResumeSession={handleResumeSession}
                onDeleteSession={deleteSession}
                onDownloadSession={handleDownloadSession}
                isLoading={isFetchingPastSessions}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
