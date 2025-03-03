
import React from 'react';
import { CareerChatMessage } from '@/types/database/analytics';
import { Button } from '@/components/ui/button';
import { Bot, User, InfoIcon, Trophy, Stars } from 'lucide-react';

interface ChatMessageProps {
  message: CareerChatMessage;
  onSuggestionClick?: (suggestion: string) => void;
}

export function ChatMessage({ message, onSuggestionClick }: ChatMessageProps) {
  const isUser = message.message_type === 'user';
  const isRecommendation = message.message_type === 'recommendation';
  const hasSuggestions = message.message_type === 'bot' && 
    message.metadata && 
    message.metadata.hasOptions && 
    Array.isArray(message.metadata.suggestions);
  
  if (isRecommendation && message.metadata?.career) {
    return (
      <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg shadow-sm backdrop-blur-sm my-4 transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <h4 className="font-medium text-lg text-primary">{message.metadata.career}</h4>
          </div>
          <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-full flex items-center gap-1">
            <Stars className="h-3 w-3" />
            {message.metadata.score}% Match
          </span>
        </div>
        <p className="text-sm text-muted-foreground pl-7">{message.content}</p>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} mb-4`}>
      <div className="flex items-start gap-2 max-w-[90%]">
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
            {message.message_type === 'system' ? (
              <InfoIcon className="h-4 w-4 text-primary" />
            ) : (
              <Bot className="h-4 w-4 text-primary" />
            )}
          </div>
        )}
        
        <div 
          className={`rounded-lg px-4 py-2 ${
            isUser 
              ? "bg-primary text-primary-foreground rounded-tr-none" 
              : message.message_type === 'system' 
                ? "bg-muted/80 border border-border/50 backdrop-blur-sm" 
                : "bg-card border border-border/50 backdrop-blur-sm rounded-tl-none"
          }`}
        >
          <p className={`text-sm ${isUser ? "text-primary-foreground" : ""}`}>
            {message.content}
          </p>
        </div>
        
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
      </div>
      
      {/* Display suggestion buttons if available */}
      {hasSuggestions && message.metadata.suggestions && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-w-[90%] ml-10">
          {message.metadata.suggestions.map((suggestion: string, index: number) => (
            <Button 
              key={index}
              variant="secondary" 
              size="sm"
              className="justify-start text-sm whitespace-normal h-auto py-2 text-left pl-3 transition-all hover:bg-primary/10"
              onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
