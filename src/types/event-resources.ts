
export interface EventResource {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  resource_type: 'video' | 'audio' | 'document' | 'presentation' | 'image' | 'link' | 'other';
  file_url?: string;
  external_url?: string;
  file_size?: number;
  file_format?: string;
  is_downloadable: boolean;
  access_level: 'public' | 'registered' | 'participants_only';
  sort_order: number;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  // New tracking fields
  view_count?: number;
  download_count?: number;
  last_viewed_at?: string;
  last_downloaded_at?: string;
  unique_viewers?: number;
  unique_downloaders?: number;
  // Optional event information for resources with event context
  events?: {
    id: string;
    title: string;
    start_time: string;
    organized_by?: string;
  };
}

export interface EventResourceFormData {
  title: string;
  description?: string;
  resource_type: EventResource['resource_type'];
  file_url?: string;
  external_url?: string;
  file_format?: string;
  file_size?: number;
  is_downloadable: boolean;
  access_level: EventResource['access_level'];
  sort_order: number;
}

export interface ResourceInteraction {
  id: string;
  resource_id: string;
  profile_id?: string;
  interaction_type: 'view' | 'download';
  created_at: string;
  metadata?: Record<string, any>;
}
