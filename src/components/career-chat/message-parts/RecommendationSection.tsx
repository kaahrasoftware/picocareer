
import React from 'react';
import { Star, Brain, Users, Check } from 'lucide-react';
import { ParsedRecommendation } from '../utils/recommendationParser';

interface RecommendationSectionProps {
  recommendation: ParsedRecommendation;
}

export function RecommendationSection({ recommendation }: RecommendationSectionProps) {
  return (
    <div className="space-y-4">
      {/* Careers Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
        <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
          <Star className="h-5 w-5 text-amber-500 mr-2" />
          Career Matches
        </h3>
        <div className="space-y-3">
          {recommendation.careers.map((career, idx) => (
            <div key={idx} className="bg-blue-50/50 rounded-md p-3 border border-blue-100">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{career.title}</h4>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  {career.match}% Match
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{career.reasoning}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Personality Section */}
      {recommendation.personalities.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
          <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
            <Brain className="h-5 w-5 text-purple-500 mr-2" />
            Personality Analysis
          </h3>
          <div className="space-y-3">
            {recommendation.personalities.map((personality, idx) => (
              <div key={idx} className="bg-purple-50/50 rounded-md p-3 border border-purple-100">
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
        <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
          <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
            <Users className="h-5 w-5 text-green-500 mr-2" />
            Recommended Mentors
          </h3>
          <div className="space-y-3">
            {recommendation.mentors.map((mentor, idx) => (
              <div key={idx} className="bg-green-50/50 rounded-md p-3 border border-green-100">
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
          <Check className="h-5 w-5 text-green-500 mr-2" />
          Next Steps
        </h3>
        <p className="text-sm text-gray-600">
          Would you like to explore any of these career paths in more detail? You can ask specific questions
          about the careers listed or request information about educational requirements, daily responsibilities,
          or how to connect with one of the recommended mentors.
        </p>
      </div>
    </div>
  );
}
