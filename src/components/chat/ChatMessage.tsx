
import React from 'react';
import { CareerChatMessage } from '@/types/database/analytics';
import { QuestionCard } from '@/components/career-chat/QuestionCard';
import { OptionCards } from '@/components/career-chat/OptionCards';
import { CareerRecommendationCard } from '@/components/career-chat/message-parts/CareerRecommendationCard';
import { RecommendationSection } from '@/components/career-chat/message-parts/RecommendationSection';
import { UserMessage } from '@/components/career-chat/message-parts/UserMessage';
import { SystemMessage } from '@/components/career-chat/message-parts/SystemMessage';
import { BotMessage } from '@/components/career-chat/message-parts/BotMessage';
import { extractSections } from '@/components/career-chat/utils/recommendationParser';

interface ChatMessageProps {
  message: CareerChatMessage;
  onSuggestionClick?: (suggestion: string) => void;
  currentQuestionProgress?: number;
}

export function ChatMessage({ message, onSuggestionClick, currentQuestionProgress = 0 }: ChatMessageProps) {
  const isUser = message.message_type === 'user';
  const isRecommendation = message.message_type === 'recommendation';
  const isSystem = message.message_type === 'system';
  
  const isQuestion = message.message_type === 'bot' && 
    message.metadata && 
    message.metadata.category && 
    message.metadata.hasOptions;
  
  // Handle single career recommendation messages
  if (isRecommendation && message.metadata?.career) {
    return (
      <CareerRecommendationCard 
        career={message.metadata.career as string}
        score={message.metadata.score as number}
        description={message.content}
      />
    );
  }
  
  // Handle full recommendation message with multiple sections
  if (isRecommendation && !message.metadata?.career) {
    const sections = extractSections(message.content);
    
    if (sections.type === 'recommendation') {
      return <RecommendationSection recommendation={sections} />;
    }
    
    // If the parser couldn't identify this as a recommendation, display as normal message
    return <BotMessage content={message.content} />;
  }
  
  // For question and option messages
  if (isQuestion) {
    const category = message.metadata.category as string || 'general';
    const questionNumber = message.metadata.questionNumber as number || 1;
    const totalInCategory = message.metadata.totalInCategory as number || 4;
    
    return (
      <div className="flex flex-col items-start w-full">
        <QuestionCard 
          question={message.content}
          category={category}
          questionNumber={questionNumber}
          totalQuestions={totalInCategory}
          progress={currentQuestionProgress}
        />
        
        {message.metadata.suggestions && message.metadata.suggestions.length > 0 && (
          <OptionCards 
            options={message.metadata.suggestions as string[]}
            onSelect={(option) => onSuggestionClick && onSuggestionClick(option)}
          />
        )}
      </div>
    );
  }
  
  // Regular chat messages based on message type
  if (isUser) {
    return <UserMessage content={message.content} />;
  }
  
  if (isSystem) {
    return <SystemMessage content={message.content} />;
  }
  
  // Default to bot message for anything else
  return <BotMessage content={message.content} />;
}
