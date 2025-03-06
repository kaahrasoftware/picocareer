
import React, { useState } from 'react';
import { ParsedRecommendation } from '../utils/recommendationParser';
import { IntroductionSection } from './IntroductionSection';
import { CareersSection } from './CareersSection';
import { PersonalitySection } from './PersonalitySection';
import { GrowthAreasSection } from './GrowthAreasSection';
import { ClosingSection } from './ClosingSection';
import { CareerDetailsDialog } from '@/components/CareerDetailsDialog';

interface RecommendationSectionProps {
  recommendation: ParsedRecommendation;
  onSuggestionClick?: (suggestion: string) => void;
}

export function RecommendationSection({ recommendation, onSuggestionClick }: RecommendationSectionProps) {
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);

  // Check if this is a structured assessment result or session end
  const isStructuredContent = 
    (recommendation.type === 'assessment_result' || 
     recommendation.type === 'session_end') && 
    recommendation.structuredContent;

  const handleExploreCareer = (careerTitle: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(`Tell me more about ${careerTitle}`);
    }
  };

  if (isStructuredContent && recommendation.structuredContent) {
    const { 
      introduction, 
      career_recommendations, 
      personality_insights, 
      growth_areas, 
      closing 
    } = recommendation.structuredContent;
    
    return (
      <div className="space-y-4 animate-fade-in">
        {/* Introduction Section */}
        {introduction && (
          <IntroductionSection 
            title={introduction.title || "Your Career Assessment Results"} 
            summary={introduction.summary || "Based on your responses, here are personalized career recommendations."}
          />
        )}
        
        {/* Careers Section */}
        {career_recommendations && career_recommendations.length > 0 && (
          <CareersSection 
            careers={career_recommendations} 
            onExploreCareer={handleExploreCareer}
          />
        )}
        
        {/* Personality Section */}
        {personality_insights && personality_insights.length > 0 && (
          <PersonalitySection traits={personality_insights} />
        )}
        
        {/* Growth Areas Section */}
        {growth_areas && growth_areas.length > 0 && (
          <GrowthAreasSection areas={growth_areas} />
        )}
        
        {/* Closing Section */}
        {closing && (
          <ClosingSection 
            message={closing.message || "Thank you for completing the career assessment!"} 
            nextSteps={closing.next_steps || [
              "Explore these careers in detail",
              "Start a new career assessment",
              "Connect with mentors in these fields"
            ]}
            onNextStepClick={onSuggestionClick}
          />
        )}

        {/* Career Details Dialog */}
        {selectedCareerId && (
          <CareerDetailsDialog 
            careerId={selectedCareerId}
            open={!!selectedCareerId}
            onOpenChange={(open) => {
              if (!open) setSelectedCareerId(null);
            }}
          />
        )}
      </div>
    );
  }
  
  // Fallback to the original format for backward compatibility
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Careers Section */}
      <div className="bg-gradient-to-r from-white to-blue-50 p-5 rounded-lg shadow-sm border border-blue-100">
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <i className="h-5 w-5 text-primary mr-2" />
          Top Career Matches
        </h3>
        <div className="space-y-3">
          {recommendation.careers.map((career, idx) => (
            <div key={idx} className="bg-white rounded-md p-3 border border-blue-100 transition-all hover:shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {idx < 3 && <i className="h-4 w-4 text-amber-500" />}
                  <h4 className="font-medium">{career.title}</h4>
                </div>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                  {career.match}% Match
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{career.reasoning}</p>
              <button 
                onClick={() => handleExploreCareer(career.title)}
                className="mt-2 text-xs text-primary hover:text-primary/80 flex items-center"
              >
                Explore this career <span className="ml-1">→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Personality Section */}
      {recommendation.personalities.length > 0 && (
        <div className="bg-gradient-to-r from-white to-purple-50 p-5 rounded-lg shadow-sm border border-purple-100">
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
            <i className="h-5 w-5 text-purple-500 mr-2" />
            Personality Profile
          </h3>
          <div className="space-y-3">
            {recommendation.personalities.map((personality, idx) => (
              <div key={idx} className="bg-white rounded-md p-3 border border-purple-100 transition-all hover:shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{personality.title}</h4>
                  <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">
                    {personality.match}% Match
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{personality.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Mentors Section */}
      {recommendation.mentors.length > 0 && (
        <div className="bg-gradient-to-r from-white to-green-50 p-5 rounded-lg shadow-sm border border-green-100">
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
            <i className="h-5 w-5 text-green-500 mr-2" />
            Recommended Mentors
          </h3>
          <div className="space-y-3">
            {recommendation.mentors.map((mentor, idx) => (
              <div key={idx} className="bg-white rounded-md p-3 border border-green-100 transition-all hover:shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{mentor.name}</h4>
                  {mentor.experience && (
                    <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full">
                      {mentor.experience} Experience
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{mentor.skills}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Next Steps Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
        <h3 className="text-medium font-medium flex items-center mb-2">
          <i className="h-5 w-5 text-green-500 mr-2" />
          Next Steps
        </h3>
        <p className="text-sm text-gray-600">
          Would you like to explore any of these career paths in more detail? You can ask specific questions
          about the careers listed or request information about educational requirements, daily responsibilities,
          or how to connect with one of the recommended mentors.
        </p>
        
        {onSuggestionClick && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button 
              onClick={() => onSuggestionClick("Start a new career assessment")}
              className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200"
            >
              Start a new assessment
            </button>
            <button 
              onClick={() => onSuggestionClick("Tell me more about educational requirements for these careers")}
              className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200"
            >
              Educational requirements
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
