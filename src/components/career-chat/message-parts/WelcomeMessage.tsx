
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RobotAvatar } from '../robot-avatar/RobotAvatar';

interface WelcomeMessageProps {
  content: string;
  onBeginAssessment?: () => void;
  isDisabled?: boolean;
}

export function WelcomeMessage({ 
  content, 
  onBeginAssessment,
  isDisabled = false 
}: WelcomeMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center mb-8 max-w-lg mx-auto text-center p-6 bg-white rounded-xl shadow-sm border border-primary/20">
      <div className="mb-4">
        <RobotAvatar size="xl" />
      </div>
      
      <h2 className="text-xl font-semibold mb-3">Welcome to Your Career Assessment</h2>
      
      <p className="text-muted-foreground mb-6">{content}</p>
      
      {onBeginAssessment && (
        <Button
          onClick={onBeginAssessment}
          disabled={isDisabled}
          className={cn(
            "font-medium transition-all",
            isDisabled ? "opacity-70" : "hover:scale-105"
          )}
          size="lg"
        >
          Begin Assessment
        </Button>
      )}
    </div>
  );
}
