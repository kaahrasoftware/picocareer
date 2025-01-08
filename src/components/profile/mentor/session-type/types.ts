export interface SessionTypeFormData {
  type: string;
  duration: number;
  price: number;
  description: string;
  meeting_platform: string[];
  telegram_username?: string;
  phone_number?: string;
}