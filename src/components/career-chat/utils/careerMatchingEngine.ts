
import { supabase } from "@/integrations/supabase/client";
import { StructuredMessage } from "@/types/database/message-types";

export interface UserProfileData {
  skills: string[];
  interests: string[];
  workPreferences: string[];
  academicInterests: string[];
  personalityTraits: string[];
}

export interface CareerMatch {
  id: string;
  title: string;
  description: string;
  salary_range?: string;
  work_environment?: string;
  required_skills?: string[];
  required_tools?: string[];
  growth_potential?: string;
  score: number;
  reasoning?: string;
}

/**
 * Extracts user profile data from conversation history
 */
export function extractUserProfileFromMessages(
  messages: { message_type: string; content: string; metadata?: any }[]
): UserProfileData {
  // Default empty profile
  const profile: UserProfileData = {
    skills: [],
    interests: [],
    workPreferences: [],
    academicInterests: [],
    personalityTraits: [],
  };

  // Process messages to extract profile data
  messages.forEach((message) => {
    if (message.message_type !== "user") return;

    const content = message.content.toLowerCase();

    // Extract skills (this is simplified, actual implementation would be more sophisticated)
    const skillsKeywords = [
      "good at",
      "skilled in",
      "expertise",
      "proficient",
      "skill",
      "ability",
      "capable",
    ];
    skillsKeywords.forEach((keyword) => {
      if (content.includes(keyword)) {
        const skillsText = content.split(keyword)[1]?.split(".")[0] || "";
        const skills = skillsText
          .split(/,|\band\b/)
          .map((s) => s.trim())
          .filter((s) => s.length > 3);
        profile.skills.push(...skills);
      }
    });

    // Extract interests
    const interestsKeywords = [
      "interested in",
      "passion for",
      "enjoy",
      "like",
      "love",
    ];
    interestsKeywords.forEach((keyword) => {
      if (content.includes(keyword)) {
        const interestsText = content.split(keyword)[1]?.split(".")[0] || "";
        const interests = interestsText
          .split(/,|\band\b/)
          .map((s) => s.trim())
          .filter((s) => s.length > 3);
        profile.interests.push(...interests);
      }
    });

    // Extract work preferences
    const workKeywords = [
      "prefer",
      "environment",
      "workplace",
      "work style",
      "team",
      "individual",
    ];
    workKeywords.forEach((keyword) => {
      if (content.includes(keyword)) {
        const workText = content.split(keyword)[1]?.split(".")[0] || "";
        const prefs = workText
          .split(/,|\band\b/)
          .map((s) => s.trim())
          .filter((s) => s.length > 3);
        profile.workPreferences.push(...prefs);
      }
    });

    // Extract academic interests
    const academicKeywords = [
      "study",
      "studied",
      "major",
      "degree",
      "education",
      "learn",
      "course",
    ];
    academicKeywords.forEach((keyword) => {
      if (content.includes(keyword)) {
        const academicText = content.split(keyword)[1]?.split(".")[0] || "";
        const academics = academicText
          .split(/,|\band\b/)
          .map((s) => s.trim())
          .filter((s) => s.length > 3);
        profile.academicInterests.push(...academics);
      }
    });
  });

  // Remove duplicates and limit length
  profile.skills = [...new Set(profile.skills)].slice(0, 10);
  profile.interests = [...new Set(profile.interests)].slice(0, 10);
  profile.workPreferences = [...new Set(profile.workPreferences)].slice(0, 10);
  profile.academicInterests = [...new Set(profile.academicInterests)].slice(0, 10);
  profile.personalityTraits = [...new Set(profile.personalityTraits)].slice(0, 10);

  return profile;
}

/**
 * Performs direct database query to find matching careers
 */
