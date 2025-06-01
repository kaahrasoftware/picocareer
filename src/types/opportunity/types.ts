
import { OpportunityType } from "@/types/database/enums";

export interface OpportunityWithAuthor {
  id: string;
  title: string;
  description: string;
  opportunity_type: OpportunityType;
  provider_name: string;
  location?: string;
  remote?: boolean;
  deadline?: string;
  compensation?: string;
  categories?: string[];
  featured?: boolean;
  created_at: string;
  application_url?: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}
