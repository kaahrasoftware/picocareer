export interface School {
  id: string;
  name: string;
  state: string;
  type: string;
  website: string;
  status: string;
  acceptance_rate: number;
  country: string;
  location: string; // Added this required field
}