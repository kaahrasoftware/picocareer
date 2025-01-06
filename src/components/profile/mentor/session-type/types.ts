import { Control } from "react-hook-form";
import { SessionTypeEnum } from "@/types/session";

export interface SessionTypeFormData {
  type: SessionTypeEnum;
  duration: number;
  description?: string;
  meeting_platform: string[];
  telegram_username?: string;
  phone_number?: string;
}

export interface SessionTypeFormProps {
  profileId: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingTypes: SessionTypeEnum[];
}

export interface SessionTypeSelectProps {
  control: Control<SessionTypeFormData>;
  availableTypes: SessionTypeEnum[];
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