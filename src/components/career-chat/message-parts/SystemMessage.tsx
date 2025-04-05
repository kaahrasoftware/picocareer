
import React from 'react';
import { cn } from '@/lib/utils';
import { RobotAvatar } from '../robot-avatar/RobotAvatar';

interface SystemMessageProps {
  content: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  isDisabled?: boolean;
}

export function SystemMessage({ 
  content, 
  suggestions,
  onSuggestionClick,
  isDisabled = false
}: SystemMessageProps) {
  return (
    <div className="mb-6 text-center">
      <p className="text-muted-foreground mb-4">{content}</p>
      
      {suggestions && suggestions.length > 0 && onSuggestionClick && (
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              disabled={isDisabled}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                "border border-primary/30 text-primary hover:bg-primary/10",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
