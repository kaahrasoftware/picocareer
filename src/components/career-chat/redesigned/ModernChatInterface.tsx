
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator';
import { CareerChatMessage } from '@/types/database/analytics';
import { ChatProgress } from './ChatProgress';
import { Button } from '@/components/ui/button';
import { RotateCcw, Download } from 'lucide-react';

interface ModernChatInterfaceProps {
  messages: CareerChatMessage[];
  inputMessage: string;
  isTyping: boolean;
  isAnalyzing: boolean;
  currentCategory: string | null;
  questionProgress: number;
  isSessionComplete: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onSuggestionClick: (suggestion: string) => void;
  onSendMessage: (message: string) => Promise<void>;
  onStartNewChat: () => void;
  onDownloadResults?: () => void;
  setInputMessage: (message: string) => void;
}

export function ModernChatInterface({
  messages,
  inputMessage,
  isTyping,
  isAnalyzing,
  currentCategory,
  questionProgress,
  isSessionComplete,
  messagesEndRef,
  onSuggestionClick,
  onSendMessage,
  onStartNewChat,
  onDownloadResults,
  setInputMessage
}: ModernChatInterfaceProps) {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Progress Header */}
      <ChatProgress 
        currentCategory={currentCategory}
        questionProgress={questionProgress}
        isSessionComplete={isSessionComplete}
      />
      
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <ChatMessage 
              key={message.id || index} 
              message={message} 
              onSuggestionClick={onSuggestionClick}
              currentQuestionProgress={questionProgress} 
              isDisabled={isTyping || isAnalyzing}
            />
          ))}
          
          {isTyping && <ChatTypingIndicator />}
          
          {/* Session Complete Actions */}
          {isSessionComplete && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6 border-t">
              <Button 
                onClick={onStartNewChat}
                variant="default"
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Start New Assessment
              </Button>
              
              {onDownloadResults && (
                <Button 
                  onClick={onDownloadResults}
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Results
                </Button>
              )}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Chat Input */}
      {!isSessionComplete && (
        <div className="border-t bg-gray-50/50">
          <div className="max-w-4xl mx-auto">
            <ChatInput 
              inputMessage={inputMessage} 
              setInputMessage={setInputMessage} 
              onSendMessage={onSendMessage}
              isDisabled={isTyping || isAnalyzing} 
              isSessionComplete={isSessionComplete}
              placeholderText="Share your thoughts or ask questions..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
