
import React from 'react';
import { QuestionCard } from '@/components/career-chat/QuestionCard';
import { OptionCards } from '@/components/career-chat/OptionCards';
import { StructuredMessage } from '@/types/database/message-types';

interface StructuredQuestionMessageProps {
  message: StructuredMessage;
  currentQuestionProgress?: number;
  onSuggestionClick?: (suggestion: string) => void;
}

export function StructuredQuestionMessage({ 
  message, 
  currentQuestionProgress = 0,
  onSuggestionClick 
}: StructuredQuestionMessageProps) {
  const questionInfo = {
    question: message.content.question || '',
    intro: message.content.intro,
    category: message.metadata.progress?.category?.toLowerCase() || 'general',
    current: message.metadata.progress?.current || 1,
    total: message.metadata.progress?.total || 4,
    overall: parseFloat(message.metadata.progress?.overall || '0') || currentQuestionProgress,
    options: message.content.options || [],
    layout: message.metadata.options?.layout || 'cards',
    allowMultiple: message.metadata.options?.type === 'multiple'
  };

  return (
    <div className="flex flex-col items-start w-full space-y-6 animate-fade-in">
      <QuestionCard 
        question={questionInfo.question}
        intro={questionInfo.intro}
        category={questionInfo.category}
        questionNumber={questionInfo.current}
        totalQuestions={questionInfo.total}
        progress={typeof questionInfo.overall === 'number' ? questionInfo.overall : parseFloat(questionInfo.overall)}
      />
      
      {questionInfo.options.length > 0 && (
        <div className="w-full mt-2">
          <OptionCards 
            options={questionInfo.options}
            onSelect={(option) => onSuggestionClick && onSuggestionClick(option)}
            layout={questionInfo.layout as any}
            allowMultiple={questionInfo.allowMultiple}
          />
        </div>
      )}
    </div>
  );
}
