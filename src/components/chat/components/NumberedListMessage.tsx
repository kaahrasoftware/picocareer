
import React from 'react';
import { QuestionCard } from '@/components/career-chat/QuestionCard';
import { OptionCards } from '@/components/career-chat/OptionCards';
import { CareerChatMessage } from '@/types/database/analytics';
import { parseNumberedOptions } from '../utils/messageUtils';

interface NumberedListMessageProps {
  message: CareerChatMessage;
  currentQuestionProgress: number;
  onSuggestionClick?: (suggestion: string) => void;
}

export function NumberedListMessage({ 
  message, 
  currentQuestionProgress,
  onSuggestionClick 
}: NumberedListMessageProps) {
  const parsedContent = parseNumberedOptions(message.content);
  
  if (!parsedContent) return null;
  
  const { intro, question, options } = parsedContent;
  const category = (message.metadata?.category as string || 'general').toLowerCase();

  return (
    <div className="flex flex-col items-start w-full space-y-6 animate-fade-in">
      <QuestionCard 
        question={question}
        intro={intro}
        category={category}
        questionNumber={1}
        totalQuestions={4}
        progress={currentQuestionProgress}
      />
      
      {options.length > 0 && (
        <div className="w-full mt-2">
          <OptionCards 
            options={options}
            onSelect={(option) => onSuggestionClick && onSuggestionClick(option)}
            layout="cards"
            allowMultiple={message.metadata?.allowMultiple as boolean || false}
          />
        </div>
      )}
    </div>
  );
}
