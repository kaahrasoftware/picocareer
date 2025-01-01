import { SessionTypeEnum } from "@/types/session";

export interface SessionTypeFormData {
  type: SessionTypeEnum;
  duration: number;
  description: string;
  meeting_platform: ("Google Meet" | "WhatsApp" | "Telegram" | "Phone Call")[];
  telegram_username?: string;
  phone_number?: string;
}

export interface SessionTypeFormProps {
  profileId: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingTypes: {
    id: string;
    type: string;
    duration: number;
    description: string | null;
  }[];
}