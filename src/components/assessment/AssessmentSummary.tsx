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
  return;
};