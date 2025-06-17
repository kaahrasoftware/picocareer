import type { HubAnnouncement } from "@/types/database/hub";
import type { Editor } from "@tiptap/react";

export type FormFields = {
  title: string;
  content: string;
  hub_id: string;
  status: "Draft" | "Published" | "Archived";
  publish_date: string | null;
};

export interface AnnouncementFormProps {
  hubId: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingAnnouncement?: HubAnnouncement; // Added missing property
}
