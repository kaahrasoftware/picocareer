import { Database } from "@/integrations/supabase/types";

export interface SessionTypeFormData {
  type: Database["public"]["Enums"]["session_type"];
  duration: number;
  price: number;
  description: string;
  meeting_platform: Database["public"]["Enums"]["meeting_platform"][];
  telegram_username?: string;
  phone_number?: string;
}