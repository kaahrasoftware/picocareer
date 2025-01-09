import type { MeetingPlatform, SessionType } from "@/types/calendar";
import type { Control } from "react-hook-form";

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
  onSubmit: (data: SessionTypeFormData) => void;
  defaultValues?: Partial<SessionTypeFormData>;
  control: Control<SessionTypeFormData>;
}