
export type HubType = 'University' | 'NGO' | 'Organization' | 'High School';
export type HubMemberRole = 'admin' | 'moderator' | 'member' | 'faculty' | 'student';
export type InviteStatus = 'pending' | 'accepted' | 'rejected';

export interface Hub {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
}

export interface HubInvite {
  id: string;
  hub_id: string;
  invited_email: string;
  token: string;
  role: HubMemberRole;
  status: InviteStatus;
  expires_at: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string | null;
  rejected_at?: string | null;
}
