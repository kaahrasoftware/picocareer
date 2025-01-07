import { Database } from "@/integrations/supabase/types";
import { Control } from "react-hook-form";

export interface SessionTypeFormData {
  type: Database["public"]["Enums"]["session_type"];
  duration: number;
  price: number;
  description: string;
  meeting_platform: Database["public"]["Enums"]["meeting_platform"][];
  telegram_username?: string;
  phone_number?: string;
}

export interface SessionTypeFormProps {
  onSubmit: (data: SessionTypeFormData) => Promise<void>;
  onCancel: () => void;
  onSuccess?: () => void;
  profileId: string;
  existingTypes: Database["public"]["Tables"]["mentor_session_types"]["Row"][];
  defaultValues?: Partial<SessionTypeFormData>;
  isSubmitting?: boolean;
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