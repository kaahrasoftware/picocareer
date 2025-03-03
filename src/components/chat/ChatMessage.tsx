
import React from 'react';
import { CareerChatMessage } from '@/types/database/analytics';

interface ChatMessageProps {
  message: CareerChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.message_type === 'user';
  const isRecommendation = message.message_type === 'recommendation';
  
  if (isRecommendation && message.metadata?.career) {
    return (
      <div className="bg-card border border-primary/20 p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-lg">{message.metadata.career}</h4>
          <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded">
            {message.metadata.score}% Match
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{message.content}</p>
      </div>
    );
  }
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div 
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser 
            ? "bg-primary text-primary-foreground" 
            : message.message_type === 'system' 
              ? "bg-muted" 
              : "bg-card border"
        }`}
      >
        <p className={`text-sm ${isUser ? "text-primary-foreground" : ""}`}>
          {message.content}
        </p>
      </div>
    </div>
  );
}
