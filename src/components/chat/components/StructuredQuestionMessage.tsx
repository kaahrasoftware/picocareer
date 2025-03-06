
import React from 'react';
import { StructuredMessage } from '@/types/database/message-types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

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
  // Extract the category and progress information
  const category = message.metadata?.progress?.category?.toLowerCase() || 'general';
  const currentQuestion = message.metadata?.progress?.current || 0;
  const totalQuestions = message.metadata?.progress?.total || 6;
  const progress = message.metadata?.progress?.overall || currentQuestionProgress;
  
  // Extract the question information
  const intro = message.content.intro || '';
  const question = message.content.question || '';
  const options = message.content.options || [];
  const optionType = message.metadata?.options?.type || 'single';
  const optionLayout = message.metadata?.options?.layout || 'buttons';
  
  // Handle option layout styles
  const getOptionLayout = () => {
    switch (optionLayout) {
      case 'cards':
        return 'grid grid-cols-1 md:grid-cols-2 gap-2';
      case 'chips':
        return 'flex flex-wrap gap-2';
      case 'buttons':
      default:
        return 'flex flex-col gap-2';
    }
  };

  // Category gradient for styling
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
        {/* Introduction text */}
        {intro && <p className="text-sm text-gray-700 mb-2">{intro}</p>}
        
        {/* The question */}
        <p className="text-sm font-medium text-gray-800 mb-3">{question}</p>
        
        {/* Progress indicator */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Question {currentQuestion}/{totalQuestions}</span>
            <span>{progress}% complete</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
        
        {/* Options */}
        <div className={getOptionLayout()}>
          {options.map((option, index) => (
            <Button
              key={option.id || index}
              variant={optionLayout === 'cards' ? 'outline' : 'secondary'}
              size={optionLayout === 'chips' ? 'sm' : 'default'}
              className={`justify-start ${optionLayout === 'cards' ? 'h-auto py-3 text-left' : ''}`}
              onClick={() => onSuggestionClick && onSuggestionClick(option.text)}
            >
              {option.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
