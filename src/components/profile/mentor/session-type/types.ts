import { Control } from "react-hook-form";
import { MeetingPlatform } from "@/types/database/enums";
import { SessionType } from "@/types/session";

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
  control: Control<SessionTypeFormData>;
  profileId: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingTypes: SessionTypeFormData[];
}