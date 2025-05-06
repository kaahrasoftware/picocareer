
export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  image_url?: string; // For backward compatibility with some content types
  position?: string;
  career_title?: string;
  company_name?: string;
  provider_name?: string;
  deadline?: string;
  amount?: number;
  compensation?: string;
  location?: string;
  remote?: boolean;
  skills?: string[];
  author_name?: string;
  created_at?: string;
  avatar_url?: string; // For mentor profiles
  categories?: string[];
  salary_range?: string;
  [key: string]: any; // Allow other properties
}

export interface ProfileForEmail {
  id: string;
  email: string;
  full_name?: string;
}

export interface Campaign {
  id: string;
  admin_id: string;
  subject?: string;
  body?: string;
  content_type: string; // Using string type to accommodate all content types
  content_id?: string;
  content_ids?: string[];
  recipient_type: string;
  recipient_filter?: {
    profile_ids?: string[];
    [key: string]: any;
  };
  scheduled_for?: string;
  last_sent?: string;
  frequency: string;
  status: "planned" | "pending" | "sending" | "sent" | "failed" | "partial";
  sent_count: number;
  failed_count: number;
  recipients_count: number;
  sent_at?: string;
  created_at: string;
  updated_at: string;
  last_error?: string;
  last_checked_at?: string;
}

export interface EmailTemplateSettings {
  id: string;
  admin_id: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  content_type?: string;
  layout_settings?: {
    headerStyle: 'centered' | 'banner' | 'minimal';
    showAuthor: boolean;
    showDate: boolean;
    imagePosition: 'top' | 'inline' | 'side';
    contentBlocks: string[];
    metadataDisplay: string[];
  };
  content?: {
    header_text?: string;
    intro_text?: string;
    cta_text?: string;
    footer_text?: string;
  };
  created_at: string;
  updated_at: string;
}
