
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, History, SlidersHorizontal, Brain, Target, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmptyStateProps {
  onStartChat: () => void;
  onViewPastSessions: () => void;
}

export function EmptyState({ onStartChat, onViewPastSessions }: EmptyStateProps) {
  return (
    <ScrollArea className="h-[calc(100vh-120px)]">
      <div className="flex flex-col items-center justify-start p-4 md:p-8 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-gray-800">AI Career Assistant</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Discover your ideal career path through a personalized conversation with our AI. 
            We'll analyze your skills, interests, and goals to suggest matching careers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mb-8">
          <Card className="border-2 border-primary/20 transition-transform hover:scale-105 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-primary">
                <PlusCircle className="h-5 w-5" />
                New Assessment
              </CardTitle>
              <CardDescription>
                Start a guided career exploration
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm">
                Answer a series of questions about your interests, skills, and education to get personalized 
                career recommendations tailored to your unique profile.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={onStartChat}>
                Begin Assessment
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="transition-transform hover:scale-105 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <History className="h-5 w-5 text-gray-600" />
                Past Assessments
              </CardTitle>
              <CardDescription>
                Resume or review previous chats
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm">
                Access your past career assessments to review recommendations or continue 
                where you left off. Compare different results over time.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onViewPastSessions}
              >
                View History
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="w-full max-w-3xl mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full w-8 h-8 bg-primary/10 flex items-center justify-center mb-2">
                  <span className="font-semibold text-primary">1</span>
                </div>
                <h3 className="font-medium mb-1">Share Your Profile</h3>
                <p className="text-sm text-muted-foreground">Answer questions about your background, skills, and preferences.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full w-8 h-8 bg-primary/10 flex items-center justify-center mb-2">
                  <span className="font-semibold text-primary">2</span>
                </div>
                <h3 className="font-medium mb-1">AI Analysis</h3>
                <p className="text-sm text-muted-foreground">Our AI analyzes your responses to find matching career paths.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full w-8 h-8 bg-primary/10 flex items-center justify-center mb-2">
                  <span className="font-semibold text-primary">3</span>
                </div>
                <h3 className="font-medium mb-1">Get Recommendations</h3>
                <p className="text-sm text-muted-foreground">Receive personalized career suggestions with detailed information.</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="w-full max-w-3xl mb-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Benefits
          </h2>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm">Personalized career recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm">Insight into required skills and education</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm">Discover careers matching your interests</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm">Save and compare different career paths</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <SlidersHorizontal className="h-3 w-3" />
            Your data is used only to provide personalized career recommendations
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}
