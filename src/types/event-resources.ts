
export interface EventResource {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  resource_type: "link" | "other" | "document" | "image" | "video" | "audio" | "presentation";
  file_url?: string;
  external_url?: string;
  file_format?: string;
  file_size?: number;
  access_level: "public" | "registered" | "participants_only";
  is_downloadable: boolean;
  sort_order?: number; // Make this optional to match the database
  view_count: number;
  download_count: number;
  unique_viewers: number;
  unique_downloaders: number;
  last_viewed_at?: string;
  last_downloaded_at?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EventResourceFormData {
  title: string;
  description?: string;
  resource_type: "link" | "other" | "document" | "image" | "video" | "audio" | "presentation";
  file_url?: string;
  external_url?: string;
  file_format?: string;
  file_size?: number;
  access_level: "public" | "registered" | "participants_only";
  is_downloadable: boolean;
  sort_order?: number;
}
