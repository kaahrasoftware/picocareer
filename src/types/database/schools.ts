export interface School {
  id: string;
  name: string;
  location: string | null;
  type: 'High School' | 'Community College' | 'University' | 'Other' | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}