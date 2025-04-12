
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
import { BookOpen, PanelLeftOpen, Brain, Download, RefreshCw } from 'lucide-react';

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
  const [introVisible, setIntroVisible] = useState(true);

  useEffect(() => {
    if (!isChatLoading && configChecked && !hasConfigError && messages.length === 0) {
      // Don't auto-start on page load, wait for user to click "Begin Assessment"
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
    if (!isAuthenticated) {
      toast.error("Authentication Required", {
        description: "Please sign in to start a career assessment."
      });
      return;
    }
    
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
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
            <Brain className="h-12 w-12 text-blue-500" />
          </div>
          
          <h2 className="text-2xl font-bold mb-3">AI Career Assessment</h2>
          <p className="text-gray-600 max-w-lg mb-8">
            Answer a few questions about your skills, interests, and preferences to receive personalized
            career recommendations that match your unique profile.
          </p>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 max-w-2xl w-full mb-8">
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="text-blue-500 font-medium mb-2">Step 1</div>
              <p className="text-sm text-gray-500">Answer questions about your background and preferences</p>
            </div>
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="text-blue-500 font-medium mb-2">Step 2</div>
              <p className="text-sm text-gray-500">AI analyzes your responses to find matching careers</p>
            </div>
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="text-blue-500 font-medium mb-2">Step 3</div>
              <p className="text-sm text-gray-500">Review and download your personalized recommendations</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              size="lg"
              onClick={handleInitiateChat}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Begin Assessment
              <BookOpen className="h-4 w-4" />
            </Button>
            {messages.length > 0 && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleViewPastSessions}
                className="gap-2"
              >
                View Past Results
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="h-full">
          {!isSidebarOpen && (
            <Button
              variant="outline"
              size="icon"
              onClick={onOpenSidebar}
              className="absolute top-4 left-4 z-10 h-8 w-8 md:hidden bg-white/80"
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
      )}
    </div>
  );
}
