
export type SchoolType = 'High School' | 'Community College' | 'University' | 'Other';
export type SchoolStatus = 'Pending' | 'Approved' | 'Rejected';

export interface School {
  id: string;
  name: string;
  type: SchoolType;
  location?: string;
  country: string;
  state?: string;
  website?: string;
  status: SchoolStatus;
  acceptance_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface SchoolCreateInput {
  name: string;
  type: SchoolType;
  location?: string;
  country: string;
  state?: string;
  website?: string;
  acceptance_rate?: number;
}

export interface SchoolUpdateInput extends Partial<SchoolCreateInput> {
  status?: SchoolStatus;
}
