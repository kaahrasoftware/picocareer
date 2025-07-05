
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Career = Tables<"careers">;

interface SimilarCareer extends Career {
  similarity_score: number;
  match_reasons: string[];
}

export const useSimilarCareers = (
  requiredSkills: string[] = [],
  careerTitle: string = '',
  industry?: string
) => {
  const [similarCareers, setSimilarCareers] = useState<SimilarCareer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const findSimilarCareers = async () => {
      if (!requiredSkills.length && !careerTitle) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Finding similar careers for:', { requiredSkills, careerTitle, industry });
        
        // Fetch all approved careers
        const { data: careers, error: careersError } = await supabase
          .from('careers')
          .select('*')
          .eq('status', 'Approved')
          .limit(50); // Limit to prevent large queries

        if (careersError) {
          throw careersError;
        }

        console.log('Fetched careers for similarity matching:', careers?.length);

        if (!careers || careers.length === 0) {
          setSimilarCareers([]);
          setIsLoading(false);
          return;
        }

        // Calculate similarity scores
        const careersWithScores = careers.map(career => {
          let score = 0;
          const matchReasons: string[] = [];

          // Skills matching (40% weight)
          const careerSkills = [...(career.required_skills || []), ...(career.transferable_skills || [])];
          const skillMatches = requiredSkills.filter(skill => 
            careerSkills.some(careerSkill => 
              careerSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(careerSkill.toLowerCase())
            )
          );
          
          if (skillMatches.length > 0) {
            const skillScore = (skillMatches.length / Math.max(requiredSkills.length, 1)) * 0.4;
            score += skillScore;
            matchReasons.push(`${skillMatches.length} matching skills`);
          }

          // Title similarity (30% weight)
          const titleSimilarity = calculateStringSimilarity(career.title.toLowerCase(), careerTitle.toLowerCase());
          if (titleSimilarity > 0.1) {
            score += titleSimilarity * 0.3;
            if (titleSimilarity > 0.3) {
              matchReasons.push('Similar job title');
            }
          }

          // Industry matching (20% weight)
          if (industry && career.industry) {
            const industrySimilarity = calculateStringSimilarity(
              career.industry.toLowerCase(), 
              industry.toLowerCase()
            );
            if (industrySimilarity > 0.3) {
              score += industrySimilarity * 0.2;
              matchReasons.push('Same industry');
            }
          }

          // Keywords matching (10% weight)
          if (career.keywords && career.keywords.length > 0) {
            const keywordMatches = career.keywords.filter(keyword =>
              careerTitle.toLowerCase().includes(keyword.toLowerCase()) ||
              requiredSkills.some(skill => skill.toLowerCase().includes(keyword.toLowerCase()))
            );
            
            if (keywordMatches.length > 0) {
              score += (keywordMatches.length / career.keywords.length) * 0.1;
              matchReasons.push('Related keywords');
            }
          }

          return {
            ...career,
            similarity_score: score,
            match_reasons: matchReasons
          } as SimilarCareer;
        });

        // Sort by similarity score and take top 5
        const topSimilar = careersWithScores
          .filter(career => career.similarity_score > 0.1) // Minimum threshold
          .sort((a, b) => b.similarity_score - a.similarity_score)
          .slice(0, 5);

        console.log('Found similar careers:', topSimilar.map(c => ({ 
          title: c.title, 
          score: c.similarity_score,
          reasons: c.match_reasons 
        })));

        setSimilarCareers(topSimilar);
      } catch (err) {
        console.error('Error finding similar careers:', err);
        setError(err instanceof Error ? err.message : 'Failed to find similar careers');
        setSimilarCareers([]);
      } finally {
        setIsLoading(false);
      }
    };

    findSimilarCareers();
  }, [requiredSkills, careerTitle, industry]);

  return { similarCareers, isLoading, error };
};

// Simple string similarity function using Jaccard similarity
function calculateStringSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);
  
  return union.size === 0 ? 0 : intersection.size / union.size;
}
