
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeMessageProps {
  content: string;
  onBeginAssessment?: () => void;
  isDisabled?: boolean;
}

export function WelcomeMessage({ content, onBeginAssessment, isDisabled = false }: WelcomeMessageProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50/80 to-white border-blue-100 shadow-sm overflow-hidden w-full animate-fade-in">
      <CardContent className="p-6 space-y-6">
        <div className="prose max-w-none">
          <h3 className="text-lg font-semibold text-primary mb-4">Welcome to your Career Assessment</h3>
          <p className="text-gray-700">{content}</p>
          
          <div className="mt-6 bg-blue-50/60 rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-blue-700 mb-2">What to expect:</h4>
            <ul className="text-sm space-y-2 text-gray-600">
              <li>A series of questions about your background, skills, and preferences</li>
              <li>Personalized career recommendations based on your answers</li>
              <li>Insights about potential career paths that match your profile</li>
              <li>The assessment typically takes 5-10 minutes to complete</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <Button 
            onClick={onBeginAssessment} 
            disabled={isDisabled}
            size="lg"
            className={cn(
              "font-medium transition-all gap-2",
              isDisabled ? "opacity-70" : "hover:scale-105 shadow-md hover:shadow-lg"
            )}
          >
            <Play className="h-4 w-4" />
            Begin Assessment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
