
import React, { useState, useEffect } from 'react';
import { useCareerChat } from './hooks/useCareerChat';
import { useConfigCheck } from './hooks/useConfigCheck';
import { downloadPdfResults } from './utils/pdfGenerator';
import { EmptyState } from './components/EmptyState';
import { ChatInterface } from './components/ChatInterface';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { SessionManagementDialog } from './session-management';
import { toast } from 'sonner';

export function PicoChatContainer() {
  const {
    messages,
    inputMessage,
    isLoading: isChatLoading,
    isTyping,
    isAnalyzing,
    messagesEndRef,
    currentCategory,
    questionProgress,
    pastSessions,
    isFetchingPastSessions,
    fetchPastSessions,
    endCurrentSession,
    startNewSession,
    resumeSession,
    deleteSession,
    updateSessionTitle,
    setInputMessage,
    sendMessage,
    isSessionComplete,
    handleStartNewChat,
    handleBeginAssessment
  } = useCareerChat();
  
  const { configChecked, hasConfigError, isLoading: isConfigLoading } = useConfigCheck();
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [localIsTyping, setLocalIsTyping] = useState(false);
  const [showInitialState, setShowInitialState] = useState(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping, localIsTyping]);

  useEffect(() => {
    setLocalIsTyping(isTyping);
  }, [isTyping]);

  useEffect(() => {
    if (messages.length > 0 && showInitialState) {
      setShowInitialState(false);
    }
  }, [messages.length]);

  const handleSuggestionClick = (suggestion: string) => {
    if (isTyping || localIsTyping) {
      // Don't process clicks when already processing something
      return;
    }
    
    if (isSessionComplete && 
        (suggestion.toLowerCase().includes('new') || 
         suggestion.toLowerCase().includes('start'))) {
      handleStartNewChat();
      return;
    }
    
    setLocalIsTyping(true);
    sendMessage(suggestion)
      .catch(() => {
        setLocalIsTyping(false);
      });
  };

  const handleSendMessage = async (msg: string) => {
    if (isTyping || localIsTyping) {
      // Don't send when already processing something
      return;
    }
    
    setLocalIsTyping(true);
    await sendMessage(msg)
      .catch(() => {
        setLocalIsTyping(false);
      });
  };

  const handleInitiateChat = () => {
    setShowInitialState(false);
    handleStartNewChat();
  };

  const handleViewPastSessions = () => {
    fetchPastSessions();
    setSessionDialogOpen(true);
  };

  const handleDownloadResults = () => {
    if (messages.length === 0) {
      toast({
        description: "No results to download yet."
      });
      return;
    }
    
    try {
      downloadPdfResults(messages);
      
      toast({
        description: "Your career assessment results have been downloaded."
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        description: "There was a problem generating your results PDF.",
        variant: "destructive"
      });
    }
  };

  const isLoadingState = isConfigLoading || isChatLoading;
  if (isLoadingState) {
    return <LoadingState />;
  }

  if (hasConfigError) {
    return <ErrorState />;
  }

  return (
    <div className="flex flex-col max-w-6xl mx-auto h-[calc(100vh-120px)] p-4">
      {showInitialState ? (
        <EmptyState 
          onStartChat={handleInitiateChat} 
          onViewPastSessions={handleViewPastSessions} 
        />
      ) : (
        <ChatInterface 
          messages={messages}
          inputMessage={inputMessage}
          isTyping={localIsTyping}
          isAnalyzing={isAnalyzing}
          currentCategory={currentCategory}
          questionProgress={questionProgress}
          isSessionEnded={isSessionComplete}
          messagesEndRef={messagesEndRef}
          onSuggestionClick={handleSuggestionClick}
          onBeginAssessment={handleBeginAssessment}
          onSendMessage={handleSendMessage}
          onStartNewChat={handleStartNewChat}
          onViewPastSessions={handleViewPastSessions}
          onEndCurrentSession={endCurrentSession}
          onDownloadResults={handleDownloadResults}
          setInputMessage={setInputMessage}
        />
      )}
      
      <SessionManagementDialog 
        open={sessionDialogOpen} 
        onOpenChange={setSessionDialogOpen} 
        pastSessions={pastSessions} 
        isFetchingPastSessions={isFetchingPastSessions} 
        onFetchPastSessions={fetchPastSessions} 
        onResumeSession={(sessionId) => {
          resumeSession(sessionId);
          setShowInitialState(false);
          setSessionDialogOpen(false);
        }} 
        onDeleteSession={deleteSession} 
        onUpdateSessionTitle={updateSessionTitle} 
      />
    </div>
  );
}
