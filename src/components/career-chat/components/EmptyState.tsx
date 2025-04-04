
import React from 'react';
import { MessageCircle, History, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RobotAvatar } from '../robot-avatar/RobotAvatar';

interface EmptyStateProps {
  onStartChat: () => void;
  onViewPastSessions: () => void;
}

export function EmptyState({ onStartChat, onViewPastSessions }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 text-center px-4">
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-blue-100 flex items-center justify-center mb-4">
        <RobotAvatar size="lg" isAnimated={true} />
      </div>
      <h1 className="text-3xl font-bold text-gray-800">Hey there... I am Pico!</h1>
      <p className="text-lg text-muted-foreground max-w-md">
        I'm here to help you explore career options and find the perfect path for your skills and interests.
      </p>
      
      <div className="bg-white/80 p-6 rounded-lg border shadow-sm max-w-md">
        <h3 className="font-semibold text-lg mb-3">What would you like to do?</h3>
        <div className="space-y-3">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 gap-2 rounded-full px-6 py-6 shadow-sm hover:shadow-md transition-all justify-start" 
            size="lg" 
            onClick={onStartChat}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="flex-1 text-left">Start New Career Assessment</span>
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          
          <Button 
            className="w-full gap-2 rounded-full px-6 shadow-sm hover:shadow-md transition-all justify-start" 
            size="lg" 
            variant="outline" 
            onClick={onViewPastSessions}
          >
            <History className="h-5 w-5" />
            <span className="flex-1 text-left">View Past Assessments</span>
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
