export type Status = 'Pending' | 'Approved' | 'Rejected';

export type NotificationType = 
  | 'session_booked'
  | 'session_cancelled'
  | 'session_reminder'
  | 'mentor_request'
  | 'system_update'
  | 'profile_update'
  | 'major_update'
  | 'career_update';

export type NotificationCategory = 'general' | 'session' | 'mentorship' | 'system';

export type Degree = 
  | 'No Degree'
  | 'High School'
  | 'Associate'
  | 'Bachelor'
  | 'Master'
  | 'Doctorate'
  | 'MD'
  | 'PhD';

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
