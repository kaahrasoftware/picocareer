import { Json } from "./auth";

export interface ProfilesTables {
  profiles: {
    Row: {
      id: string
      username: string | null
      full_name: string | null
      avatar_url: string | null
      user_type: string | null
      email: string
      created_at: string
      updated_at: string
      featured: boolean | null
      school_name: string | null
      company_name: string | null
      position: string | null
      highest_degree: string | null
      academic_major: string | null
      skills: string[] | null
      tools_used: string[] | null
      keywords: string[] | null
      bio: string | null
      linkedin_url: string | null
      github_url: string | null
      website_url: string | null
      years_of_experience: number | null
    }
    Insert: {
      id: string
      username?: string | null
      full_name?: string | null
      avatar_url?: string | null
      user_type?: string | null
      email: string
      created_at?: string
      updated_at?: string
      featured?: boolean | null
      school_name?: string | null
      company_name?: string | null
      position?: string | null
      highest_degree?: string | null
      academic_major?: string | null
      skills?: string[] | null
      tools_used?: string[] | null
      keywords?: string[] | null
      bio?: string | null
      linkedin_url?: string | null
      github_url?: string | null
      website_url?: string | null
      years_of_experience?: number | null
    }
    Update: {
      id?: string
      username?: string | null
      full_name?: string | null
      avatar_url?: string | null
      user_type?: string | null
      email?: string
      created_at?: string
      updated_at?: string
      featured?: boolean | null
      school_name?: string | null
      company_name?: string | null
      position?: string | null
      highest_degree?: string | null
      academic_major?: string | null
      skills?: string[] | null
      tools_used?: string[] | null
      keywords?: string[] | null
      bio?: string | null
      linkedin_url?: string | null
      github_url?: string | null
      website_url?: string | null
      years_of_experience?: number | null
    }
  }
}