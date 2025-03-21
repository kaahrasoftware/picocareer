
/**
 * Utility to parse and structure career recommendation messages
 */
import { CareerSuggestion, GrowthArea, PersonalityTrait } from "@/types/database/message-types";

// Types for parsed recommendation sections
export interface CareerRecommendation {
  title: string;
  match: number;
  reasoning: string;
}

export interface PersonalityInsight {
  title: string;
  match: number;
  description: string;
}

export interface MentorRecommendation {
  name: string;
  experience: string;
  skills: string;
}

// Types for structured assessment result content
export interface AssessmentIntroduction {
  title: string;
  summary: string;
}

export interface StructuredCareerRecommendation {
  title: string;
  match_percentage: number;
  description: string;
  key_requirements?: string[];
  education_paths?: string[];
  id?: string; // Added ID field to link to careers database
  industry?: string;
  salary_range?: string;
  growth_potential?: string;
}

export interface ClosingInfo {
  message: string;
  next_steps: string[];
}

export interface StructuredAssessmentContent {
  introduction?: AssessmentIntroduction;
  career_recommendations?: StructuredCareerRecommendation[];
  personality_insights?: PersonalityTrait[];
  growth_areas?: GrowthArea[];
  closing?: ClosingInfo;
}

export interface ParsedRecommendation {
  type: 'recommendation' | 'assessment_result' | 'session_end' | 'unknown';
  careers: CareerRecommendation[];
  personalities: PersonalityInsight[];
  mentors: MentorRecommendation[];
  structuredContent?: StructuredAssessmentContent;
}

// Type for structured response from DeepSeek
export interface StructuredRecommendation {
  type: string;
  content: {
    careers?: Array<{
      title: string;
      match: number;
      reasoning: string;
    }>;
    personality?: Array<{
      title: string;
      match: number;
      description: string;
    }>;
    mentors?: Array<{
      name: string;
      experience: string;
      skills: string;
    }>;
    // New structured assessment result format
    introduction?: AssessmentIntroduction;
    career_recommendations?: StructuredCareerRecommendation[];
    personality_insights?: PersonalityTrait[];
    growth_areas?: GrowthArea[];
    closing?: ClosingInfo;
    message?: string;
    suggestions?: string[];
  };
  metadata?: {
    isSessionEnd?: boolean;
    completionType?: string;
  };
}

/**
 * Parses a structured recommendation response directly
 */
export function parseStructuredRecommendation(rawResponse: any): ParsedRecommendation {
  if (!rawResponse) {
    return { 
      type: 'unknown',
      careers: [],
      personalities: [],
      mentors: []
    };
  }

  // Handle session_end messages
  if (rawResponse.type === 'session_end') {
    return {
      type: 'session_end',
      careers: [],
      personalities: [],
      mentors: [],
      structuredContent: {
        introduction: {
          title: "Session Complete",
          summary: rawResponse.content?.message || "Your career assessment session is complete."
        },
        closing: {
          message: rawResponse.content?.message || "Thank you for completing the assessment.",
          next_steps: rawResponse.content?.suggestions || []
        }
      }
    };
  }

  // Handle the assessment_result type
  if (rawResponse.type === 'assessment_result') {
    // Convert career_recommendations to the format the UI expects
    let careers: CareerRecommendation[] = [];
    if (rawResponse.content.career_recommendations && rawResponse.content.career_recommendations.length > 0) {
      careers = rawResponse.content.career_recommendations.map(career => ({
        title: career.title || '',
        match: career.match_percentage || 0,
        reasoning: career.description || ''
      }));
    }

    return {
      type: 'assessment_result',
      careers,
      personalities: (rawResponse.content.personality_insights || []).map((trait: any) => ({
        title: trait.trait || '',
        match: trait.strength_level || 0,
        description: trait.description || ''
      })),
      mentors: [],
      structuredContent: {
        introduction: rawResponse.content.introduction,
        career_recommendations: rawResponse.content.career_recommendations,
        personality_insights: rawResponse.content.personality_insights,
        growth_areas: rawResponse.content.growth_areas,
        closing: rawResponse.content.closing
      }
    };
  }
  
  // Handle legacy recommendation format
  if (rawResponse.type === 'recommendation') {
    return {
      type: 'recommendation',
      careers: (rawResponse.content.careers || []).map((career: any) => ({
        title: career.title || '',
        match: career.match_percentage || career.match || 0,
        reasoning: career.description || career.reasoning || ''
      })),
      personalities: (rawResponse.content.personality || []).map((trait: any) => ({
        title: trait.title || '',
        match: trait.match || 0,
        description: trait.description || ''
      })),
      mentors: (rawResponse.content.mentors || []).map((mentor: any) => ({
        name: mentor.name || '',
        experience: mentor.experience || '',
        skills: mentor.skills || ''
      }))
    };
  }
  
  return { 
    type: 'unknown',
    careers: [],
    personalities: [],
    mentors: []
  };
}

/**
 * Extracts structured sections from a career recommendation message
 * This is used as a fallback when raw JSON structure isn't available
 */
