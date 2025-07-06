
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuestionResponse } from '@/types/assessment';
import { useAssessmentAnalysis } from '@/hooks/useAssessmentAnalysis';
import { BarChart3, User, Target } from 'lucide-react';

interface AssessmentSummaryProps {
  responses: QuestionResponse[];
}

export const AssessmentSummary = ({
  responses
}: AssessmentSummaryProps) => {
  const {
    interests,
    strengths,
    preferences
  } = useAssessmentAnalysis(responses);

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
    <div className="grid gap-6 md:grid-cols-3">
      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Your Interests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {displayInterests.map((interest, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                {interest}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Your Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {displayStrengths.map((strength, index) => (
              <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                {strength}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-purple-600" />
            Your Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {displayPreferences.map((preference, index) => (
              <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                {preference}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
