
import React, { useState, useEffect } from 'react';
import { useCareerChat } from './hooks/useCareerChat';
import { useConfigCheck } from './hooks/useConfigCheck';
import { downloadPdfResults } from './utils/pdfGenerator';
import { EmptyState } from './components/EmptyState';
import { ChatInterface } from './components/ChatInterface';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { toast } from 'sonner';
import { useAuthSession } from '@/hooks/useAuthSession';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen } from 'lucide-react';

interface PicoChatContainerProps {
  isSidebarOpen?: boolean;
  onOpenSidebar?: () => void;
}

export function PicoChatContainer({ isSidebarOpen, onOpenSidebar }: PicoChatContainerProps) {
  const {
    messages,
    inputMessage,
    isLoading: isChatLoading,
    isTyping,
    isAnalyzing,
    messagesEndRef,
    currentCategory,
    questionProgress,
    endCurrentSession,
    setInputMessage,
    sendMessage,
    isSessionComplete,
    handleStartNewChat,
    handleBeginAssessment
  } = useCareerChat();
  
  const { configChecked, hasConfigError, isLoading: isConfigLoading } = useConfigCheck();
  const { isAuthenticated } = useAuthSession('optional');
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
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start a career assessment."
      });
      return;
    }
    
    setShowInitialState(false);
    handleStartNewChat();
  };

  const handleViewPastSessions = () => {
    if (onOpenSidebar) {
      onOpenSidebar();
    }
  };

  const handleDownloadResults = () => {
    if (messages.length === 0) {
      toast({
        title: "No Results",
        description: "No results to download yet."
      });
      return;
    }
    
    try {
      downloadPdfResults(messages);
      
      toast({
        title: "Download Complete",
        description: "Your career assessment results have been downloaded."
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Error",
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
    <div className="flex flex-col h-[calc(100vh-120px)] p-2 md:p-4">
      {showInitialState ? (
        <div className="relative">
          {!isSidebarOpen && (
            <Button
              variant="outline"
              size="icon"
              onClick={onOpenSidebar}
              className="absolute top-2 left-2 z-10 h-8 w-8 md:hidden"
            >
              <PanelLeftOpen size={16} />
            </Button>
          )}
          <EmptyState 
            onStartChat={handleInitiateChat} 
            onViewPastSessions={handleViewPastSessions} 
          />
        </div>
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
    </div>
  );
}
