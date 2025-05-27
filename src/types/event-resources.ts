
export interface EventResource {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  resource_type: 'video' | 'audio' | 'document' | 'presentation' | 'image' | 'link';
  access_level: 'public' | 'registered_users' | 'participants_only';
  external_url?: string;
  file_url?: string;
  file_size?: number;
  file_format?: string;
  is_downloadable: boolean;
  sort_order?: number;
  uploaded_by?: string;
  view_count?: number;
  download_count?: number;
  unique_viewers?: number;
  unique_downloaders?: number;
  last_viewed_at?: string;
  last_downloaded_at?: string;
  created_at: string;
  updated_at: string;
}
