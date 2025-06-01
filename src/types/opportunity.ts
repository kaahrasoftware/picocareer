
export type OpportunityType = 
  | "job"
  | "internship" 
  | "scholarship"
  | "fellowship"
  | "grant"
  | "competition"
  | "volunteer"
  | "event"
  | "other";

export interface OpportunityWithAuthor {
  id: string;
  title: string;
  description: string;
  type: OpportunityType;
  author_id: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}
