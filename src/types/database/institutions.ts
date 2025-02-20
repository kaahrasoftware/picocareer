
export interface Institution {
  id: string;
  name: string;
  type: 'University' | 'High School' | 'Community College' | 'Other';
  location: string;
  country: string;
  state?: string;
  website?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  acceptance_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface InstitutionDepartment {
  id: string;
  institution_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface InstitutionMember {
  id: string;
  institution_id: string;
  profile_id: string;
  role: 'admin' | 'faculty' | 'student' | 'staff';
  department_id?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  updated_at: string;
}
