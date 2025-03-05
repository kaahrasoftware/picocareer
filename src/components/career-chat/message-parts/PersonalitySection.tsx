
import React from 'react';
import { Brain, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonalityTrait {
  trait: string;
  strength_level: number;
  description: string;
}

interface PersonalitySectionProps {
  traits: PersonalityTrait[];
  category?: string;
}

export function PersonalitySection({ traits, category }: PersonalitySectionProps) {
  // Define category-specific styles
  const getCategoryStyles = () => {
    switch (category) {
      case 'education':
        return "from-white to-indigo-50 border-indigo-100 text-indigo-500";
      case 'skills':
        return "from-white to-emerald-50 border-emerald-100 text-emerald-500";
      case 'workstyle':
        return "from-white to-amber-50 border-amber-100 text-amber-500";
      case 'goals':
        return "from-white to-blue-50 border-blue-100 text-blue-500";
      case 'personality':
      case 'complete':
        return "from-white to-purple-50 border-purple-100 text-purple-500";
      default:
        return "from-white to-purple-50 border-purple-100 text-purple-500";
    }
  };

  const styles = getCategoryStyles().split(' ');
  const colorClass = styles[styles.length - 1]; // Extract the text color class

  return (
    <div className={`bg-gradient-to-r ${getCategoryStyles().replace(colorClass, '')} p-5 rounded-lg shadow-sm border mb-4`}>
      <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
        <Brain className={`h-5 w-5 ${colorClass} mr-2`} />
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
