
import type { QuestionResponse, ProfileType } from '@/types/assessment';

export const detectProfileType = (responses: QuestionResponse[]): ProfileType | null => {
  // Find the first question response (academic/professional status)
  const profileResponse = responses.find(r => {
    // Look for the first response which should be the profile detection question
    return typeof r.answer === 'string' && r.answer.trim().length > 0;
  });

  if (!profileResponse || typeof profileResponse.answer !== 'string') {
    return null;
  }

  const answer = profileResponse.answer.toLowerCase();

  // Map answers to profile types based on the exact options from the database
  if (answer.includes('middle school')) {
    return 'middle_school';
  } else if (answer.includes('high school')) {
    return 'high_school';
  } else if (answer.includes('college') || answer.includes('university')) {
    return 'college';
  } else if (answer.includes('working professional') || answer.includes('recent graduate')) {
    return 'career_professional';
  }

  return null;
};

export const shouldShowQuestion = (
  question: { profileType?: string[]; targetAudience?: string[]; order: number },
  detectedProfileType: ProfileType | null,
  currentQuestionIndex: number
): boolean => {
  // Always show first two questions (profile detection)
  if (question.order <= 2) {
    return question.targetAudience?.includes('all') || false;
  }

  // If no profile type detected yet, don't show profile-specific questions
  if (!detectedProfileType) {
    return false;
  }

  // Show profile-specific questions for the detected profile
  if (question.profileType && question.profileType.length > 0) {
    return question.profileType.includes(detectedProfileType);
  }

  // Show universal questions that apply to all profile types
  if (question.targetAudience?.includes('all') && question.order >= 50) {
    // Include all profiles for universal questions (fixing the original issue)
    return true;
  }

  return false;
};
