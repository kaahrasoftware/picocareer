
// Define the types that are referenced but missing
export type OpportunityType = 'job' | 'internship' | 'fellowship' | 'scholarship' | 'event' | 'grant' | 'competition' | 'volunteer' | 'other';
export type OpportunityStatus = 'active' | 'inactive' | 'draft' | 'expired';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

// Opportunity interface
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  company_name?: string;
  location?: string;
  salary_range?: string;
  application_deadline?: string;
  requirements?: string[];
  benefits?: string[];
  application_url?: string;
  contact_email?: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  status: OpportunityStatus;
  type: OpportunityType;
  is_featured?: boolean;
  views_count?: number;
  applications_count?: number;
}

// Opportunity Insert type
export interface OpportunityInsert {
  title: string;
  description: string;
  company_name?: string;
  location?: string;
  salary_range?: string;
  application_deadline?: string;
  requirements?: string[];
  benefits?: string[];
  application_url?: string;
  contact_email?: string;
  author_id: string;
  status?: OpportunityStatus;
  type: OpportunityType;
  is_featured?: boolean;
}

// Opportunity Update type
export interface OpportunityUpdate {
  title?: string;
  description?: string;
  company_name?: string;
  location?: string;
  salary_range?: string;
  application_deadline?: string;
  requirements?: string[];
  benefits?: string[];
  application_url?: string;
  contact_email?: string;
  status?: OpportunityStatus;
  type?: OpportunityType;
  is_featured?: boolean;
}

// Application interface
export interface OpportunityApplication {
  id: string;
  opportunity_id: string;
  applicant_id: string;
  cover_letter?: string;
  resume_url?: string;
  additional_documents?: string[];
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

// Application Insert type
export interface OpportunityApplicationInsert {
  opportunity_id: string;
  applicant_id: string;
  cover_letter?: string;
  resume_url?: string;
  additional_documents?: string[];
  status?: ApplicationStatus;
}

// Application Update type
export interface OpportunityApplicationUpdate {
  cover_letter?: string;
  resume_url?: string;
  additional_documents?: string[];
  status?: ApplicationStatus;
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      opportunities: {
        Row: Opportunity;
        Insert: OpportunityInsert;
        Update: OpportunityUpdate;
      };
      opportunity_applications: {
        Row: OpportunityApplication;
        Insert: OpportunityApplicationInsert;
        Update: OpportunityApplicationUpdate;
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      opportunity_type: OpportunityType;
      opportunity_status: OpportunityStatus;
      application_status: ApplicationStatus;
    };
  };
}
