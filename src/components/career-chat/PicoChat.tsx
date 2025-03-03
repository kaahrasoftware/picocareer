
import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { MainLayout } from '@/router/layouts';
import { useCareerChat } from './hooks/useCareerChat';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export function PicoChat() {
  const {
    messages,
    inputMessage,
    isLoading,
    isTyping,
    isAnalyzing,
    hasConfigError,
    messagesEndRef,
    setInputMessage,
    sendMessage
  } = useCareerChat();
  
  const { toast } = useToast();
  const [configChecked, setConfigChecked] = useState(false);
  const [showAnalyzeButton, setShowAnalyzeButton] = useState(false);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  // Show toast if DeepSeek API key is not configured
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
    
    // Only run the check if we have no messages (first load)
    if (!isLoading && messages.length <= 2 && !configChecked) {
      checkApiConfig();
    }
  }, [toast, messages.length, isLoading, configChecked]);
  
  // Show analyze button after several user messages
  useEffect(() => {
    const userMessageCount = messages.filter(msg => msg.message_type === 'user').length;
    
    // Show the analyze button after at least 4 user responses
    if (userMessageCount >= 4 && !isAnalyzing && !showAnalyzeButton) {
      setShowAnalyzeButton(true);
    }
    
    // Hide the button after analysis
    if (isAnalyzing || messages.some(msg => msg.message_type === 'recommendation')) {
      setShowAnalyzeButton(false);
    }
  }, [messages, isAnalyzing, showAnalyzeButton]);
  
  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };
  
  // Handle analyze button click
  const handleAnalyzeClick = () => {
    // This will trigger the career analysis
    const { analyzeResponses } = require('./hooks/useCareerAnalysis').useCareerAnalysis(
      messages[0]?.session_id,
      async (message) => {
        // We're reusing the addMessage function from useCareerChat
        const { data, error } = await supabase
          .from('career_chat_messages')
          .insert(message)
          .select()
          .single();
        
        if (error) {
          console.error('Error storing message:', error);
          throw error;
        }
        
        return data;
      }
    );
    
    analyzeResponses();
    setShowAnalyzeButton(false);
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }
  
  // Show warning if configuration has an issue
  if (hasConfigError) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-2xl font-semibold">AI Chat Unavailable</h2>
          <p className="text-muted-foreground max-w-md">
            The career chat AI service is currently unavailable. Please try again later or contact an administrator.
          </p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">
        <ChatHeader isAnalyzing={isAnalyzing} />
        
        <ScrollArea className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <ChatMessage 
                key={message.id || index} 
                message={message} 
                onSuggestionClick={handleSuggestionClick}
              />
            ))}
            
            {showAnalyzeButton && (
              <div className="flex justify-center my-4">
                <Button 
                  onClick={handleAnalyzeClick}
                  className="bg-primary hover:bg-primary/90"
                >
                  Find Career Matches
                </Button>
              </div>
            )}
            
            {isTyping && <ChatTypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <ChatInput 
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={sendMessage}
          isDisabled={isTyping || isAnalyzing}
        />
      </div>
    </MainLayout>
  );
}

export default PicoChat;
