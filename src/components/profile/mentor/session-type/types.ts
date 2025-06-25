
export interface SessionTypeFormData {
  session_type: string;
  description: string;
  duration: number;
  price: number;
  meeting_platform: string;
}

export const SessionTypeEnum = {
  CAREER_GUIDANCE: 'career_guidance',
  RESUME_REVIEW: 'resume_review',
  INTERVIEW_PREP: 'interview_prep',
  SKILL_DEVELOPMENT: 'skill_development',
  NETWORKING: 'networking',
  INDUSTRY_INSIGHTS: 'industry_insights',
  PERSONAL_BRANDING: 'personal_branding',
  GOAL_SETTING: 'goal_setting',
  OTHER: 'other'
} as const;

export type SessionType = typeof SessionTypeEnum[keyof typeof SessionTypeEnum];

export interface SessionTypeFormProps {
  profileId: string;
  sessionType?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export type MeetingPlatform = 'zoom' | 'google_meet' | 'teams' | 'phone' | 'in_person' | 'other';
