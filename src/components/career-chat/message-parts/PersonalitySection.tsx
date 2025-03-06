
import React, { useMemo } from 'react';
import { Brain, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PersonalityTrait {
  trait: string;
  strength_level: number;
  description: string;
  related_careers?: string[];
}

interface PersonalityType {
  id: number;
  type: string;
  title: string;
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  who_they_are: string;
  dicotomy_description: string[];
}

interface PersonalitySectionProps {
  traits: PersonalityTrait[];
  category?: string;
}

export function PersonalitySection({ traits, category }: PersonalitySectionProps) {
  // Fetch all personality types
  const { data: personalityTypes, isLoading } = useQuery({
    queryKey: ['personality-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personality_types')
        .select('*');
      
      if (error) throw error;
      return data as PersonalityType[];
    },
  });

  // Match traits to personality types
  const matchedTypes = useMemo(() => {
    if (!personalityTypes || traits.length === 0) return [];
    
    // Extract trait names from input
    const traitNames = traits.map(t => t.trait.toLowerCase());
    
    // Score each personality type based on trait matches
    const scoredTypes = personalityTypes.map(type => {
      // Calculate trait match score
      const traits = type.traits.map(t => t.toLowerCase());
      const strengths = type.strengths.map(s => s.toLowerCase());
      
      // Count how many traits match
      let matchScore = 0;
      for (const trait of traitNames) {
        // Check for direct match in traits
        if (traits.some(t => t.includes(trait) || trait.includes(t))) {
          matchScore += 2; // Direct trait match
        }
        // Check for match in strengths
        else if (strengths.some(s => s.includes(trait) || trait.includes(s))) {
          matchScore += 1; // Strength match
        }
        // Check for match in type or title
        else if (
          type.type.toLowerCase().includes(trait) || 
          trait.includes(type.type.toLowerCase()) ||
          type.title.toLowerCase().includes(trait) ||
          trait.includes(type.title.toLowerCase())
        ) {
          matchScore += 3; // Type or title match (strongest)
        }
      }
      
      return {
        type,
        score: matchScore
      };
    });
    
    // Sort by score and take top 3
    return scoredTypes
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item, index) => ({ ...item.type, index }));
  }, [personalityTypes, traits]);

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

  if (isLoading) {
    return (
      <div className={`bg-gradient-to-r ${getCategoryStyles().replace(colorClass, '')} p-5 rounded-lg shadow-sm border mb-4`}>
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <Brain className={`h-5 w-5 ${colorClass} mr-2`} />
          Personality Insights & Strengths
        </h3>
        <div className="p-4 text-center">
          <p className="text-sm text-gray-500">Loading personality insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r ${getCategoryStyles().replace(colorClass, '')} p-5 rounded-lg shadow-sm border mb-4`}>
      <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
        <Brain className={`h-5 w-5 ${colorClass} mr-2`} />
        Personality Insights & Matches
      </h3>

      {/* First show original AI-generated traits */}
      <div className="space-y-3 mb-6">
        {traits.slice(0, 3).map((trait, idx) => (
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

      {/* Then show matched personality types from the database */}
      {matchedTypes.length > 0 && (
        <>
          <h4 className="text-md font-medium text-gray-700 mb-3">Matching Personality Types</h4>
          <div className="space-y-4">
            {matchedTypes.map((type, idx) => {
              const rankConfig = {
                0: { label: "Primary Match", bgColor: "bg-purple-100 text-purple-800" },
                1: { label: "Secondary Match", bgColor: "bg-blue-100 text-blue-800" },
                2: { label: "Alternate Match", bgColor: "bg-pink-100 text-pink-800" }
              }[idx] || { label: "Match", bgColor: "bg-gray-100 text-gray-800" };
                
              return (
                <div key={idx} className="bg-white rounded-md p-4 border border-purple-100 transition-all hover:shadow-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className={`${rankConfig.bgColor} px-2 py-0.5 rounded-full text-xs font-medium`}>
                        {rankConfig.label}
                      </span>
                      <h4 className="font-medium text-gray-800 mt-1">{type.type}: {type.title}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{type.who_they_are}</p>
                  
                  {/* Show strengths */}
                  {type.strengths && type.strengths.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-xs font-medium text-gray-700">Key Strengths:</h5>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {type.strengths.slice(0, 3).map((strength, i) => (
                          <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
