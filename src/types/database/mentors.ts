
export interface MentorSessionType {
  id?: string;
  profile_id: string;
  type: string;
  duration: number;
  price: number;
  description: string;
  meeting_platform: ('WhatsApp' | 'Google Meet' | 'Telegram' | 'Phone Call' | 'Zoom')[];
  created_at?: string;
  updated_at?: string;
  timezone_offset?: number;
}
