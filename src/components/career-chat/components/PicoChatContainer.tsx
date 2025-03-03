
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/router/layouts';
import { WelcomeScreen } from './WelcomeScreen';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { ChatContainer } from './ChatContainer';
import { SessionManagementDialog } from '../SessionManagementDialog';
import { useCareerChat } from '../hooks/useCareerChat';
import { useCareerAnalysis } from '../hooks/useCareerAnalysis';

export function PicoChatContainer() {
  const {
    messages,
    inputMessage,
    isLoading,
    isTyping,
    isAnalyzing,
    hasConfigError,
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
    addMessage
  } = useCareerChat();
  
  const [configChecked, setConfigChecked] = useState(false);
  const [showAnalyzeButton, setShowAnalyzeButton] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  
  // Check API configuration on component mount
  useEffect(() => {
    const checkApiConfig = async () => {
      try {
        const response = await supabase.functions.invoke('career-chat-ai', {
          body: { type: 'config-check' }
        });
        
        if (response.error || response.data?.error) {
          toast({
            title: "DeepSeek API Key Not Configured",
            description: "Please contact an administrator to set up the DeepSeek integration.",
            variant: "destructive",
            duration: 10000,
          });
        } else {
          setConfigChecked(true);
        }
      } catch (error) {
        console.error('Failed to check API configuration:', error);
        toast({
          title: "Configuration Check Failed",
          description: "Could not verify the DeepSeek API configuration.",
          variant: "destructive",
          duration: 5000,
        });
      }
    };
    
    if (!isLoading && messages.length <= 2 && !configChecked) {
      checkApiConfig();
    }
  }, [toast, messages.length, isLoading, configChecked]);
  
  // Determine when to show the analyze button
  useEffect(() => {
    const userMessageCount = messages.filter(msg => msg.message_type === 'user').length;
    
    if (userMessageCount >= 12 && !isAnalyzing && !showAnalyzeButton) {
      setShowAnalyzeButton(true);
    }
    
    if (isAnalyzing || messages.some(msg => msg.message_type === 'recommendation')) {
      setShowAnalyzeButton(false);
    }
  }, [messages, isAnalyzing, showAnalyzeButton]);
  
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };
  
  const handleAnalyzeClick = async () => {
    if (!messages[0]?.session_id) return;
    
    const { analyzeResponses } = useCareerAnalysis(
      messages[0].session_id,
      addMessage
    );
    
    analyzeResponses();
    setShowAnalyzeButton(false);
  };
  
  const handleStartNewChat = async () => {
    if (messages.length > 2) {
      if (confirm('Starting a new chat will end your current conversation. Continue?')) {
        await startNewSession();
        toast.success('Started new conversation');
      }
    } else {
      await startNewSession();
      toast.success('Started new conversation');
    }
  };
  
  const handleStartChat = () => {
    sendMessage("Hi, I'd like to explore career options");
  };
  
  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }
  
  // Show error state
  if (hasConfigError) {
    return <ErrorState />;
  }
  
  // Determine which UI to render based on message state
  const isFirstTimeUser = messages.length === 0 || 
    (messages.length === 1 && messages[0].message_type === 'system');
  
  return (
    <MainLayout>
      <div className="flex flex-col max-w-4xl mx-auto h-[calc(100vh-120px)] p-4">
        {isFirstTimeUser ? (
          <WelcomeScreen 
            onStartChat={handleStartChat} 
            onViewPastSessions={() => setSessionDialogOpen(true)} 
          />
        ) : (
          <ChatContainer
            messages={messages}
            inputMessage={inputMessage}
            isTyping={isTyping}
            isAnalyzing={isAnalyzing}
            currentCategory={currentCategory}
            messagesEndRef={messagesEndRef}
            questionProgress={questionProgress}
            showAnalyzeButton={showAnalyzeButton}
            setInputMessage={setInputMessage}
            sendMessage={sendMessage}
            handleAnalyzeClick={handleAnalyzeClick}
            handleStartNewChat={handleStartNewChat}
            handleSuggestionClick={handleSuggestionClick}
            onManageSessions={() => setSessionDialogOpen(true)}
          />
        )}
        
        <SessionManagementDialog
          open={sessionDialogOpen}
          onOpenChange={setSessionDialogOpen}
          pastSessions={pastSessions}
          isFetchingPastSessions={isFetchingPastSessions}
          onFetchPastSessions={fetchPastSessions}
          onResumeSession={resumeSession}
          onDeleteSession={deleteSession}
          onUpdateSessionTitle={updateSessionTitle}
        />
      </div>
    </MainLayout>
  );
}
