
import React from 'react';
import { Bot, MessageCircle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onStartChat: () => void;
  onViewPastSessions: () => void;
}

export function WelcomeScreen({ onStartChat, onViewPastSessions }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 text-center px-4">
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-blue-100 flex items-center justify-center mb-4 animate-pulse">
        <Bot className="h-16 w-16 text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800">Welcome to Pico Career Guide</h1>
      <p className="text-lg text-muted-foreground max-w-md">
        I'm here to help you explore career options and find the perfect path for your skills and interests.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Button 
          className="bg-primary hover:bg-primary/90 gap-2 rounded-full px-6 py-6 shadow-sm hover:shadow-md transition-all"
          size="lg"
          onClick={onStartChat}
        >
          <MessageCircle className="h-5 w-5" />
          <span>Start Career Chat</span>
        </Button>
        
        <Button 
          className="gap-2 rounded-full px-6 shadow-sm hover:shadow-md transition-all"
          size="lg"
          variant="outline"
          onClick={onViewPastSessions}
        >
          <History className="h-5 w-5" />
          <span>Past Conversations</span>
        </Button>
      </div>
    </div>
  );
}
