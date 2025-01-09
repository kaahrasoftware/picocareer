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

export interface FormProps {
  control: Control<SessionTypeFormData>;
}

export interface PlatformFieldsProps {
  form: FormProps;
  showTelegramField: boolean;
  showPhoneField: boolean;
  showWhatsAppField: boolean;
}

export interface PlatformSelectProps {
  form: FormProps;
}

export interface SessionTypeSelectProps {
  form: FormProps;
  availableTypes: SessionTypeEnum[];
}