export async function findMatchingCareers(
  profile: UserProfileData,
  limit: number = 7
): Promise<CareerMatch[]> {
  // Combine all relevant terms for matching
  const allTerms = [
    ...profile.skills,
    ...profile.interests,
    ...profile.workPreferences,
    ...profile.academicInterests,
  ].filter(Boolean);

  if (allTerms.length === 0) {
    console.error("No profile terms to match against");
    return [];
  }

  try {
    console.log("Searching careers with profile terms:", allTerms);

    // Build a query to match careers against profile terms
    const { data: careers, error } = await supabase
      .from("careers")
      .select(`
        id,
        title,
        description,
        salary_range,
        required_skills,
        required_tools,
        work_environment,
        growth_potential,
        academic_majors,
        keywords
      `)
      .eq("status", "Approved")
      .eq("complete_career", true)
      .limit(20);

    if (error) {
      console.error("Error finding matching careers:", error);
      return [];
    }

    // Calculate match scores
    const matchedCareers = careers.map((career) => {
      // Extract all searchable text from career
      const careerTerms = [
        ...(career.required_skills || []),
        ...(career.required_tools || []),
        ...(career.academic_majors || []),
        ...(career.keywords || []),
        career.work_environment || "",
        career.description || "",
      ].filter(Boolean).map(term => term.toLowerCase());

      // Calculate match score based on term overlap
      let matchScore = 0;
      let matchedTerms: string[] = [];

      // Count overlapping terms
      allTerms.forEach((term) => {
        const termLower = term.toLowerCase();
        // Check for exact matches
        if (careerTerms.some(careerTerm => careerTerm.includes(termLower))) {
          matchScore += 10;
          matchedTerms.push(term);
        }
        // Check for partial matches
        else if (careerTerms.some(careerTerm => termLower.includes(careerTerm) || careerTerm.includes(termLower))) {
          matchScore += 5;
          matchedTerms.push(term);
        }
      });

      // Normalize score to percentage (0-100)
      const normalizedScore = Math.min(Math.round((matchScore / (allTerms.length * 10)) * 100), 100);
      
      // Generate reasoning based on matched terms
      const reasoning = matchedTerms.length > 0
        ? `This career matches your profile because of your interest in ${matchedTerms.slice(0, 3).join(", ")}.`
        : "This career may align with your overall profile and interests.";

      return {
        ...career,
        score: normalizedScore,
        reasoning
      };
    });

    // Sort by score and take top results
    return matchedCareers
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error("Error in career matching function:", error);
    return [];
  }
}

/**
 * Combines AI-generated analysis with database matching
 */
export async function getHybridCareerRecommendations(
  messages: { message_type: string; content: string; metadata?: any }[],
  aiSuggestions: any[] = [],
  limit: number = 7
): Promise<CareerMatch[]> {
  try {
    // Step 1: Extract user profile from messages
    const userProfile = extractUserProfileFromMessages(messages);
    console.log("Extracted user profile:", userProfile);
    
    // Step 2: Get database matches
    const dbMatches = await findMatchingCareers(userProfile, limit);
    console.log("Database career matches:", dbMatches.length);
    
    // Step 3: Combine with AI suggestions if available
    if (aiSuggestions && aiSuggestions.length > 0) {
      // Enhance database matches with AI reasoning where possible
      const enhancedMatches = dbMatches.map(dbMatch => {
        const aiMatch = aiSuggestions.find(ai => 
          ai.title?.toLowerCase() === dbMatch.title?.toLowerCase());
        
        if (aiMatch) {
          return {
            ...dbMatch,
            score: Math.max(dbMatch.score, aiMatch.score || 0),
            reasoning: aiMatch.reasoning || dbMatch.reasoning
          };
        }
        return dbMatch;
      });
      
      return enhancedMatches;
    }
    
    return dbMatches;
  } catch (error) {
    console.error("Error in hybrid career recommendations:", error);
    return [];
  }
}

/**
 * Creates a structured session-end message with career recommendations
 */
export function createRecommendationMessage(
  careers: CareerMatch[]
): StructuredMessage {
  const recommendationsMessage: StructuredMessage = {
    type: "recommendation",
    content: {
      intro: "Based on our conversation, I've analyzed your preferences and found some career paths that might be a good fit for you.",
      message: `I've found ${careers.length} career matches that align with your profile.`
    },
    metadata: {
      isRecommendation: true,
      completionType: "career_recommendations"
    }
  };
  
  return recommendationsMessage;
}
