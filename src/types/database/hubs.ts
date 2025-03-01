
export type HubType = 'Educational' | 'Professional' | 'Community' | 'Interest' | 'School' | 'Corporate';

export type MemberRole = 'admin' | 'moderator' | 'member' | 'faculty' | 'student';

export type ResourceType = 'document' | 'image' | 'video' | 'link' | 'event';
export type DocumentType = 'pdf' | 'word' | 'powerpoint' | 'excel' | 'other';
export type ResourceAccessLevel = 'public' | 'members' | 'faculty' | 'admin';

export type AnnouncementCategory = 'general' | 'event' | 'update' | 'resource' | 'job' | 'academic';

export interface HubMember {
  id: string;
  hub_id: string;
  profile_id: string;
  role: MemberRole;
  status: 'Pending' | 'Approved' | 'Rejected';
  confirmed: boolean;
  join_date: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string;
  };
}

export interface ImportantLink {
  title: string;
  url: string;
}

export interface Hub {
  id: string;
  name: string;
  description?: string;
  type: HubType;
  logo_url?: string;
  banner_url?: string;
  website?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  storage_limit_bytes: number;
  member_limit: number;
  current_storage_usage: number;
  current_member_count: number;
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  brand_colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  social_links?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  important_links?: ImportantLink[];
  created_at: string;
  updated_at: string;
  apply_now_url?: string;
}

export interface HubAnnouncement {
  id: string;
  hub_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  category: AnnouncementCategory;
  expires_at?: string;
  scheduled_for?: string;
  target_audience?: string[];
  cover_image_url?: string;
}

export interface HubResource {
  id: string;
  hub_id: string;
  title: string;
  description?: string;
  file_url: string;
  external_url?: string;
  resource_type: ResourceType;
  document_type?: DocumentType;
  access_level: ResourceAccessLevel;
  created_at: string;
  updated_at: string;
  created_by: string;
  category?: string;
  content_type?: string;
  original_filename?: string;
  version?: number;
}

export interface HubDepartment {
  id: string;
  hub_id: string;
  name: string;
  description?: string;
  parent_department_id?: string;
  created_at: string;
  updated_at: string;
}
