
import React from 'react';
import { Star, Brain, Users, Check, Briefcase, Award, GraduationCap } from 'lucide-react';
import { ParsedRecommendation } from '../utils/recommendationParser';
import { CareerRecommendationItem, PersonalityInsightItem, MentorRecommendationItem } from '../types/aiResponses';

interface RecommendationSectionProps {
  recommendation: ParsedRecommendation | {
    type: string;
    careers: CareerRecommendationItem[];
    personalities: PersonalityInsightItem[];
    mentors: MentorRecommendationItem[];
  };
}

export function RecommendationSection({ recommendation }: RecommendationSectionProps) {
  // Determine if we're using the new structured format or the old parser format
  const hasStructuredData = recommendation.type === 'recommendation' && 'careers' in recommendation;
  
  // Extract the career data
  const careers = hasStructuredData 
    ? (recommendation as any).careers
    : recommendation.careers;
    
  // Extract the personality data
  const personalities = hasStructuredData 
    ? (recommendation as any).personalities
    : recommendation.personalities;
    
  // Extract the mentor data
  const mentors = hasStructuredData 
    ? (recommendation as any).mentors 
    : recommendation.mentors;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Careers Section */}
      <div className="bg-gradient-to-r from-white to-blue-50 p-5 rounded-lg shadow-sm border border-blue-100">
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <Briefcase className="h-5 w-5 text-primary mr-2" />
          Top Career Matches
        </h3>
        <div className="space-y-3">
          {careers.map((career: any, idx: number) => (
            <div key={idx} className="bg-white rounded-md p-3 border border-blue-100 transition-all hover:shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {idx < 3 && <Award className="h-4 w-4 text-amber-500" />}
                  <h4 className="font-medium">{career.title}</h4>
                </div>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                  {career.match}% Match
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{career.description || career.reasoning}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Personality Section */}
      {personalities && personalities.length > 0 && (
        <div className="bg-gradient-to-r from-white to-purple-50 p-5 rounded-lg shadow-sm border border-purple-100">
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
            <Brain className="h-5 w-5 text-purple-500 mr-2" />
            Personality Profile
          </h3>
          <div className="space-y-3">
            {personalities.map((personality: any, idx: number) => (
              <div key={idx} className="bg-white rounded-md p-3 border border-purple-100 transition-all hover:shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{personality.type || personality.title}</h4>
                  <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">
                    {personality.match}% Match
                  </span>
                </div>
                {personality.traits && personality.traits.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {personality.traits.map((trait: string, i: number) => (
                      <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                        {trait}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-1">{personality.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Mentors Section */}
      {mentors && mentors.length > 0 && (
        <div className="bg-gradient-to-r from-white to-green-50 p-5 rounded-lg shadow-sm border border-green-100">
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
            <Users className="h-5 w-5 text-green-500 mr-2" />
            Recommended Mentors
          </h3>
          <div className="space-y-3">
            {mentors.map((mentor: any, idx: number) => (
              <div key={idx} className="bg-white rounded-md p-3 border border-green-100 transition-all hover:shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{mentor.name}</h4>
                  {mentor.experience && (
                    <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full">
                      {mentor.experience} Experience
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{mentor.expertise || mentor.skills}</p>
                {mentor.match && (
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-400" />
                    <span className="text-xs text-amber-600">{mentor.match}% match with your profile</span>
                  </div>
                )}
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
