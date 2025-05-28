
export type PartnershipType = 
  | 'university'
  | 'high_school'
  | 'trade_school'
  | 'organization'
  | 'individual'
  | 'company'
  | 'nonprofit';

export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'requires_changes';

export interface PartnershipApplication {
  id: string;
  application_number: string;
  partner_type: PartnershipType;
  organization_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  contact_title?: string;
  organization_size?: string;
  location?: {
    country?: string;
    state?: string;
    city?: string;
    address?: string;
  };
  website?: string;
  established_year?: number;
  focus_areas?: string[];
  current_programs?: string;
  accreditation_info?: string;
  partnership_goals: string;
  collaboration_areas?: string[];
  expected_outcomes?: string;
  student_population?: number;
  target_audience?: string;
  supporting_documents?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  status: ApplicationStatus;
  current_step: number;
  form_data?: Record<string, any>;
  terms_accepted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartnershipBenefit {
  id: string;
  partner_type: PartnershipType;
  benefit_category: string;
  benefit_title: string;
  benefit_description: string;
  is_featured: boolean;
  sort_order: number;
}

export interface Partnership {
  id: string;
  partner_name: string;
  partner_type: PartnershipType;
  contact_email: string;
  contact_name: string;
  website?: string;
  description?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'active' | 'inactive';
  benefits?: any[];
  metrics?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
