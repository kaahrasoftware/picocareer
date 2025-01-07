import { MeetingPlatform } from "@/types/calendar";
import { Control } from "react-hook-form";
import { SessionTypeEnum } from "@/types/session";

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
  onSubmit: (data: SessionTypeFormData) => Promise<void>;
  onSuccess: () => void;
  onCancel: () => void;
  profileId: string;
  existingTypes?: SessionTypeFormData[];
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