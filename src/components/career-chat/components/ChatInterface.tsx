
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
import { cn } from '@/lib/utils';

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
  onBeginAssessment: () => void;
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
  onBeginAssessment,
  onSendMessage,
  onStartNewChat,
  onViewPastSessions,
  onEndCurrentSession,
  onDownloadResults,
  setInputMessage
}: ChatInterfaceProps) {
  // Auto-scroll to bottom on new messages or typing changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping, messagesEndRef]);
  
  // Determine if any action is in progress
  const isActionInProgress = isTyping || isAnalyzing;
  
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
              <DropdownMenuItem onClick={onStartNewChat} disabled={isActionInProgress}>
                <RefreshCw className="h-4 w-4 mr-2" />
                New Assessment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onViewPastSessions} disabled={isActionInProgress}>
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
      
      <ScrollArea 
        className={cn(
          "flex-1 p-4 overflow-y-auto",
          isActionInProgress && "opacity-90"
        )}
      >
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage 
              key={message.id || index} 
              message={message} 
              onSuggestionClick={onSuggestionClick}
              onBeginAssessment={onBeginAssessment}
              currentQuestionProgress={questionProgress} 
              isDisabled={isActionInProgress}
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
