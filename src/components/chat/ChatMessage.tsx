
import React from 'react';
import { CircleDashed, AlertCircle, Bot, User, SparkleIcon } from 'lucide-react';
import clsx from 'clsx';
import { Avatar } from '@/components/ui/avatar';
import { BotMessage } from '../career-chat/message-parts/BotMessage';
import { UserMessage } from '../career-chat/message-parts/UserMessage';
import { SystemMessage } from '../career-chat/message-parts/SystemMessage';
import { RecommendationSection } from '../career-chat/message-parts/RecommendationSection';
import { CareerChatMessage } from '@/types/database/analytics';
import { Badge } from '@/components/ui/badge';

type ChatMessageProps = {
  message: CareerChatMessage;
  onSuggestionClick?: (suggestion: string) => void;
  onCareerDetailsClick?: (careerId: string) => void;
  currentQuestionProgress?: number;
};

export const ChatMessage = ({
  message,
  onSuggestionClick,
  onCareerDetailsClick,
  currentQuestionProgress
}: ChatMessageProps) => {
  if (!message) return null;

  const isUser = message.message_type === 'user';
  const isBot = message.message_type === 'bot';
  const isSystem = message.message_type === 'system';
  const isRecommendation = message.message_type === 'recommendation';
  const isSessionEnd = message.message_type === 'session_end';
  const isFromCache = message.metadata?.fromCache || message.metadata?.fromTemplate;

  return (
    <div className={clsx(
      "flex items-start gap-3 py-2 px-4",
      isUser && "bg-background",
      isBot && "bg-muted/30",
      isSystem && "bg-amber-50 dark:bg-amber-950/20",
      isRecommendation && "bg-blue-50 dark:bg-blue-950/20",
      isSessionEnd && "bg-green-50 dark:bg-green-950/20",
    )}>
      {/* Avatar */}
      <div className="mt-0.5">
        <Avatar className={clsx(
          "h-8 w-8 border",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted-foreground/10",
        )}>
          {isUser && <User className="h-4 w-4" />}
          {isBot && <Bot className="h-4 w-4" />}
          {isSystem && <AlertCircle className="h-4 w-4" />}
          {(isRecommendation || isSessionEnd) && <SparkleIcon className="h-4 w-4" />}
        </Avatar>
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-sm">
            {isUser && 'You'}
            {isBot && 'Pico'}
            {isSystem && 'System'}
            {isRecommendation && 'Career Recommendations'}
            {isSessionEnd && 'Session Complete'}
          </div>
          
          {/* Cache indicator */}
          {isFromCache && (
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
              <CircleDashed className="h-3 w-3 mr-1" />
              Fast Response
            </Badge>
          )}
        </div>

        <div className="text-sm">
          {isUser && <UserMessage message={message} />}
          
          {isBot && (
            <BotMessage 
              message={message} 
              onSuggestionClick={onSuggestionClick} 
              currentProgress={currentQuestionProgress}
            />
          )}
          
          {isSystem && <SystemMessage message={message} />}
          
          {(isRecommendation || isSessionEnd) && (
            <RecommendationSection 
              message={message} 
              onSuggestionClick={onSuggestionClick}
              onCareerDetailsClick={onCareerDetailsClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};
