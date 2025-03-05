
/**
 * Utility to parse and structure career recommendation messages
 */

// Types for parsed recommendation sections
export interface CareerRecommendation {
  title: string;
  match: number;
  reasoning: string;
  keySkills?: string[];
  education?: string;
}

export interface PersonalityInsight {
  title: string;
  match: number;
  description: string;
}

export interface GrowthArea {
  skill: string;
  priority: "high" | "medium" | "low";
  description: string;
  resources?: string[];
}

export interface MentorRecommendation {
  name: string;
  experience: string;
  skills: string;
}

export interface TestResultIntroduction {
  title: string;
  summary: string;
  completionDate: string;
  overallInsight: string;
}

export interface TestResultClosing {
  message: string;
  nextSteps: string[];
}

export interface ParsedRecommendation {
  type: 'recommendation' | 'unknown';
  introduction?: TestResultIntroduction;
  careers: CareerRecommendation[];
  personalities: PersonalityInsight[];
  growthAreas: GrowthArea[];
  mentors: MentorRecommendation[];
  closing?: TestResultClosing;
}

// Type for structured response from DeepSeek
export interface StructuredRecommendation {
  type: string;
  sections: {
    introduction?: {
      title: string;
      summary: string;
      completionDate: string;
      overallInsight: string;
    };
    careers: Array<{
      title: string;
      match: number;
      description: string;
      keySkills?: string[];
      education?: string;
    }>;
    personalityInsights: Array<{
      trait: string;
      strength: number;
      description: string;
    }>;
    growthAreas: Array<{
      skill: string;
      priority: "high" | "medium" | "low";
      description: string;
      resources?: string[];
    }>;
    closing?: {
      message: string;
      nextSteps: string[];
    };
    mentors?: Array<{
      name: string;
      experience: string;
      skills: string;
    }>;
  };
}

/**
 * Parses a structured recommendation response directly
 */
