
export interface SessionTypeFormData {
  type: string;
  description: string;
  duration: number;
  price: number;
  meeting_platform: string[];
  telegram_username?: string;
  phone_number?: string;
  custom_type_name?: string;
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
  CUSTOM: 'Custom',
  OTHER: 'other'
} as const;

export type SessionType = typeof SessionTypeEnum[keyof typeof SessionTypeEnum];

export interface SessionTypeFormProps {
  profileId: string;
  sessionType?: any;
  onSuccess: () => void;
  onCancel: () => void;
  existingTypes?: any[];
}

export type MeetingPlatform = 'Google Meet' | 'WhatsApp' | 'Telegram' | 'Phone Call';
