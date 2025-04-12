
import React, { useState, useEffect } from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator';
import { Button } from '@/components/ui/button';
import { CareerChatMessage } from '@/types/database/analytics';
import { RefreshCw, Clock, Download, ChevronDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  onSendMessage: (message: string) => void;
  onStartNewChat: () => void;
  onViewPastSessions: () => void;
  onEndCurrentSession: () => void;
  onDownloadResults: () => void;
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
  // Determine if this is an empty chat (no messages or only welcome message)
  const isEmptyChat = messages.length === 0 || 
    (messages.length === 1 && messages[0].message_type === 'system');
  
  // State to track if user has scrolled up away from bottom
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  
  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setHasNewMessages(false);
      setIsAtBottom(true);
    }
  };
  
  // Watch for new messages
  useEffect(() => {
    if (messages.length > 0 && !isAtBottom) {
      setHasNewMessages(true);
    } else if (messages.length > 0) {
      // Auto-scroll to bottom when new messages arrive if already at bottom
      scrollToBottom();
    }
  }, [messages.length]);
  
  // Handle scroll events
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const isScrolledToBottom = 
      Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 50;
    
    setIsAtBottom(isScrolledToBottom);
    if (isScrolledToBottom) {
      setHasNewMessages(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/80 rounded-lg shadow-sm overflow-hidden border">
      {/* Chat Header */}
      <div className="shadow-sm border-b flex-shrink-0">
        <ChatHeader 
          isAnalyzing={isAnalyzing}
          currentCategory={currentCategory}
          questionProgress={questionProgress}
          isSessionComplete={isSessionEnded}
          onEndSession={onEndCurrentSession}
          onDownloadResults={onDownloadResults}
        />
      </div>

      {/* Messages Container with fixed height */}
      <div className="flex-1 relative overflow-hidden">
        <ScrollArea 
          className="h-full max-h-[calc(100vh-280px)]" 
          onScroll={handleScroll}
        >
          <div className="p-4 space-y-4 bg-gradient-to-b from-white/40 to-white/10">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <p className="text-gray-400 mb-4">Your chat will appear here</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onBeginAssessment}
                  className="gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Begin Assessment
                </Button>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <ChatMessage
                    key={`${message.id}-${index}`}
                    message={message}
                    onSuggestionClick={onSuggestionClick}
                    onBeginAssessment={onBeginAssessment}
                    currentQuestionProgress={questionProgress}
                    isDisabled={isTyping || isAnalyzing}
                  />
                ))}
                {isTyping && <ChatTypingIndicator />}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>
        
        {/* Scroll to Bottom Button */}
        {(hasNewMessages || !isAtBottom) && !isEmptyChat && (
          <Button 
            variant="secondary" 
            size="sm" 
            className="absolute bottom-4 right-4 shadow-md gap-1 px-3 rounded-full opacity-90 hover:opacity-100"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-4 w-4" />
            {hasNewMessages ? 'New messages' : 'Bottom'}
          </Button>
        )}
      </div>

      {/* Action buttons for completed sessions */}
      {isSessionEnded && (
        <div className="grid grid-cols-2 gap-2 p-2 bg-blue-50 border-t border-blue-100 flex-shrink-0">
          <Button 
            variant="outline"
            onClick={onStartNewChat}
            className="gap-2 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            <RefreshCw className="h-4 w-4" />
            New Assessment
          </Button>
          <Button 
            variant="outline"
            onClick={onDownloadResults}
            className="gap-2 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            <Download className="h-4 w-4" />
            Download Results
          </Button>
        </div>
      )}

      {/* Chat Input */}
      <div className="flex-shrink-0">
        <ChatInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={onSendMessage}
          isDisabled={isTyping || isAnalyzing}
          isSessionComplete={isSessionEnded}
          placeholderText={isEmptyChat ? "Type here to start..." : "Type your response..."}
          onDownloadResults={onDownloadResults}
          onStartNewChat={onStartNewChat}
        />
      </div>
    </div>
  );
}
