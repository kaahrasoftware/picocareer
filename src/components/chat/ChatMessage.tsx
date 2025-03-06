
import React from 'react';
import { CareerChatMessage } from '@/types/database/analytics';
import { QuestionCard } from '@/components/career-chat/QuestionCard';
import { OptionCards } from '@/components/career-chat/OptionCards';
import { CareerRecommendationCard } from '@/components/career-chat/message-parts/CareerRecommendationCard';
import { RecommendationSection } from '@/components/career-chat/message-parts/RecommendationSection';
import { UserMessage } from '@/components/career-chat/message-parts/UserMessage';
import { SystemMessage } from '@/components/career-chat/message-parts/SystemMessage';
import { BotMessage } from '@/components/career-chat/message-parts/BotMessage';
import { parseStructuredRecommendation } from '@/components/career-chat/utils/recommendationParser';
import { StructuredMessage } from '@/types/database/message-types';
import { StructuredQuestionMessage } from './components/StructuredQuestionMessage';
import { NumberedListMessage } from './components/NumberedListMessage';
import { WelcomeMessage } from '@/components/career-chat/message-parts/WelcomeMessage';

interface ChatMessageProps {
  message: CareerChatMessage;
  onSuggestionClick?: (suggestion: string) => void;
  onBeginAssessment?: () => void;
  currentQuestionProgress?: number;
  isDisabled?: boolean;
}

export function ChatMessage({ 
  message, 
  onSuggestionClick, 
  onBeginAssessment,
  currentQuestionProgress = 0,
  isDisabled = false 
}: ChatMessageProps) {
  const isUser = message.message_type === 'user';
  const isRecommendation = message.message_type === 'recommendation';
  const isSystem = message.message_type === 'system';
  const isSessionEnd = message.message_type === 'session_end' || message.metadata?.isSessionEnd === true;
  const isWelcomeMessage = isSystem && message.metadata?.suggestions && 
    message.metadata.suggestions.includes("Begin Assessment");
  
  // Try to parse structured message from metadata (new format)
  const structuredMessage: StructuredMessage | null = 
    message.metadata?.structuredMessage 
      ? (message.metadata.structuredMessage as StructuredMessage) 
      : null;

  // Check if the message is in a numbered list format
  const hasNumberedList = React.useMemo(() => {
    if (message.message_type !== 'bot') return false;
    const pattern = /\d+\.\s+[A-Za-z]/;
    return pattern.test(message.content);
  }, [message]);

  const handleSuggestionSelect = (suggestion: string) => {
    if (isDisabled) return;
    
    if (suggestion === "Begin Assessment" && onBeginAssessment) {
      onBeginAssessment();
    } else if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  // Handle welcome message specially
  if (isWelcomeMessage) {
    return (
      <WelcomeMessage 
        content={message.content} 
        onBeginAssessment={onBeginAssessment}
        isDisabled={isDisabled} 
      />
    );
  }

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
  
  // Handle structured recommendation from raw response
  if (message.metadata?.rawResponse && 
     (message.metadata.rawResponse.type === 'recommendation' ||
      message.metadata.rawResponse.type === 'assessment_result')) {
    const structuredData = parseStructuredRecommendation(message.metadata.rawResponse);
    return (
      <RecommendationSection 
        recommendation={structuredData} 
        onSuggestionClick={isDisabled ? undefined : onSuggestionClick} 
      />
    );
  }
  
  // Handle full recommendation message with multiple sections
  if (isRecommendation && !message.metadata?.career) {
    const sections = parseStructuredRecommendation({ type: 'recommendation', content: message.content });
    if (sections.type === 'recommendation') {
      return (
        <RecommendationSection 
          recommendation={sections} 
          onSuggestionClick={isDisabled ? undefined : onSuggestionClick} 
        />
      );
    }
    return <BotMessage content={message.content} />;
  }

  // Handle session end message
  if (isSessionEnd) {
    const rawResponse = message.metadata?.rawResponse 
      ? message.metadata.rawResponse 
      : { type: 'session_end', content: { message: message.content } };
    
    const sections = parseStructuredRecommendation(rawResponse);
    return (
      <RecommendationSection 
        recommendation={sections} 
        onSuggestionClick={isDisabled ? undefined : onSuggestionClick}
        isSessionComplete={true}
      />
    );
  }

  // Handle structured question format (new)
  if (structuredMessage?.type === 'question') {
    return (
      <StructuredQuestionMessage 
        message={structuredMessage}
        currentQuestionProgress={currentQuestionProgress}
        onSuggestionClick={isDisabled ? undefined : handleSuggestionSelect}
        isDisabled={isDisabled}
      />
    );
  }
  
  // Handle detected numbered list format
  if (hasNumberedList) {
    return (
      <NumberedListMessage 
        message={message}
        currentQuestionProgress={currentQuestionProgress}
        onSuggestionClick={isDisabled ? undefined : handleSuggestionSelect}
        isDisabled={isDisabled}
      />
    );
  }
  
  // Regular chat messages based on message type
  if (isUser) {
    return <UserMessage content={message.content} />;
  }
  
  if (isSystem) {
    return (
      <SystemMessage 
        content={message.content}
        suggestions={message.metadata?.suggestions as string[] | undefined} 
        onSuggestionClick={handleSuggestionSelect}
        isDisabled={isDisabled}
      />
    );
  }
  
  // Handle structured conversation (new format)
  if (structuredMessage?.type === 'conversation') {
    const category = structuredMessage.metadata?.progress?.category?.toLowerCase();
    return (
      <BotMessage 
        content={structuredMessage.content.intro || message.content} 
        category={category} 
      />
    );
  }
  
  // Default to bot message for anything else with category info if available
  return (
    <BotMessage 
      content={message.content} 
      category={(message.metadata?.category as string || '').toLowerCase()} 
    />
  );
}
