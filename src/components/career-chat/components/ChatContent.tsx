
import React from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { CareerChatMessage } from '@/types/database/analytics';

interface ChatContentProps {
  messages: CareerChatMessage[];
  inputMessage: string;
  isTyping: boolean;
  isAnalyzing: boolean;
  currentCategory: string | null;
  questionProgress: number;
  isSessionComplete: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isSidebarOpen: boolean | undefined;
  onOpenSidebar: (() => void) | undefined;
  onSuggestionClick: (suggestion: string) => void;
  onBeginAssessment: () => void;
  onSendMessage: (message: string) => void;
  onStartNewChat: () => void;
  onViewPastSessions: () => void;
  onEndCurrentSession: () => Promise<void>;
  onDownloadResults: () => void;
  setInputMessage: (message: string) => void;
}

export function ChatContent({
  messages,
  inputMessage,
  isTyping,
  isAnalyzing,
  currentCategory,
  questionProgress,
  isSessionComplete,
  messagesEndRef,
  isSidebarOpen,
  onOpenSidebar,
  onSuggestionClick,
  onBeginAssessment,
  onSendMessage,
  onStartNewChat,
  onViewPastSessions,
  onEndCurrentSession,
  onDownloadResults,
  setInputMessage
}: ChatContentProps) {
  return (
    <div className="h-full">
      {!isSidebarOpen && (
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenSidebar}
          className="absolute top-4 left-4 z-10 h-8 w-8 md:hidden bg-white/80"
        >
          <PanelLeftOpen size={16} />
        </Button>
      )}
      <ChatInterface 
        messages={messages}
        inputMessage={inputMessage}
        isTyping={isTyping}
        isAnalyzing={isAnalyzing}
        currentCategory={currentCategory}
        questionProgress={questionProgress}
        isSessionEnded={isSessionComplete}
        messagesEndRef={messagesEndRef}
        onSuggestionClick={onSuggestionClick}
        onBeginAssessment={onBeginAssessment}
        onSendMessage={onSendMessage}
        onStartNewChat={onStartNewChat}
        onViewPastSessions={onViewPastSessions}
        onEndCurrentSession={onEndCurrentSession}
        onDownloadResults={onDownloadResults}
        setInputMessage={setInputMessage}
      />
    </div>
  );
}
