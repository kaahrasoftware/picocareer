
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
    <div className="flex flex-col space-y-3 mb-4">
      <div className="flex items-start space-x-3">
        <div className="mt-0.5">
          <RobotAvatar size="sm" showSpeechBubble={false} />
        </div>
        <div className="bg-muted/50 rounded-lg p-3 max-w-[85%]">
          <p className="text-sm text-muted-foreground">{content}</p>
        </div>
      </div>
    </div>
  );
}
