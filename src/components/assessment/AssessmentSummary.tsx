
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Assessment Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Interests Section */}
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            Your Top Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {displayInterests.map((interest, index) => (
              <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {interest}
              </Badge>
            ))}
          </div>
        </div>

        {/* Key Strengths Section */}
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-green-600" />
            Your Key Strengths
          </h3>
          <div className="flex flex-wrap gap-2">
            {displayStrengths.map((strength, index) => (
              <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {strength}
              </Badge>
            ))}
          </div>
        </div>

        {/* Work Preferences Section */}
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-purple-600" />
            Your Work Preferences
          </h3>
          <div className="flex flex-wrap gap-2">
            {displayPreferences.map((preference, index) => (
              <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {preference}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
