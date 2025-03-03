
import React, { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { History, RefreshCw, Briefcase } from 'lucide-react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { CareerChatMessage } from '@/types/database/analytics';

interface ChatContainerProps {
  messages: CareerChatMessage[];
  inputMessage: string;
  isTyping: boolean;
  isAnalyzing: boolean;
  currentCategory: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  questionProgress: number;
  showAnalyzeButton: boolean;
  setInputMessage: (message: string) => void;
  sendMessage: (message: string) => void;
  handleAnalyzeClick: () => void;
  handleStartNewChat: () => void;
  handleSuggestionClick: (suggestion: string) => void;
  onManageSessions: () => void;
}

export function ChatContainer({
  messages,
  inputMessage,
  isTyping,
  isAnalyzing,
  currentCategory,
  messagesEndRef,
  questionProgress,
  showAnalyzeButton,
  setInputMessage,
  sendMessage,
  handleAnalyzeClick,
  handleStartNewChat,
  handleSuggestionClick,
  onManageSessions
}: ChatContainerProps) {
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, messagesEndRef]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50/50 to-white rounded-lg shadow-sm overflow-hidden border">
      <div className="flex items-center justify-between bg-white border-b p-4">
        <div className="flex-1">
          <ChatHeader isAnalyzing={isAnalyzing} currentCategory={currentCategory} />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <History className="h-4 w-4" />
                Manage
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleStartNewChat}>
                <RefreshCw className="h-4 w-4 mr-2" />
                New Conversation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onManageSessions}>
                <History className="h-4 w-4 mr-2" />
                Past Conversations
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage 
              key={message.id || index} 
              message={message} 
              onSuggestionClick={handleSuggestionClick}
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
