
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
