
import React from 'react';
import { Briefcase, Star, ChevronRight } from 'lucide-react';

interface Career {
  career: string;
  match_percentage: number;
  reasoning: string;
}

interface CareersSectionProps {
  careers: Career[];
  onExploreCareer?: (career: string) => void;
}

export function CareersSection({ careers, onExploreCareer }: CareersSectionProps) {
  return (
    <div className="bg-gradient-to-r from-white to-blue-50 p-5 rounded-lg shadow-sm border border-blue-100 mb-4">
      <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
        <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
        Top Career Matches
      </h3>
      <div className="space-y-3">
        {careers.map((career, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-md p-4 border border-blue-100 transition-all hover:shadow-md"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                {idx < 3 && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                <h4 className="font-medium text-gray-800">{career.career}</h4>
              </div>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                {career.match_percentage}% Match
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{career.reasoning}</p>
            {onExploreCareer && (
              <button 
                onClick={() => onExploreCareer(career.career)}
                className="flex items-center text-xs text-primary hover:text-primary/70 transition-colors mt-2"
              >
                Explore this career
                <ChevronRight className="h-3 w-3 ml-1" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
