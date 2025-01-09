export interface School {
  id: string;
  name: string;
  location: string;
  state?: string;
  country?: string;
  type?: string;
  website?: string;
  acceptance_rate?: number;
  created_at?: string;
  updated_at?: string;
  status?: string;
}