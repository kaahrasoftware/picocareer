import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/router/layouts';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCareerChat } from './hooks/useCareerChat';
import { SessionManagementDialog } from './SessionManagementDialog';
import { CareerDetailsDialog } from '@/components/CareerDetailsDialog';
import { EmptyState } from './components/EmptyState';
import { LoadingState } from './components/LoadingState';
import { ConfigErrorState } from './components/ConfigErrorState';
import { ChatContainer } from './components/ChatContainer';

export function PicoChat() {
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
    addMessage,
    lastResponseFromCache
  } = useCareerChat();
  
  const { toast } = useToast();
  const [configChecked, setConfigChecked] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
  const [careerDetailsOpen, setCareerDetailsOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping]);

  useEffect(() => {
    const checkApiConfig = async () => {
      try {
        const response = await supabase.functions.invoke('career-chat-ai', {
          body: {
            type: 'config-check'
          }
        });
        if (response.error || response.data?.error) {
          toast({
            title: "DeepSeek API Key Not Configured",
            description: "Please contact an administrator to set up the DeepSeek integration.",
            variant: "destructive",
            duration: 10000
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
          duration: 5000
        });
      }
    };
    if (!isLoading && messages.length <= 2 && !configChecked) {
      checkApiConfig();
    }
  }, [toast, messages.length, isLoading, configChecked]);

  useEffect(() => {
    const hasSessionEndMessage = messages.some(msg => 
      msg.message_type === 'session_end' || 
      msg.metadata?.isSessionEnd === true
    );
    
    if (hasSessionEndMessage) {
      setIsSessionEnded(true);
    } else {
      setIsSessionEnded(false);
    }
  }, [messages]);

  const handleSuggestionClick = (suggestion: string) => {
    if (isSessionEnded && 
        (suggestion.toLowerCase().includes('new') || 
         suggestion.toLowerCase().includes('start'))) {
      handleStartNewChat();
      return;
    }
    sendMessage(suggestion);
  };

  const handleStartNewChat = async () => {
    if (messages.length > 2) {
      if (confirm('Starting a new chat will end your current conversation. Continue?')) {
        await startNewSession();
        toast({
          title: "New Conversation Started",
          description: "Your previous conversation has been saved.",
          variant: "default"
        });
      }
    } else {
      await startNewSession();
      toast({
        title: "New Conversation Started",
        description: "Your previous conversation has been saved.",
        variant: "default"
      });
    }
  };

  const handleCareerDetailsClick = (careerId: string) => {
    setSelectedCareerId(careerId);
    setCareerDetailsOpen(true);
  };

  if (isLoading) return <LoadingState />;
  if (hasConfigError) return <ConfigErrorState />;

  return (
    <MainLayout>
      <div className="flex flex-col max-w-6xl mx-auto h-[calc(100vh-120px)] p-4">
        {messages.length === 0 || messages.length === 1 && messages[0].message_type === 'system' ? (
          <EmptyState 
            onStartChat={() => sendMessage("Hi, I'd like to explore career options")}
            onShowSessions={() => setSessionDialogOpen(true)}
          />
        ) : (
          <ChatContainer 
            messages={messages}
            inputMessage={inputMessage}
            isTyping={isTyping}
            isAnalyzing={isAnalyzing}
            isSessionEnded={isSessionEnded}
            currentCategory={currentCategory}
            questionProgress={questionProgress}
            messagesEndRef={messagesEndRef}
            onSendMessage={handleSuggestionClick}
            onStartNewChat={handleStartNewChat}
            onShowSessions={() => setSessionDialogOpen(true)}
            setInputMessage={setInputMessage}
            onCareerDetailsClick={handleCareerDetailsClick}
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

        <CareerDetailsDialog 
          open={careerDetailsOpen} 
          onOpenChange={setCareerDetailsOpen} 
          careerId={selectedCareerId} 
        />
      </div>
    </MainLayout>
  );
}

export default PicoChat;
