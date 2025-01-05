import { SessionTypeEnum, MeetingPlatform } from "@/types/session";
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

export interface PlatformFieldsProps {
  form: {
    control: Control<SessionTypeFormData>;
  };
  showTelegramField: boolean;
  showPhoneField: boolean;
  showWhatsAppField: boolean;
}

export interface PlatformSelectProps {
  form: {
    control: Control<SessionTypeFormData>;
  };
}

export interface SessionTypeSelectProps {
  form: {
    control: Control<SessionTypeFormData>;
  };
  availableTypes: SessionTypeEnum[];
}