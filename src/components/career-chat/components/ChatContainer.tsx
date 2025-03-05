
import React from 'react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatHeaderActions } from './ChatHeaderActions';
import { CareerChatMessage } from '@/types/database/analytics';

interface ChatContainerProps {
  messages: CareerChatMessage[];
  inputMessage: string;
  isTyping: boolean;
  isAnalyzing: boolean;
  isSessionEnded: boolean;
  currentCategory: string | null;
  questionProgress: number;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onSendMessage: (message: string) => void;
  onStartNewChat: () => void;
  onShowSessions: () => void;
  setInputMessage: (message: string) => void;
  onCareerDetailsClick: (careerId: string) => void;
}

export function ChatContainer({
  messages,
  inputMessage,
  isTyping,
  isAnalyzing,
  isSessionEnded,
  currentCategory,
  questionProgress,
  messagesEndRef,
  onSendMessage,
  onStartNewChat,
  onShowSessions,
  setInputMessage,
  onCareerDetailsClick
}: ChatContainerProps) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50/50 to-white rounded-lg shadow-sm overflow-hidden border">
      <div className="flex items-center justify-between bg-white border-b p-4">
        <div className="flex-1">
          <ChatHeader isAnalyzing={isAnalyzing} currentCategory={currentCategory} />
        </div>
        
        <div className="flex gap-2">
          <ChatHeaderActions 
            onStartNewChat={onStartNewChat}
            onShowSessions={onShowSessions}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage 
              key={message.id || index} 
              message={message} 
              onSuggestionClick={onSendMessage} 
              onCareerDetailsClick={onCareerDetailsClick}
              currentQuestionProgress={questionProgress} 
            />
          ))}
          
          {isTyping && <ChatTypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <ChatInput 
        inputMessage={inputMessage} 
        setInputMessage={setInputMessage} 
        onSendMessage={onSendMessage} 
        isDisabled={isTyping || isAnalyzing || isSessionEnded}
        placeholder={isSessionEnded ? "Conversation ended. Start a new chat to continue." : "Type your question..."}
      />
    </div>
  );
}
