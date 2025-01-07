import { MeetingPlatform, SessionTypeEnum } from "@/types/calendar";
import { Control } from "react-hook-form";

export interface SessionTypeFormData {
  type: SessionTypeEnum;
  duration: number;
  price: number;
  description: string;
  meeting_platform: MeetingPlatform[];
  telegram_username?: string;
  phone_number?: string;
}

export interface PlatformSelectProps {
  control: Control<SessionTypeFormData>;
}

export interface PlatformFieldsProps {
  control: Control<SessionTypeFormData>;
  showTelegramField: boolean;
  showPhoneField: boolean;
  showWhatsAppField: boolean;
}