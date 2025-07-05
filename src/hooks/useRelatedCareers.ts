
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RelatedCareer } from '@/types/assessment';
import type { Tables } from '@/integrations/supabase/types';

type Career = Tables<"careers">;

export const useRelatedCareers = (
  careerId: string,
  careerTitle: string,
  requiredSkills: string[] = [],
  industry?: string
) => {
  const [relatedCareers, setRelatedCareers] = useState<RelatedCareer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedCareers = async () => {
      if (!careerTitle && !careerId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching related careers for:', { careerId, careerTitle, requiredSkills });
        
        let relatedCareerTitles: string[] = [];
        
        // First, try to get related careers from the database if we have a valid careerId
        if (careerId) {
          const { data: careerData } = await supabase
            .from('careers')
            .select('careers_to_consider_switching_to')
            .eq('id', careerId)
            .single();
          
          if (careerData?.careers_to_consider_switching_to) {
            relatedCareerTitles = careerData.careers_to_consider_switching_to;
          }
        }
        
        // If we don't have enough related careers, find similar ones
        if (relatedCareerTitles.length < 5) {
          const { data: allCareers } = await supabase
            .from('careers')
            .select('*')
            .eq('status', 'Approved')
            .neq('id', careerId || '')
            .limit(20);
          
          if (allCareers) {
            // Calculate similarity scores
            const careersWithScores = allCareers.map(career => {
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
                matchReasons.push(`${skillMatches.length} shared skills`);
              }
              
              // Title similarity (30% weight)
              const titleSimilarity = calculateStringSimilarity(career.title.toLowerCase(), careerTitle.toLowerCase());
              if (titleSimilarity > 0.1) {
                score += titleSimilarity * 0.3;
                if (titleSimilarity > 0.3) {
                  matchReasons.push('Similar role');
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
                  matchReasons.push('Related field');
                }
              }
              
              return {
                career,
                score,
                matchReason: matchReasons.join(', ') || 'Related career path'
              };
            });
            
            // Get additional careers from similarity calculation
            const similarCareers = careersWithScores
              .filter(item => item.score > 0.1)
              .sort((a, b) => b.score - a.score)
              .slice(0, 5 - relatedCareerTitles.length);
            
            // Add to related careers list
            similarCareers.forEach(item => {
              if (!relatedCareerTitles.includes(item.career.title)) {
                relatedCareerTitles.push(item.career.title);
              }
            });
          }
        }
        
        // Now fetch full career data for the related career titles
        if (relatedCareerTitles.length > 0) {
          const { data: relatedCareersData } = await supabase
            .from('careers')
            .select('id, title, industry, required_skills')
            .in('title', relatedCareerTitles.slice(0, 5))
            .eq('status', 'Approved');
          
          if (relatedCareersData) {
            const transformedRelated: RelatedCareer[] = relatedCareersData.map(career => {
              // Calculate match reason
              let matchReason = 'Related career path';
              const careerSkills = career.required_skills || [];
              const skillMatches = requiredSkills.filter(skill => 
                careerSkills.some(careerSkill => 
                  careerSkill.toLowerCase().includes(skill.toLowerCase())
                )
              );
              
              if (skillMatches.length > 0) {
                matchReason = `${skillMatches.length} shared skills`;
              } else if (industry && career.industry === industry) {
                matchReason = 'Same industry';
              }
              
              return {
                id: career.id,
                title: career.title,
                matchReason,
                similarityScore: Math.random() * 0.5 + 0.5 // Placeholder score
              };
            });
            
            setRelatedCareers(transformedRelated);
          }
        }
        
        console.log('Found related careers:', relatedCareerTitles.length);
        
      } catch (err) {
        console.error('Error fetching related careers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch related careers');
        setRelatedCareers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedCareers();
  }, [careerId, careerTitle, requiredSkills, industry]);

  return { relatedCareers, isLoading, error };
};

// Simple string similarity function using Jaccard similarity
function calculateStringSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);
  
  return union.size === 0 ? 0 : intersection.size / union.size;
}
