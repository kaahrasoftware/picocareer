
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
