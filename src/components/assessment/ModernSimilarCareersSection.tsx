
import React from 'react';
import { Network, Star, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModernContentCard } from './ModernContentCard';
import { useEnhancedSimilarCareers } from '@/hooks/useEnhancedSimilarCareers';
import type { CareerRecommendation } from '@/types/assessment';

interface ModernSimilarCareersSectionProps {
  recommendation: CareerRecommendation;
  onCareerSelect: (careerId: string) => void;
}

export const ModernSimilarCareersSection = ({ 
  recommendation, 
  onCareerSelect 
}: ModernSimilarCareersSectionProps) => {
  const { 
    similarCareers, 
    isLoading 
  } = useEnhancedSimilarCareers(
    recommendation.requiredSkills || [],
    recommendation.title,
    recommendation.industry
  );

  if (isLoading) {
    return (
      <ModernContentCard 
        title="Similar Career Opportunities" 
        icon={<Network className="h-5 w-5 text-indigo-600" />}
        variant="gradient"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg p-6 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-8 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </ModernContentCard>
    );
  }

  if (!similarCareers || similarCareers.length === 0) {
    return (
      <ModernContentCard 
        title="Similar Career Opportunities" 
        icon={<Network className="h-5 w-5 text-indigo-600" />}
        variant="gradient"
      >
        <div className="text-center py-8">
          <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No similar careers found</p>
          <p className="text-sm text-gray-500">
            This career appears to be unique in our database.
          </p>
        </div>
      </ModernContentCard>
    );
  }

  return (
    <ModernContentCard 
      title="Similar Career Opportunities" 
      icon={<Network className="h-5 w-5 text-indigo-600" />}
      variant="gradient"
    >
      <div className="space-y-4">
        <p className="text-gray-700 text-sm">
          Explore careers with similar skills and opportunities based on your profile.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {similarCareers.slice(0, 6).map((career) => (
            <div
              key={career.id}
              className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 cursor-pointer"
              onClick={() => onCareerSelect(career.id)}
            >
              {/* Match Score Badge */}
              <div className="absolute top-3 right-3">
                <Badge 
                  variant="secondary"
                  className={`text-xs font-semibold ${
                    career.similarity_score > 0.8 
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                      : career.similarity_score > 0.6
                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                      : 'bg-purple-100 text-purple-700 border-purple-200'
                  }`}
                >
                  {Math.round(career.similarity_score * 100)}% match
                </Badge>
              </div>

              {/* Career Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-16 group-hover:text-indigo-600 transition-colors">
                {career.title}
              </h3>

              {/* Industry */}
              {career.industry && (
                <p className="text-sm text-gray-600 mb-3">{career.industry}</p>
              )}

              {/* Match Details */}
              <div className="space-y-2 mb-4">
                {career.match_details.matchedSkills.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-3 w-3 text-amber-500" />
                      <span className="text-xs font-medium text-gray-700">
                        Shared Skills ({career.match_details.matchedSkills.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {career.match_details.matchedSkills.slice(0, 3).map((skill, index) => (
                        <Badge 
                          key={index}
                          variant="outline" 
                          className="text-xs bg-amber-50 text-amber-700 border-amber-200"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {career.match_details.matchedSkills.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                          +{career.match_details.matchedSkills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {career.match_details.roleCompatibility && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-gray-600">
                      {career.match_details.roleCompatibility}
                    </span>
                  </div>
                )}
              </div>

              {/* Salary Range (if available) */}
              {career.salary_range && (
                <p className="text-sm font-medium text-gray-800 mb-3">
                  {career.salary_range}
                </p>
              )}

              {/* Learn More Button */}
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-between group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"
              >
                <span>Learn More</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {similarCareers.length > 6 && (
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              And {similarCareers.length - 6} more similar career opportunities
            </p>
          </div>
        )}
      </div>
    </ModernContentCard>
  );
};
