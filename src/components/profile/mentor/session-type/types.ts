import { Control } from "react-hook-form";
import { SessionType, MeetingPlatform } from "@/types/session";

export interface SessionTypeFormData {
  type: SessionType;
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
}

export interface FormProps {
  control: Control<SessionTypeFormData>;
}

export interface PlatformFieldsProps {
  form: FormProps;
  showTelegramField?: boolean;
  showPhoneField?: boolean;
  showWhatsAppField?: boolean;
}

export interface PlatformSelectProps {
  form: FormProps;
}

export interface SessionTypeSelectProps {
  form: FormProps;
  availableTypes?: SessionType[];
}