
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { MainLayout } from '@/router/layouts';
import { useCareerChat } from './hooks/useCareerChat';

export function PicoChat() {
  const {
    messages,
    inputMessage,
    isLoading,
    isTyping,
    isAnalyzing,
    messagesEndRef,
    setInputMessage,
    sendMessage
  } = useCareerChat();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <ChatMessage key={message.id || index} message={message} />
            ))}
            
            {isTyping && <ChatTypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <ChatInput 
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={sendMessage}
          isDisabled={isAnalyzing}
        />
      </div>
    </MainLayout>
  );
}

export default PicoChat;
