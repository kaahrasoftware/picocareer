export interface School {
  id: string;
  name: string;
  location?: string | null;  // Added location as optional
  type: 'High School' | 'Community College' | 'University' | 'Other' | null;
  website: string | null;
  created_at: string;
  updated_at: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  acceptance_rate?: number | null;
  state?: string;
  country?: string;
}