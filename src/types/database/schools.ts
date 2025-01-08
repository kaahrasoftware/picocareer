import type { Country, SchoolType, Status } from "./enums";

export interface School {
  id: string;
  name: string;
  location: string;
  country: Country;
  type: SchoolType;
  website?: string;
  acceptance_rate?: number;
  created_at: string;
  updated_at: string;
  status?: Status;
}