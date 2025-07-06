
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Career = Tables<"careers">;

interface SimilarCareer extends Career {
  similarity_score: number;
  match_reasons: string[];
}

interface SkillMatch {
  skill: string;
  matchType: 'exact' | 'partial' | 'semantic';
  score: number;
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
          .limit(100); // Increased limit for better matching

        if (careersError) {
          throw careersError;
        }

        console.log('Fetched careers for similarity matching:', careers?.length);

        if (!careers || careers.length === 0) {
          setSimilarCareers([]);
          setIsLoading(false);
          return;
        }

        // Enhanced similarity calculation
        const careersWithScores = careers.map(career => {
          const matchResult = calculateEnhancedSimilarity(
            career,
            requiredSkills,
            careerTitle,
            industry
          );

          return {
            ...career,
            similarity_score: matchResult.score,
            match_reasons: matchResult.reasons
          } as SimilarCareer;
        });

        // Filter and sort with higher threshold for better quality
        const topSimilar = careersWithScores
          .filter(career => career.similarity_score > 0.25) // Increased threshold
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

// Enhanced similarity calculation with multiple factors
function calculateEnhancedSimilarity(
  career: Career,
  targetSkills: string[],
  targetTitle: string,
  targetIndustry?: string
): { score: number; reasons: string[] } {
  let totalScore = 0;
  const reasons: string[] = [];

  // 1. Enhanced Skills Matching (40% weight)
  const skillMatches = findSkillMatches(
    [...(career.required_skills || []), ...(career.transferable_skills || [])],
    targetSkills
  );
  
  if (skillMatches.length > 0) {
    const skillScore = calculateSkillScore(skillMatches, targetSkills.length);
    totalScore += skillScore * 0.4;
    
    const exactMatches = skillMatches.filter(m => m.matchType === 'exact').length;
    const partialMatches = skillMatches.filter(m => m.matchType === 'partial').length;
    const semanticMatches = skillMatches.filter(m => m.matchType === 'semantic').length;
    
    if (exactMatches > 0) reasons.push(`${exactMatches} exact skill match${exactMatches > 1 ? 'es' : ''}`);
    if (partialMatches > 0) reasons.push(`${partialMatches} related skill${partialMatches > 1 ? 's' : ''}`);
    if (semanticMatches > 0) reasons.push(`${semanticMatches} complementary skill${semanticMatches > 1 ? 's' : ''}`);
  }

  // 2. Enhanced Title Similarity (25% weight)
  const titleSimilarity = calculateEnhancedTitleSimilarity(career.title, targetTitle);
  if (titleSimilarity > 0.15) {
    totalScore += titleSimilarity * 0.25;
    if (titleSimilarity > 0.6) {
      reasons.push('Very similar job title');
    } else if (titleSimilarity > 0.3) {
      reasons.push('Similar job title');
    } else {
      reasons.push('Related job role');
    }
  }

  // 3. Industry/Field Matching (20% weight)
  const industryScore = calculateIndustryScore(career, targetIndustry);
  if (industryScore > 0) {
    totalScore += industryScore * 0.2;
    if (industryScore > 0.8) {
      reasons.push('Same industry');
    } else if (industryScore > 0.5) {
      reasons.push('Related industry');
    }
  }

  // 4. Education Level Compatibility (10% weight)
  const educationScore = calculateEducationCompatibility(career.required_education || []);
  if (educationScore > 0) {
    totalScore += educationScore * 0.1;
    if (educationScore > 0.7) {
      reasons.push('Similar education requirements');
    }
  }

  // 5. Keywords and Career Family (5% weight)
  if (career.keywords && career.keywords.length > 0) {
    const keywordMatches = career.keywords.filter(keyword =>
      targetTitle.toLowerCase().includes(keyword.toLowerCase()) ||
      targetSkills.some(skill => skill.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    if (keywordMatches.length > 0) {
      const keywordScore = Math.min(keywordMatches.length / career.keywords.length, 1);
      totalScore += keywordScore * 0.05;
      reasons.push('Related career field');
    }
  }

  return {
    score: Math.min(totalScore, 1), // Cap at 1.0
    reasons: reasons.slice(0, 3) // Limit to top 3 reasons
  };
}

// Enhanced skill matching with semantic understanding
function findSkillMatches(careerSkills: string[], targetSkills: string[]): SkillMatch[] {
  const matches: SkillMatch[] = [];
  
  for (const careerSkill of careerSkills) {
    for (const targetSkill of targetSkills) {
      const matchResult = compareSkills(careerSkill, targetSkill);
      if (matchResult.score > 0) {
        matches.push({
          skill: careerSkill,
          matchType: matchResult.type,
          score: matchResult.score
        });
        break; // Avoid duplicate matches for the same career skill
      }
    }
  }
  
  return matches;
}

// Enhanced skill comparison with semantic matching
function compareSkills(skill1: string, skill2: string): { score: number; type: 'exact' | 'partial' | 'semantic' } {
  const s1 = skill1.toLowerCase().trim();
  const s2 = skill2.toLowerCase().trim();
  
  // Exact match
  if (s1 === s2) {
    return { score: 1.0, type: 'exact' };
  }
  
  // Partial matches (one contains the other)
  if (s1.includes(s2) || s2.includes(s1)) {
    return { score: 0.8, type: 'partial' };
  }
  
  // Semantic/related skills mapping
  const semanticMatches = getSemanticSkillMatches();
  for (const [key, relatedSkills] of Object.entries(semanticMatches)) {
    if ((s1.includes(key) || key.includes(s1)) && 
        relatedSkills.some(related => s2.includes(related) || related.includes(s2))) {
      return { score: 0.6, type: 'semantic' };
    }
  }
  
  // Fuzzy string similarity for typos and variations
  const similarity = calculateStringSimilarity(s1, s2);
  if (similarity > 0.7) {
    return { score: similarity * 0.7, type: 'partial' };
  }
  
  return { score: 0, type: 'exact' };
}

// Semantic skill mapping for related technologies and concepts
function getSemanticSkillMatches(): Record<string, string[]> {
  return {
    'javascript': ['react', 'node.js', 'vue', 'angular', 'typescript', 'web development'],
    'python': ['django', 'flask', 'machine learning', 'data science', 'ai', 'backend'],
    'react': ['javascript', 'frontend', 'web development', 'ui/ux'],
    'data analysis': ['statistics', 'excel', 'sql', 'python', 'r', 'analytics'],
    'project management': ['agile', 'scrum', 'leadership', 'planning', 'coordination'],
    'communication': ['presentation', 'writing', 'public speaking', 'interpersonal'],
    'leadership': ['management', 'team building', 'decision making', 'mentoring'],
    'design': ['ui/ux', 'graphic design', 'creative', 'visual', 'adobe'],
    'marketing': ['digital marketing', 'social media', 'content', 'branding', 'advertising'],
    'finance': ['accounting', 'budgeting', 'financial analysis', 'economics'],
    'healthcare': ['medical', 'patient care', 'clinical', 'nursing', 'therapy'],
    'education': ['teaching', 'curriculum', 'training', 'mentoring', 'academic'],
    'engineering': ['technical', 'problem solving', 'design', 'analysis', 'mathematics'],
    'sales': ['negotiation', 'customer service', 'relationship building', 'persuasion']
  };
}

// Calculate weighted skill score
function calculateSkillScore(matches: SkillMatch[], totalTargetSkills: number): number {
  if (matches.length === 0 || totalTargetSkills === 0) return 0;
  
  const weightedScore = matches.reduce((sum, match) => {
    const weight = match.matchType === 'exact' ? 1.0 : 
                   match.matchType === 'partial' ? 0.8 : 0.6;
    return sum + (match.score * weight);
  }, 0);
  
  // Normalize by number of target skills, but don't penalize too heavily for having more skills
  return Math.min(weightedScore / Math.max(totalTargetSkills, matches.length), 1);
}

// Enhanced title similarity with career role understanding
function calculateEnhancedTitleSimilarity(title1: string, title2: string): number {
  const t1 = title1.toLowerCase();
  const t2 = title2.toLowerCase();
  
  // Direct word-based similarity
  const wordSimilarity = calculateStringSimilarity(t1, t2);
  
  // Check for role hierarchy (e.g., "Senior Developer" vs "Developer")
  const rolePatterns = [
    ['senior', 'lead', 'principal', 'chief'],
    ['junior', 'entry', 'associate', 'assistant'],
    ['manager', 'director', 'head', 'supervisor'],
    ['analyst', 'specialist', 'consultant', 'expert'],
    ['engineer', 'developer', 'programmer', 'architect']
  ];
  
  let roleBonus = 0;
  for (const roles of rolePatterns) {
    const t1HasRole = roles.some(role => t1.includes(role));
    const t2HasRole = roles.some(role => t2.includes(role));
    if (t1HasRole && t2HasRole) {
      roleBonus = 0.3; // Boost for same role category
      break;
    }
  }
  
  return Math.min(wordSimilarity + roleBonus, 1);
}

// Industry scoring with fallback to description analysis
function calculateIndustryScore(career: Career, targetIndustry?: string): number {
  if (!targetIndustry) return 0;
  
  const careerIndustry = career.industry;
  if (careerIndustry) {
    const similarity = calculateStringSimilarity(
      careerIndustry.toLowerCase(),
      targetIndustry.toLowerCase()
    );
    if (similarity > 0.7) return similarity;
  }
  
  // Fallback: analyze description for industry keywords
  if (career.description) {
    const industryKeywords = extractIndustryKeywords(targetIndustry);
    const descriptionWords = career.description.toLowerCase().split(/\s+/);
    const matches = industryKeywords.filter(keyword => 
      descriptionWords.some(word => word.includes(keyword))
    );
    
    if (matches.length > 0) {
      return Math.min(matches.length / industryKeywords.length * 0.8, 0.8);
    }
  }
  
  return 0;
}

// Extract keywords from industry name
function extractIndustryKeywords(industry: string): string[] {
  const baseKeywords = industry.toLowerCase().split(/[,\s&]+/).filter(word => word.length > 2);
  
  // Add related keywords based on common industry terms
  const industryExpansions: Record<string, string[]> = {
    'technology': ['tech', 'software', 'digital', 'it', 'computer'],
    'healthcare': ['medical', 'health', 'clinical', 'patient', 'hospital'],
    'finance': ['financial', 'banking', 'investment', 'accounting', 'money'],
    'education': ['academic', 'school', 'university', 'teaching', 'learning'],
    'retail': ['sales', 'customer', 'store', 'shopping', 'merchandise'],
    'manufacturing': ['production', 'factory', 'industrial', 'assembly', 'quality'],
    'marketing': ['advertising', 'brand', 'campaign', 'social media', 'content']
  };
  
  const expandedKeywords = [...baseKeywords];
  for (const [key, expansions] of Object.entries(industryExpansions)) {
    if (baseKeywords.some(keyword => keyword.includes(key) || key.includes(keyword))) {
      expandedKeywords.push(...expansions);
    }
  }
  
  return [...new Set(expandedKeywords)]; // Remove duplicates
}

// Education compatibility scoring
function calculateEducationCompatibility(requiredEducation: string[]): number {
  if (!requiredEducation.length) return 0.5; // Neutral score for unspecified
  
  // Score based on education level - careers requiring similar levels are more compatible
  const educationLevels = {
    'high school': 1,
    'associate': 2,
    'bachelor': 3,
    'master': 4,
    'phd': 5,
    'doctorate': 5,
    'certification': 2,
    'bootcamp': 2,
    'vocational': 2
  };
  
  const avgLevel = requiredEducation.reduce((sum, edu) => {
    const level = Object.entries(educationLevels).find(([key]) => 
      edu.toLowerCase().includes(key)
    )?.[1] || 3; // Default to bachelor level
    return sum + level;
  }, 0) / requiredEducation.length;
  
  // Return higher score for moderate education requirements (bachelor level)
  return avgLevel >= 2 && avgLevel <= 4 ? 0.8 : 0.5;
}

// Enhanced string similarity using Jaccard similarity with word importance
function calculateStringSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/).filter(word => word.length > 2));
  const words2 = new Set(str2.split(/\s+/).filter(word => word.length > 2));
  
  if (words1.size === 0 && words2.size === 0) return 1;
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}
