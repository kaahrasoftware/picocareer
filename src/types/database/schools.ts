export interface School {
  id: string;
  name: string;
  type: 'High School' | 'Community College' | 'University' | 'Other';
  website: string;
  status: string;
  acceptance_rate: number;
  country: string;
  state: string;
  location: string;
  created_at?: string;
  updated_at?: string;
}