
export interface ImportantLink {
  title: string;
  url: string;
}

export interface Hub {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  logo_url?: string;
  banner_url?: string;
  website?: string;
  contact_info: Record<string, any>;
  social_links: Record<string, string>;
  important_links: ImportantLink[];
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  created_at: string;
  updated_at: string;
  apply_now_url?: string;
}

export type AuditAction = 
  | "member_added"
  | "member_removed"
  | "member_role_changed"
  | "hub_settings_updated"
  | "announcement_created"
  | "announcement_updated"
  | "announcement_deleted"
  | "resource_added"
  | "resource_updated"
  | "resource_deleted"
  | "department_created"
  | "department_updated"
  | "department_deleted"
  | "member_invitation_sent"
  | "member_invitation_cancelled"
  | "branding_updated";

export type MemberRole = "admin" | "moderator" | "member" | "faculty" | "student";
