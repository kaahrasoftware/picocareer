
import type { HubAnnouncement } from "@/types/database/hubs";

export type FormFields = {
  title: string;
  content: string;
  hub_id: string;
  category: "general" | "event" | "news" | "alert";
  scheduled_for: string;
  expires_at: string;
  target_audience: string[];
  cover_image_url: string;
};

export interface AnnouncementFormProps {
  hubId: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingAnnouncement?: HubAnnouncement;
}
