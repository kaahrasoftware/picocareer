
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
  avatar_url?: string; // For mentor profiles
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
  content_type: string;
  content_id: string;
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
