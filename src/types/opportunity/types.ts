
import { OpportunityStatus, OpportunityType, ApplicationStatus } from "@/types/database/enums";
import { Json } from "@/types/database/database.types";

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  opportunity_type: OpportunityType;
  provider_name: string;
  location: string | null;
  remote: boolean | null;
  compensation: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  status: OpportunityStatus;
  author_id: string | null;
  requirements: Json | null;
  benefits: Json | null;
  eligibility: Json | null;
  application_url: string | null;
  tags: string[] | null;
  categories: string[] | null;
  featured: boolean | null;
  views_count: number | null;
  applications_count: number | null;
  bookmarks_count: number | null;
  cover_image_url: string | null;
}

export interface OpportunityWithAuthor extends Opportunity {
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  };
}

export interface OpportunityApplication {
  id: string;
  opportunity_id: string;
  profile_id: string;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
  notes: string | null;
  application_data: Json | null;
}

export interface OpportunityFilters {
  type?: OpportunityType | "all";
  search?: string;
  category?: string;
  featured?: boolean;
  remote?: boolean;
  location?: string;
  deadline?: string; // ISO date string
}
