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
      careers: {
        Row: {
          affiliated_programs: string[] | null
          average_salary: number | null
          certifications_to_consider: string[] | null
          common_courses: string[] | null
          common_difficulties: string[] | null
          created_at: string | null
          degree_levels: string[] | null
          description: string | null
          dropout_rates: number | null
          featured: boolean | null
          global_applicability: string | null
          growth_potential: string | null
          id: string
          image_url: string | null
          industry: string | null
          intensity: number | null
          job_prospects: string | null
          learning_objectives: string[] | null
          majors_to_consider_switching_to: string[] | null
          passion_for_subject: string | null
          potential_salary: number | null
          professional_associations: string[] | null
          required_education: string[] | null
          required_skills: string[] | null
          required_tools: string[] | null
          salary_range: string | null
          skill_match: string[] | null
          stress_levels: number | null
          title: string
          tools_knowledge: string[] | null
          transferable_skills: string[] | null
          tuition_and_fees: number | null
          updated_at: string | null
          work_environment: string | null
        }
        Insert: {
          affiliated_programs?: string[] | null
          average_salary?: number | null
          certifications_to_consider?: string[] | null
          common_courses?: string[] | null
          common_difficulties?: string[] | null
          created_at?: string | null
          degree_levels?: string[] | null
          description?: string | null
          dropout_rates?: number | null
          featured?: boolean | null
          global_applicability?: string | null
          growth_potential?: string | null
          id?: string
          image_url?: string | null
          industry?: string | null
          intensity?: number | null
          job_prospects?: string | null
          learning_objectives?: string[] | null
          majors_to_consider_switching_to?: string[] | null
          passion_for_subject?: string | null
          potential_salary?: number | null
          professional_associations?: string[] | null
          required_education?: string[] | null
          required_skills?: string[] | null
          required_tools?: string[] | null
          salary_range?: string | null
          skill_match?: string[] | null
          stress_levels?: number | null
          title: string
          tools_knowledge?: string[] | null
          transferable_skills?: string[] | null
          tuition_and_fees?: number | null
          updated_at?: string | null
          work_environment?: string | null
        }
        Update: {
          affiliated_programs?: string[] | null
          average_salary?: number | null
          certifications_to_consider?: string[] | null
          common_courses?: string[] | null
          common_difficulties?: string[] | null
          created_at?: string | null
          degree_levels?: string[] | null
          description?: string | null
          dropout_rates?: number | null
          featured?: boolean | null
          global_applicability?: string | null
          growth_potential?: string | null
          id?: string
          image_url?: string | null
          industry?: string | null
          intensity?: number | null
          job_prospects?: string | null
          learning_objectives?: string[] | null
          majors_to_consider_switching_to?: string[] | null
          passion_for_subject?: string | null
          potential_salary?: number | null
          professional_associations?: string[] | null
          required_education?: string[] | null
          required_skills?: string[] | null
          required_tools?: string[] | null
          salary_range?: string | null
          skill_match?: string[] | null
          stress_levels?: number | null
          title?: string
          tools_knowledge?: string[] | null
          transferable_skills?: string[] | null
          tuition_and_fees?: number | null
          updated_at?: string | null
          work_environment?: string | null
        }
        Relationships: []
      }
      mentor_availability: {
        Row: {
          created_at: string | null
          date_available: string
          end_time: string
          id: string
          is_available: boolean | null
          profile_id: string | null
          start_time: string
          timezone: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_available: string
          end_time: string
          id?: string
          is_available?: boolean | null
          profile_id?: string | null
          start_time: string
          timezone: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_available?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          profile_id?: string | null
          start_time?: string
          timezone?: string
          updated_at?: string | null
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
          created_at: string | null
          description: string | null
          duration: number
          id: string
          price: number
          profile_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          price: number
          profile_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          price?: number
          profile_id?: string | null
          type?: string
          updated_at?: string | null
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
          created_at: string | null
          id: string
          mentee_id: string | null
          mentor_id: string | null
          notes: string | null
          scheduled_at: string
          session_type_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mentee_id?: string | null
          mentor_id?: string | null
          notes?: string | null
          scheduled_at: string
          session_type_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mentee_id?: string | null
          mentor_id?: string | null
          notes?: string | null
          scheduled_at?: string
          session_type_id?: string | null
          status?: string | null
          updated_at?: string | null
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
      profiles: {
        Row: {
          academic_major_id: string | null
          avatar_url: string | null
          bio: string | null
          career_id: string | null
          company_id: string | null
          created_at: string | null
          email: string | null
          fields_of_interest: string[] | null
          first_name: string | null
          full_name: string | null
          github_url: string | null
          highest_degree: string | null
          id: string
          keywords: string[] | null
          last_name: string | null
          linkedin_url: string | null
          location: string | null
          position: string | null
          school_id: string | null
          skills: string[] | null
          tools_used: string[] | null
          top_mentor: boolean | null
          updated_at: string | null
          user_type: string | null
          website_url: string | null
          years_of_experience: number | null
        }
        Insert: {
          academic_major_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          career_id?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          fields_of_interest?: string[] | null
          first_name?: string | null
          full_name?: string | null
          github_url?: string | null
          highest_degree?: string | null
          id: string
          keywords?: string[] | null
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          position?: string | null
          school_id?: string | null
          skills?: string[] | null
          tools_used?: string[] | null
          top_mentor?: boolean | null
          updated_at?: string | null
          user_type?: string | null
          website_url?: string | null
          years_of_experience?: number | null
        }
        Update: {
          academic_major_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          career_id?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          fields_of_interest?: string[] | null
          first_name?: string | null
          full_name?: string | null
          github_url?: string | null
          highest_degree?: string | null
          id?: string
          keywords?: string[] | null
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          position?: string | null
          school_id?: string | null
          skills?: string[] | null
          tools_used?: string[] | null
          top_mentor?: boolean | null
          updated_at?: string | null
          user_type?: string | null
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
      [_ in never]: never
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
