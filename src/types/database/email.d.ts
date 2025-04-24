import type { Json } from './database.types';

export interface EmailCampaign {
  id: string;
  admin_id: string;
  subject: string;
  body?: string;
  content_type: string;
  content_id: string;
  content_ids?: string[];
  recipient_type: 'all' | 'mentees' | 'mentors' | 'selected';
  recipient_filter?: {
    profile_ids?: string[];
    [key: string]: any;
  };
  scheduled_for: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  sent_at?: string | null;
  created_at: string;
  updated_at: string;
  status: 'planned' | 'pending' | 'sending' | 'processing' | 'sent' | 'partial' | 'failed';
  last_sent?: string | null;
  sent_count: number;
  failed_count: number;
  recipients_count: number;
  last_error?: string | null;
  last_checked_at?: string | null;
}

export interface EmailCampaignRecipient {
  id: string;
  campaign_id: string;
  profile_id: string;
  email_subscription_id?: string;
  created_at: string;
}

export interface EmailSubscription {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

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
