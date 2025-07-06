
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Career = Tables<"careers">;

export interface DetailedMatchInfo {
  matchedSkills: string[];
  roleCompatibility: string;
  educationRequirements: string[];
  industryMatch: string;
}

export interface EnhancedSimilarCareer extends Career {
  similarity_score: number;
  match_details: DetailedMatchInfo;
}

interface SkillMatch {
  originalSkill: string;
  matchedSkill: string;
  matchType: 'exact' | 'partial' | 'semantic';
  score: number;
}

export const useEnhancedSimilarCareers = (
  requiredSkills: string[] = [],
  careerTitle: string = '',
  industry?: string
) => {
  const [similarCareers, setSimilarCareers] = useState<EnhancedSimilarCareer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const findSimilarCareers = async () => {
      if (!requiredSkills.length && !careerTitle) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log('Finding enhanced similar careers for:', { requiredSkills, careerTitle, industry });

        const { data: careers, error: careersError } = await supabase
          .from('careers')
          .select('*')
          .eq('status', 'Approved')
          .limit(100);

        if (careersError) {
          throw careersError;
        }

        if (!careers || careers.length === 0) {
          setSimilarCareers([]);
          setIsLoading(false);
          return;
        }

        const careersWithDetails = careers.map(career => {
          const matchResult = calculateDetailedSimilarity(
            career,
            requiredSkills,
            careerTitle,
            industry
          );

          return {
            ...career,
            similarity_score: matchResult.score,
            match_details: matchResult.details
          } as EnhancedSimilarCareer;
        });

        const topSimilar = careersWithDetails
          .filter(career => career.similarity_score > 0.25)
          .sort((a, b) => b.similarity_score - a.similarity_score)
          .slice(0, 5);

        console.log('Found enhanced similar careers:', topSimilar.map(c => ({ 
          title: c.title, 
          score: c.similarity_score,
          matchedSkills: c.match_details.matchedSkills 
        })));

        setSimilarCareers(topSimilar);
      } catch (err) {
        console.error('Error finding enhanced similar careers:', err);
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

function calculateDetailedSimilarity(
  career: Career,
  targetSkills: string[],
  targetTitle: string,
  targetIndustry?: string
): { score: number; details: DetailedMatchInfo } {
  let totalScore = 0;
  const details: DetailedMatchInfo = {
    matchedSkills: [],
    roleCompatibility: '',
    educationRequirements: career.required_education || [],
    industryMatch: ''
  };

  // Enhanced Skills Matching with specific skill tracking
  const careerSkills = [...(career.required_skills || []), ...(career.transferable_skills || [])];
  const skillMatches = findDetailedSkillMatches(careerSkills, targetSkills);

  if (skillMatches.length > 0) {
    const skillScore = calculateSkillScore(skillMatches, targetSkills.length);
    totalScore += skillScore * 0.4;
    details.matchedSkills = skillMatches.map(match => match.originalSkill);
  }

  // Title similarity with role description
  const titleSimilarity = calculateEnhancedTitleSimilarity(career.title, targetTitle);
  if (titleSimilarity > 0.15) {
    totalScore += titleSimilarity * 0.25;
    details.roleCompatibility = determineRoleCompatibility(career.title, targetTitle, titleSimilarity);
  }

  // Industry matching with specific industry info
  const industryScore = calculateIndustryScore(career, targetIndustry);
  if (industryScore > 0) {
    totalScore += industryScore * 0.2;
    details.industryMatch = career.industry || 'Related field';
  }

  // Education and other factors
  const educationScore = calculateEducationCompatibility(career.required_education || []);
  if (educationScore > 0) {
    totalScore += educationScore * 0.15;
  }

  return {
    score: Math.min(totalScore, 1),
    details
  };
}

function findDetailedSkillMatches(careerSkills: string[], targetSkills: string[]): SkillMatch[] {
  const matches: SkillMatch[] = [];

  for (const careerSkill of careerSkills) {
    for (const targetSkill of targetSkills) {
      const matchResult = compareSkills(careerSkill, targetSkill);
      if (matchResult.score > 0.5) { // Higher threshold for quality matches
        matches.push({
          originalSkill: careerSkill,
          matchedSkill: targetSkill,
          matchType: matchResult.type,
          score: matchResult.score
        });
        break;
      }
    }
  }

  return matches;
}

function compareSkills(skill1: string, skill2: string): { score: number; type: 'exact' | 'partial' | 'semantic' } {
  const s1 = skill1.toLowerCase().trim();
  const s2 = skill2.toLowerCase().trim();

  if (s1 === s2) {
    return { score: 1.0, type: 'exact' };
  }

  if (s1.includes(s2) || s2.includes(s1)) {
    return { score: 0.8, type: 'partial' };
  }

  // Semantic matching for related skills
  const semanticScore = getSemanticSkillScore(s1, s2);
  if (semanticScore > 0) {
    return { score: semanticScore, type: 'semantic' };
  }

  const similarity = calculateStringSimilarity(s1, s2);
  if (similarity > 0.7) {
    return { score: similarity * 0.7, type: 'partial' };
  }

  return { score: 0, type: 'exact' };
}

function getSemanticSkillScore(skill1: string, skill2: string): number {
  const semanticGroups = [
    ['javascript', 'react', 'node.js', 'vue', 'angular', 'typescript'],
    ['python', 'django', 'flask', 'machine learning', 'data science'],
    ['project management', 'agile', 'scrum', 'leadership', 'planning'],
    ['communication', 'presentation', 'writing', 'public speaking'],
    ['data analysis', 'statistics', 'excel', 'sql', 'analytics'],
    ['design', 'ui/ux', 'graphic design', 'adobe', 'figma'],
    ['marketing', 'digital marketing', 'social media', 'content marketing'],
    ['finance', 'accounting', 'budgeting', 'financial analysis']
  ];

  for (const group of semanticGroups) {
    const skill1InGroup = group.some(skill => skill1.includes(skill) || skill.includes(skill1));
    const skill2InGroup = group.some(skill => skill2.includes(skill) || skill.includes(skill2));
    
    if (skill1InGroup && skill2InGroup) {
      return 0.6;
    }
  }

  return 0;
}

function determineRoleCompatibility(careerTitle: string, targetTitle: string, similarity: number): string {
  if (similarity > 0.8) return `Very similar to ${targetTitle}`;
  if (similarity > 0.5) return `Similar role to ${targetTitle}`;
  if (similarity > 0.3) return `Related to ${targetTitle}`;
  return `Compatible career path`;
}

function calculateSkillScore(matches: SkillMatch[], totalTargetSkills: number): number {
  if (matches.length === 0 || totalTargetSkills === 0) return 0;

  const weightedScore = matches.reduce((sum, match) => {
    const weight = match.matchType === 'exact' ? 1.0 : 
                   match.matchType === 'partial' ? 0.8 : 0.6;
    return sum + (match.score * weight);
  }, 0);

  return Math.min(weightedScore / Math.max(totalTargetSkills, matches.length), 1);
}

function calculateEnhancedTitleSimilarity(title1: string, title2: string): number {
  return calculateStringSimilarity(title1.toLowerCase(), title2.toLowerCase());
}

function calculateIndustryScore(career: Career, targetIndustry?: string): number {
  if (!targetIndustry || !career.industry) return 0;
  return calculateStringSimilarity(career.industry.toLowerCase(), targetIndustry.toLowerCase());
}

function calculateEducationCompatibility(requiredEducation: string[]): number {
  return requiredEducation.length > 0 ? 0.7 : 0.3;
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/).filter(word => word.length > 2));
  const words2 = new Set(str2.split(/\s+/).filter(word => word.length > 2));

  if (words1.size === 0 && words2.size === 0) return 1;
  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}
