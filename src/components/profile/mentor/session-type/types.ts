import type { MeetingPlatform } from "@/types/database/enums";

export interface SessionTypeFormData {
  type: string;
  duration: number;
  price: number;
  description: string;
  meeting_platform: MeetingPlatform[];
  telegram_username?: string;
  phone_number?: string;
}