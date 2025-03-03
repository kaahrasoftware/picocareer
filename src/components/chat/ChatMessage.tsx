
import React from 'react';
import { CareerChatMessage } from '@/types/database/analytics';
import { Button } from '@/components/ui/button';

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
      <div className="bg-gradient-to-r from-white to-blue-50 border border-primary/20 p-4 rounded-lg shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-lg">{message.metadata.career}</h4>
          <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
            {message.metadata.score}% Match
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{message.content}</p>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} mb-4`}>
      <div 
        className={`max-w-[90%] rounded-lg px-4 py-3 shadow-sm ${
          isUser 
            ? "bg-primary text-primary-foreground" 
            : message.message_type === 'system' 
              ? "bg-muted/80" 
              : "bg-white border"
        }`}
      >
        <p className={`text-sm ${isUser ? "text-primary-foreground" : ""}`}>
          {message.content}
        </p>
      </div>
      
      {hasSuggestions && message.metadata.suggestions && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 max-w-[90%]">
          {message.metadata.suggestions.map((suggestion: string, index: number) => (
            <Button 
              key={index}
              variant="outline" 
              size="sm"
              className="justify-start text-sm whitespace-normal h-auto py-2 border-primary/20 hover:bg-primary/5 transition-all"
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
