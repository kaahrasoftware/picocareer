export type HubType = 'University' | 'NGO' | 'Organization' | 'High School';
export type MemberRole = 'admin' | 'moderator' | 'member' | 'faculty' | 'student';
export type ResourceAccessLevel = 'public' | 'members' | 'faculty' | 'admin';
export type AnnouncementCategory = 'event' | 'news' | 'alert' | 'general';
export type HubMemberRole = 'admin' | 'moderator' | 'member';
export type InviteStatus = 'pending' | 'accepted' | 'rejected';
export type ResourceType = 'document' | 'image' | 'video' | 'audio' | 'external_link';
export type DocumentType = 'pdf' | 'word' | 'powerpoint' | 'excel' | 'other';

export interface ImportantLink {
  title: string;
  url: string;
}

export interface Hub {
  id: string;
  name: string;
  type: HubType;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  brand_colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  website?: string;
  apply_now_URL?: string;
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  social_links?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  important_links?: ImportantLink[];
  status: 'Approved' | 'Pending' | 'Rejected';
  created_at: string;
  updated_at: string;
}

export interface HubAnnouncement {
  id: string;
  hub_id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  created_by: string;
  scheduled_for?: string;
  expires_at?: string;
  target_audience?: string[];
  created_at: string;
  updated_at: string;
}

export interface HubResource {
  id: string;
  hub_id: string;
  title: string;
  description?: string;
  file_url: string;
  category?: string;
  access_level: ResourceAccessLevel;
  created_by: string;
  version: number;
  created_at: string;
  updated_at: string;
  resource_type: ResourceType;
  document_type?: DocumentType;
  external_url?: string;
  content_type?: string;
  original_filename?: string;
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