export function parseStructuredRecommendation(rawResponse: any): ParsedRecommendation {
  if (!rawResponse || rawResponse.type !== 'recommendation' || !rawResponse.sections) {
    return { 
      type: 'unknown',
      careers: [],
      personalities: [],
      growthAreas: [],
      mentors: []
    };
  }
  
  return {
    type: 'recommendation',
    introduction: rawResponse.sections.introduction ? {
      title: rawResponse.sections.introduction.title || 'Your Career Assessment Results',
      summary: rawResponse.sections.introduction.summary || '',
      completionDate: rawResponse.sections.introduction.completionDate || new Date().toLocaleDateString(),
      overallInsight: rawResponse.sections.introduction.overallInsight || ''
    } : undefined,
    careers: (rawResponse.sections.careers || []).map((career: any) => ({
      title: career.title || '',
      match: career.match || 0,
      reasoning: career.description || '',
      keySkills: career.keySkills || [],
      education: career.education || ''
    })),
    personalities: (rawResponse.sections.personalityInsights || []).map((trait: any) => ({
      title: trait.trait || '',
      match: trait.strength || 0,
      description: trait.description || ''
    })),
    growthAreas: (rawResponse.sections.growthAreas || []).map((area: any) => ({
      skill: area.skill || '',
      priority: area.priority || 'medium',
      description: area.description || '',
      resources: area.resources || []
    })),
    mentors: (rawResponse.sections.mentors || []).map((mentor: any) => ({
      name: mentor.name || '',
      experience: mentor.experience || '',
      skills: mentor.skills || ''
    })),
    closing: rawResponse.sections.closing ? {
      message: rawResponse.sections.closing.message || 'Thank you for completing your career assessment!',
      nextSteps: rawResponse.sections.closing.nextSteps || []
    } : undefined
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
      growthAreas: [],
      mentors: []
    };
  }
  
  // Extract introduction if present
  const introSection = content.split(/Career (Recommendations|Matches)/i)[0] || '';
  let introduction: TestResultIntroduction | undefined = undefined;
  
  if (introSection) {
    const titleMatch = introSection.match(/# (.*?)(?:\n|$)/);
    const summaryMatch = introSection.match(/\n\n(.*?)(?=\n\n|$)/);
    
    introduction = {
      title: titleMatch ? titleMatch[1].trim() : 'Your Career Assessment Results',
      summary: summaryMatch ? summaryMatch[1].trim() : '',
      completionDate: new Date().toLocaleDateString(),
      overallInsight: introSection.replace(titleMatch ? titleMatch[0] : '', '')
        .replace(summaryMatch ? summaryMatch[0] : '', '').trim()
    };
  }
  
  // Extract careers section
  const careers: CareerRecommendation[] = [];
  const careerSection = content.split(/Career (Recommendations|Matches)/i)[2]?.split(/Personality (Assessment|Analysis)/i)[0] || '';
  if (careerSection) {
    const careerMatches = careerSection.match(/\d+\.\s+(.*?)(?:\s*\((\d+)%\)|\s*-\s*(\d+)%)/g) || [];
    
    careerMatches.forEach((match, index) => {
      const titleMatch = match.match(/\d+\.\s+(.*?)(?:\s*\((\d+)%\)|\s*-\s*(\d+)%)/);
      if (titleMatch) {
        const title = titleMatch[1].trim();
        const matchPercentage = parseInt(titleMatch[2] || titleMatch[3] || '0', 10);
        
        let reasoning = '';
        const startPos = careerSection.indexOf(match) + match.length;
        const nextNumberPos = careerSection.substring(startPos).search(/\d+\.\s+/);
        
        if (nextNumberPos > 0) {
          reasoning = careerSection.substring(startPos, startPos + nextNumberPos).trim();
        } else if (index === careerMatches.length - 1) {
          reasoning = careerSection.substring(startPos).trim();
        }
        
        // Extract key skills if they exist
        const keySkillsMatch = reasoning.match(/Key Skills:(.*?)(?=Education:|$)/is);
        const educationMatch = reasoning.match(/Education:(.*?)(?=\n\n|$)/is);
        
        const keySkills = keySkillsMatch 
          ? keySkillsMatch[1].trim().split(/,|\n/).map(s => s.trim()).filter(Boolean)
          : [];
        
        const education = educationMatch ? educationMatch[1].trim() : '';
        
        // Clean up the reasoning by removing the extracted parts
        let cleanReasoning = reasoning;
        if (keySkillsMatch) cleanReasoning = cleanReasoning.replace(keySkillsMatch[0], '');
        if (educationMatch) cleanReasoning = cleanReasoning.replace(educationMatch[0], '');
        
        careers.push({
          title,
          match: matchPercentage,
          reasoning: cleanReasoning.trim() || `Good match based on your skills and preferences.`,
          keySkills,
          education
        });
      }
    });
  }
  
  // Extract personality insights section
  const personalities: PersonalityInsight[] = [];
  const personalitySection = content.split(/Personality (Assessment|Analysis|Insights)/i)[1]?.split(/Growth Areas|Suggested Skills|Next Steps/i)[0] || '';
  if (personalitySection) {
    const personalityMatches = personalitySection.match(/\d+\.\s+(.*?)(?:\s*\((\d+)%\)|\s*-\s*(\d+)%)/g) || [];
    
    personalityMatches.forEach((match, index) => {
      const titleMatch = match.match(/\d+\.\s+(.*?)(?:\s*\((\d+)%\)|\s*-\s*(\d+)%)/);
      if (titleMatch) {
        const title = titleMatch[1].trim();
        const matchPercentage = parseInt(titleMatch[2] || titleMatch[3] || '80', 10);
        
        let description = '';
        const startPos = personalitySection.indexOf(match) + match.length;
        const nextNumberPos = personalitySection.substring(startPos).search(/\d+\.\s+/);
        
        if (nextNumberPos > 0) {
          description = personalitySection.substring(startPos, startPos + nextNumberPos).trim();
        } else if (index === personalityMatches.length - 1) {
          description = personalitySection.substring(startPos).trim();
        }
        
        personalities.push({
          title,
          match: matchPercentage,
          description: description || `Personality trait that matches your profile.`
        });
      }
    });
  }
  
  // Extract growth areas section
  const growthAreas: GrowthArea[] = [];
  const growthAreaSection = content.split(/Growth Areas|Suggested Skills/i)[1]?.split(/Next Steps|Conclusion|Thank/i)[0] || '';
  if (growthAreaSection) {
    const growthMatches = growthAreaSection.match(/\d+\.\s+(.*?)(?:\(|:|\s*-)/g) || [];
    
    growthMatches.forEach((match, index) => {
      const skillMatch = match.match(/\d+\.\s+(.*?)(?:\(|:|\s*-)/);
      if (skillMatch) {
        const skill = skillMatch[1].trim();
        
        let details = '';
        const startPos = growthAreaSection.indexOf(match) + match.length;
        const nextNumberPos = growthAreaSection.substring(startPos).search(/\d+\.\s+/);
        
        if (nextNumberPos > 0) {
          details = growthAreaSection.substring(startPos, startPos + nextNumberPos).trim();
        } else if (index === growthMatches.length - 1) {
          details = growthAreaSection.substring(startPos).trim();
        }
        
        // Extract priority
        let priority: "high" | "medium" | "low" = "medium";
        if (details.toLowerCase().includes('high priority') || details.toLowerCase().includes('priority: high')) {
          priority = "high";
        } else if (details.toLowerCase().includes('low priority') || details.toLowerCase().includes('priority: low')) {
          priority = "low";
        }
        
        // Extract resources if they exist
        const resourcesMatch = details.match(/Resources:(.*?)(?=\n\n|$)/is);
        const resources = resourcesMatch 
          ? resourcesMatch[1].trim().split(/,|\n/).map(s => s.trim()).filter(Boolean)
          : [];
        
        // Clean up the description
        let description = details;
        if (resourcesMatch) description = description.replace(resourcesMatch[0], '');
        
        growthAreas.push({
          skill,
          priority,
          description: description.trim(),
          resources
        });
      }
    });
  }
  
  // Extract closing section
  let closing: TestResultClosing | undefined = undefined;
  const closingSection = content.split(/Next Steps|Conclusion|Thank/i)[1] || '';
  if (closingSection) {
    const nextStepsMatch = closingSection.match(/\d+\.\s+(.*?)(?=\n\d+\.\s+|$)/g) || [];
    const nextSteps = nextStepsMatch.map(step => {
      const match = step.match(/\d+\.\s+(.*?)$/);
      return match ? match[1].trim() : step.trim();
    }).filter(Boolean);
    
    closing = {
      message: closingSection.split(nextStepsMatch[0] || '')[0].trim() || 'Thank you for completing your career assessment!',
      nextSteps: nextSteps.length > 0 ? nextSteps : ['Explore these career paths in detail', 'Connect with mentors in these fields']
    };
  }
  
  // Extract mentor section if it exists
  const mentors: MentorRecommendation[] = [];
  const mentorSection = content.split(/Mentor (Suggestions|Recommendations)/i)[1] || '';
  if (mentorSection) {
    const mentorMatches = mentorSection.match(/\d+\.\s+(.*?)(?:\s*\(|:|\s*-)/g) || [];
    
    mentorMatches.forEach((match, index) => {
      const nameMatch = match.match(/\d+\.\s+(.*?)(?:\s*\(|:|\s*-)/);
      if (nameMatch) {
        const name = nameMatch[1].trim();
        
        let details = '';
        const startPos = mentorSection.indexOf(match) + match.length;
        const nextNumberPos = mentorSection.substring(startPos).search(/\d+\.\s+/);
        
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
    introduction,
    careers,
    personalities,
    growthAreas,
    mentors,
    closing
  };
}
