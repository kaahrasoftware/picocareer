
export interface PartnershipApplicationFormData {
  partner_type: 'university' | 'high_school' | 'trade_school' | 'organization' | 'individual' | 'company' | 'nonprofit';
  organization_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  contact_title?: string;
  organization_size?: string;
  website?: string;
  established_year?: number;
  focus_areas: string[];
  current_programs?: string;
  accreditation_info?: string;
  partnership_goals: string;
  collaboration_areas: string[];
  expected_outcomes?: string;
  student_population?: number;
  target_audience?: string;
  supporting_documents: Array<{
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

export interface PartnershipFormData {
  // Organization Information
  organizationName: string;
  organizationType: string;
  website: string;
  foundedYear?: number;
  employeeCount?: string;
  headquarters?: string;
  
  // Contact Information
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone?: string;
  primaryContactTitle: string;
  
  // Partnership Details
  partnershipType: string[];
  proposedCollaboration: string;
  targetOutcomes: string;
  timeline: string;
  budget?: string;
  
  // Organization Details
  currentPrograms?: string;
  previousPartnerships?: string;
  organizationMission: string;
  
  // Additional Information
  additionalComments?: string;
  attachments?: File[];
}

export interface PartnershipFormStep {
  title: string;
  description: string;
  fields: string[];
}
