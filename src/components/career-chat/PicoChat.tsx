
import React, { useEffect, useState } from 'react';
import { useCareerChat } from './hooks/useCareerChat';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SessionManagementDialog } from './session-management';
import { EmptyState } from './components/EmptyState';
import { ChatInterface } from './components/ChatInterface';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';

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
    isSessionComplete
  } = useCareerChat();
  
  const { toast } = useToast();
  const [configChecked, setConfigChecked] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [localIsTyping, setLocalIsTyping] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping, localIsTyping]);

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
            title: "API Configuration Issue",
            description: "There was a problem with the chat configuration. Please try again later.",
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
          description: "Could not verify the chat API configuration.",
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
    setLocalIsTyping(isTyping);
  }, [isTyping]);

  const handleSuggestionClick = (suggestion: string) => {
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

  const handleSendMessage = async (msg: string) => {
    setLocalIsTyping(true);
    await sendMessage(msg)
      .catch(() => {
        setLocalIsTyping(false);
      });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (hasConfigError) {
    return <ErrorState />;
  }

  const hasNoMessages = messages.length === 0 || (messages.length === 1 && messages[0].message_type === 'system');

  return (
    <div className="flex flex-col max-w-6xl mx-auto h-[calc(100vh-120px)] p-4">
      {hasNoMessages ? (
        <EmptyState 
          onStartChat={() => sendMessage("Hi, I'd like to explore career options")} 
          onViewPastSessions={() => {
            fetchPastSessions();
            setSessionDialogOpen(true);
          }} 
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
          onSendMessage={handleSendMessage}
          onStartNewChat={handleStartNewChat}
          onViewPastSessions={() => {
            fetchPastSessions();
            setSessionDialogOpen(true);
          }}
          setInputMessage={setInputMessage}
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
  );
}

export default PicoChat;
