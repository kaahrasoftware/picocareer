
export interface Partnership {
  id: string;
  entity_type: 'organization' | 'high_school' | 'university' | 'trade_school' | 'individual' | 'other';
  entity_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  website?: string;
  description: string;
  partnership_goals: string;
  student_count?: number;
  geographic_location?: string;
  preferred_partnership_type?: string[];
  additional_info?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PartnershipFormData {
  entity_type: Partnership['entity_type'];
  entity_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  description: string;
  partnership_goals: string;
  student_count: string;
  geographic_location: string;
  preferred_partnership_type: string[];
  additional_info: string;
}

export const ENTITY_TYPES = [
  { value: 'organization', label: 'Organization' },
  { value: 'high_school', label: 'High School' },
  { value: 'university', label: 'University' },
  { value: 'trade_school', label: 'Trade School' },
  { value: 'individual', label: 'Individual' },
  { value: 'other', label: 'Other' }
] as const;

export const PARTNERSHIP_TYPES = [
  'Student Placement Programs',
  'Career Mentorship',
  'Educational Content Creation',
  'Workshop & Event Hosting',
  'Curriculum Development',
  'Research Collaboration',
  'Internship Programs',
  'Scholarship Opportunities',
  'Technology Integration',
  'Other'
];
