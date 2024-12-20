export interface CareerMajorRelation {
  career_id: string;
  major_id: string;
  relevance_score: number | null;
}

export interface MentorSpecialization {
  profile_id: string;
  career_id: string;
  major_id: string;
  years_of_experience: number | null;
}