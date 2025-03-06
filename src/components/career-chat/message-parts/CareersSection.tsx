
import React from 'react';
import { Briefcase, Award, ChevronRight, GraduationCap, Book } from 'lucide-react';

interface CareerRecommendation {
  title: string;
  match_percentage: number;
  description: string;
  key_requirements?: string[];
  education_paths?: string[];
}

interface CareersSectionProps {
  careers: CareerRecommendation[];
  onExploreCareer?: (career: string) => void;
}

export function CareersSection({ careers, onExploreCareer }: CareersSectionProps) {
  return (
    <div className="bg-gradient-to-r from-white to-blue-50 p-5 rounded-lg shadow-sm border border-blue-100 mb-4">
      <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
        <Briefcase className="h-5 w-5 text-primary mr-2" />
        Top Career Matches
      </h3>
      <div className="space-y-3">
        {careers.map((career, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-md p-4 border border-blue-100 transition-all hover:shadow-md"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {idx < 3 && <Award className="h-4 w-4 text-amber-500" />}
                <h4 className="font-medium text-gray-800">{career.title}</h4>
              </div>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                {career.match_percentage}% Match
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{career.description}</p>
            
            {career.key_requirements && career.key_requirements.length > 0 && (
              <div className="mt-3">
                <h5 className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                  <Book className="h-3 w-3 mr-1" /> Key Requirements:
                </h5>
                <div className="flex flex-wrap gap-1">
                  {career.key_requirements.map((req, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {career.education_paths && career.education_paths.length > 0 && (
              <div className="mt-2">
                <h5 className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                  <GraduationCap className="h-3 w-3 mr-1" /> Education Paths:
                </h5>
                <div className="flex flex-wrap gap-1">
                  {career.education_paths.map((path, i) => (
                    <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      {path}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {onExploreCareer && (
              <button 
                onClick={() => onExploreCareer(career.title)}
                className="mt-3 flex items-center text-xs text-primary hover:text-primary/80"
              >
                Explore this career <ChevronRight className="h-3 w-3 ml-1" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
