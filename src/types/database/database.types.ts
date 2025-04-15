import {
  Categories,
  Degree,
  FeedbackType,
  InteractionType,
  Language,
  MeetingPlatform,
  NotificationType,
  OnboardingStatus,
  SchoolType,
  SessionType,
  SettingType,
  Status,
  UserType
} from './enums';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      blogs: {
        Row: {
          author_id: string
          categories: Categories[] | null
          content: string
          cover_image_url: string | null
          created_at: string
          id: string
          is_recent: boolean | null
          other_notes: string | null
          status: Status | null
          subcategories: string[] | null
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          categories?: Categories[] | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_recent?: boolean | null
          other_notes?: string | null
          status?: Status | null
          subcategories?: string[] | null
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          categories?: Categories[] | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_recent?: boolean | null
          other_notes?: string | null
          status?: Status | null
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
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string | null
          last_name: string | null
          email: string
          avatar_url: string | null
          bio: string | null
          years_of_experience: number | null
          linkedin_url: string | null
          github_url: string | null
          website_url: string | null
          skills: string[] | null
          tools_used: string[] | null
          keywords: string[] | null
          fields_of_interest: string[] | null
          highest_degree: Degree | null
          position: string | null
          company_id: string | null
          school_id: string | null
          academic_major_id: string | null
          location: string | null
          user_type: UserType | null
          X_url: string | null
          facebook_url: string | null
          instagram_url: string | null
          tiktok_url: string | null
          youtube_url: string | null
          languages: Language[] | null
          onboarding_status: OnboardingStatus | null
          top_mentor: boolean | null
          total_booked_sessions: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          email: string
          avatar_url?: string | null
          bio?: string | null
          years_of_experience?: number | null
          linkedin_url?: string | null
          github_url?: string | null
          website_url?: string | null
          skills?: string[] | null
          tools_used?: string[] | null
          keywords?: string[] | null
          fields_of_interest?: string[] | null
          highest_degree?: Degree | null
          position?: string | null
          company_id?: string | null
          school_id?: string | null
          academic_major_id?: string | null
          location?: string | null
          user_type?: UserType | null
          X_url?: string | null
          facebook_url?: string | null
          instagram_url?: string | null
          tiktok_url?: string | null
          youtube_url?: string | null
          languages?: Language[] | null
          onboarding_status?: OnboardingStatus | null
          top_mentor?: boolean | null
          total_booked_sessions?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          email?: string
          avatar_url?: string | null
          bio?: string | null
          years_of_experience?: number | null
          linkedin_url?: string | null
          github_url?: string | null
          website_url?: string | null
          skills?: string[] | null
          tools_used?: string[] | null
          keywords?: string[] | null
          fields_of_interest?: string[] | null
          highest_degree?: Degree | null
          position?: string | null
          company_id?: string | null
          school_id?: string | null
          academic_major_id?: string | null
          location?: string | null
          user_type?: UserType | null
          X_url?: string | null
          facebook_url?: string | null
          instagram_url?: string | null
          tiktok_url?: string | null
          youtube_url?: string | null
          languages?: Language[] | null
          onboarding_status?: OnboardingStatus | null
          top_mentor?: boolean | null
          total_booked_sessions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_academic_major_id_fkey"
            columns: ["academic_major_id"]
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_position_fkey"
            columns: ["position"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          }
        ]
      }
      mentor_session_types: {
        Row: {
          meeting_platform: MeetingPlatform[] | null
          custom_type_name: string | null
          phone_number: string | null
          telegram_username: string | null
          description: string | null
          token_cost: number
          updated_at: string
          created_at: string
          price: number
          duration: number
          type: SessionType
          profile_id: string
          id: string
        }
        Insert: {
          meeting_platform?: MeetingPlatform[] | null
          custom_type_name?: string | null
          phone_number?: string | null
          telegram_username?: string | null
          description?: string | null
          token_cost?: number
          updated_at?: string
          created_at?: string
          price: number
          duration: number
          type: SessionType
          profile_id: string
          id?: string
        }
        Update: {
          meeting_platform?: MeetingPlatform[] | null
          custom_type_name?: string | null
          phone_number?: string | null
          telegram_username?: string | null
          description?: string | null
          token_cost?: number
          updated_at?: string
          created_at?: string
          price?: number
          duration?: number
          type?: SessionType
          profile_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_session_types_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      opportunities: {
        Row: {
          id: string
          title: string
          description: string
          opportunity_type: OpportunityType
          provider_name: string
          location: string | null
          remote: boolean | null
          compensation: string | null
          deadline: string | null
          created_at: string
          updated_at: string
          status: OpportunityStatus
          author_id: string | null
          requirements: Json | null
          benefits: Json | null
          eligibility: Json | null
          application_url: string | null
          tags: string[] | null
          categories: string[] | null
          featured: boolean | null
          views_count: number | null
          applications_count: number | null
          bookmarks_count: number | null
          cover_image_url: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          opportunity_type: OpportunityType
          provider_name: string
          location?: string | null
          remote?: boolean | null
          compensation?: string | null
          deadline?: string | null
          created_at?: string
          updated_at?: string
          status?: OpportunityStatus
          author_id?: string | null
          requirements?: Json | null
          benefits?: Json | null
          eligibility?: Json | null
          application_url?: string | null
          tags?: string[] | null
          categories?: string[] | null
          featured?: boolean | null
          views_count?: number | null
          applications_count?: number | null
          bookmarks_count?: number | null
          cover_image_url?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          opportunity_type?: OpportunityType
          provider_name?: string
          location?: string | null
          remote?: boolean | null
          compensation?: string | null
          deadline?: string | null
          created_at?: string
          updated_at?: string
          status?: OpportunityStatus
          author_id?: string | null
          requirements?: Json | null
          benefits?: Json | null
          eligibility?: Json | null
          application_url?: string | null
          tags?: string[] | null
          categories?: string[] | null
          featured?: boolean | null
          views_count?: number | null
          applications_count?: number | null
          bookmarks_count?: number | null
          cover_image_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      
      opportunity_applications: {
        Row: {
          id: string
          opportunity_id: string
          profile_id: string
          status: ApplicationStatus
          applied_at: string
          updated_at: string
          notes: string | null
          application_data: Json | null
        }
        Insert: {
          id?: string
          opportunity_id: string
          profile_id: string
          status?: ApplicationStatus
          applied_at?: string
          updated_at?: string
          notes?: string | null
          application_data?: Json | null
        }
        Update: {
          id?: string
          opportunity_id?: string
          profile_id?: string
          status?: ApplicationStatus
          applied_at?: string
          updated_at?: string
          notes?: string | null
          application_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_applications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_insert_major: {
        Args: {
          major_data: Json
        }
        Returns: Json
      }
      clean_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      match_profiles_with_majors: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      schedule_notification: {
        Args: {
          p_notifications: Json[]
          p_scheduled_for: string
        }
        Returns: undefined
      }
      send_session_feedback_requests: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_careers_profiles_count: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      categories: Categories
      degree: Degree
      feedback_type: FeedbackType
      interaction_type: InteractionType
      language: Language
      meeting_platform: MeetingPlatform
      notification_type: NotificationType
      onboarding_status: OnboardingStatus
      school_type: SchoolType
      session_type: SessionType
      setting_type: SettingType
      status: Status
      user_type: UserType
      opportunity_type: OpportunityType
      opportunity_status: OpportunityStatus
      application_status: ApplicationStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
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
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
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
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
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
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof Database["public"]["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Database["public"]["CompositeTypes"]
    ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
