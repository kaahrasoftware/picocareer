
import React, { useEffect, useRef } from 'react';
import { RefreshCw, History, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CareerChatMessage } from '@/types/database/analytics';

interface ChatInterfaceProps {
  messages: CareerChatMessage[];
  inputMessage: string;
  isTyping: boolean;
  isAnalyzing: boolean;
  currentCategory: string | null;
  questionProgress: number;
  isSessionEnded: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onSuggestionClick: (suggestion: string) => void;
  onSendMessage: (message: string) => Promise<void>;
  onStartNewChat: () => void;
  onViewPastSessions: () => void;
  onEndCurrentSession: () => Promise<void>;
  onDownloadResults?: () => void;
  setInputMessage: (message: string) => void;
}

export function ChatInterface({
  messages,
  inputMessage,
  isTyping,
  isAnalyzing,
  currentCategory,
  questionProgress,
  isSessionEnded,
  messagesEndRef,
  onSuggestionClick,
  onSendMessage,
  onStartNewChat,
  onViewPastSessions,
  onEndCurrentSession,
  onDownloadResults,
  setInputMessage
}: ChatInterfaceProps) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50/50 to-white rounded-lg shadow-sm overflow-hidden border">
      <div className="flex items-center justify-between bg-white border-b p-4">
        <div className="flex-1">
          <ChatHeader 
            isAnalyzing={isAnalyzing} 
            currentCategory={currentCategory} 
            questionProgress={questionProgress}
            isSessionComplete={isSessionEnded}
            onEndSession={onEndCurrentSession}
            onDownloadResults={onDownloadResults}
          />
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
              <DropdownMenuItem onClick={onStartNewChat}>
                <RefreshCw className="h-4 w-4 mr-2" />
                New Assessment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onViewPastSessions}>
                <History className="h-4 w-4 mr-2" />
                Past Assessments
              </DropdownMenuItem>
              {isSessionEnded && onDownloadResults && (
                <DropdownMenuItem onClick={onDownloadResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Results
                </DropdownMenuItem>
              )}
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
              onSuggestionClick={onSuggestionClick} 
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
        isDisabled={isTyping || isAnalyzing} 
        isSessionComplete={isSessionEnded}
        placeholderText={isSessionEnded ? "Try exploring career paths or start a new assessment..." : "Type your message..."}
        onDownloadResults={onDownloadResults}
        onStartNewChat={onStartNewChat}
      />
    </div>
  );
}
