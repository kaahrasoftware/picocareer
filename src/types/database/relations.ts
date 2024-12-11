import { Json } from "./auth";

export interface RelationsTables {
  career_major_relations: {
    Row: {
      career_id: string
      major_id: string
      relevance_score: number | null
    }
    Insert: {
      career_id: string
      major_id: string
      relevance_score?: number | null
    }
    Update: {
      career_id?: string
      major_id?: string
      relevance_score?: number | null
    }
  }
  mentor_specializations: {
    Row: {
      profile_id: string
      career_id: string
      major_id: string
      years_of_experience: number | null
    }
    Insert: {
      profile_id: string
      career_id: string
      major_id: string
      years_of_experience?: number | null
    }
    Update: {
      profile_id?: string
      career_id?: string
      major_id?: string
      years_of_experience?: number | null
    }
  }
}