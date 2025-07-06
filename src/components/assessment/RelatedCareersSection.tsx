
import React from 'react';
import { EnhancedSimilarCareersSection } from './EnhancedSimilarCareersSection';
import type { CareerRecommendation } from '@/types/assessment';

interface RelatedCareersSectionProps {
  recommendation: CareerRecommendation;
  onCareerSelect: (careerId: string) => void;
}

export const RelatedCareersSection = ({ 
  recommendation, 
  onCareerSelect 
}: RelatedCareersSectionProps) => {
  return (
    <EnhancedSimilarCareersSection
      requiredSkills={recommendation.requiredSkills || []}
      careerTitle={recommendation.title}
      industry={recommendation.industry}
      onCareerSelect={onCareerSelect}
    />
  );
};
