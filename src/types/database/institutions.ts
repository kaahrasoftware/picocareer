
export interface Institution {
  id: string;
  name: string;
  type: string;
  website?: string;
  description?: string;
  banner_url?: string;
  logo_url?: string;
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  social_links?: Record<string, string>;
}

export interface InstitutionDepartment {
  id: string;
  name: string;
  description?: string;
  institution_id: string;
  parent_department_id?: string;
  created_at: string;
  updated_at: string;
}

export interface InstitutionMember {
  id: string;
  profile_id: string;
  institution_id: string;
  role: string;
  status: string;
  join_date: string;
  created_at: string;
  updated_at: string;
}

export interface InstitutionResource {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  institution_id: string;
  created_at: string;
  updated_at: string;
}

export interface InstitutionAnnouncement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  institution_id: string;
  created_at: string;
  updated_at: string;
}

export type AnnouncementCategory = 'general' | 'event' | 'academic' | 'administrative';
export type ResourceAccessLevel = 'public' | 'members' | 'staff';
