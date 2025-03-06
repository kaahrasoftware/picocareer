
import React from 'react';
import { CareerChatMessage } from '@/types/database/analytics';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface NumberedListMessageProps {
  message: CareerChatMessage;
  currentQuestionProgress?: number;
  onSuggestionClick?: (suggestion: string) => void;
}

export function NumberedListMessage({ 
  message, 
  currentQuestionProgress = 0,
  onSuggestionClick
}: NumberedListMessageProps) {
  // Try to extract options from numbered list format
  const extractOptions = () => {
    const options: string[] = [];
    const regex = /\d+\.\s+([A-Za-z].*?)(?=\d+\.|$)/gs;
    let match;
    
    while ((match = regex.exec(message.content)) !== null) {
      if (match[1]) {
        options.push(match[1].trim());
      }
    }
    
    return options;
  };
  
  const options = extractOptions();
  
  // Extract the main question text (everything before the first numbered option)
  const getQuestionText = () => {
    const firstNumberIndex = message.content.search(/\d+\./);
    if (firstNumberIndex > 0) {
      return message.content.substring(0, firstNumberIndex).trim();
    }
    return message.content;
  };
  
  const questionText = getQuestionText();
  
  // Get category styling
  const category = (message.metadata?.category as string || '').toLowerCase();
  
  const getCategoryGradient = () => {
    switch (category) {
      case 'education':
        return "from-indigo-50 to-white border-indigo-200";
      case 'skills':
        return "from-emerald-50 to-white border-emerald-200";
      case 'workstyle':
        return "from-amber-50 to-white border-amber-200";
      case 'goals':
        return "from-blue-50 to-white border-blue-200";
      default:
        return "from-blue-50 to-white border-blue-200";
    }
  };
  
  return (
    <div className="flex flex-col items-start mb-4 animate-fade-in">
      <div className={`max-w-[95%] rounded-xl px-4 py-3 shadow-sm bg-gradient-to-br ${getCategoryGradient()} border`}>
        {/* Question text */}
        <p className="text-sm text-gray-700 mb-3">{questionText}</p>
        
        {/* Progress indicator */}
        {currentQuestionProgress > 0 && (
          <div className="mb-3">
            <div className="flex justify-end text-xs text-gray-500 mb-1">
              <span>{currentQuestionProgress}% complete</span>
            </div>
            <Progress value={currentQuestionProgress} className="h-1" />
          </div>
        )}
        
        {/* Options */}
        {options.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {options.map((option, index) => (
              <Button
                key={index}
                variant="secondary"
                className="justify-start text-left"
                onClick={() => onSuggestionClick && onSuggestionClick(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
