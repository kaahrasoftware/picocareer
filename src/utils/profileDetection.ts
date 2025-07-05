
import type { QuestionResponse, ProfileType } from '@/types/assessment';

export const detectProfileType = (responses: QuestionResponse[]): ProfileType | null => {
  // Find the profile type detection question response
  const profileResponse = responses.find(r => 
    // This should match the first question about academic/professional status
    r.questionId && typeof r.answer === 'string'
  );

  if (!profileResponse || typeof profileResponse.answer !== 'string') {
    return null;
  }

  const answer = profileResponse.answer.toLowerCase();

  // Map answers to profile types
  if (answer.includes('middle school')) {
    return 'middle_school';
  } else if (answer.includes('high school')) {
    return 'high_school';
  } else if (answer.includes('college') || answer.includes('university')) {
    return 'college';
  } else if (answer.includes('professional') || answer.includes('working')) {
    return 'career_professional';
  } else if (answer.includes('recent graduate')) {
    return 'career_professional'; // Recent graduates looking for career guidance
  }

  return null;
};

export const getQuestionOrderRange = (profileType: ProfileType | null): { start: number; end: number } => {
  switch (profileType) {
    case 'middle_school':
      return { start: 1, end: 19 }; // Profile detection + middle school questions + universal
    case 'high_school':
      return { start: 1, end: 29 }; // Profile detection + high school questions + universal
    case 'college':
      return { start: 1, end: 39 }; // Profile detection + college questions + universal
    case 'career_professional':
      return { start: 1, end: 52 }; // Profile detection + career professional questions + universal
    default:
      return { start: 1, end: 10 }; // Just profile detection questions
  }
};

export const shouldShowQuestion = (
  question: { profileType?: string[]; targetAudience?: string[]; order: number },
  detectedProfileType: ProfileType | null,
  currentQuestionIndex: number
): boolean => {
  // Always show the first few profile detection questions
  if (question.order <= 2) {
    return true;
  }

  // If no profile type detected yet, don't show profile-specific questions
  if (!detectedProfileType) {
    return question.targetAudience?.includes('all') || false;
  }

  // Check if question is applicable to the detected profile type
  if (question.profileType && question.profileType.length > 0) {
    return question.profileType.includes(detectedProfileType);
  }

  // Universal questions
  if (question.targetAudience?.includes('all')) {
    return true;
  }

  return false;
};
