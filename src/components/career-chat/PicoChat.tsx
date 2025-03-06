
import React, { useEffect, useState } from 'react';
import { useCareerChat } from './hooks/useCareerChat';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SessionManagementDialog } from './SessionManagementDialog';
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
    addMessage
  } = useCareerChat();
  
  const { toast } = useToast();
  const [configChecked, setConfigChecked] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [localIsTyping, setLocalIsTyping] = useState(false); // Local typing state for immediate feedback

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping, localIsTyping]); // Add localIsTyping to scroll dependencies

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

  // Update local typing state when isTyping changes
  useEffect(() => {
    setLocalIsTyping(isTyping);
  }, [isTyping]);

  const handleSuggestionClick = (suggestion: string) => {
    if (isSessionEnded && 
        (suggestion.toLowerCase().includes('new') || 
         suggestion.toLowerCase().includes('start'))) {
      handleStartNewChat();
      return;
    }
    
    // Show typing indicator immediately
    setLocalIsTyping(true);
    sendMessage(suggestion)
      .catch(() => {
        // Reset typing indicator if there's an error
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
    setLocalIsTyping(true); // Show typing indicator immediately
    await sendMessage(msg)
      .catch(() => {
        // Reset typing indicator if there's an error
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
          onViewPastSessions={() => setSessionDialogOpen(true)} 
        />
      ) : (
        <ChatInterface 
          messages={messages}
          inputMessage={inputMessage}
          isTyping={localIsTyping}
          isAnalyzing={isAnalyzing}
          currentCategory={currentCategory}
          questionProgress={questionProgress}
          isSessionEnded={isSessionEnded}
          messagesEndRef={messagesEndRef}
          onSuggestionClick={handleSuggestionClick}
          onSendMessage={handleSendMessage}
          onStartNewChat={handleStartNewChat}
          onViewPastSessions={() => setSessionDialogOpen(true)}
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
