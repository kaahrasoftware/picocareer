// Fix the Match type issues in recommendationParser.ts
// Let's add the necessary exports and types

// Define the types needed for parsing recommendations
export interface Career {
  title: string;
  match: string | number;
  reasoning: string;
  key_requirements?: string[];
  education_paths?: string[];
}

export interface Personality {
  title: string;
  match: string | number;
  description: string;
}

export interface Mentor {
  name: string;
  experience?: string;
  skills: string;
}

export interface StructuredContent {
  introduction?: {
    title?: string;
    summary?: string;
  };
  career_recommendations?: Array<any>;
  personality_insights?: Array<any>;
  growth_areas?: Array<any>;
  closing?: {
    message?: string;
    next_steps?: string[];
  };
}

export interface ParsedRecommendation {
  type: string;
  careers: Career[];
  personalities: Personality[];
  mentors: Mentor[];
  structuredContent?: StructuredContent;
}

// Replace the problematic match pattern with a safer approach
function extractValue(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  if (match && match.length > 0) {
    return match[0];
  }
  return null;
}

// Add function to parse structured recommendations
export function parseStructuredRecommendation(rawResponse: any): ParsedRecommendation {
  // Default structure
  const recommendation: ParsedRecommendation = {
    type: rawResponse.type || 'recommendation',
    careers: [],
    personalities: [],
    mentors: [],
  };

  // Handle structured content format (new format)
  if (rawResponse.content && typeof rawResponse.content === 'object') {
    recommendation.structuredContent = {
      introduction: rawResponse.content.intro ? {
        title: rawResponse.content.title || "Your Career Assessment Results",
        summary: rawResponse.content.intro
      } : undefined,
      career_recommendations: rawResponse.content.careers || rawResponse.content.career_recommendations,
      personality_insights: rawResponse.content.personality || rawResponse.content.personality_insights,
      growth_areas: rawResponse.content.growth_areas,
      closing: rawResponse.content.message ? {
        message: rawResponse.content.message,
        next_steps: rawResponse.content.suggestions
      } : undefined
    };
    return recommendation;
  }

  // Handle text-based parsing for legacy format
  const content = typeof rawResponse.content === 'string' ? rawResponse.content : rawResponse.content?.message || '';
  
  // Parse careers section
  const careerRegex = /Career:\s*([^\n]+)\nMatch:\s*(\d+)%\nReasoning:\s*([^\n]+)/g;
  let careerMatch;
  while ((careerMatch = careerRegex.exec(content)) !== null) {
    recommendation.careers.push({
      title: careerMatch[1].trim(),
      match: parseInt(careerMatch[2]),
      reasoning: careerMatch[3].trim()
    });
  }

  // Parse personalities section
  const personalityRegex = /Trait:\s*([^\n]+)\nStrength:\s*(\d+)%\nDescription:\s*([^\n]+)/g;
  let personalityMatch;
  while ((personalityMatch = personalityRegex.exec(content)) !== null) {
    recommendation.personalities.push({
      title: personalityMatch[1].trim(),
      match: parseInt(personalityMatch[2]),
      description: personalityMatch[3].trim()
    });
  }

  // Parse mentors section (if present)
  const mentorRegex = /Mentor:\s*([^\n]+)\nExperience:\s*([^\n]+)\nSkills:\s*([^\n]+)/g;
  let mentorMatch;
  while ((mentorMatch = mentorRegex.exec(content)) !== null) {
    recommendation.mentors.push({
      name: mentorMatch[1].trim(),
      experience: mentorMatch[2].trim(),
      skills: mentorMatch[3].trim()
    });
  }

  return recommendation;
}

// Keep the original functions
export function parseCareerFromRecommendation(text: string) {
  // Use the safer approach
  const careerMatch = extractValue(text, /Career: ([^\n]+)/);
  if (!careerMatch) return null;
  
  // Process the matched content
  return careerMatch.replace('Career: ', '').trim();
}

export function parseReasoningFromRecommendation(text: string) {
  // Use the safer approach
  const reasoningMatch = extractValue(text, /Reasoning: ([^\n]+)/);
  if (!reasoningMatch || reasoningMatch.length === 0) return null;
  
  // Process the matched content
  return reasoningMatch.replace('Reasoning: ', '').trim();
}
