
import type { PartnershipType } from '@/types/partnership';

export interface PartnershipApplicationFormData {
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
  terms_accepted: boolean;
}

export interface StepProps {
  form: any;
  data: PartnershipApplicationFormData;
}
