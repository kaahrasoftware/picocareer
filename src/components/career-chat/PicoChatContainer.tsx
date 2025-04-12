import React, { useState, useEffect } from 'react';
import { useCareerChat } from './hooks/useCareerChat';
import { useConfigCheck } from './hooks/useConfigCheck';
import { downloadPdfResults } from './utils/pdfGenerator';
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

  useEffect(() => {
    if (!isChatLoading && configChecked && !hasConfigError && messages.length === 0) {
      handleStartNewChat();
    }
  }, [isChatLoading, configChecked, hasConfigError, messages.length, handleStartNewChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping, localIsTyping]);

  useEffect(() => {
    setLocalIsTyping(isTyping);
  }, [isTyping]);

  const handleSuggestionClick = (suggestion: string) => {
    if (isTyping || localIsTyping) {
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
      toast.error("Authentication Required", {
        description: "Please sign in to start a career assessment."
      });
      return;
    }
    
    handleStartNewChat();
  };

  const handleViewPastSessions = () => {
    if (onOpenSidebar) {
      onOpenSidebar();
    }
  };

  const handleDownloadResults = () => {
    if (messages.length === 0) {
      toast.error("No Results", {
        description: "No results to download yet."
      });
      return;
    }
    
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

  const isLoadingState = isConfigLoading || isChatLoading;
  if (isLoadingState) {
    return <LoadingState />;
  }

  if (hasConfigError) {
    return <ErrorState />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] p-2 md:p-4">
      <div className="relative flex-1">
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
      </div>
    </div>
  );
}
