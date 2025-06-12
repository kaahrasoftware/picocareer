
import { AnnouncementCategory, HubAnnouncement } from "@/types/database/hubs";

export interface AnnouncementFormProps {
  hubId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface FormFields {
  title: string;
  content: string;
  category: AnnouncementCategory;
  scheduled_for?: string;
  expires_at?: string;
  target_audience?: string[];
  cover_image_url?: string;
}
