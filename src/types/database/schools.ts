import { Country } from './enums';

export interface School {
  id: string;
  name: string;
  state?: string;
  type?: string;
  website?: string;
  created_at: string;
  updated_at: string;
  status?: string;
  acceptance_rate?: number;
  country?: Country;
  location: string;
}