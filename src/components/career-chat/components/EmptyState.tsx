
import React from 'react';
import { Button } from '@/components/ui/button';
import { RobotWithMessage } from '../robot-avatar/RobotWithMessage';
import { PlusCircle, History, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface EmptyStateProps {
  onStartChat: () => void;
  onViewPastSessions: () => void;
}

export function EmptyState({ onStartChat, onViewPastSessions }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 max-w-4xl mx-auto">
      <div className="mb-8">
        <RobotWithMessage 
          message="Ready to explore your career options?" 
          size="lg"
        />
      </div>
      
      <h1 className="text-3xl font-bold text-center mb-3">Career Assessment</h1>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        Have a conversation with our AI to discover career paths that match your skills, 
        interests, and goals.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
        <Card className="border-2 border-primary/20 transition-transform hover:scale-105">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              New Assessment
            </CardTitle>
            <CardDescription>
              Start a fresh conversation to explore career options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Answer questions about your interests, skills, and work preferences 
              to get personalized career recommendations.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={onStartChat}>
              Start New Assessment
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="transition-transform hover:scale-105">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              Past Assessments
            </CardTitle>
            <CardDescription>
              Resume or review your previous career chats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Review past assessments, compare recommendations, or continue 
              conversations you've already started.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onViewPastSessions}
            >
              View Past Assessments
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <SlidersHorizontal className="h-3 w-3" />
          Customize your career path exploration with Pico
        </p>
      </div>
    </div>
  );
}
