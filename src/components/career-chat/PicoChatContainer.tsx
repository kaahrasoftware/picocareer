
import React, { useState, useEffect } from 'react';
import { useCareerChat } from './hooks/useCareerChat';
import { useConfigCheck } from './hooks/useConfigCheck';
import { downloadPdfResults } from './utils/pdfGenerator';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { IntroScreen } from './components/IntroScreen';
import { ChatContent } from './components/ChatContent';
import { toast } from 'sonner';

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
  const [localIsTyping, setLocalIsTyping] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);

  useEffect(() => {
    if (!isChatLoading && configChecked && !hasConfigError && messages.length === 0) {
      setIntroVisible(true);
    } else if (messages.length > 0) {
      setIntroVisible(false);
    }
  }, [isChatLoading, configChecked, hasConfigError, messages.length]);

  useEffect(() => {
    if (messagesEndRef.current && !introVisible) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping, localIsTyping, introVisible]);

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
    
    setIntroVisible(false);
  };

  const handleInitiateChat = () => {
    handleStartNewChat();
    setIntroVisible(false);
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

  // Handle loading and error states
  const isLoadingState = isConfigLoading || isChatLoading;
  if (isLoadingState) {
    return <LoadingState />;
  }

  if (hasConfigError) {
    return <ErrorState />;
  }

  return (
    <div className="flex flex-col h-full p-2 md:p-4">
      {introVisible && messages.length === 0 ? (
        <IntroScreen 
          handleInitiateChat={handleInitiateChat}
          viewPastSessions={handleViewPastSessions}
          hasExistingMessages={messages.length > 0} 
        />
      ) : (
        <ChatContent 
          messages={messages}
          inputMessage={inputMessage}
          isTyping={localIsTyping}
          isAnalyzing={isAnalyzing}
          currentCategory={currentCategory}
          questionProgress={questionProgress}
          isSessionComplete={isSessionComplete}
          messagesEndRef={messagesEndRef}
          isSidebarOpen={isSidebarOpen}
          onOpenSidebar={onOpenSidebar}
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
