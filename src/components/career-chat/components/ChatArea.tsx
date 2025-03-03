
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator';
import { Briefcase, Menu } from 'lucide-react';
import { useCareerChat } from '../hooks/useCareerChat';
import { WelcomeScreen } from './WelcomeScreen';

interface ChatAreaProps {
  isMinimized: boolean;
  setIsMinimized: (value: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  onManageSessions: () => void;
}

export function ChatArea({ 
  isMinimized, 
  setIsMinimized, 
  sidebarOpen, 
  setSidebarOpen,
  onManageSessions 
}: ChatAreaProps) {
  const {
    messages,
    inputMessage,
    isTyping,
    isAnalyzing,
    currentCategory,
    questionProgress,
    messagesEndRef,
    showAnalyzeButton,
    setInputMessage,
    sendMessage,
    handleAnalyzeClick,
  } = useCareerChat();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, messagesEndRef]);

  const isFirstTimeUser = messages.length === 0 || 
    (messages.length === 1 && messages[0].message_type === 'system');

  if (isFirstTimeUser) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-blue-50/50 to-white">
        <div className="flex items-center p-3 border-b bg-white">
          {!sidebarOpen && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h2 className="font-semibold">Career Chat</h2>
        </div>
        
        <WelcomeScreen 
          onStartChat={() => sendMessage("Hi, I'd like to explore career options")} 
          onViewPastSessions={onManageSessions}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-blue-50/50 to-white">
      <ChatHeader 
        isAnalyzing={isAnalyzing} 
        currentCategory={currentCategory}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onMinimize={() => setIsMinimized(true)}
        isSidebarOpen={sidebarOpen}
      />
      
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage 
              key={message.id || index} 
              message={message} 
              onSuggestionClick={(suggestion) => sendMessage(suggestion)}
              currentQuestionProgress={questionProgress}
            />
          ))}
          
          {showAnalyzeButton && (
            <div className="flex justify-center my-4 animate-fade-in">
              <Button 
                onClick={handleAnalyzeClick}
                className="bg-primary hover:bg-primary/90 gap-2 rounded-full px-6 shadow-sm hover:shadow-md transition-all"
              >
                <Briefcase className="h-5 w-5" />
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
  );
}
