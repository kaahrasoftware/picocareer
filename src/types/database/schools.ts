import type { Country } from "./enums";

export interface School {
  id: string;
  name: string;
  location: string;
  country: Country;
  type: string;
  website?: string;
  acceptance_rate?: number;
  created_at: string;
  updated_at: string;
}