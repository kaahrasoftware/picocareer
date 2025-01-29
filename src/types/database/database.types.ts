export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      degree: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      feedback_type: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      interaction_type: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      language: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      meeting_platform: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      notification_category: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      notification_type: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      onboarding_status: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      school_type: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      setting_type: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      status: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      user_type: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      webinar_platform: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          name: string;
        };
        Update: {
          name?: string;
        };
      };
    };
    Enums: {
      categories: Categories;
      degree: Degree;
      feedback_type: FeedbackType;
      interaction_type: InteractionType;
      language: Language;
      meeting_platform: 'Google Meet';
      notification_category: NotificationCategory;
      notification_type: NotificationType;
      onboarding_status: OnboardingStatus;
      school_type: SchoolType;
      setting_type: SettingType;
      status: Status;
      user_type: UserType;
      webinar_platform: WebinarPlatform;
      'where did you hear about us': HearAboutUs;
      country: Country;
    };
  };
};

export type HearAboutUs = 
  | 'Instagram'
  | 'Facebook'
  | 'TikTok'
  | 'LinkedIn'
  | 'X (Twitter)'
  | 'WhatsApp'
  | 'YouTube'
  | 'Search Engine (Google, Bing...)'
  | 'RedNote'
  | 'Friend/Family'
  | 'Other';

export type Country = string; // Add all country names as union type if needed
