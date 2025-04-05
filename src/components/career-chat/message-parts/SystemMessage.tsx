
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
    <div className="flex items-start gap-3 rounded-lg p-3 mb-4 transition-colors">
      <div className="flex-shrink-0">
        <RobotAvatar size="sm" showSpeechBubble={false} />
      </div>
      <div className="flex-1">
        <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
}
