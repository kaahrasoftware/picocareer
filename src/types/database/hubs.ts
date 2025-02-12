
export type HubType = 'University' | 'NGO' | 'Organization' | 'High School';
export type MemberRole = 'admin' | 'moderator' | 'member' | 'faculty' | 'student';
export type ResourceAccessLevel = 'public' | 'members' | 'faculty' | 'admin';
export type AnnouncementCategory = 'event' | 'news' | 'alert' | 'general';
export type HubMemberRole = 'admin' | 'moderator' | 'member';
export type InviteStatus = 'pending' | 'accepted' | 'rejected';

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
