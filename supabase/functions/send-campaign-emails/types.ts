
export interface EmailTemplateSettings {
  id: string;
  admin_id: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  created_at: string;
  updated_at: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  image_url?: string;
  provider_name?: string;
  deadline?: string;
  amount?: number;
  location?: string;
  remote?: boolean;
  avatar_url?: string;
  company_name?: string;
  compensation?: string;
  salary_range?: string;
  categories?: string[];
  author_name?: string;
  created_at?: string;
  start_time?: string;
  end_time?: string;
  platform?: string;
  [key: string]: any;
}

export interface Campaign {
  id: string;
  admin_id: string;
  name?: string;
  subject: string;
  content_type: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed' | 'sending' | 'pending' | 'partial' | 'planned';
  recipient_type: string;
  content_ids?: string[];
  content_id?: string;
  scheduled_for?: string;
  sent_at?: string;
  sent_count: number;
  recipients_count: number;
  failed_count: number;
  last_error?: string;
  last_checked_at?: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
  recipient_filter?: {
    profile_ids?: string[];
    filter_type?: string;
    [key: string]: any;
  };
}
