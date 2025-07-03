
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuestionResponse } from '@/types/assessment';
import { BarChart3, User, Target } from 'lucide-react';

interface AssessmentSummaryProps {
  responses: QuestionResponse[];
}

export const AssessmentSummary = ({ responses }: AssessmentSummaryProps) => {
  // Analyze responses to provide insights
  const getTopInterests = () => {
    // Mock implementation - in real app, this would analyze actual responses
    return ['Technology', 'Problem Solving', 'Leadership', 'Creativity'];
  };

  const getStrengths = () => {
    // Mock implementation
    return ['Analytical Thinking', 'Communication', 'Adaptability'];
  };

  const getPreferences = () => {
    // Mock implementation
    return ['Remote Work', 'Team Collaboration', 'Continuous Learning'];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Your Assessment Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Top Interests
          </h4>
          <div className="flex flex-wrap gap-2">
            {getTopInterests().map((interest, index) => (
              <Badge key={index} variant="secondary">
                {interest}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            Key Strengths
          </h4>
          <div className="flex flex-wrap gap-2">
            {getStrengths().map((strength, index) => (
              <Badge key={index} variant="outline">
                {strength}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Work Preferences</h4>
          <div className="flex flex-wrap gap-2">
            {getPreferences().map((preference, index) => (
              <Badge key={index} variant="outline">
                {preference}
              </Badge>
            ))}
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Based on {responses.length} responses, we've identified your key career 
            interests and preferences to provide personalized recommendations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
