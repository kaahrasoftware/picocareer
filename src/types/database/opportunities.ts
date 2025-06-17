
export type OpportunityType = 
  | "job" 
  | "internship" 
  | "fellowship" 
  | "grant" 
  | "competition" 
  | "volunteer" 
  | "event" 
  | "scholarship"
  | "other";

export interface OpportunityAnalytics {
  id: string;
  opportunity_id: string;
  views_count: number | null;
  bookmarks_count: number | null;
  checked_out_count: number | null;
  applications_count?: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface OpportunityWithAuthor {
  id: string;
  title: string;
  description: string;
  opportunity_type: OpportunityType;
  application_url?: string | null;
  application_deadline?: string | null;
  location?: string | null;
  remote_eligible?: boolean;
  salary_range?: string | null;
  requirements?: string[] | null;
  benefits?: string[] | null;
  company_name?: string | null;
  contact_email?: string | null;
  status: "Pending" | "Approved" | "Rejected";
  featured: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
  cover_image_url?: string | null;
  category?: string[] | null;
  profiles: {
    id: string;
    full_name: string;
    email: string;
  };
  analytics?: OpportunityAnalytics;
}
