
import { QuestionResponse } from '@/types/assessment';

export const useAssessmentAnalysis = (responses: QuestionResponse[]) => {
  const analyzeResponses = () => {
    const interests: string[] = [];
    const strengths: string[] = [];
    const preferences: string[] = [];

    responses.forEach(response => {
      const answer = response.answer;
      
      // Handle multiple select responses (arrays)
      if (Array.isArray(answer)) {
        // Categorize based on common question patterns
        const answerStrings = answer as string[];
        
        // Check if this looks like interests (common interest-related keywords)
        const interestKeywords = ['technology', 'art', 'science', 'business', 'healthcare', 'education', 'sports', 'music', 'writing', 'research', 'design', 'leadership'];
        const hasInterestKeywords = answerStrings.some(item => 
          interestKeywords.some(keyword => 
            item.toLowerCase().includes(keyword)
          )
        );
        
        // Check if this looks like skills
        const skillKeywords = ['communication', 'analytical', 'creative', 'technical', 'problem solving', 'leadership', 'teamwork', 'organization', 'critical thinking'];
        const hasSkillKeywords = answerStrings.some(item =>
          skillKeywords.some(keyword =>
            item.toLowerCase().includes(keyword)
          )
        );
        
        // Check if this looks like work preferences
        const preferenceKeywords = ['remote', 'office', 'flexible', 'team', 'independent', 'collaborative', 'structured', 'creative environment'];
        const hasPreferenceKeywords = answerStrings.some(item =>
          preferenceKeywords.some(keyword =>
            item.toLowerCase().includes(keyword)
          )
        );
        
        if (hasInterestKeywords) {
          interests.push(...answerStrings);
        } else if (hasSkillKeywords) {
          strengths.push(...answerStrings);
        } else if (hasPreferenceKeywords) {
          preferences.push(...answerStrings);
        } else {
          // Default categorization for unclear responses
          interests.push(...answerStrings.slice(0, 2));
        }
      }
      
      // Handle single choice responses
      else if (typeof answer === 'string') {
        // Categorize string responses based on content
        const lowerAnswer = answer.toLowerCase();
        
        if (lowerAnswer.includes('prefer') || lowerAnswer.includes('like') || lowerAnswer.includes('enjoy')) {
          preferences.push(answer);
        } else if (lowerAnswer.includes('skill') || lowerAnswer.includes('good at') || lowerAnswer.includes('strong')) {
          strengths.push(answer);
        } else {
          interests.push(answer);
        }
      }
      
      // Handle scale responses (convert to meaningful labels)
      else if (typeof answer === 'number') {
        if (answer >= 8) {
          interests.push('High motivation and engagement');
        } else if (answer >= 6) {
          preferences.push('Moderate interest level');
        }
      }
    });

    // Remove duplicates and limit results
    const uniqueInterests = [...new Set(interests)].slice(0, 6);
    const uniqueStrengths = [...new Set(strengths)].slice(0, 5);
    const uniquePreferences = [...new Set(preferences)].slice(0, 5);

    return {
      interests: uniqueInterests,
      strengths: uniqueStrengths,
      preferences: uniquePreferences
    };
  };

  return analyzeResponses();
};
