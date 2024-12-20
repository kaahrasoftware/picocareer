export interface CareerMajorRelation {
  id: string;
  career_id: string;
  major_id: string;
  relevance_score: number | null;
  created_at: string | null;
  updated_at: string | null;
}