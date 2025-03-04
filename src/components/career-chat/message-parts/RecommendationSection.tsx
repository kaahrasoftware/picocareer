
import React from 'react';
import { ParsedRecommendation } from '../utils/recommendationParser';
import { IntroductionSection } from './recommendation-sections/IntroductionSection';
import { CareersSection } from './recommendation-sections/CareersSection';
import { PersonalitySection } from './recommendation-sections/PersonalitySection';
import { GrowthAreasSection } from './recommendation-sections/GrowthAreasSection';
import { ClosingSection } from './recommendation-sections/ClosingSection';

interface RecommendationSectionProps {
  recommendation: ParsedRecommendation;
  onSuggestionClick?: (suggestion: string) => void;
}

export function RecommendationSection({ recommendation, onSuggestionClick }: RecommendationSectionProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Introduction Section */}
      {recommendation.introduction && (
        <IntroductionSection introduction={recommendation.introduction} />
      )}
      
      {/* Careers Section */}
      {recommendation.careers.length > 0 && (
        <CareersSection careers={recommendation.careers} />
      )}
      
      {/* Personality Section */}
      {recommendation.personalities.length > 0 && (
        <PersonalitySection personalities={recommendation.personalities} />
      )}
      
      {/* Growth Areas Section */}
      {recommendation.growthAreas.length > 0 && (
        <GrowthAreasSection growthAreas={recommendation.growthAreas} />
      )}
      
      {/* Closing Section */}
      {recommendation.closing && (
        <ClosingSection 
          closing={recommendation.closing} 
          onSuggestionClick={onSuggestionClick} 
        />
      )}
    </div>
  );
}
