
import React, { useMemo } from 'react';
import { CareerChatMessage } from '@/types/database/analytics';
import { BotMessage } from '@/components/career-chat/message-parts/BotMessage';
import { OptionCards } from '@/components/career-chat/OptionCards';
import { MessageOption } from '@/types/database/message-types';

interface NumberedListMessageProps {
  message: CareerChatMessage;
  currentQuestionProgress: number;
  onSuggestionClick?: (suggestion: string) => void;
  isDisabled?: boolean;
}

export function NumberedListMessage({
  message,
  currentQuestionProgress,
  onSuggestionClick,
  isDisabled = false
}: NumberedListMessageProps) {
  // Parse the content to extract a potential question and options
  const { question, options } = useMemo(() => {
    const lines = message.content.split('\n');
    
    // Try to find a question (usually first non-empty line)
    let questionText = '';
    for (const line of lines) {
      if (line.trim() && !line.match(/^\d+\./)) {
        questionText = line.trim();
        break;
      }
    }
    
    // Extract numbered options
    const optionList: MessageOption[] = [];
    const optionRegex = /^\s*(\d+)\.\s+(.*)/;
    
    for (const line of lines) {
      const match = line.match(optionRegex);
      if (match) {
        optionList.push({
          id: `option-${match[1]}`,
          text: match[2].trim()
        });
      }
    }
    
    return {
      question: questionText,
      options: optionList
    };
  }, [message.content]);
  
  const handleOptionSelect = (option: string) => {
    if (onSuggestionClick && !isDisabled) {
      onSuggestionClick(option);
    }
  };
  
  // If we can't parse options, just show the regular message
  if (options.length === 0) {
    return (
      <BotMessage 
        content={message.content} 
        category={(message.metadata?.category as string || '').toLowerCase()} 
      />
    );
  }
  
  return (
    <div className="w-full space-y-4 mb-6">
      {/* Display the question part */}
      <BotMessage 
        content={question} 
        category={(message.metadata?.category as string || '').toLowerCase()} 
      />
      
      {/* Display the options as interactive buttons */}
      <OptionCards
        options={options}
        onSelect={handleOptionSelect}
        layout="chips"
        disabled={isDisabled}
      />
    </div>
  );
}