export function extractSections(content: string): ParsedRecommendation {
  if (!content.includes('Career Recommendations') && 
      !content.includes('Career Matches') && 
      !content.includes('Personality')) {
    return { 
      type: 'unknown',
      careers: [],
      personalities: [],
      mentors: []
    };
  }
  
  const careers: CareerRecommendation[] = [];
  const personalities: PersonalityInsight[] = [];
  const mentors: MentorRecommendation[] = [];
  
  const careerSection = content.split(/Career (Recommendations|Matches)/i)[2]?.split(/Personality (Assessment|Analysis)/i)[0] || '';
  if (careerSection) {
    const careerMatches = careerSection.match(/\d+\.\s+(.*?)(?:\s*\((\d+)%\)|\s*-\s*(\d+)%)/g) || [];
    
    careerMatches.forEach((matchText, index) => {
      const titleMatch = matchText.match(/\d+\.\s+(.*?)(?:\s*\((\d+)%\)|\s*-\s*(\d+)%)/);
      if (titleMatch) {
        const title = titleMatch[1].trim();
        const matchScore = parseInt(titleMatch[2] || titleMatch[3] || '0', 10);
        
        let reasoning = '';
        const startPos = careerSection.indexOf(matchText) + matchText.length;
        let nextNumberPos;
        
        if (index < careerMatches.length - 1) {
          const nextMatchPos = careerSection.indexOf(careerMatches[index + 1], startPos);
          nextNumberPos = nextMatchPos > 0 ? nextMatchPos - startPos : -1;
        } else {
          nextNumberPos = careerSection.substring(startPos).search(/\d+\.\s+/);
        }
        
        if (nextNumberPos > 0) {
          reasoning = careerSection.substring(startPos, startPos + nextNumberPos).trim();
        } else if (index === careerMatches.length - 1) {
          reasoning = careerSection.substring(startPos).trim();
        }
        
        careers.push({
          title,
          match: matchScore,
          reasoning: reasoning || `Good match based on your skills and preferences.`
        });
      }
    });
  }
  
  const personalitySection = content.split(/Personality (Assessment|Analysis)/i)[1]?.split(/Mentor (Suggestions|Recommendations)/i)[0] || '';
  if (personalitySection) {
    const personalityMatches = personalitySection.match(/\d+\.\s+(.*?)(?:\s*\((\d+)%\)|\s*-\s*(\d+)%)/g) || [];
    
    personalityMatches.forEach((matchText, index) => {
      const titleMatch = matchText.match(/\d+\.\s+(.*?)(?:\s*\((\d+)%\)|\s*-\s*(\d+)%)/);
      if (titleMatch) {
        const title = titleMatch[1].trim();
        const matchScore = parseInt(titleMatch[2] || titleMatch[3] || '0', 10);
        
        let description = '';
        const startPos = personalitySection.indexOf(matchText) + matchText.length;
        let nextNumberPos;
        
        if (index < personalityMatches.length - 1) {
          const nextMatchPos = personalitySection.indexOf(personalityMatches[index + 1], startPos);
          nextNumberPos = nextMatchPos > 0 ? nextMatchPos - startPos : -1;
        } else {
          nextNumberPos = personalitySection.substring(startPos).search(/\d+\.\s+/);
        }
        
        if (nextNumberPos > 0) {
          description = personalitySection.substring(startPos, startPos + nextNumberPos).trim();
        } else if (index === personalityMatches.length - 1) {
          description = personalitySection.substring(startPos).trim();
        }
        
        personalities.push({
          title,
          match: matchScore,
          description: description || `Personality type that matches your profile.`
        });
      }
    });
  }
  
  const mentorSection = content.split(/Mentor (Suggestions|Recommendations)/i)[1] || '';
  if (mentorSection) {
    const mentorMatches = mentorSection.match(/\d+\.\s+(.*?)(?:\s*\(|:|\s*-)/g) || [];
    
    mentorMatches.forEach((matchText, index) => {
      const nameMatch = matchText.match(/\d+\.\s+(.*?)(?:\s*\(|:|\s*-)/);
      if (nameMatch) {
        const name = nameMatch[1].trim();
        
        let details = '';
        const startPos = mentorSection.indexOf(matchText) + matchText.length;
        let nextNumberPos;
        
        if (index < mentorMatches.length - 1) {
          const nextMatchPos = mentorSection.indexOf(mentorMatches[index + 1], startPos);
          nextNumberPos = nextMatchPos > 0 ? nextMatchPos - startPos : -1;
        } else {
          nextNumberPos = mentorSection.substring(startPos).search(/\d+\.\s+/);
        }
        
        if (nextNumberPos > 0) {
          details = mentorSection.substring(startPos, startPos + nextNumberPos).trim();
        } else if (index === mentorMatches.length - 1) {
          details = mentorSection.substring(startPos).trim();
        }
        
        const experienceMatch = details.match(/(\d+)\s+years?/i);
        const experience = experienceMatch ? `${experienceMatch[1]} years` : "Experienced";
        
        mentors.push({
          name,
          experience,
          skills: details
        });
      }
    });
  }
  
  return {
    type: 'recommendation',
    careers,
    personalities,
    mentors
  };
}
