
import React from 'react';
import { Brain, Star } from 'lucide-react';

interface PersonalityTrait {
  trait: string;
  strength_level: number;
  description: string;
}

interface PersonalitySectionProps {
  traits: PersonalityTrait[];
}

export function PersonalitySection({ traits }: PersonalitySectionProps) {
  return (
    <div className="bg-gradient-to-r from-white to-purple-50 p-5 rounded-lg shadow-sm border border-purple-100 mb-4">
      <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
        <Brain className="h-5 w-5 text-purple-500 mr-2" />
        Personality Insights & Strengths
      </h3>
      <div className="space-y-3">
        {traits.map((trait, idx) => (
          <div key={idx} className="bg-white rounded-md p-4 border border-purple-100 transition-all hover:shadow-md">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-800">{trait.trait}</h4>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3.5 w-3.5 ${
                      i < Math.round(trait.strength_level / 20) 
                        ? 'text-amber-400 fill-amber-400' 
                        : 'text-gray-200'
                    }`} 
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{trait.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
