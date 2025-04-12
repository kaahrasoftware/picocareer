
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, RefreshCw, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthSession } from '@/hooks/useAuthSession';
import { ScrollArea } from '@/components/ui/scroll-area';

interface IntroScreenProps {
  handleInitiateChat: () => void;
  viewPastSessions: () => void;
  hasExistingMessages: boolean;
}

export function IntroScreen({ 
  handleInitiateChat, 
  viewPastSessions, 
  hasExistingMessages 
}: IntroScreenProps) {
  const { isAuthenticated } = useAuthSession('optional');

  const onBeginAssessment = () => {
    if (!isAuthenticated) {
      toast.error("Authentication Required", {
        description: "Please sign in to start a career assessment."
      });
      return;
    }
    
    handleInitiateChat();
  };

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col items-center justify-center p-6 text-center min-h-[400px]">
        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          <Brain className="h-12 w-12 text-blue-500" />
        </div>
        
        <h2 className="text-2xl font-bold mb-3">AI Career Assessment</h2>
        <p className="text-gray-600 max-w-lg mb-8">
          Answer a few questions about your skills, interests, and preferences to receive personalized
          career recommendations that match your unique profile.
        </p>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 max-w-2xl w-full mb-8">
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="text-blue-500 font-medium mb-2">Step 1</div>
            <p className="text-sm text-gray-500">Answer questions about your background and preferences</p>
          </div>
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="text-blue-500 font-medium mb-2">Step 2</div>
            <p className="text-sm text-gray-500">AI analyzes your responses to find matching careers</p>
          </div>
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="text-blue-500 font-medium mb-2">Step 3</div>
            <p className="text-sm text-gray-500">Review and download your personalized recommendations</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <Button 
            size="lg"
            onClick={onBeginAssessment}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            Begin Assessment
            <BookOpen className="h-4 w-4" />
          </Button>
          {hasExistingMessages && (
            <Button 
              variant="outline" 
              size="lg"
              onClick={viewPastSessions}
              className="gap-2"
            >
              View Past Results
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
