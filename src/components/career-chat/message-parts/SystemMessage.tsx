
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
    <div className="flex flex-col space-y-3 mb-4">
      <div className="flex items-start space-x-3">
        <div className="mt-0.5">
          <RobotAvatar size="sm" showSpeechBubble={false} />
        </div>
        <div className="bg-muted/50 rounded-lg p-3 max-w-[85%]">
          <p className="text-sm text-muted-foreground">{content}</p>
        </div>
      </div>
      
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-12">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className={cn(
                "bg-background hover:bg-muted text-sm",
                isDisabled && "opacity-60 pointer-events-none"
              )}
              onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
              disabled={isDisabled}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
