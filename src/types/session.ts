import { Database } from "@/types/database/database.types";

export type SessionType = Database["public"]["Tables"]["mentor_session_types"]["Row"];
export type SessionTypeEnum = Database["public"]["Enums"]["session_type"];
export type MeetingPlatform = Database["public"]["Enums"]["meeting_platform"];

export interface SessionTypeFormData {
  type: SessionTypeEnum;
  duration: number;
  price: number;
  description: string;
  meeting_platform: MeetingPlatform[];
  telegram_username?: string;
  phone_number?: string;
}
