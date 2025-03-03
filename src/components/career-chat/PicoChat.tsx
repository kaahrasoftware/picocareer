
import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Bot } from 'lucide-react';
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
import { useCareerAnalysis } from './hooks/useCareerAnalysis';

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
    sendMessage,
    addMessage
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
  const handleAnalyzeClick = async () => {
    if (!messages[0]?.session_id) return;
    
    const { analyzeResponses } = useCareerAnalysis(
      messages[0].session_id,
      addMessage
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
      <div className="flex flex-col max-w-4xl mx-auto h-[calc(100vh-120px)] p-4">
        {messages.length === 0 || (messages.length === 1 && messages[0].message_type === 'system') ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 text-center px-4">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="h-16 w-16 text-primary animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome to Pico Career Guide</h1>
            <p className="text-lg text-muted-foreground max-w-md">
              I'm here to help you explore career options and find the perfect path for your skills and interests.
            </p>
            <Button 
              className="mt-4"
              size="lg"
              onClick={() => sendMessage("Hi, I'd like to explore career options")}
            >
              Start Career Chat
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full bg-blue-50/30 rounded-lg shadow-sm overflow-hidden border">
            <ChatHeader isAnalyzing={isAnalyzing} />
            
            <ScrollArea className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-white/80 to-blue-50/20">
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
                      className="bg-primary hover:bg-primary/90 gap-2 rounded-full px-6 shadow-sm hover:shadow-md transition-all"
                    >
                      <span>Find Career Matches</span>
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
        )}
      </div>
    </MainLayout>
  );
}

export default PicoChat;
