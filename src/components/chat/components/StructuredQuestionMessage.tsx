
import React from 'react';
import { StructuredMessage } from '@/types/database/message-types';
import { QuestionCard } from '@/components/career-chat/QuestionCard';
import { OptionCards } from '@/components/career-chat/OptionCards';

interface StructuredQuestionMessageProps {
  message: StructuredMessage;
  currentQuestionProgress: number;
  onSuggestionClick?: (suggestion: string) => void;
  isDisabled?: boolean;
}

export function StructuredQuestionMessage({
  message,
  currentQuestionProgress,
  onSuggestionClick,
  isDisabled = false
}: StructuredQuestionMessageProps) {
  // Extract question data
  const content = message.content;
  const progress = message.metadata?.progress;
  const options = content.options || [];
  const category = progress?.category || 'general';
  const questionNumber = progress?.current || 1;
  const totalQuestions = progress?.total || 1;
  const layoutType = message.metadata?.options?.layout || 'buttons';
  const allowMultiple = message.metadata?.options?.type === 'multiple';
  const allowCustom = message.metadata?.options?.allow_custom || false;

  // Determine layout based on metadata or heuristics
  let layout: 'cards' | 'chips' = 'cards';
  if (layoutType === 'chips' || layoutType === 'buttons') {
    layout = 'chips';
  } else if (options.length < 3) {
    layout = 'chips';
  }

  const handleOptionSelect = (option: string) => {
    if (onSuggestionClick && !isDisabled) {
      onSuggestionClick(option);
    }
  };

  return (
    <div className="w-full animate-fade-in space-y-4 mb-6">
      <QuestionCard
        question={content.question || ""}
        intro={content.intro}
        category={category}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        progress={currentQuestionProgress}
      />
      
      <OptionCards
        options={options}
        onSelect={handleOptionSelect}
        layout={layout}
        allowMultiple={allowMultiple}
        disabled={isDisabled}
      />
    </div>
  );
}
