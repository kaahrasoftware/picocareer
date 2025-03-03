
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CareerChatMessage } from '@/types/database/analytics';

interface ChatMessageProps {
  message: CareerChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.message_type === 'user';
  const isSystem = message.message_type === 'system';
  const isRecommendation = message.message_type === 'recommendation';
  
  if (isSystem) {
    return <SystemMessage message={message} />;
  }
  
  if (isRecommendation) {
    return <RecommendationMessage message={message} />;
  }
  
  return isUser ? <UserMessage message={message} /> : <BotMessage message={message} />;
}

interface MessageComponentProps {
  message: CareerChatMessage;
}

export function SystemMessage({ message }: MessageComponentProps) {
  return (
    <div className="flex justify-center my-6">
      <div className="bg-muted px-4 py-2 rounded-full text-sm text-center">
        {message.content}
      </div>
    </div>
  );
}

export function RecommendationMessage({ message }: MessageComponentProps) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex justify-center">
        <Badge variant="outline" className="text-sm">
          Career Recommendation
        </Badge>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted p-3 border-b flex justify-between items-center">
          <h3 className="font-semibold">{message.metadata?.career}</h3>
          <Badge>{message.metadata?.score}% Match</Badge>
        </div>
        <div className="p-4">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

export function UserMessage({ message }: MessageComponentProps) {
  return (
    <div className="flex items-start gap-3 flex-row-reverse">
      <Avatar className="h-8 w-8 bg-secondary text-white flex items-center justify-center">
        <span className="text-sm font-semibold">U</span>
      </Avatar>
      <div className="flex-1 rounded-lg p-3 text-sm bg-secondary/10">
        {message.content.split('\n').map((paragraph, i) => (
          <p key={i} className={i > 0 ? 'mt-2' : ''}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

export function BotMessage({ message }: MessageComponentProps) {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8 bg-primary text-white flex items-center justify-center">
        <span className="text-sm font-semibold">P</span>
      </Avatar>
      <div className="flex-1 rounded-lg p-3 text-sm bg-muted">
        {message.content.split('\n').map((paragraph, i) => (
          <p key={i} className={i > 0 ? 'mt-2' : ''}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
