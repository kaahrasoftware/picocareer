import { Json } from "./auth";

export interface MajorsTables {
  majors: {
    Row: {
      id: string
      title: string
      description: string
      image_url: string | null
      created_at: string
      updated_at: string
      featured: boolean | null
      field_of_study: string | null
      required_courses: string[] | null
      average_gpa: number | null
      degree_level: string | null
      duration: string | null
      career_opportunities: string[] | null
      keywords: string[] | null
    }
    Insert: {
      id?: string
      title: string
      description: string
      image_url?: string | null
      created_at?: string
      updated_at?: string
      featured?: boolean | null
      field_of_study?: string | null
      required_courses?: string[] | null
      average_gpa?: number | null
      degree_level?: string | null
      duration?: string | null
      career_opportunities?: string[] | null
      keywords?: string[] | null
    }
    Update: {
      id?: string
      title?: string
      description?: string
      image_url?: string | null
      created_at?: string
      updated_at?: string
      featured?: boolean | null
      field_of_study?: string | null
      required_courses?: string[] | null
      average_gpa?: number | null
      degree_level?: string | null
      duration?: string | null
      career_opportunities?: string[] | null
      keywords?: string[] | null
    }
  }
}