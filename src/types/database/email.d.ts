
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

export interface EmailContentTypeSettings {
  id: string;
  admin_id: string;
  content_type: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  layout_settings: {
    headerStyle: 'centered' | 'banner' | 'minimal';
    showAuthor: boolean;
    showDate: boolean;
    imagePosition: 'top' | 'inline' | 'side';
    contentBlocks: string[];
    metadataDisplay: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  admin_id: string;
  name: string;
  subject: string;
  content_type: 'blog' | 'event' | 'news' | 'update' | 'promotion';
  status: 'draft' | 'scheduled' | 'sent' | 'failed' | 'sending' | 'pending' | 'partial';
  recipient_type: string;
  recipient_ids?: string[];
  content_ids?: string[];
  scheduled_for?: string;
  sent_at?: string;
  sent_count: number;
  recipients_count: number;
  failed_count: number;
  last_error?: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
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
  [key: string]: any;
}
