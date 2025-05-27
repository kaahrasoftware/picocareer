
export interface HubInvite {
  id: string;
  hub_id: string;
  invited_email: string;
  role: string;
  status: string;
  token: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface Hub {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
}
