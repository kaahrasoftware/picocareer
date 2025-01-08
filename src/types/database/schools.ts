import { Status, SchoolType, States, Country } from "./enums";

export interface School {
  id: string;
  name: string;
  state?: States;
  type?: SchoolType;
  website?: string;
  created_at: string;
  updated_at: string;
  status?: Status;
  acceptance_rate?: number;
  country?: Country;
  location?: string;
}