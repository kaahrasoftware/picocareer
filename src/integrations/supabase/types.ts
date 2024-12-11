export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blogs: {
        Row: {
          author_id: string
          categories: string[] | null
          content: string
          cover_image_url: string | null
          created_at: string
          id: string
          image_url: string | null
          is_recent: boolean | null
          subcategories: string[] | null
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          categories?: string[] | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_recent?: boolean | null
          subcategories?: string[] | null
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          categories?: string[] | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_recent?: boolean | null
          subcategories?: string[] | null
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blogs_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
        Relationships: [
          {
            foreignKeyName: "career_major_relations_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_major_relations_major_id_fkey"
            columns: ["major_id"]
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["id"]
          },
        ]
      }
      careers: {
        Row: {
          average_salary: number | null
          created_at: string
          description: string
          featured: boolean | null
          growth_potential: string | null
          id: string
          image_url: string | null
          industry: string | null
          job_outlook: string | null
          keywords: string[] | null
          required_education: string[] | null
          required_skills: string[] | null
          required_tools: string[] | null
          salary_range: string | null
          title: string
          updated_at: string
          work_environment: string | null
        }
        Insert: {
          average_salary?: number | null
          created_at?: string
          description: string
          featured?: boolean | null
          growth_potential?: string | null
          id?: string
          image_url?: string | null
          industry?: string | null
          job_outlook?: string | null
          keywords?: string[] | null
          required_education?: string[] | null
          required_skills?: string[] | null
          required_tools?: string[] | null
          salary_range?: string | null
          title: string
          updated_at?: string
          work_environment?: string | null
        }
        Update: {
          average_salary?: number | null
          created_at?: string
          description?: string
          featured?: boolean | null
          growth_potential?: string | null
          id?: string
          image_url?: string | null
          industry?: string | null
          job_outlook?: string | null
          keywords?: string[] | null
          required_education?: string[] | null
          required_skills?: string[] | null
          required_tools?: string[] | null
          salary_range?: string | null
          title?: string
          updated_at?: string
          work_environment?: string | null
        }
        Relationships: []
      }
      majors: {
        Row: {
          average_gpa: number | null
          career_opportunities: string[] | null
          created_at: string
          degree_level: string | null
          description: string
          duration: string | null
          featured: boolean | null
          field_of_study: string | null
          id: string
          image_url: string | null
          keywords: string[] | null
          required_courses: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          average_gpa?: number | null
          career_opportunities?: string[] | null
          created_at?: string
          degree_level?: string | null
          description: string
          duration?: string | null
          featured?: boolean | null
          field_of_study?: string | null
          id?: string
          image_url?: string | null
          keywords?: string[] | null
          required_courses?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          average_gpa?: number | null
          career_opportunities?: string[] | null
          created_at?: string
          degree_level?: string | null
          description?: string
          duration?: string | null
          featured?: boolean | null
          field_of_study?: string | null
          id?: string
          image_url?: string | null
          keywords?: string[] | null
          required_courses?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mentor_availability: {
        Row: {
          created_at: string
          date_available: string
          end_time: string
          id: string
          is_available: boolean | null
          profile_id: string
          start_time: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_available: string
          end_time: string
          id?: string
          is_available?: boolean | null
          profile_id: string
          start_time: string
          timezone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_available?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          profile_id?: string
          start_time?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_availability_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_session_types: {
        Row: {
          created_at: string
          description: string | null
          duration: number
          id: string
          price: number
          profile_id: string
          type: Database["public"]["Enums"]["session_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration: number
          id?: string
          price: number
          profile_id: string
          type: Database["public"]["Enums"]["session_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          price?: number
          profile_id?: string
          type?: Database["public"]["Enums"]["session_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_session_types_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_sessions: {
        Row: {
          created_at: string
          id: string
          mentee_id: string
          mentor_id: string
          notes: string | null
          scheduled_at: string
          session_type_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentee_id: string
          mentor_id: string
          notes?: string | null
          scheduled_at: string
          session_type_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mentee_id?: string
          mentor_id?: string
          notes?: string | null
          scheduled_at?: string
          session_type_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_sessions_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_sessions_session_type_id_fkey"
            columns: ["session_type_id"]
            isOneToOne: false
            referencedRelation: "mentor_session_types"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_specializations: {
        Row: {
          career_id: string
          major_id: string
          profile_id: string
          years_of_experience: number | null
        }
        Insert: {
          career_id: string
          major_id: string
          profile_id: string
          years_of_experience?: number | null
        }
        Update: {
          career_id?: string
          major_id?: string
          profile_id?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_specializations_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_specializations_major_id_fkey"
            columns: ["major_id"]
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_specializations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          academic_major: string | null
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string
          email: string
          featured: boolean | null
          fields_of_interest: string[] | null
          full_name: string | null
          github_url: string | null
          highest_degree: string | null
          id: string
          keywords: string[] | null
          linkedin_url: string | null
          location: string | null
          position: string | null
          school_name: string | null
          skills: string[] | null
          tools_used: string[] | null
          updated_at: string
          user_type: string | null
          username: string | null
          website_url: string | null
          years_of_experience: number | null
        }
        Insert: {
          academic_major?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          featured?: boolean | null
          fields_of_interest?: string[] | null
          full_name?: string | null
          github_url?: string | null
          highest_degree?: string | null
          id: string
          keywords?: string[] | null
          linkedin_url?: string | null
          location?: string | null
          position?: string | null
          school_name?: string | null
          skills?: string[] | null
          tools_used?: string[] | null
          updated_at?: string
          user_type?: string | null
          username?: string | null
          website_url?: string | null
          years_of_experience?: number | null
        }
        Update: {
          academic_major?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          featured?: boolean | null
          fields_of_interest?: string[] | null
          full_name?: string | null
          github_url?: string | null
          highest_degree?: string | null
          id?: string
          keywords?: string[] | null
          linkedin_url?: string | null
          location?: string | null
          position?: string | null
          school_name?: string | null
          skills?: string[] | null
          tools_used?: string[] | null
          updated_at?: string
          user_type?: string | null
          username?: string | null
          website_url?: string | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      session_type: "intro" | "quick-advice" | "walkthrough"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
