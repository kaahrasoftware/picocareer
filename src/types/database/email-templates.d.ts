
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

export interface Campaign {
  id: string;
  admin_id: string;
  name: string;
  subject: string;
  content_type: 'blog' | 'event' | 'news' | 'update' | 'promotion';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipient_type: string;
  recipient_ids?: string[];
  content_ids?: string[];
  scheduled_date?: string;
  sent_date?: string;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
}
