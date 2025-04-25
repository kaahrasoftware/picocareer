
export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  provider_name?: string;
  amount?: number | string;
  deadline?: string;
  compensation?: string;
  location?: string;
  image_url?: string;
  cover_image_url?: string;
  [key: string]: any;
}

export interface ProfileForEmail {
  id: string;
  email: string;
  full_name?: string;
}

export interface Campaign {
  id: string;
  subject: string;
  content_type: string;
  content_id: string;
  content_ids?: string[];
  recipient_type: string;
  recipients_count: number;
  status: 'sent' | 'sending' | 'pending' | 'partial' | 'failed';
  sent_count: number;
  sent_at?: string | null;
  failed_count: number;
  last_error?: string | null;
  scheduled_for: string;
}
