
import React from 'react';
import { Brain, ChevronUp } from 'lucide-react';
import { PersonalityInsight } from '../../utils/recommendationParser';

interface PersonalitySectionProps {
  personalities: PersonalityInsight[];
}

export function PersonalitySection({ personalities }: PersonalitySectionProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="bg-gradient-to-r from-white to-purple-50 p-5 rounded-lg shadow-sm border border-purple-100">
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <Brain className="h-5 w-5 text-purple-500 mr-2" />
          Personality Insights
        </h3>
        
        <div className="space-y-3">
          {personalities.map((personality, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-md p-3 border border-purple-100 transition-all hover:shadow-sm"
            >
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-medium text-gray-800 flex items-center">
                  {idx === 0 && (
                    <ChevronUp className="h-4 w-4 text-purple-600 mr-1" />
                  )}
                  {personality.title}
                </h4>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {personality.match}% Strength
                </span>
              </div>
              
              <div className="w-full bg-gray-200 h-1.5 rounded-full mb-2">
                <div 
                  className="bg-purple-500 h-1.5 rounded-full" 
                  style={{ width: `${personality.match}%` }}
                />
              </div>
              
              <p className="text-sm text-gray-600">{personality.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
