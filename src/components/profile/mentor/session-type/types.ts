import { SessionTypeEnum } from "@/types/session";
import { MeetingPlatform } from "@/types/calendar";

export interface SessionTypeFormData {
  type: SessionTypeEnum;
  duration: number;
  price: number;
  description: string;
  meeting_platform: MeetingPlatform[];
  telegram_username?: string;
  phone_number?: string;
}

export interface SessionTypeFormProps {
  profileId: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingTypes: {
    id: string;
    type: SessionTypeEnum;
    duration: number;
    price: number;
    description: string | null;
    meeting_platform: MeetingPlatform[];
  }[];
}