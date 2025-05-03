
export type ContentType = 'blog' | 'event' | 'news' | 'update' | 'promotion';

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  blog: 'Blog Posts',
  event: 'Events',
  news: 'News',
  update: 'Platform Updates',
  promotion: 'Promotions'
};

export interface EmailCampaignFormState {
  subject: string;
  contentType: ContentType;
  contentIds: string[];
  recipientType: string;
  recipientIds: string[];
  scheduledFor: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  randomSelect: boolean;
  randomCount: number;
}

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  cover_image_url?: string;
  content?: string;
  author_name?: string;
  created_at?: string;
  [key: string]: any;
}
