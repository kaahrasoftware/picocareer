
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuestionResponse } from '@/types/assessment';
import { useAssessmentAnalysis } from '@/hooks/useAssessmentAnalysis';
import { BarChart3, User, Target } from 'lucide-react';

interface AssessmentSummaryProps {
  responses: QuestionResponse[];
}

export const AssessmentSummary = ({ responses }: AssessmentSummaryProps) => {
  const { interests, strengths, preferences } = useAssessmentAnalysis(responses);

  // Fallback data for when analysis doesn't yield enough results
  const getTopInterests = () => {
    if (interests.length > 0) return interests;
    return ['Based on your responses', 'We identified key areas', 'That align with your goals'];
  };

  const getStrengths = () => {
    if (strengths.length > 0) return strengths;
    return ['Your unique abilities', 'Analytical capabilities', 'Personal qualities'];
  };

  const getPreferences = () => {
    if (preferences.length > 0) return preferences;
    return ['Work style preferences', 'Environment choices', 'Career priorities'];
  };

  const displayInterests = getTopInterests();
  const displayStrengths = getStrengths();
  const displayPreferences = getPreferences();

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
            {displayInterests.map((interest, index) => (
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
            {displayStrengths.map((strength, index) => (
              <Badge key={index} variant="outline">
                {strength}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Work Preferences</h4>
          <div className="flex flex-wrap gap-2">
            {displayPreferences.map((preference, index) => (
              <Badge key={index} variant="outline">
                {preference}
              </Badge>
            ))}
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Based on your {responses.length} responses, we've analyzed your preferences 
            and identified {displayInterests.length} key interest areas, {displayStrengths.length} strengths, 
            and {displayPreferences.length} work preferences to provide personalized recommendations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
