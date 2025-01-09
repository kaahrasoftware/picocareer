export type Status = 'Pending' | 'Approved' | 'Rejected';

export type NotificationType = 
  | 'session_reminder'
  | 'profile_update'
  | 'system_update'
  | 'major_update'
  | 'career_update';

export type NotificationCategory = 'general' | 'session' | 'profile' | 'system';

export type Degree = 
  | 'No Degree'
  | 'High School'
  | 'Associate'
  | 'Bachelor'
  | 'Master'
  | 'Doctorate'
  | 'MD';

export type UserType = 'mentee' | 'mentor' | 'admin' | 'editor';

export type SchoolType = 'University' | 'College' | 'Technical School';

export type Categories = 
  | 'Academic'
  | 'Career'
  | 'Professional'
  | 'Personal Development';

export type FeedbackType = 'mentor_feedback' | 'mentee_feedback';

export type InteractionType = 'click' | 'view' | 'scroll' | 'search';

export type Language = 
  | 'English'
  | 'French'
  | 'Spanish'
  | 'German'
  | 'Chinese'
  | 'Japanese'
  | 'Arabic';

export type MeetingPlatform = 
  | 'Google Meet'
  | 'Zoom'
  | 'Microsoft Teams'
  | 'Skype'
  | 'Phone'
  | 'In Person';

export type OnboardingStatus = 'Pending' | 'In Progress' | 'Completed';

export type SessionType = 
  | 'One on One'
  | 'Group Session'
  | 'Workshop'
  | 'Quick Chat';

export type SettingType = 
  | 'theme'
  | 'language'
  | 'notifications'
  | 'timezone'
  | 'privacy';