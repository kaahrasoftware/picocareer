
export type HubType = 'University' | 'NGO' | 'Organization' | 'High School';
export type MemberRole = 'admin' | 'moderator' | 'member' | 'faculty' | 'student';
export type ResourceAccessLevel = 'public' | 'members' | 'faculty' | 'admin';
export type AnnouncementCategory = 'event' | 'news' | 'alert' | 'general';

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
  status: 'Approved' | 'Pending' | 'Rejected';
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
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HubAnnouncement {
  id: string;
  hub_id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  scheduled_for?: string;
  expires_at?: string;
  target_audience?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HubMember {
  id: string;
  hub_id: string;
  profile_id: string;
  department_id?: string;
  role: MemberRole;
  status: 'Approved' | 'Pending' | 'Rejected';
  join_date: string;
  created_at: string;
  updated_at: string;
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
