
import React from 'react';
import { MessageCircle, History, ArrowRight, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RobotAvatar } from '../robot-avatar/RobotAvatar';
import { useNavigate } from 'react-router-dom';
import { useAuthSession } from '@/hooks/useAuthSession';

interface EmptyStateProps {
  onStartChat: () => void;
  onViewPastSessions: () => void;
}

export function EmptyState({ onStartChat, onViewPastSessions }: EmptyStateProps) {
  const { isAuthenticated } = useAuthSession();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/auth');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 text-center px-4">
      <div className="mb-4">
        <RobotAvatar size="xl" isAnimated={true} showSpeechBubble={true} />
      </div>
      <h1 className="text-3xl font-bold text-gray-800">Hey there... I am Pico!</h1>
      
      {isAuthenticated ? (
        <>
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
        </>
      ) : (
        <>
          <p className="text-lg text-muted-foreground max-w-md">
            Please sign in to start your career assessment journey with me!
          </p>
          
          <div className="bg-white/80 p-6 rounded-lg border shadow-sm max-w-md">
            <h3 className="font-semibold text-lg mb-3">Ready to discover your ideal career path?</h3>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 gap-2 rounded-full px-6 py-6 shadow-sm hover:shadow-md transition-all justify-start" 
              size="lg" 
              onClick={handleLoginClick}
            >
              <LogIn className="h-5 w-5" />
              <span className="flex-1 text-left">Sign In to Start Assessment</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
