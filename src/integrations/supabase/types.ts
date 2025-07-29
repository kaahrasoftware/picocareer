export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_assessment_sessions: {
        Row: {
          api_user_id: string
          assessment_id: string | null
          callback_url: string | null
          client_metadata: Json | null
          completed_at: string | null
          created_at: string | null
          current_question_index: number | null
          expires_at: string
          id: string
          is_active: boolean | null
          last_activity_at: string | null
          organization_id: string
          progress_data: Json | null
          return_url: string | null
          session_token: string
          started_at: string | null
          template_id: string | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          api_user_id: string
          assessment_id?: string | null
          callback_url?: string | null
          client_metadata?: Json | null
          completed_at?: string | null
          created_at?: string | null
          current_question_index?: number | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          organization_id: string
          progress_data?: Json | null
          return_url?: string | null
          session_token: string
          started_at?: string | null
          template_id?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_user_id?: string
          assessment_id?: string | null
          callback_url?: string | null
          client_metadata?: Json | null
          completed_at?: string | null
          created_at?: string | null
          current_question_index?: number | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          organization_id?: string
          progress_data?: Json | null
          return_url?: string | null
          session_token?: string
          started_at?: string | null
          template_id?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_assessment_sessions_api_user_id_fkey"
            columns: ["api_user_id"]
            isOneToOne: false
            referencedRelation: "api_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_assessment_sessions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "career_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_assessment_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "api_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_assessment_sessions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "api_assessment_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      api_assessment_templates: {
        Row: {
          branding: Json | null
          config: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          estimated_duration_minutes: number | null
          id: string
          is_active: boolean
          is_default: boolean
          languages: string[] | null
          max_retries: number | null
          name: string
          organization_id: string
          question_sets: Json | null
          scoring_logic: Json | null
          session_timeout_minutes: number | null
          target_audience: string[] | null
          updated_at: string | null
          version: number
        }
        Insert: {
          branding?: Json | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          languages?: string[] | null
          max_retries?: number | null
          name: string
          organization_id: string
          question_sets?: Json | null
          scoring_logic?: Json | null
          session_timeout_minutes?: number | null
          target_audience?: string[] | null
          updated_at?: string | null
          version?: number
        }
        Update: {
          branding?: Json | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          languages?: string[] | null
          max_retries?: number | null
          name?: string
          organization_id?: string
          question_sets?: Json | null
          scoring_logic?: Json | null
          session_timeout_minutes?: number | null
          target_audience?: string[] | null
          updated_at?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "api_assessment_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "api_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_billing_events: {
        Row: {
          created_at: string | null
          currency: string | null
          event_type: string
          id: string
          metadata: Json | null
          organization_id: string
          processed: boolean | null
          quantity: number | null
          reference_id: string | null
          total_amount: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          organization_id: string
          processed?: boolean | null
          quantity?: number | null
          reference_id?: string | null
          total_amount?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          processed?: boolean | null
          quantity?: number | null
          reference_id?: string | null
          total_amount?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_billing_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "api_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          created_by: string | null
          environment: Database["public"]["Enums"]["api_environment"]
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_name: string
          key_prefix: string
          last_used_at: string | null
          organization_id: string
          permissions: Json | null
          rate_limit_per_day: number | null
          rate_limit_per_minute: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          environment?: Database["public"]["Enums"]["api_environment"]
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_name: string
          key_prefix: string
          last_used_at?: string | null
          organization_id: string
          permissions?: Json | null
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          environment?: Database["public"]["Enums"]["api_environment"]
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_name?: string
          key_prefix?: string
          last_used_at?: string | null
          organization_id?: string
          permissions?: Json | null
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "api_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_organizations: {
        Row: {
          billing_address: Json | null
          contact_email: string
          contact_name: string | null
          created_at: string | null
          domain: string | null
          hub_id: string | null
          id: string
          name: string
          phone: string | null
          settings: Json | null
          status: Database["public"]["Enums"]["status"]
          subscription_tier: Database["public"]["Enums"]["api_subscription_tier"]
          updated_at: string | null
        }
        Insert: {
          billing_address?: Json | null
          contact_email: string
          contact_name?: string | null
          created_at?: string | null
          domain?: string | null
          hub_id?: string | null
          id?: string
          name: string
          phone?: string | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["status"]
          subscription_tier?: Database["public"]["Enums"]["api_subscription_tier"]
          updated_at?: string | null
        }
        Update: {
          billing_address?: Json | null
          contact_email?: string
          contact_name?: string | null
          created_at?: string | null
          domain?: string | null
          hub_id?: string | null
          id?: string
          name?: string
          phone?: string | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["status"]
          subscription_tier?: Database["public"]["Enums"]["api_subscription_tier"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_organizations_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      api_quotas: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          limit_value: number
          organization_id: string
          period_type: string
          quota_type: string
          reset_day: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          limit_value: number
          organization_id: string
          period_type: string
          quota_type: string
          reset_day?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          limit_value?: number
          organization_id?: string
          period_type?: string
          quota_type?: string
          reset_day?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_quotas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "api_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_rate_limits: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          id: string
          last_request_at: string | null
          organization_id: string
          request_count: number | null
          window_duration_minutes: number
          window_start: string
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          id?: string
          last_request_at?: string | null
          organization_id: string
          request_count?: number | null
          window_duration_minutes: number
          window_start: string
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          id?: string
          last_request_at?: string | null
          organization_id?: string
          request_count?: number | null
          window_duration_minutes?: number
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_rate_limits_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_rate_limits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "api_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage_aggregates: {
        Row: {
          avg_response_time_ms: number | null
          created_at: string | null
          date_period: string
          failed_requests: number | null
          id: string
          organization_id: string
          period_type: string
          successful_requests: number | null
          total_assessments: number | null
          total_data_transfer_bytes: number | null
          total_requests: number | null
          unique_endpoints: number | null
          updated_at: string | null
        }
        Insert: {
          avg_response_time_ms?: number | null
          created_at?: string | null
          date_period: string
          failed_requests?: number | null
          id?: string
          organization_id: string
          period_type: string
          successful_requests?: number | null
          total_assessments?: number | null
          total_data_transfer_bytes?: number | null
          total_requests?: number | null
          unique_endpoints?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_response_time_ms?: number | null
          created_at?: string | null
          date_period?: string
          failed_requests?: number | null
          id?: string
          organization_id?: string
          period_type?: string
          successful_requests?: number | null
          total_assessments?: number | null
          total_data_transfer_bytes?: number | null
          total_requests?: number | null
          unique_endpoints?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_aggregates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "api_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage_logs: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          endpoint: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          method: string
          organization_id: string
          request_size_bytes: number | null
          response_size_bytes: number | null
          response_time_ms: number | null
          session_id: string | null
          status_code: number
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          method: string
          organization_id: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          session_id?: string | null
          status_code: number
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          method?: string
          organization_id?: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          session_id?: string | null
          status_code?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_usage_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "api_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_usage_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "api_assessment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      api_users: {
        Row: {
          assessments_taken: number | null
          created_at: string | null
          external_user_id: string
          id: string
          is_active: boolean | null
          last_assessment_at: string | null
          organization_id: string
          profile_data: Json | null
          updated_at: string | null
          user_metadata: Json | null
        }
        Insert: {
          assessments_taken?: number | null
          created_at?: string | null
          external_user_id: string
          id?: string
          is_active?: boolean | null
          last_assessment_at?: string | null
          organization_id: string
          profile_data?: Json | null
          updated_at?: string | null
          user_metadata?: Json | null
        }
        Update: {
          assessments_taken?: number | null
          created_at?: string | null
          external_user_id?: string
          id?: string
          is_active?: boolean | null
          last_assessment_at?: string | null
          organization_id?: string
          profile_data?: Json | null
          updated_at?: string | null
          user_metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "api_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "api_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          conditional_logic: Json | null
          created_at: string
          custom_config: Json | null
          description: string | null
          id: string
          is_active: boolean
          is_custom: boolean | null
          is_required: boolean
          options: Json | null
          order_index: number
          organization_id: string | null
          prerequisites: Json | null
          profile_type: string[] | null
          target_audience: string[] | null
          template_id: string | null
          title: string
          type: Database["public"]["Enums"]["question_type"]
          updated_at: string
        }
        Insert: {
          conditional_logic?: Json | null
          created_at?: string
          custom_config?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_custom?: boolean | null
          is_required?: boolean
          options?: Json | null
          order_index: number
          organization_id?: string | null
          prerequisites?: Json | null
          profile_type?: string[] | null
          target_audience?: string[] | null
          template_id?: string | null
          title: string
          type: Database["public"]["Enums"]["question_type"]
          updated_at?: string
        }
        Update: {
          conditional_logic?: Json | null
          created_at?: string
          custom_config?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_custom?: boolean | null
          is_required?: boolean
          options?: Json | null
          order_index?: number
          organization_id?: string | null
          prerequisites?: Json | null
          profile_type?: string[] | null
          target_audience?: string[] | null
          template_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["question_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "api_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_questions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "api_assessment_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_responses: {
        Row: {
          answer: Json
          assessment_id: string
          created_at: string
          id: string
          question_id: string
        }
        Insert: {
          answer: Json
          assessment_id: string
          created_at?: string
          id?: string
          question_id: string
        }
        Update: {
          answer?: Json
          assessment_id?: string
          created_at?: string
          id?: string
          question_id?: string
        }
        Relationships: []
      }
      availability_requests: {
        Row: {
          created_at: string
          id: string
          mentee_id: string
          mentor_id: string
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          mentee_id: string
          mentor_id: string
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          mentee_id?: string
          mentor_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_requests_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_requests_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          author_id: string
          categories: Database["public"]["Enums"]["categories"][] | null
          content: string
          cover_image_url: string | null
          created_at: string
          id: string
          is_recent: boolean | null
          other_notes: string | null
          status: Database["public"]["Enums"]["status"] | null
          subcategories: Database["public"]["Enums"]["subcategories"][] | null
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          categories?: Database["public"]["Enums"]["categories"][] | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_recent?: boolean | null
          other_notes?: string | null
          status?: Database["public"]["Enums"]["status"] | null
          subcategories?: Database["public"]["Enums"]["subcategories"][] | null
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          categories?: Database["public"]["Enums"]["categories"][] | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_recent?: boolean | null
          other_notes?: string | null
          status?: Database["public"]["Enums"]["status"] | null
          subcategories?: Database["public"]["Enums"]["subcategories"][] | null
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
      calendar_events: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          event_type: string
          id: string
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          event_type: string
          id?: string
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          event_type?: string
          id?: string
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      career_assessments: {
        Row: {
          api_created: boolean | null
          api_session_id: string | null
          callback_url: string | null
          client_metadata: Json | null
          completed_at: string | null
          created_at: string
          detected_profile_type:
            | Database["public"]["Enums"]["profile_type_enum"]
            | null
          external_user_id: string | null
          id: string
          organization_id: string | null
          profile_detection_completed: boolean | null
          started_at: string
          status: Database["public"]["Enums"]["assessment_status"]
          template_id: string | null
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          api_created?: boolean | null
          api_session_id?: string | null
          callback_url?: string | null
          client_metadata?: Json | null
          completed_at?: string | null
          created_at?: string
          detected_profile_type?:
            | Database["public"]["Enums"]["profile_type_enum"]
            | null
          external_user_id?: string | null
          id?: string
          organization_id?: string | null
          profile_detection_completed?: boolean | null
          started_at?: string
          status?: Database["public"]["Enums"]["assessment_status"]
          template_id?: string | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          api_created?: boolean | null
          api_session_id?: string | null
          callback_url?: string | null
          client_metadata?: Json | null
          completed_at?: string | null
          created_at?: string
          detected_profile_type?:
            | Database["public"]["Enums"]["profile_type_enum"]
            | null
          external_user_id?: string | null
          id?: string
          organization_id?: string | null
          profile_detection_completed?: boolean | null
          started_at?: string
          status?: Database["public"]["Enums"]["assessment_status"]
          template_id?: string | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "career_assessments_api_session_id_fkey"
            columns: ["api_session_id"]
            isOneToOne: false
            referencedRelation: "api_assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "api_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_assessments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "api_assessment_templates"
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
      career_recommendations: {
        Row: {
          assessment_id: string
          career_id: string | null
          created_at: string
          description: string
          education_requirements: string[] | null
          growth_outlook: string | null
          id: string
          match_score: number
          reasoning: string
          required_skills: string[] | null
          salary_range: string | null
          time_to_entry: string | null
          title: string
          work_environment: string | null
        }
        Insert: {
          assessment_id: string
          career_id?: string | null
          created_at?: string
          description: string
          education_requirements?: string[] | null
          growth_outlook?: string | null
          id?: string
          match_score: number
          reasoning: string
          required_skills?: string[] | null
          salary_range?: string | null
          time_to_entry?: string | null
          title: string
          work_environment?: string | null
        }
        Update: {
          assessment_id?: string
          career_id?: string | null
          created_at?: string
          description?: string
          education_requirements?: string[] | null
          growth_outlook?: string | null
          id?: string
          match_score?: number
          reasoning?: string
          required_skills?: string[] | null
          salary_range?: string | null
          time_to_entry?: string | null
          title?: string
          work_environment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "career_recommendations_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
        ]
      }
      careers: {
        Row: {
          academic_majors: string[] | null
          author_id: string | null
          careers_to_consider_switching_to: string[] | null
          complete_career: boolean | null
          created_at: string
          description: string
          featured: boolean | null
          growth_potential: string | null
          id: string
          image_url: string | null
          important_note: string | null
          industry: string | null
          job_outlook: string | null
          keywords: string[] | null
          new_career: boolean | null
          popular: boolean | null
          profiles_count: number | null
          rare: boolean | null
          required_education: string[] | null
          required_skills: string[] | null
          required_tools: string[] | null
          salary_range: string | null
          status: Database["public"]["Enums"]["status"] | null
          stress_levels: string | null
          title: string
          token_cost: number
          transferable_skills: string[] | null
          updated_at: string
          work_environment: string | null
        }
        Insert: {
          academic_majors?: string[] | null
          author_id?: string | null
          careers_to_consider_switching_to?: string[] | null
          complete_career?: boolean | null
          created_at?: string
          description: string
          featured?: boolean | null
          growth_potential?: string | null
          id?: string
          image_url?: string | null
          important_note?: string | null
          industry?: string | null
          job_outlook?: string | null
          keywords?: string[] | null
          new_career?: boolean | null
          popular?: boolean | null
          profiles_count?: number | null
          rare?: boolean | null
          required_education?: string[] | null
          required_skills?: string[] | null
          required_tools?: string[] | null
          salary_range?: string | null
          status?: Database["public"]["Enums"]["status"] | null
          stress_levels?: string | null
          title: string
          token_cost?: number
          transferable_skills?: string[] | null
          updated_at?: string
          work_environment?: string | null
        }
        Update: {
          academic_majors?: string[] | null
          author_id?: string | null
          careers_to_consider_switching_to?: string[] | null
          complete_career?: boolean | null
          created_at?: string
          description?: string
          featured?: boolean | null
          growth_potential?: string | null
          id?: string
          image_url?: string | null
          important_note?: string | null
          industry?: string | null
          job_outlook?: string | null
          keywords?: string[] | null
          new_career?: boolean | null
          popular?: boolean | null
          profiles_count?: number | null
          rare?: boolean | null
          required_education?: string[] | null
          required_skills?: string[] | null
          required_tools?: string[] | null
          salary_range?: string | null
          status?: Database["public"]["Enums"]["status"] | null
          stress_levels?: string | null
          title?: string
          token_cost?: number
          transferable_skills?: string[] | null
          updated_at?: string
          work_environment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "careers_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          industry: string | null
          name: string
          status: Database["public"]["Enums"]["status"] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          industry?: string | null
          name: string
          status?: Database["public"]["Enums"]["status"] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          industry?: string | null
          name?: string
          status?: Database["public"]["Enums"]["status"] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      content_engagement: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          profile_id: string
          scroll_depth: number | null
          time_spent: number
          updated_at: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          profile_id: string
          scroll_depth?: number | null
          time_spent?: number
          updated_at?: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          profile_id?: string
          scroll_depth?: number | null
          time_spent?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_engagement_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaign_recipients: {
        Row: {
          campaign_id: string | null
          created_at: string
          email_subscription_id: string | null
          id: string
          profile_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          email_subscription_id?: string | null
          id?: string
          profile_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          email_subscription_id?: string | null
          id?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaign_recipients_email_subscription_id_fkey"
            columns: ["email_subscription_id"]
            isOneToOne: false
            referencedRelation: "email_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaign_recipients_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          admin_id: string
          body: string | null
          content_id: string
          content_ids: string[] | null
          content_type: string
          created_at: string
          failed_count: number
          frequency: string
          id: string
          last_checked_at: string | null
          last_error: string | null
          last_sent: string | null
          recipient_filter: Json | null
          recipient_type: string | null
          recipients_count: number
          scheduled_for: string | null
          sent_at: string | null
          sent_count: number
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          admin_id: string
          body?: string | null
          content_id: string
          content_ids?: string[] | null
          content_type: string
          created_at?: string
          failed_count?: number
          frequency: string
          id?: string
          last_checked_at?: string | null
          last_error?: string | null
          last_sent?: string | null
          recipient_filter?: Json | null
          recipient_type?: string | null
          recipients_count?: number
          scheduled_for?: string | null
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          admin_id?: string
          body?: string | null
          content_id?: string
          content_ids?: string[] | null
          content_type?: string
          created_at?: string
          failed_count?: number
          frequency?: string
          id?: string
          last_checked_at?: string | null
          last_error?: string | null
          last_sent?: string | null
          recipient_filter?: Json | null
          recipient_type?: string | null
          recipients_count?: number
          scheduled_for?: string | null
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_content_type_settings: {
        Row: {
          accent_color: string
          admin_id: string
          content_type: string
          created_at: string
          id: string
          layout_settings: Json
          primary_color: string
          secondary_color: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          admin_id: string
          content_type: string
          created_at?: string
          id?: string
          layout_settings?: Json
          primary_color?: string
          secondary_color?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          admin_id?: string
          content_type?: string
          created_at?: string
          id?: string
          layout_settings?: Json
          primary_color?: string
          secondary_color?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_html_templates: {
        Row: {
          admin_id: string
          content_type: string
          created_at: string
          html_content: string
          id: string
          template_type: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          content_type: string
          created_at?: string
          html_content: string
          id?: string
          template_type: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          content_type?: string
          created_at?: string
          html_content?: string
          id?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_template_content: {
        Row: {
          admin_id: string
          content_type: string
          created_at: string
          cta_text: string | null
          footer_text: string | null
          header_text: string | null
          id: string
          intro_text: string | null
          updated_at: string
        }
        Insert: {
          admin_id: string
          content_type: string
          created_at?: string
          cta_text?: string | null
          footer_text?: string | null
          header_text?: string | null
          id?: string
          intro_text?: string | null
          updated_at?: string
        }
        Update: {
          admin_id?: string
          content_type?: string
          created_at?: string
          cta_text?: string | null
          footer_text?: string | null
          header_text?: string | null
          id?: string
          intro_text?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_template_settings: {
        Row: {
          accent_color: string
          admin_id: string
          created_at: string
          id: string
          logo_url: string | null
          primary_color: string
          secondary_color: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          admin_id: string
          created_at?: string
          id?: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          admin_id?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_template_settings_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      essay_prompts: {
        Row: {
          category: Database["public"]["Enums"]["essay_prompt_category"]
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          prompt_text: string
          title: string
          updated_at: string
          word_limit: number | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["essay_prompt_category"]
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          prompt_text: string
          title: string
          updated_at?: string
          word_limit?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["essay_prompt_category"]
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          prompt_text?: string
          title?: string
          updated_at?: string
          word_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "essay_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_email_logs: {
        Row: {
          created_at: string | null
          email: string
          error_message: string | null
          id: string
          registration_id: string | null
          sent_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          error_message?: string | null
          id?: string
          registration_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          error_message?: string | null
          id?: string
          registration_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_email_logs_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          country: Database["public"]["Enums"]["country"] | null
          created_at: string
          "current academic field/position": string
          "current school/company": string | null
          email: string
          event_id: string | null
          first_name: string
          id: string
          last_name: string
          profile_id: string | null
          status: string | null
          student_or_professional: string
          updated_at: string
          "where did you hear about us":
            | Database["public"]["Enums"]["where did you hear about us"]
            | null
        }
        Insert: {
          country?: Database["public"]["Enums"]["country"] | null
          created_at?: string
          "current academic field/position": string
          "current school/company"?: string | null
          email: string
          event_id?: string | null
          first_name: string
          id?: string
          last_name: string
          profile_id?: string | null
          status?: string | null
          student_or_professional: string
          updated_at?: string
          "where did you hear about us"?:
            | Database["public"]["Enums"]["where did you hear about us"]
            | null
        }
        Update: {
          country?: Database["public"]["Enums"]["country"] | null
          created_at?: string
          "current academic field/position"?: string
          "current school/company"?: string | null
          email?: string
          event_id?: string | null
          first_name?: string
          id?: string
          last_name?: string
          profile_id?: string | null
          status?: string | null
          student_or_professional?: string
          updated_at?: string
          "where did you hear about us"?:
            | Database["public"]["Enums"]["where did you hear about us"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webinar_registrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_resource_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          metadata: Json | null
          profile_id: string | null
          resource_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          profile_id?: string | null
          resource_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          profile_id?: string | null
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_resource_interactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_resource_interactions_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "event_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      event_resources: {
        Row: {
          access_level: string
          created_at: string
          description: string | null
          download_count: number | null
          event_id: string | null
          external_url: string | null
          file_format: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_downloadable: boolean
          last_downloaded_at: string | null
          last_viewed_at: string | null
          resource_type: string
          sort_order: number | null
          title: string
          unique_downloaders: number | null
          unique_viewers: number | null
          updated_at: string
          uploaded_by: string | null
          view_count: number | null
        }
        Insert: {
          access_level?: string
          created_at?: string
          description?: string | null
          download_count?: number | null
          event_id?: string | null
          external_url?: string | null
          file_format?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_downloadable?: boolean
          last_downloaded_at?: string | null
          last_viewed_at?: string | null
          resource_type: string
          sort_order?: number | null
          title: string
          unique_downloaders?: number | null
          unique_viewers?: number | null
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number | null
        }
        Update: {
          access_level?: string
          created_at?: string
          description?: string | null
          download_count?: number | null
          event_id?: string | null
          external_url?: string | null
          file_format?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_downloadable?: boolean
          last_downloaded_at?: string | null
          last_viewed_at?: string | null
          resource_type?: string
          sort_order?: number | null
          title?: string
          unique_downloaders?: number | null
          unique_viewers?: number | null
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_resources_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_resources_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          author_id: string | null
          created_at: string
          description: string
          end_time: string
          event_type: Database["public"]["Enums"]["event_types"]
          facilitator: string | null
          id: string
          max_attendees: number | null
          meeting_link: string | null
          organized_by: string | null
          platform: Database["public"]["Enums"]["webinar_platform"]
          start_time: string
          status: Database["public"]["Enums"]["status"] | null
          thumbnail_url: string | null
          timezone: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          description: string
          end_time: string
          event_type: Database["public"]["Enums"]["event_types"]
          facilitator?: string | null
          id?: string
          max_attendees?: number | null
          meeting_link?: string | null
          organized_by?: string | null
          platform?: Database["public"]["Enums"]["webinar_platform"]
          start_time: string
          status?: Database["public"]["Enums"]["status"] | null
          thumbnail_url?: string | null
          timezone?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          description?: string
          end_time?: string
          event_type?: Database["public"]["Enums"]["event_types"]
          facilitator?: string | null
          id?: string
          max_attendees?: number | null
          meeting_link?: string | null
          organized_by?: string | null
          platform?: Database["public"]["Enums"]["webinar_platform"]
          start_time?: string
          status?: Database["public"]["Enums"]["status"] | null
          thumbnail_url?: string | null
          timezone?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_analytics: {
        Row: {
          created_at: string | null
          hub_id: string
          id: string
          measured_at: string | null
          metric_type: string
          metric_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          hub_id: string
          id?: string
          measured_at?: string | null
          metric_type: string
          metric_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          hub_id?: string
          id?: string
          measured_at?: string | null
          metric_type?: string
          metric_value?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hub_analytics_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_announcement_analytics: {
        Row: {
          announcement_id: string
          created_at: string | null
          hub_id: string
          id: string
          interaction_type: string
          metadata: Json | null
          profile_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string | null
          hub_id: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          profile_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string | null
          hub_id?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hub_announcement_analytics_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "hub_announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_announcement_analytics_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_announcement_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_announcement_engagement: {
        Row: {
          announcement_id: string
          created_at: string | null
          hub_id: string
          id: string
          reaction_count: number | null
          title: string | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          announcement_id: string
          created_at?: string | null
          hub_id: string
          id?: string
          reaction_count?: number | null
          title?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          announcement_id?: string
          created_at?: string | null
          hub_id?: string
          id?: string
          reaction_count?: number | null
          title?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hub_announcement_engagement_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "hub_announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_announcement_engagement_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_announcements: {
        Row: {
          category: Database["public"]["Enums"]["announcement_category"] | null
          content: string
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          hub_id: string | null
          id: string
          scheduled_for: string | null
          target_audience: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["announcement_category"] | null
          content: string
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          hub_id?: string | null
          id?: string
          scheduled_for?: string | null
          target_audience?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["announcement_category"] | null
          content?: string
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          hub_id?: string | null
          id?: string
          scheduled_for?: string | null
          target_audience?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_announcements_institution_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string
          details: Json | null
          hub_id: string
          id: string
          performed_by: string
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          details?: Json | null
          hub_id: string
          id?: string
          performed_by: string
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          details?: Json | null
          hub_id?: string
          id?: string
          performed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "hub_audit_logs_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_audit_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_chat_messages: {
        Row: {
          content: string
          created_at: string
          file_type: string | null
          file_url: string | null
          id: string
          metadata: Json | null
          room_id: string
          sender_id: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          room_id: string
          sender_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          room_id?: string
          sender_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_room"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hub_chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hub_chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_chat_participants: {
        Row: {
          id: string
          joined_at: string
          last_read_at: string
          profile_id: string
          room_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          last_read_at?: string
          profile_id: string
          room_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          last_read_at?: string
          profile_id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hub_chat_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_chat_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hub_chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_chat_reactions: {
        Row: {
          created_at: string
          id: string
          message_id: string
          reaction_type: Database["public"]["Enums"]["chat_reaction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          reaction_type: Database["public"]["Enums"]["chat_reaction_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          reaction_type?: Database["public"]["Enums"]["chat_reaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hub_chat_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "hub_chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_chat_rooms: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          hub_id: string
          id: string
          name: string
          type: Database["public"]["Enums"]["chat_room_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          hub_id: string
          id?: string
          name: string
          type?: Database["public"]["Enums"]["chat_room_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          hub_id?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["chat_room_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hub_chat_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_chat_rooms_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_department_metrics: {
        Row: {
          department_id: string
          hub_id: string
          id: string
          measured_at: string | null
          metric_type: string
          metric_value: number
        }
        Insert: {
          department_id: string
          hub_id: string
          id?: string
          measured_at?: string | null
          metric_type: string
          metric_value?: number
        }
        Update: {
          department_id?: string
          hub_id?: string
          id?: string
          measured_at?: string | null
          metric_type?: string
          metric_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "hub_department_metrics_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hub_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_department_metrics_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_departments: {
        Row: {
          created_at: string | null
          description: string | null
          hub_id: string | null
          id: string
          name: string
          parent_department_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          hub_id?: string | null
          id?: string
          name: string
          parent_department_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          hub_id?: string | null
          id?: string
          name?: string
          parent_department_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_departments_institution_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_departments_parent_department_id_fkey"
            columns: ["parent_department_id"]
            isOneToOne: false
            referencedRelation: "hub_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_invite_verification_attempts: {
        Row: {
          attempted_at: string | null
          id: string
          ip_address: string | null
          success: boolean | null
          token: string
        }
        Insert: {
          attempted_at?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          token: string
        }
        Update: {
          attempted_at?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          token?: string
        }
        Relationships: []
      }
      hub_member_metrics: {
        Row: {
          active_members: number | null
          hub_id: string | null
          id: string
          total_members: number | null
          updated_at: string | null
        }
        Insert: {
          active_members?: number | null
          hub_id?: string | null
          id?: string
          total_members?: number | null
          updated_at?: string | null
        }
        Update: {
          active_members?: number | null
          hub_id?: string | null
          id?: string
          total_members?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hub_member_metrics_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: true
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_members: {
        Row: {
          confirmed: boolean
          created_at: string | null
          department_id: string | null
          hub_id: string
          id: string
          join_date: string | null
          profile_id: string
          role: Database["public"]["Enums"]["hub_member_role"] | null
          status: Database["public"]["Enums"]["status"] | null
          updated_at: string | null
        }
        Insert: {
          confirmed?: boolean
          created_at?: string | null
          department_id?: string | null
          hub_id: string
          id?: string
          join_date?: string | null
          profile_id: string
          role?: Database["public"]["Enums"]["hub_member_role"] | null
          status?: Database["public"]["Enums"]["status"] | null
          updated_at?: string | null
        }
        Update: {
          confirmed?: boolean
          created_at?: string | null
          department_id?: string | null
          hub_id?: string
          id?: string
          join_date?: string | null
          profile_id?: string
          role?: Database["public"]["Enums"]["hub_member_role"] | null
          status?: Database["public"]["Enums"]["status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hub_members_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hub_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_members_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_members_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hub_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_members_institution_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_metrics: {
        Row: {
          created_at: string | null
          hub_id: string | null
          id: string
          storage_used: number | null
          total_files: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          hub_id?: string | null
          id?: string
          storage_used?: number | null
          total_files?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          hub_id?: string | null
          id?: string
          storage_used?: number | null
          total_files?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hub_metrics_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: true
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_resource_analytics: {
        Row: {
          created_at: string | null
          hub_id: string
          id: string
          interaction_type: string
          metadata: Json | null
          profile_id: string
          resource_id: string
        }
        Insert: {
          created_at?: string | null
          hub_id: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          profile_id: string
          resource_id: string
        }
        Update: {
          created_at?: string | null
          hub_id?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          profile_id?: string
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hub_resource_analytics_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_resource_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_resource_analytics_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "hub_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_resource_engagement: {
        Row: {
          created_at: string | null
          download_count: number | null
          hub_id: string
          id: string
          resource_id: string
          share_count: number | null
          title: string | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          download_count?: number | null
          hub_id: string
          id?: string
          resource_id: string
          share_count?: number | null
          title?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          download_count?: number | null
          hub_id?: string
          id?: string
          resource_id?: string
          share_count?: number | null
          title?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hub_resource_engagement_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_resource_engagement_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "hub_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_resources: {
        Row: {
          access_level:
            | Database["public"]["Enums"]["resource_access_level"]
            | null
          category: string | null
          content_type: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          document_type: Database["public"]["Enums"]["document_type"] | null
          external_url: string | null
          file_url: string
          hub_id: string | null
          id: string
          original_filename: string | null
          resource_type: Database["public"]["Enums"]["resource_type"]
          size_in_bytes: number | null
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          access_level?:
            | Database["public"]["Enums"]["resource_access_level"]
            | null
          category?: string | null
          content_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          external_url?: string | null
          file_url: string
          hub_id?: string | null
          id?: string
          original_filename?: string | null
          resource_type?: Database["public"]["Enums"]["resource_type"]
          size_in_bytes?: number | null
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          access_level?:
            | Database["public"]["Enums"]["resource_access_level"]
            | null
          category?: string | null
          content_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          external_url?: string | null
          file_url?: string
          hub_id?: string | null
          id?: string
          original_filename?: string | null
          resource_type?: Database["public"]["Enums"]["resource_type"]
          size_in_bytes?: number | null
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_resources_institution_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_storage_metrics: {
        Row: {
          announcements_count: number | null
          banner_count: number | null
          bucket_id: string
          file_count: number | null
          hub_id: string | null
          id: string
          last_calculated_at: string | null
          logo_count: number | null
          resources_count: number | null
          total_storage_bytes: number | null
          updated_at: string | null
        }
        Insert: {
          announcements_count?: number | null
          banner_count?: number | null
          bucket_id: string
          file_count?: number | null
          hub_id?: string | null
          id?: string
          last_calculated_at?: string | null
          logo_count?: number | null
          resources_count?: number | null
          total_storage_bytes?: number | null
          updated_at?: string | null
        }
        Update: {
          announcements_count?: number | null
          banner_count?: number | null
          bucket_id?: string
          file_count?: number | null
          hub_id?: string | null
          id?: string
          last_calculated_at?: string | null
          logo_count?: number | null
          resources_count?: number | null
          total_storage_bytes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hub_storage_metrics_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: true
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      hubs: {
        Row: {
          apply_now_url: string | null
          apply_now_URL: string | null
          banner_url: string | null
          brand_colors: Json | null
          contact_info: Json | null
          created_at: string | null
          current_member_count: number | null
          current_storage_usage: number | null
          description: string | null
          id: string
          important_links: Json | null
          logo_url: string | null
          member_limit: number | null
          name: string
          social_links: Json | null
          status: Database["public"]["Enums"]["status"] | null
          storage_limit_bytes: number | null
          type: Database["public"]["Enums"]["hub_type"]
          updated_at: string | null
          website: string | null
        }
        Insert: {
          apply_now_url?: string | null
          apply_now_URL?: string | null
          banner_url?: string | null
          brand_colors?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          current_member_count?: number | null
          current_storage_usage?: number | null
          description?: string | null
          id?: string
          important_links?: Json | null
          logo_url?: string | null
          member_limit?: number | null
          name: string
          social_links?: Json | null
          status?: Database["public"]["Enums"]["status"] | null
          storage_limit_bytes?: number | null
          type: Database["public"]["Enums"]["hub_type"]
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          apply_now_url?: string | null
          apply_now_URL?: string | null
          banner_url?: string | null
          brand_colors?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          current_member_count?: number | null
          current_storage_usage?: number | null
          description?: string | null
          id?: string
          important_links?: Json | null
          logo_url?: string | null
          member_limit?: number | null
          name?: string
          social_links?: Json | null
          status?: Database["public"]["Enums"]["status"] | null
          storage_limit_bytes?: number | null
          type?: Database["public"]["Enums"]["hub_type"]
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      majors: {
        Row: {
          affiliated_programs: string[] | null
          author_id: string | null
          career_opportunities: string[] | null
          category: string[] | null
          certifications_to_consider: string[] | null
          common_courses: string[] | null
          common_difficulties: string[] | null
          created_at: string
          degree_levels: string[] | null
          description: string
          dropout_rates: string | null
          featured: boolean | null
          global_applicability: string | null
          gpa_expectations: number | null
          id: string
          intensity: string | null
          interdisciplinary_connections: string[] | null
          job_prospects: string | null
          learning_objectives: string[] | null
          majors_to_consider_switching_to: string[] | null
          passion_for_subject: string | null
          potential_salary: string | null
          professional_associations: string[] | null
          profiles_count: number | null
          skill_match: string[] | null
          status: Database["public"]["Enums"]["status"] | null
          stress_level: string | null
          title: string
          token_cost: number
          tools_knowledge: string[] | null
          transferable_skills: string[] | null
          updated_at: string
        }
        Insert: {
          affiliated_programs?: string[] | null
          author_id?: string | null
          career_opportunities?: string[] | null
          category?: string[] | null
          certifications_to_consider?: string[] | null
          common_courses?: string[] | null
          common_difficulties?: string[] | null
          created_at?: string
          degree_levels?: string[] | null
          description: string
          dropout_rates?: string | null
          featured?: boolean | null
          global_applicability?: string | null
          gpa_expectations?: number | null
          id?: string
          intensity?: string | null
          interdisciplinary_connections?: string[] | null
          job_prospects?: string | null
          learning_objectives?: string[] | null
          majors_to_consider_switching_to?: string[] | null
          passion_for_subject?: string | null
          potential_salary?: string | null
          professional_associations?: string[] | null
          profiles_count?: number | null
          skill_match?: string[] | null
          status?: Database["public"]["Enums"]["status"] | null
          stress_level?: string | null
          title: string
          token_cost?: number
          tools_knowledge?: string[] | null
          transferable_skills?: string[] | null
          updated_at?: string
        }
        Update: {
          affiliated_programs?: string[] | null
          author_id?: string | null
          career_opportunities?: string[] | null
          category?: string[] | null
          certifications_to_consider?: string[] | null
          common_courses?: string[] | null
          common_difficulties?: string[] | null
          created_at?: string
          degree_levels?: string[] | null
          description?: string
          dropout_rates?: string | null
          featured?: boolean | null
          global_applicability?: string | null
          gpa_expectations?: number | null
          id?: string
          intensity?: string | null
          interdisciplinary_connections?: string[] | null
          job_prospects?: string | null
          learning_objectives?: string[] | null
          majors_to_consider_switching_to?: string[] | null
          passion_for_subject?: string | null
          potential_salary?: string | null
          professional_associations?: string[] | null
          profiles_count?: number | null
          skill_match?: string[] | null
          status?: Database["public"]["Enums"]["status"] | null
          stress_level?: string | null
          title?: string
          token_cost?: number
          tools_knowledge?: string[] | null
          transferable_skills?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "majors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentee_academic_records: {
        Row: {
          awards: string[] | null
          class_rank: number | null
          created_at: string
          credits_attempted: number | null
          credits_earned: number | null
          cumulative_gpa: number | null
          honors: string[] | null
          id: string
          mentee_id: string
          semester: string
          semester_gpa: number | null
          updated_at: string
          year: number
        }
        Insert: {
          awards?: string[] | null
          class_rank?: number | null
          created_at?: string
          credits_attempted?: number | null
          credits_earned?: number | null
          cumulative_gpa?: number | null
          honors?: string[] | null
          id?: string
          mentee_id: string
          semester: string
          semester_gpa?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          awards?: string[] | null
          class_rank?: number | null
          created_at?: string
          credits_attempted?: number | null
          credits_earned?: number | null
          cumulative_gpa?: number | null
          honors?: string[] | null
          id?: string
          mentee_id?: string
          semester?: string
          semester_gpa?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "mentee_academic_records_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentee_courses: {
        Row: {
          course_code: string | null
          course_name: string
          created_at: string
          credits: number | null
          description: string | null
          grade: string | null
          id: string
          instructor_name: string | null
          is_favorite: boolean | null
          mentee_id: string
          semester: string | null
          status: Database["public"]["Enums"]["course_status"]
          updated_at: string
          year: number | null
        }
        Insert: {
          course_code?: string | null
          course_name: string
          created_at?: string
          credits?: number | null
          description?: string | null
          grade?: string | null
          id?: string
          instructor_name?: string | null
          is_favorite?: boolean | null
          mentee_id: string
          semester?: string | null
          status?: Database["public"]["Enums"]["course_status"]
          updated_at?: string
          year?: number | null
        }
        Update: {
          course_code?: string | null
          course_name?: string
          created_at?: string
          credits?: number | null
          description?: string | null
          grade?: string | null
          id?: string
          instructor_name?: string | null
          is_favorite?: boolean | null
          mentee_id?: string
          semester?: string | null
          status?: Database["public"]["Enums"]["course_status"]
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mentee_courses_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentee_essay_responses: {
        Row: {
          created_at: string
          id: string
          is_draft: boolean
          mentee_id: string
          prompt_id: string
          response_text: string | null
          updated_at: string
          version: number
          word_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_draft?: boolean
          mentee_id: string
          prompt_id: string
          response_text?: string | null
          updated_at?: string
          version?: number
          word_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_draft?: boolean
          mentee_id?: string
          prompt_id?: string
          response_text?: string | null
          updated_at?: string
          version?: number
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mentee_essay_responses_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentee_essay_responses_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "essay_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      mentee_interests: {
        Row: {
          category: Database["public"]["Enums"]["interest_category"]
          created_at: string
          description: string | null
          id: string
          interest_name: string
          mentee_id: string
          proficiency_level: string | null
          related_career_id: string | null
          related_major_id: string | null
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["interest_category"]
          created_at?: string
          description?: string | null
          id?: string
          interest_name: string
          mentee_id: string
          proficiency_level?: string | null
          related_career_id?: string | null
          related_major_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["interest_category"]
          created_at?: string
          description?: string | null
          id?: string
          interest_name?: string
          mentee_id?: string
          proficiency_level?: string | null
          related_career_id?: string | null
          related_major_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentee_interests_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentee_interests_related_career_id_fkey"
            columns: ["related_career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentee_interests_related_major_id_fkey"
            columns: ["related_major_id"]
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentee_projects: {
        Row: {
          collaborators: string[] | null
          created_at: string
          description: string | null
          end_date: string | null
          github_url: string | null
          id: string
          image_urls: string[] | null
          live_demo_url: string | null
          mentee_id: string
          skills_used: string[] | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          technologies: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          collaborators?: string[] | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          github_url?: string | null
          id?: string
          image_urls?: string[] | null
          live_demo_url?: string | null
          mentee_id: string
          skills_used?: string[] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          technologies?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          collaborators?: string[] | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          github_url?: string | null
          id?: string
          image_urls?: string[] | null
          live_demo_url?: string | null
          mentee_id?: string
          skills_used?: string[] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          technologies?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentee_projects_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_availability: {
        Row: {
          booked_session_id: string | null
          created_at: string
          day_of_week: number | null
          dst_aware: boolean
          end_date_time: string | null
          id: string
          is_available: boolean | null
          is_dst: boolean | null
          last_dst_check: string | null
          profile_id: string
          recurring: boolean | null
          reference_timezone: string
          start_date_time: string | null
          timezone_offset: number
          updated_at: string
        }
        Insert: {
          booked_session_id?: string | null
          created_at?: string
          day_of_week?: number | null
          dst_aware?: boolean
          end_date_time?: string | null
          id?: string
          is_available?: boolean | null
          is_dst?: boolean | null
          last_dst_check?: string | null
          profile_id: string
          recurring?: boolean | null
          reference_timezone?: string
          start_date_time?: string | null
          timezone_offset: number
          updated_at?: string
        }
        Update: {
          booked_session_id?: string | null
          created_at?: string
          day_of_week?: number | null
          dst_aware?: boolean
          end_date_time?: string | null
          id?: string
          is_available?: boolean | null
          is_dst?: boolean | null
          last_dst_check?: string | null
          profile_id?: string
          recurring?: boolean | null
          reference_timezone?: string
          start_date_time?: string | null
          timezone_offset?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_availability_booked_session_id_fkey"
            columns: ["booked_session_id"]
            isOneToOne: false
            referencedRelation: "mentor_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_availability_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_content: {
        Row: {
          content_type: string
          created_at: string
          description: string | null
          external_url: string | null
          file_url: string | null
          id: string
          mentor_id: string
          metadata: Json | null
          size_in_bytes: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content_type: string
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          mentor_id: string
          metadata?: Json | null
          size_in_bytes?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content_type?: string
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          mentor_id?: string
          metadata?: Json | null
          size_in_bytes?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_content_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_reminder_settings: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          minutes_before: number
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          minutes_before: number
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          minutes_before?: number
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_reminder_settings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_resources: {
        Row: {
          author_id: string
          categories: string | null
          created_at: string
          external_url: string | null
          file_url: string | null
          hashtags: string[] | null
          id: string
          mentor_id: string
          resource_type: string
          size_in_bytes: number | null
          status: string | null
          tags: string | null
          title: string
        }
        Insert: {
          author_id: string
          categories?: string | null
          created_at?: string
          external_url?: string | null
          file_url?: string | null
          hashtags?: string[] | null
          id?: string
          mentor_id: string
          resource_type: string
          size_in_bytes?: number | null
          status?: string | null
          tags?: string | null
          title: string
        }
        Update: {
          author_id?: string
          categories?: string | null
          created_at?: string
          external_url?: string | null
          file_url?: string | null
          hashtags?: string[] | null
          id?: string
          mentor_id?: string
          resource_type?: string
          size_in_bytes?: number | null
          status?: string | null
          tags?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_resources_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_session_types: {
        Row: {
          created_at: string
          custom_type_name: string | null
          description: string | null
          duration: number
          id: string
          meeting_platform:
            | Database["public"]["Enums"]["meeting_platform"][]
            | null
          phone_number: string | null
          price: number
          profile_id: string
          telegram_username: string | null
          token_cost: number
          type: Database["public"]["Enums"]["session_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_type_name?: string | null
          description?: string | null
          duration: number
          id?: string
          meeting_platform?:
            | Database["public"]["Enums"]["meeting_platform"][]
            | null
          phone_number?: string | null
          price: number
          profile_id: string
          telegram_username?: string | null
          token_cost?: number
          type: Database["public"]["Enums"]["session_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_type_name?: string | null
          description?: string | null
          duration?: number
          id?: string
          meeting_platform?:
            | Database["public"]["Enums"]["meeting_platform"][]
            | null
          phone_number?: string | null
          price?: number
          profile_id?: string
          telegram_username?: string | null
          token_cost?: number
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
          availability_slot_id: string | null
          calendar_event_etag: string | null
          calendar_event_id: string | null
          created_at: string
          id: string
          last_calendar_sync: string | null
          meeting_link: string | null
          meeting_platform:
            | Database["public"]["Enums"]["meeting_platform"]
            | null
          mentee_id: string
          mentee_phone_number: string | null
          mentee_telegram_username: string | null
          mentor_id: string
          notes: string | null
          scheduled_at: string
          session_type_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          availability_slot_id?: string | null
          calendar_event_etag?: string | null
          calendar_event_id?: string | null
          created_at?: string
          id?: string
          last_calendar_sync?: string | null
          meeting_link?: string | null
          meeting_platform?:
            | Database["public"]["Enums"]["meeting_platform"]
            | null
          mentee_id: string
          mentee_phone_number?: string | null
          mentee_telegram_username?: string | null
          mentor_id: string
          notes?: string | null
          scheduled_at: string
          session_type_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          availability_slot_id?: string | null
          calendar_event_etag?: string | null
          calendar_event_id?: string | null
          created_at?: string
          id?: string
          last_calendar_sync?: string | null
          meeting_link?: string | null
          meeting_platform?:
            | Database["public"]["Enums"]["meeting_platform"]
            | null
          mentee_id?: string
          mentee_phone_number?: string | null
          mentee_telegram_username?: string | null
          mentor_id?: string
          notes?: string | null
          scheduled_at?: string
          session_type_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_sessions_availability_slot_id_fkey"
            columns: ["availability_slot_id"]
            isOneToOne: false
            referencedRelation: "mentor_availability"
            referencedColumns: ["id"]
          },
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
      mentor_storage_metrics: {
        Row: {
          blog_count: number | null
          created_at: string | null
          document_count: number | null
          file_count: number | null
          image_count: number | null
          last_calculated_at: string | null
          link_count: number | null
          mentor_id: string
          other_count: number | null
          pdf_count: number | null
          presentation_count: number | null
          spreadsheet_count: number | null
          total_storage_bytes: number | null
          updated_at: string | null
        }
        Insert: {
          blog_count?: number | null
          created_at?: string | null
          document_count?: number | null
          file_count?: number | null
          image_count?: number | null
          last_calculated_at?: string | null
          link_count?: number | null
          mentor_id: string
          other_count?: number | null
          pdf_count?: number | null
          presentation_count?: number | null
          spreadsheet_count?: number | null
          total_storage_bytes?: number | null
          updated_at?: string | null
        }
        Update: {
          blog_count?: number | null
          created_at?: string | null
          document_count?: number | null
          file_count?: number | null
          image_count?: number | null
          last_calculated_at?: string | null
          link_count?: number | null
          mentor_id?: string
          other_count?: number | null
          pdf_count?: number | null
          presentation_count?: number | null
          spreadsheet_count?: number | null
          total_storage_bytes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_storage_metrics_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          id: string
          message: string
          profile_id: string
          read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
        }
        Insert: {
          action_url?: string | null
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          id?: string
          message: string
          profile_id: string
          read?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
        }
        Update: {
          action_url?: string | null
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          id?: string
          message?: string
          profile_id?: string
          read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          application_url: string | null
          author_id: string | null
          categories: string[] | null
          compensation: string | null
          cover_image_url: string | null
          created_at: string
          deadline: string | null
          description: string
          featured: boolean | null
          id: string
          location: string | null
          opportunity_type: Database["public"]["Enums"]["opportunity_type"]
          provider_name: string
          remote: boolean | null
          status: Database["public"]["Enums"]["opportunity_status"]
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          application_url?: string | null
          author_id?: string | null
          categories?: string[] | null
          compensation?: string | null
          cover_image_url?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          featured?: boolean | null
          id?: string
          location?: string | null
          opportunity_type: Database["public"]["Enums"]["opportunity_type"]
          provider_name: string
          remote?: boolean | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          application_url?: string | null
          author_id?: string | null
          categories?: string[] | null
          compensation?: string | null
          cover_image_url?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          featured?: boolean | null
          id?: string
          location?: string | null
          opportunity_type?: Database["public"]["Enums"]["opportunity_type"]
          provider_name?: string
          remote?: boolean | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_analytics: {
        Row: {
          bookmarks_count: number | null
          checked_out_count: number | null
          created_at: string | null
          id: string
          opportunity_id: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          bookmarks_count?: number | null
          checked_out_count?: number | null
          created_at?: string | null
          id?: string
          opportunity_id: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          bookmarks_count?: number | null
          checked_out_count?: number | null
          created_at?: string | null
          id?: string
          opportunity_id?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_analytics_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_user_clicks: {
        Row: {
          clicked_at: string
          id: string
          opportunity_id: string
          profile_id: string
        }
        Insert: {
          clicked_at?: string
          id?: string
          opportunity_id: string
          profile_id: string
        }
        Update: {
          clicked_at?: string
          id?: string
          opportunity_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_user_clicks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_user_clicks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partnerships: {
        Row: {
          additional_info: string | null
          admin_notes: string | null
          budget_range: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          current_technology: string | null
          description: string
          entity_name: string
          entity_type: string
          geographic_location: string | null
          id: string
          partnership_goals: string
          pilot_program_interest: string | null
          preferred_partnership_type: string[] | null
          previous_partnerships: string | null
          status: string
          student_count: number | null
          success_metrics: string | null
          timeline_expectations: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          additional_info?: string | null
          admin_notes?: string | null
          budget_range?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          current_technology?: string | null
          description: string
          entity_name: string
          entity_type: string
          geographic_location?: string | null
          id?: string
          partnership_goals: string
          pilot_program_interest?: string | null
          preferred_partnership_type?: string[] | null
          previous_partnerships?: string | null
          status?: string
          student_count?: number | null
          success_metrics?: string | null
          timeline_expectations?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          additional_info?: string | null
          admin_notes?: string | null
          budget_range?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          current_technology?: string | null
          description?: string
          entity_name?: string
          entity_type?: string
          geographic_location?: string | null
          id?: string
          partnership_goals?: string
          pilot_program_interest?: string | null
          preferred_partnership_type?: string[] | null
          previous_partnerships?: string | null
          status?: string
          student_count?: number | null
          success_metrics?: string | null
          timeline_expectations?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      personality_answer_weights: {
        Row: {
          answer_value: string
          created_at: string | null
          dimension: string
          id: string
          question_id: string | null
          updated_at: string | null
          weight: number
        }
        Insert: {
          answer_value: string
          created_at?: string | null
          dimension: string
          id?: string
          question_id?: string | null
          updated_at?: string | null
          weight?: number
        }
        Update: {
          answer_value?: string
          created_at?: string | null
          dimension?: string
          id?: string
          question_id?: string | null
          updated_at?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "personality_answer_weights_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "personality_test_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      personality_dimension_scores: {
        Row: {
          confidence_level: number
          created_at: string | null
          e_i_responses: number
          e_i_score: number
          id: string
          j_p_responses: number
          j_p_score: number
          profile_id: string | null
          s_n_responses: number
          s_n_score: number
          t_f_responses: number
          t_f_score: number
          test_result_id: string | null
        }
        Insert: {
          confidence_level?: number
          created_at?: string | null
          e_i_responses?: number
          e_i_score?: number
          id?: string
          j_p_responses?: number
          j_p_score?: number
          profile_id?: string | null
          s_n_responses?: number
          s_n_score?: number
          t_f_responses?: number
          t_f_score?: number
          test_result_id?: string | null
        }
        Update: {
          confidence_level?: number
          created_at?: string | null
          e_i_responses?: number
          e_i_score?: number
          id?: string
          j_p_responses?: number
          j_p_score?: number
          profile_id?: string | null
          s_n_responses?: number
          s_n_score?: number
          t_f_responses?: number
          t_f_score?: number
          test_result_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personality_dimension_scores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personality_test_answer_mappings: {
        Row: {
          answer_value: string
          created_at: string
          id: string
          question_id: string | null
          recommendation_id: string | null
          recommendation_type: Database["public"]["Enums"]["recommendation_type"]
          updated_at: string
          weight: number
        }
        Insert: {
          answer_value: string
          created_at?: string
          id?: string
          question_id?: string | null
          recommendation_id?: string | null
          recommendation_type: Database["public"]["Enums"]["recommendation_type"]
          updated_at?: string
          weight?: number
        }
        Update: {
          answer_value?: string
          created_at?: string
          id?: string
          question_id?: string | null
          recommendation_id?: string | null
          recommendation_type?: Database["public"]["Enums"]["recommendation_type"]
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "personality_test_answer_mappings_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "personality_test_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      personality_test_questions: {
        Row: {
          created_at: string
          id: string
          options: Json | null
          order_index: number
          question: string
          question_type: Database["public"]["Enums"]["personality_question_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          options?: Json | null
          order_index: number
          question: string
          question_type: Database["public"]["Enums"]["personality_question_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          options?: Json | null
          order_index?: number
          question?: string
          question_type?: Database["public"]["Enums"]["personality_question_type"]
          updated_at?: string
        }
        Relationships: []
      }
      personality_types: {
        Row: {
          created_at: string
          dicotomy_description: string[]
          id: number
          keywords: string[] | null
          strengths: string[]
          title: string
          traits: string[]
          type: string
          weaknesses: string[]
          who_they_are: string | null
        }
        Insert: {
          created_at?: string
          dicotomy_description: string[]
          id?: number
          keywords?: string[] | null
          strengths: string[]
          title: string
          traits: string[]
          type: string
          weaknesses: string[]
          who_they_are?: string | null
        }
        Update: {
          created_at?: string
          dicotomy_description?: string[]
          id?: number
          keywords?: string[] | null
          strengths?: string[]
          title?: string
          traits?: string[]
          type?: string
          weaknesses?: string[]
          who_they_are?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          academic_major_id: string | null
          academic_status: Database["public"]["Enums"]["academic_status"] | null
          avatar_type: string | null
          avatar_url: string | null
          background_check_consent: boolean | null
          bio: string | null
          class_rank: number | null
          company_id: string | null
          created_at: string
          current_gpa: number | null
          email: string
          facebook_url: string | null
          fields_of_interest: string[] | null
          first_name: string | null
          full_name: string | null
          github_url: string | null
          graduation_year: number | null
          highest_degree: Database["public"]["Enums"]["degree"] | null
          id: string
          instagram_url: string | null
          keywords: string[] | null
          languages: string[] | null
          last_name: string | null
          linkedin_url: string | null
          location: string | null
          onboarding_status:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          position: string | null
          school_id: string | null
          skills: string[] | null
          student_nonstudent:
            | Database["public"]["Enums"]["student_nonstudent"]
            | null
          tiktok_url: string | null
          tools_used: string[] | null
          top_mentor: boolean | null
          total_booked_sessions: number | null
          total_credits: number | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"] | null
          website_url: string | null
          X_url: string | null
          years_of_experience: number | null
          youtube_url: string | null
        }
        Insert: {
          academic_major_id?: string | null
          academic_status?:
            | Database["public"]["Enums"]["academic_status"]
            | null
          avatar_type?: string | null
          avatar_url?: string | null
          background_check_consent?: boolean | null
          bio?: string | null
          class_rank?: number | null
          company_id?: string | null
          created_at?: string
          current_gpa?: number | null
          email: string
          facebook_url?: string | null
          fields_of_interest?: string[] | null
          first_name?: string | null
          full_name?: string | null
          github_url?: string | null
          graduation_year?: number | null
          highest_degree?: Database["public"]["Enums"]["degree"] | null
          id?: string
          instagram_url?: string | null
          keywords?: string[] | null
          languages?: string[] | null
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          onboarding_status?:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          position?: string | null
          school_id?: string | null
          skills?: string[] | null
          student_nonstudent?:
            | Database["public"]["Enums"]["student_nonstudent"]
            | null
          tiktok_url?: string | null
          tools_used?: string[] | null
          top_mentor?: boolean | null
          total_booked_sessions?: number | null
          total_credits?: number | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          website_url?: string | null
          X_url?: string | null
          years_of_experience?: number | null
          youtube_url?: string | null
        }
        Update: {
          academic_major_id?: string | null
          academic_status?:
            | Database["public"]["Enums"]["academic_status"]
            | null
          avatar_type?: string | null
          avatar_url?: string | null
          background_check_consent?: boolean | null
          bio?: string | null
          class_rank?: number | null
          company_id?: string | null
          created_at?: string
          current_gpa?: number | null
          email?: string
          facebook_url?: string | null
          fields_of_interest?: string[] | null
          first_name?: string | null
          full_name?: string | null
          github_url?: string | null
          graduation_year?: number | null
          highest_degree?: Database["public"]["Enums"]["degree"] | null
          id?: string
          instagram_url?: string | null
          keywords?: string[] | null
          languages?: string[] | null
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          onboarding_status?:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          position?: string | null
          school_id?: string | null
          skills?: string[] | null
          student_nonstudent?:
            | Database["public"]["Enums"]["student_nonstudent"]
            | null
          tiktok_url?: string | null
          tools_used?: string[] | null
          top_mentor?: boolean | null
          total_booked_sessions?: number | null
          total_credits?: number | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          website_url?: string | null
          X_url?: string | null
          years_of_experience?: number | null
          youtube_url?: string | null
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
          },
        ]
      }
      referral_codes: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          profile_id: string
          referral_code: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          profile_id: string
          referral_code: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          profile_id?: string
          referral_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_rewards: {
        Row: {
          awarded_at: string
          id: string
          referral_id: string
          referred_id: string
          referrer_id: string
          reward_amount: number
          reward_type: string
          transaction_id: string | null
        }
        Insert: {
          awarded_at?: string
          id?: string
          referral_id: string
          referred_id: string
          referrer_id: string
          reward_amount?: number
          reward_type?: string
          transaction_id?: string | null
        }
        Update: {
          awarded_at?: string
          id?: string
          referral_id?: string
          referred_id?: string
          referrer_id?: string
          reward_amount?: number
          reward_type?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "user_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "token_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          academic_requirements: Json | null
          amount: number | null
          application_open_date: string | null
          application_process: string | null
          application_url: string | null
          author_id: string | null
          award_frequency: string | null
          category: string[] | null
          citizenship_requirements: string[] | null
          contact_information: Json | null
          created_at: string
          deadline: string | null
          demographic_requirements: string[] | null
          description: string
          eligibility_criteria: Json | null
          featured: boolean | null
          id: string
          image_url: string | null
          provider_name: string
          renewable: boolean | null
          required_documents: string[] | null
          source_verified: boolean | null
          status: string
          tags: string[] | null
          title: string
          total_applicants: number | null
          updated_at: string
          views_count: number | null
        }
        Insert: {
          academic_requirements?: Json | null
          amount?: number | null
          application_open_date?: string | null
          application_process?: string | null
          application_url?: string | null
          author_id?: string | null
          award_frequency?: string | null
          category?: string[] | null
          citizenship_requirements?: string[] | null
          contact_information?: Json | null
          created_at?: string
          deadline?: string | null
          demographic_requirements?: string[] | null
          description: string
          eligibility_criteria?: Json | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          provider_name: string
          renewable?: boolean | null
          required_documents?: string[] | null
          source_verified?: boolean | null
          status?: string
          tags?: string[] | null
          title: string
          total_applicants?: number | null
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          academic_requirements?: Json | null
          amount?: number | null
          application_open_date?: string | null
          application_process?: string | null
          application_url?: string | null
          author_id?: string | null
          award_frequency?: string | null
          category?: string[] | null
          citizenship_requirements?: string[] | null
          contact_information?: Json | null
          created_at?: string
          deadline?: string | null
          demographic_requirements?: string[] | null
          description?: string
          eligibility_criteria?: Json | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          provider_name?: string
          renewable?: boolean | null
          required_documents?: string[] | null
          source_verified?: boolean | null
          status?: string
          tags?: string[] | null
          title?: string
          total_applicants?: number | null
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scholarships_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      school_majors: {
        Row: {
          created_at: string
          id: string
          major_id: string
          program_details: string | null
          program_url: string | null
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          major_id: string
          program_details?: string | null
          program_url?: string | null
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          major_id?: string
          program_details?: string | null
          program_url?: string | null
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_majors_major_id_fkey"
            columns: ["major_id"]
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_majors_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          acceptance_rate: number | null
          admissions_page_url: string | null
          country: Database["public"]["Enums"]["country"] | null
          cover_image_url: string | null
          created_at: string
          featured: boolean | null
          featured_priority: number | null
          financial_aid_url: string | null
          grad_programs_link: string | null
          graduate_application_url: string | null
          id: string
          international_students_url: string | null
          location: string | null
          logo_url: string | null
          name: string
          ranking: string | null
          state: Database["public"]["Enums"]["states"] | null
          status: Database["public"]["Enums"]["status"] | null
          student_faculty_ratio: string | null
          student_population: number | null
          tuition_fees: Json | null
          type: Database["public"]["Enums"]["school_type"] | null
          undergrad_programs_link: string | null
          undergraduate_application_url: string | null
          updated_at: string
          virtual_tour_url: string | null
          website: string | null
        }
        Insert: {
          acceptance_rate?: number | null
          admissions_page_url?: string | null
          country?: Database["public"]["Enums"]["country"] | null
          cover_image_url?: string | null
          created_at?: string
          featured?: boolean | null
          featured_priority?: number | null
          financial_aid_url?: string | null
          grad_programs_link?: string | null
          graduate_application_url?: string | null
          id?: string
          international_students_url?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          ranking?: string | null
          state?: Database["public"]["Enums"]["states"] | null
          status?: Database["public"]["Enums"]["status"] | null
          student_faculty_ratio?: string | null
          student_population?: number | null
          tuition_fees?: Json | null
          type?: Database["public"]["Enums"]["school_type"] | null
          undergrad_programs_link?: string | null
          undergraduate_application_url?: string | null
          updated_at?: string
          virtual_tour_url?: string | null
          website?: string | null
        }
        Update: {
          acceptance_rate?: number | null
          admissions_page_url?: string | null
          country?: Database["public"]["Enums"]["country"] | null
          cover_image_url?: string | null
          created_at?: string
          featured?: boolean | null
          featured_priority?: number | null
          financial_aid_url?: string | null
          grad_programs_link?: string | null
          graduate_application_url?: string | null
          id?: string
          international_students_url?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          ranking?: string | null
          state?: Database["public"]["Enums"]["states"] | null
          status?: Database["public"]["Enums"]["status"] | null
          student_faculty_ratio?: string | null
          student_population?: number | null
          tuition_fees?: Json | null
          type?: Database["public"]["Enums"]["school_type"] | null
          undergrad_programs_link?: string | null
          undergraduate_application_url?: string | null
          updated_at?: string
          virtual_tour_url?: string | null
          website?: string | null
        }
        Relationships: []
      }
      search_history: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          results_count: number | null
          search_query: string
          search_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          results_count?: number | null
          search_query: string
          search_type: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          results_count?: number | null
          search_query?: string
          search_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_feedback: {
        Row: {
          created_at: string
          did_not_show_up: boolean | null
          feedback_type: Database["public"]["Enums"]["feedback_type"]
          from_profile_id: string
          id: string
          notes: string | null
          rating: number | null
          recommend: boolean | null
          session_id: string
          to_profile_id: string
        }
        Insert: {
          created_at?: string
          did_not_show_up?: boolean | null
          feedback_type: Database["public"]["Enums"]["feedback_type"]
          from_profile_id: string
          id?: string
          notes?: string | null
          rating?: number | null
          recommend?: boolean | null
          session_id: string
          to_profile_id: string
        }
        Update: {
          created_at?: string
          did_not_show_up?: boolean | null
          feedback_type?: Database["public"]["Enums"]["feedback_type"]
          from_profile_id?: string
          id?: string
          notes?: string | null
          rating?: number | null
          recommend?: boolean | null
          session_id?: string
          to_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_feedback_from_profile_id_fkey"
            columns: ["from_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mentor_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_feedback_to_profile_id_fkey"
            columns: ["to_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_reminders: {
        Row: {
          created_at: string
          id: string
          minutes_before: number
          reminder_time: string
          sent: boolean
          sent_at: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          minutes_before: number
          reminder_time: string
          sent?: boolean
          sent_at?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          minutes_before?: number
          reminder_time?: string
          sent?: boolean
          sent_at?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_reminders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mentor_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      token_packages: {
        Row: {
          created_at: string
          default_price: string | null
          id: string
          is_active: boolean | null
          name: string
          price_usd: number
          token_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_price?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price_usd: number
          token_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_price?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_usd?: number
          token_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["transaction_category"] | null
          created_at: string
          description: string | null
          discount_amount: number | null
          id: string
          metadata: Json | null
          original_amount: number | null
          reference_id: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          transaction_status:
            | Database["public"]["Enums"]["transaction_status"]
            | null
          transaction_type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          category?: Database["public"]["Enums"]["transaction_category"] | null
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          id?: string
          metadata?: Json | null
          original_amount?: number | null
          reference_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          transaction_status?:
            | Database["public"]["Enums"]["transaction_status"]
            | null
          transaction_type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["transaction_category"] | null
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          id?: string
          metadata?: Json | null
          original_amount?: number | null
          reference_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          transaction_status?:
            | Database["public"]["Enums"]["transaction_status"]
            | null
          transaction_type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bookmarks: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interactions: {
        Row: {
          created_at: string
          element_id: string | null
          element_type: string | null
          id: string
          interaction_data: Json | null
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          page_path: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          element_id?: string | null
          element_type?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          page_path: string
          profile_id: string
        }
        Update: {
          created_at?: string
          element_id?: string | null
          element_type?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_type?: Database["public"]["Enums"]["interaction_type"]
          page_path?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_login_rewards: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          reward_date: string
          tokens_awarded: number
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          reward_date: string
          tokens_awarded?: number
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          reward_date?: string
          tokens_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_login_rewards_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_oauth_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          provider: string
          refresh_token: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          provider: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          provider?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_page_views: {
        Row: {
          created_at: string
          entry_time: string
          exit_time: string | null
          id: string
          page_path: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          entry_time?: string
          exit_time?: string | null
          id?: string
          page_path: string
          profile_id: string
        }
        Update: {
          created_at?: string
          entry_time?: string
          exit_time?: string | null
          id?: string
          page_path?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_page_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          registration_completed_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          registration_completed_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          registration_completed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          setting_type: Database["public"]["Enums"]["setting_type"]
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          setting_type: Database["public"]["Enums"]["setting_type"]
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          setting_type?: Database["public"]["Enums"]["setting_type"]
          setting_value?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          profile_id: string
          updated_at: string
          video_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          profile_id: string
          updated_at?: string
          video_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          profile_id?: string
          updated_at?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          profile_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          profile_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          profile_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_interactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_interactions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_views: {
        Row: {
          created_at: string
          id: string
          last_watched_at: string
          profile_id: string
          updated_at: string
          video_id: string
          watch_time: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_watched_at?: string
          profile_id: string
          updated_at?: string
          video_id: string
          watch_time?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_watched_at?: string
          profile_id?: string
          updated_at?: string
          video_id?: string
          watch_time?: number
        }
        Relationships: [
          {
            foreignKeyName: "video_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_views_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          author_id: string
          created_at: string
          description: string | null
          duration: number
          id: string
          status: Database["public"]["Enums"]["status"] | null
          tags: string[]
          thumbnail_url: string | null
          title: string
          total_views: number
          total_watch_time: number
          updated_at: string
          video_url: string
        }
        Insert: {
          author_id: string
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          status?: Database["public"]["Enums"]["status"] | null
          tags?: string[]
          thumbnail_url?: string | null
          title: string
          total_views?: number
          total_watch_time?: number
          updated_at?: string
          video_url: string
        }
        Update: {
          author_id?: string
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          status?: Database["public"]["Enums"]["status"] | null
          tags?: string[]
          thumbnail_url?: string | null
          title?: string
          total_views?: number
          total_watch_time?: number
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      hub_member_growth: {
        Row: {
          hub_id: string | null
          month: string | null
          new_members: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hub_members_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_members_institution_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_hub_member: {
        Args: { _hub_id: string; _email: string; _role: string }
        Returns: Json
      }
      add_tokens_to_wallet: {
        Args: {
          p_wallet_id: string
          p_amount: number
          p_description: string
          p_related_entity_type?: string
          p_related_entity_id?: string
        }
        Returns: undefined
      }
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      calculate_hub_member_count: {
        Args: { _hub_id: string }
        Returns: number
      }
      calculate_hub_storage_usage: {
        Args: { _hub_id: string }
        Returns: number
      }
      cancel_session: {
        Args: {
          p_session_id: string
          p_reason?: string
          p_cancelled_by_user_id?: string
        }
        Returns: Json
      }
      check_and_insert_major: {
        Args: { major_data: Json }
        Returns: Json
      }
      check_hub_admin: {
        Args: { user_id: string; target_hub_id: string }
        Returns: boolean
      }
      check_hub_membership: {
        Args: { user_id: string; target_hub_id: string }
        Returns: boolean
      }
      check_pending_invitation: {
        Args: { user_id: string; target_hub_id: string }
        Returns: boolean
      }
      check_quota_usage: {
        Args: {
          p_organization_id: string
          p_quota_type: string
          p_period_type?: string
        }
        Returns: Json
      }
      check_rate_limit: {
        Args: { p_api_key_id: string; p_window_minutes?: number }
        Returns: Json
      }
      check_timezone_dst_changes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_verification_rate_limit: {
        Args: { _token: string; _ip_address: string }
        Returns: boolean
      }
      clean_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_duplicate_availability_slots: {
        Args: Record<PropertyKey, never>
        Returns: {
          cleaned_count: number
          mentor_id: string
          mentor_email: string
        }[]
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      confirm_hub_membership: {
        Args: { _hub_id: string }
        Returns: Json
      }
      create_assessment_session: {
        Args: {
          p_organization_id: string
          p_external_user_id: string
          p_template_id?: string
          p_callback_url?: string
          p_webhook_url?: string
          p_return_url?: string
          p_client_metadata?: Json
          p_expires_in_minutes?: number
        }
        Returns: string
      }
      create_billing_event: {
        Args: {
          p_organization_id: string
          p_event_type: string
          p_quantity?: number
          p_unit_price?: number
          p_reference_id?: string
          p_metadata?: Json
        }
        Returns: string
      }
      create_hub_member: {
        Args: {
          hub_id: string
          member_profile_id: string
          member_role: string
          member_status: string
        }
        Returns: undefined
      }
      create_session_and_update_availability: {
        Args: {
          p_mentor_id: string
          p_mentee_id: string
          p_session_type_id: string
          p_scheduled_at: string
          p_notes: string
          p_meeting_platform: string
          p_mentee_phone_number: string
          p_mentee_telegram_username: string
          p_start_time: string
          p_session_date: string
        }
        Returns: Json
      }
      deduct_tokens: {
        Args: {
          p_wallet_id: string
          p_amount: number
          p_description: string
          p_category?: Database["public"]["Enums"]["transaction_category"]
          p_reference_id?: string
          p_metadata?: Json
        }
        Returns: Json
      }
      delete_session: {
        Args: { p_session_id: string }
        Returns: Json
      }
      ensure_complete_hub_storage_structure: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      fix_hub_metrics_inconsistencies: {
        Args: Record<PropertyKey, never>
        Returns: {
          hub_id: string
          name: string
          old_storage: number
          new_storage: number
          old_members: number
          new_members: number
          fixed: boolean
        }[]
      }
      generate_api_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_personality_test_mappings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_session_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_hub_recommendations: {
        Args: { p_hub_id: string }
        Returns: {
          content_type: string
          content_id: string
          title: string
          bookmark_count: number
          search_count: number
        }[]
      }
      get_organization_template: {
        Args: { p_organization_id: string; p_template_name?: string }
        Returns: string
      }
      get_transaction_summary: {
        Args: {
          p_wallet_id: string
          p_start_date?: string
          p_end_date?: string
        }
        Returns: Json
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      handle_opportunity_click: {
        Args: { p_opportunity_id: string }
        Returns: Json
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      increment_opportunity_applications_count: {
        Args: { opportunity_id: string }
        Returns: undefined
      }
      increment_opportunity_checked_out_count: {
        Args: { opportunity_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { user_id?: string }
        Returns: boolean
      }
      is_hub_admin: {
        Args: { hub_id: string }
        Returns: boolean
      }
      is_hub_member: {
        Args: { hub_id: string }
        Returns: boolean
      }
      log_api_usage: {
        Args: {
          p_organization_id: string
          p_endpoint: string
          p_method: string
          p_status_code: number
          p_api_key_id?: string
          p_session_id?: string
          p_response_time_ms?: number
          p_request_size_bytes?: number
          p_response_size_bytes?: number
          p_ip_address?: unknown
          p_user_agent?: string
          p_error_message?: string
          p_metadata?: Json
        }
        Returns: string
      }
      log_hub_audit_event: {
        Args: {
          _hub_id: string
          _action: Database["public"]["Enums"]["audit_action"]
          _details?: Json
        }
        Returns: undefined
      }
      manually_update_majors_profiles_count: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      mark_past_sessions_completed: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      match_profiles_with_majors: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      migrate_reminder_settings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      monitor_availability_duplicates: {
        Args: Record<PropertyKey, never>
        Returns: {
          profile_id: string
          mentor_email: string
          duplicate_count: number
          sample_start_time: string
          sample_end_time: string
        }[]
      }
      process_daily_login_reward: {
        Args: { p_profile_id: string }
        Returns: Json
      }
      process_referral_reward: {
        Args: { p_referred_id: string; p_referral_code: string }
        Returns: Json
      }
      process_welcome_reward: {
        Args: { p_profile_id: string }
        Returns: Json
      }
      refresh_all_hub_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_hub_metrics: {
        Args: { _hub_id: string }
        Returns: Json
      }
      refresh_personality_test_mappings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refund_tokens: {
        Args: {
          p_wallet_id: string
          p_amount: number
          p_description: string
          p_reference_id?: string
          p_metadata?: Json
        }
        Returns: Json
      }
      reschedule_session: {
        Args: { p_session_id: string; p_new_time: string }
        Returns: Json
      }
      schedule_notification: {
        Args: { p_notifications: Json[]; p_scheduled_for: string }
        Returns: undefined
      }
      send_session_feedback_requests: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      update_availability_dst: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_availability_dst_offset: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_careers_profiles_count: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
      validate_api_key: {
        Args: { api_key: string }
        Returns: string
      }
      validate_session_token: {
        Args: { p_session_token: string }
        Returns: string
      }
    }
    Enums: {
      academic_status:
        | "current_student"
        | "gap_year"
        | "graduated"
        | "transfer_student"
        | "prospective_student"
      announcement_category: "event" | "news" | "alert" | "general"
      api_environment: "sandbox" | "production"
      api_subscription_tier: "free" | "basic" | "professional" | "enterprise"
      application_status:
        | "Not Applied"
        | "Applied"
        | "In Progress"
        | "Accepted"
        | "Rejected"
        | "Withdrawn"
      assessment_status: "in_progress" | "completed"
      audit_action:
        | "member_added"
        | "member_removed"
        | "member_role_changed"
        | "hub_settings_updated"
        | "announcement_created"
        | "announcement_updated"
        | "announcement_deleted"
        | "resource_added"
        | "resource_removed"
        | "department_created"
        | "department_updated"
        | "department_deleted"
        | "member_invitation_sent"
        | "member_invitation_cancelled"
        | "member_role_updated"
        | "branding_updated"
        | "member_confirmed"
        | "confirmed_hub_membership"
      campaign_status: "pending" | "sending" | "sent" | "failed" | "partial"
      categories:
        | "Technology"
        | "Digital Tools"
        | "Extracurricular Activities"
        | "Success Stories"
        | "Volunteerism"
        | "Community Service"
        | "Entrepreneurship"
        | "Financial Literacy"
        | "Arts Careers"
        | "STEM Education"
        | "STEM Careers"
        | "Humanities Careers"
        | "Diversity and Inclusion"
        | "Educational Resources"
        | "Leadership Development"
        | "Mental Health"
        | "Wellbeing"
        | "High School to University Transition"
        | "Study Abroad Preparation"
        | "Personal Branding"
        | "Internship and Job Search"
        | "Networking Strategies"
        | "Skill Development"
        | "University Admissions"
        | "Career Guidance"
      chat_reaction_type:
        | "thumbs-up"
        | "thumbs-down"
        | "heart"
        | "smile"
        | "laugh"
        | "angry"
        | "frown"
        | "meh"
      chat_room_type: "public" | "private"
      country:
        | "Afghanistan"
        | "Albania"
        | "Algeria"
        | "Andorra"
        | "Angola"
        | "Antigua and Barbuda"
        | "Argentina"
        | "Armenia"
        | "Australia"
        | "Austria"
        | "Azerbaijan"
        | "Bahamas"
        | "Bahrain"
        | "Bangladesh"
        | "Barbados"
        | "Belarus"
        | "Belgium"
        | "Belize"
        | "Benin"
        | "Bhutan"
        | "Bolivia"
        | "Bosnia and Herzegovina"
        | "Botswana"
        | "Brazil"
        | "Brunei"
        | "Bulgaria"
        | "Burkina Faso"
        | "Burundi"
        | "Cabo Verde"
        | "Cambodia"
        | "Cameroon"
        | "Canada"
        | "Central African Republic"
        | "Chad"
        | "Chile"
        | "China"
        | "Colombia"
        | "Comoros"
        | "Congo"
        | "Costa Rica"
        | "Croatia"
        | "Cuba"
        | "Cyprus"
        | "Czech Republic"
        | "Denmark"
        | "Djibouti"
        | "Dominica"
        | "Dominican Republic"
        | "East Timor"
        | "Ecuador"
        | "Egypt"
        | "El Salvador"
        | "Equatorial Guinea"
        | "Eritrea"
        | "Estonia"
        | "Eswatini"
        | "Ethiopia"
        | "Fiji"
        | "Finland"
        | "France"
        | "Gabon"
        | "Gambia"
        | "Georgia"
        | "Germany"
        | "Ghana"
        | "Greece"
        | "Grenada"
        | "Guatemala"
        | "Guinea"
        | "Guinea-Bissau"
        | "Guyana"
        | "Haiti"
        | "Honduras"
        | "Hungary"
        | "Iceland"
        | "India"
        | "Indonesia"
        | "Iran"
        | "Iraq"
        | "Ireland"
        | "Israel"
        | "Italy"
        | "Ivory Coast"
        | "Jamaica"
        | "Japan"
        | "Jordan"
        | "Kazakhstan"
        | "Kenya"
        | "Kiribati"
        | "Kuwait"
        | "Kyrgyzstan"
        | "Laos"
        | "Latvia"
        | "Lebanon"
        | "Lesotho"
        | "Liberia"
        | "Libya"
        | "Liechtenstein"
        | "Lithuania"
        | "Luxembourg"
        | "Madagascar"
        | "Malawi"
        | "Malaysia"
        | "Maldives"
        | "Mali"
        | "Malta"
        | "Marshall Islands"
        | "Mauritania"
        | "Mauritius"
        | "Mexico"
        | "Micronesia"
        | "Moldova"
        | "Monaco"
        | "Mongolia"
        | "Montenegro"
        | "Morocco"
        | "Mozambique"
        | "Myanmar"
        | "Namibia"
        | "Nauru"
        | "Nepal"
        | "Netherlands"
        | "New Zealand"
        | "Nicaragua"
        | "Niger"
        | "Nigeria"
        | "North Korea"
        | "North Macedonia"
        | "Norway"
        | "Oman"
        | "Pakistan"
        | "Palau"
        | "Palestine"
        | "Panama"
        | "Papua New Guinea"
        | "Paraguay"
        | "Peru"
        | "Philippines"
        | "Poland"
        | "Portugal"
        | "Qatar"
        | "Romania"
        | "Russia"
        | "Rwanda"
        | "Saint Kitts and Nevis"
        | "Saint Lucia"
        | "Saint Vincent and the Grenadines"
        | "Samoa"
        | "San Marino"
        | "Sao Tome and Principe"
        | "Saudi Arabia"
        | "Senegal"
        | "Serbia"
        | "Seychelles"
        | "Sierra Leone"
        | "Singapore"
        | "Slovakia"
        | "Slovenia"
        | "Solomon Islands"
        | "Somalia"
        | "South Africa"
        | "South Korea"
        | "South Sudan"
        | "Spain"
        | "Sri Lanka"
        | "Sudan"
        | "Suriname"
        | "Sweden"
        | "Switzerland"
        | "Syria"
        | "Taiwan"
        | "Tajikistan"
        | "Tanzania"
        | "Thailand"
        | "Togo"
        | "Tonga"
        | "Trinidad and Tobago"
        | "Tunisia"
        | "Turkey"
        | "Turkmenistan"
        | "Tuvalu"
        | "Uganda"
        | "Ukraine"
        | "United Arab Emirates"
        | "United Kingdom"
        | "United States"
        | "Uruguay"
        | "Uzbekistan"
        | "Vanuatu"
        | "Vatican City"
        | "Venezuela"
        | "Vietnam"
        | "Yemen"
        | "Zambia"
        | "Zimbabwe"
        | "Democratic Republic of Congo"
      course_status: "completed" | "in_progress" | "planned" | "dropped"
      degree:
        | "No Degree"
        | "High School"
        | "Associate"
        | "Bachelor"
        | "Master"
        | "PhD"
        | "MD"
      dichotomies:
        | "Introversion (I)"
        | "Extraversion (E)"
        | "Sensing (S)"
        | "Intuition (N)"
        | "Thinking (T)"
        | "Feeling (F)"
        | "Judging (J)"
        | "Perceiving (P)"
      document_type: "pdf" | "word" | "powerpoint" | "excel" | "other"
      email_content_section: "header" | "intro" | "cta" | "footer"
      essay_prompt_category:
        | "college_application"
        | "scholarship"
        | "personal_statement"
        | "supplemental"
        | "creative_writing"
        | "academic_reflection"
      event_types:
        | "Coffee Time"
        | "Hackathon"
        | "Panel"
        | "Webinar"
        | "Workshop"
      feedback_type: "mentor_feedback" | "mentee_feedback"
      hub_member_role: "admin" | "moderator" | "member" | "faculty" | "student"
      hub_type: "University" | "NGO" | "Organization" | "High School"
      interaction_type:
        | "page_view"
        | "click"
        | "search"
        | "bookmark"
        | "content_view"
      interest_category:
        | "career"
        | "academic"
        | "extracurricular"
        | "hobby"
        | "industry"
        | "skill"
      language:
        | "English"
        | "Spanish"
        | "French"
        | "Chinese"
        | "Hindi"
        | "Arabic"
        | "Bengali"
        | "Portuguese"
        | "Russian"
        | "German"
        | "Japanese"
        | "Nigerian Pidgin"
        | "Turkish"
        | "Hausa"
        | "Swahili"
        | "Vietnamese"
        | "Korean"
        | "Italian"
        | "Thai"
        | "Marathi"
        | "Yoruba"
        | "Polish"
        | "Malayalam"
        | "Ukrainian"
        | "Zulu"
        | "Igbo"
        | "Afrikaans"
        | "Ewe"
        | "Twi"
        | "Anufo"
      meeting_platform: "Google Meet" | "WhatsApp" | "Telegram" | "Phone Call"
      notification_category:
        | "all"
        | "unread"
        | "session"
        | "system"
        | "mentorship"
        | "general"
        | "major_update"
      notification_type:
        | "session_booked"
        | "session_cancelled"
        | "session_reminder"
        | "mentor_request"
        | "system_update"
        | "profile_update"
        | "major_update"
        | "hub_invitation_sent"
        | "availability_request"
        | "hub_invite"
        | "hub_membership"
        | "session_update"
        | "reward"
        | "refund"
      onboarding_status:
        | "Pending"
        | "Under Review"
        | "Consent Signed"
        | "Approved"
        | "Rejected"
      opportunity_status:
        | "Active"
        | "Pending"
        | "Closed"
        | "Expired"
        | "Draft"
        | "Rejected"
      opportunity_type:
        | "job"
        | "internship"
        | "scholarship"
        | "fellowship"
        | "grant"
        | "competition"
        | "event"
        | "other"
        | "volunteer"
      personality_question_type:
        | "multiple_choice"
        | "likert_scale"
        | "open_ended"
      profile_type_enum:
        | "middle_school"
        | "high_school"
        | "college"
        | "career_professional"
      project_status: "completed" | "in_progress" | "planned" | "on_hold"
      question_type: "multiple_choice" | "multiple_select" | "scale" | "text"
      recommendation_type: "career" | "major" | "trait"
      resource_access_level: "public" | "members" | "faculty" | "admin"
      resource_type: "document" | "image" | "video" | "audio" | "external_link"
      school_type: "High School" | "College" | "University" | "Other"
      session_type:
        | "Know About my Career"
        | "Resume/CV Review"
        | "Campus France"
        | "Undergrad Application"
        | "Grad Application"
        | "TOEFL Exam Prep Advice"
        | "IELTS Exam Prep Advice"
        | "Duolingo Exam Prep Advice"
        | "SAT Exam Prep Advice"
        | "ACT Exam Prep Advice"
        | "GRE Exam Prep Advice"
        | "GMAT Exam Prep Advice"
        | "MCAT Exam Prep Advice"
        | "LSAT Exam Prep Advice"
        | "DAT Exam Prep Advice"
        | "Advice for PhD Students"
        | "How to Find Grants/Fellowships"
        | "Grant Writing Guidance"
        | "Interview Prep"
        | "How to Succeed as a College Student"
        | "Investment Strategies"
        | "Study Abroad Programs"
        | "Tips for F-1 Students"
        | "College Application Last Review"
        | "Application Essays Review"
        | "I need someone to practice my presentation with"
        | "Study Tips"
        | "Volunteer Opportunities"
        | "Know About my Academic Major"
        | "Custom"
      setting_type:
        | "timezone"
        | "notifications"
        | "language"
        | "theme"
        | "notification_preferences"
        | "language_preference"
        | "session_settings"
        | "privacy_settings"
        | "display_settings"
        | "accessibility_settings"
      states:
        | "Alabama - AL"
        | "Alaska - AK"
        | "Arizona - AZ"
        | "Arkansas - AR"
        | "California - CA"
        | "Colorado - CO"
        | "Connecticut - CT"
        | "Delaware - DE"
        | "Florida - FL"
        | "Georgia - GA"
        | "Hawaii - HI"
        | "Idaho - ID"
        | "Illinois - IL"
        | "Indiana - IN"
        | "Iowa - IA"
        | "Kansas - KS"
        | "Kentucky - KY"
        | "Louisiana - LA"
        | "Maine - ME"
        | "Maryland - MD"
        | "Massachusetts - MA"
        | "Michigan - MI"
        | "Minnesota - MN"
        | "Mississippi - MS"
        | "Missouri - MO"
        | "Montana - MT"
        | "Nebraska - NE"
        | "Nevada - NV"
        | "New Hampshire - NH"
        | "New Jersey - NJ"
        | "New Mexico - NM"
        | "New York - NY"
        | "North Carolina - NC"
        | "North Dakota - ND"
        | "Ohio - OH"
        | "Oklahoma - OK"
        | "Oregon - OR"
        | "Pennsylvania - PA"
        | "Rhode Island - RI"
        | "South Carolina - SC"
        | "South Dakota - SD"
        | "Tennessee - TN"
        | "Texas - TX"
        | "Utah - UT"
        | "Vermont - VT"
        | "Virginia - VA"
        | "Washington - WA"
        | "West Virginia - WV"
        | "Wisconsin - WI"
        | "Wyoming - WY"
        | "Washington DC - DC"
        | "Guam - GU"
        | "U.S. Virgin Islands - VI"
        | "Puerto Rico - PR"
      status: "Approved" | "Pending" | "Rejected"
      student_nonstudent: "Student" | "Non-Student"
      subcategories:
        | "Industry-Specific Career Insights"
        | "Choosing the Right Career Path"
        | "Transitioning Between Careers"
        | "Work-Life Balance Tips"
        | "Career Advancement Strategies"
        | "Crafting a Winning Personal Statement"
        | "Navigating the Application Process"
        | "Preparing for Entrance Exams"
        | "Choosing the Right University"
        | "Scholarship and Financial Aid Advice"
        | "Soft Skills for Professional Success"
        | "Technical Skill Mastery"
        | "Communication Skills Development"
        | "Problem-Solving and Critical Thinking"
        | "Time Management Techniques"
        | "Building Meaningful Connections"
        | "Leveraging LinkedIn and Other Platforms"
        | "Networking for Introverts"
        | "Finding a Mentor"
        | "Professional Event Etiquette"
        | "Crafting an Effective Resume"
        | "Acing Job Interviews"
        | "Finding Internship Opportunities"
        | "Gaining Work Experience in High School"
        | "Navigating Job Portals and Applications"
        | "Creating a Strong Online Presence"
        | "Building a Professional Portfolio"
        | "Social Media for Career Growth"
        | "Establishing Expertise in Your Field"
        | "Branding for Aspiring Entrepreneurs"
        | "Researching International Programs"
        | "Visa Application Guidance"
        | "Adjusting to New Cultures"
        | "Managing Finances Abroad"
        | "Safety Tips for International Students"
        | "Adapting to University Life"
        | "Choosing a Major"
        | "Navigating Academic Expectations"
        | "Developing Independence"
        | "Building New Friendships"
        | "Managing Stress and Anxiety"
        | "Overcoming Imposter Syndrome"
        | "Balancing Academic and Personal Life"
        | "Self-Care Strategies for Students"
        | "Seeking Support When Needed"
        | "Cultivating Emotional Intelligence"
        | "Becoming a Campus Leader"
        | "Decision-Making Skills"
        | "Managing Teams Effectively"
        | "Conflict Resolution Strategies"
        | "Starting a Business in College"
        | "Writing a Business Plan"
        | "Finding Funding for Startups"
        | "Marketing Your Ideas"
        | "Overcoming Entrepreneurial Challenges"
        | "Top Study Tools and Apps"
        | "Online Learning Platforms"
        | "Using Libraries Effectively"
        | "Exam Preparation Guides"
        | "Developing Effective Study Habits"
        | "Addressing Bias in Academia and Workplaces"
        | "Supporting Underrepresented Groups"
        | "Building Inclusive Communities"
        | "Overcoming Barriers to Opportunity"
        | "Celebrating Cultural Differences"
        | "Encouraging STEM in Schools"
        | "Exploring Careers in Technology"
        | "Women in STEM"
        | "Robotics and Coding for Beginners"
        | "Research Opportunities in STEM Fields"
        | "Exploring Creative Career Paths"
        | "Building a Career in Writing"
        | "Career Options for History Majors"
        | "Monetizing Artistic Talents"
        | "Pursuing Higher Education in the Arts"
        | "Budgeting for Students"
        | "Managing Student Loans"
        | "Saving for the Future"
        | "Understanding Credit and Debt"
        | "Finding Part-Time Jobs as a Student"
        | "Finding Volunteer Opportunities"
        | "Benefits of Community Involvement"
        | "Organizing Campus Charity Events"
        | "Highlighting Volunteer Work in Applications"
        | "Making a Difference Locally and Globally"
        | "Essential Tech Skills for the Workplace"
        | "Leveraging AI in Career Planning"
        | "Artificial Intelligence"
        | "Machine Learning"
        | "Best Apps for Productivity"
        | "Using Technology for Collaboration"
        | "Staying Updated on Industry Trends"
        | "Alumni Career Journeys"
        | "Inspirational Mentor-Student Relationships"
        | "Overcoming Academic and Career Challenges"
        | "Students Who Made a Difference"
        | "First-Generation College Graduates"
        | "Benefits of Joining Clubs and Societies"
        | "Sports and Physical Wellbeing"
        | "Exploring Creative Hobbies"
        | "How Extracurriculars Boost Applications"
        | "Starting Your Own Club or Organization"
      transaction_category:
        | "purchase"
        | "session"
        | "content"
        | "refund"
        | "adjustment"
        | "bonus"
      transaction_status: "pending" | "completed" | "failed" | "cancelled"
      transaction_type: "credit" | "debit" | "refund" | "adjustment" | "bonus"
      user_type:
        | "mentor"
        | "mentee"
        | "admin"
        | "editor"
        | "organization_admin"
        | "organization_developer"
        | "organization_viewer"
      webinar_platform: "Google Meet" | "Zoom"
      "where did you hear about us":
        | "Instagram"
        | "Facebook"
        | "TikTok"
        | "LinkedIn"
        | "X (Twitter)"
        | "WhatsApp"
        | "YouTube"
        | "Search Engine (Google, Bing...)"
        | "RedNote"
        | "Friend/Family"
        | "Other"
        | "Career Fair"
        | "Professional Network/Association"
        | "Alumni Network"
        | "Google Search"
        | "Other Search Engine"
        | "Email Newsletter"
        | "Blog/Article"
        | "Podcast"
        | "Online Advertisement"
        | "Website"
        | "Mobile App"
        | "QR Code"
        | "Snapchat"
        | "Reddit"
        | "Discord"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      academic_status: [
        "current_student",
        "gap_year",
        "graduated",
        "transfer_student",
        "prospective_student",
      ],
      announcement_category: ["event", "news", "alert", "general"],
      api_environment: ["sandbox", "production"],
      api_subscription_tier: ["free", "basic", "professional", "enterprise"],
      application_status: [
        "Not Applied",
        "Applied",
        "In Progress",
        "Accepted",
        "Rejected",
        "Withdrawn",
      ],
      assessment_status: ["in_progress", "completed"],
      audit_action: [
        "member_added",
        "member_removed",
        "member_role_changed",
        "hub_settings_updated",
        "announcement_created",
        "announcement_updated",
        "announcement_deleted",
        "resource_added",
        "resource_removed",
        "department_created",
        "department_updated",
        "department_deleted",
        "member_invitation_sent",
        "member_invitation_cancelled",
        "member_role_updated",
        "branding_updated",
        "member_confirmed",
        "confirmed_hub_membership",
      ],
      campaign_status: ["pending", "sending", "sent", "failed", "partial"],
      categories: [
        "Technology",
        "Digital Tools",
        "Extracurricular Activities",
        "Success Stories",
        "Volunteerism",
        "Community Service",
        "Entrepreneurship",
        "Financial Literacy",
        "Arts Careers",
        "STEM Education",
        "STEM Careers",
        "Humanities Careers",
        "Diversity and Inclusion",
        "Educational Resources",
        "Leadership Development",
        "Mental Health",
        "Wellbeing",
        "High School to University Transition",
        "Study Abroad Preparation",
        "Personal Branding",
        "Internship and Job Search",
        "Networking Strategies",
        "Skill Development",
        "University Admissions",
        "Career Guidance",
      ],
      chat_reaction_type: [
        "thumbs-up",
        "thumbs-down",
        "heart",
        "smile",
        "laugh",
        "angry",
        "frown",
        "meh",
      ],
      chat_room_type: ["public", "private"],
      country: [
        "Afghanistan",
        "Albania",
        "Algeria",
        "Andorra",
        "Angola",
        "Antigua and Barbuda",
        "Argentina",
        "Armenia",
        "Australia",
        "Austria",
        "Azerbaijan",
        "Bahamas",
        "Bahrain",
        "Bangladesh",
        "Barbados",
        "Belarus",
        "Belgium",
        "Belize",
        "Benin",
        "Bhutan",
        "Bolivia",
        "Bosnia and Herzegovina",
        "Botswana",
        "Brazil",
        "Brunei",
        "Bulgaria",
        "Burkina Faso",
        "Burundi",
        "Cabo Verde",
        "Cambodia",
        "Cameroon",
        "Canada",
        "Central African Republic",
        "Chad",
        "Chile",
        "China",
        "Colombia",
        "Comoros",
        "Congo",
        "Costa Rica",
        "Croatia",
        "Cuba",
        "Cyprus",
        "Czech Republic",
        "Denmark",
        "Djibouti",
        "Dominica",
        "Dominican Republic",
        "East Timor",
        "Ecuador",
        "Egypt",
        "El Salvador",
        "Equatorial Guinea",
        "Eritrea",
        "Estonia",
        "Eswatini",
        "Ethiopia",
        "Fiji",
        "Finland",
        "France",
        "Gabon",
        "Gambia",
        "Georgia",
        "Germany",
        "Ghana",
        "Greece",
        "Grenada",
        "Guatemala",
        "Guinea",
        "Guinea-Bissau",
        "Guyana",
        "Haiti",
        "Honduras",
        "Hungary",
        "Iceland",
        "India",
        "Indonesia",
        "Iran",
        "Iraq",
        "Ireland",
        "Israel",
        "Italy",
        "Ivory Coast",
        "Jamaica",
        "Japan",
        "Jordan",
        "Kazakhstan",
        "Kenya",
        "Kiribati",
        "Kuwait",
        "Kyrgyzstan",
        "Laos",
        "Latvia",
        "Lebanon",
        "Lesotho",
        "Liberia",
        "Libya",
        "Liechtenstein",
        "Lithuania",
        "Luxembourg",
        "Madagascar",
        "Malawi",
        "Malaysia",
        "Maldives",
        "Mali",
        "Malta",
        "Marshall Islands",
        "Mauritania",
        "Mauritius",
        "Mexico",
        "Micronesia",
        "Moldova",
        "Monaco",
        "Mongolia",
        "Montenegro",
        "Morocco",
        "Mozambique",
        "Myanmar",
        "Namibia",
        "Nauru",
        "Nepal",
        "Netherlands",
        "New Zealand",
        "Nicaragua",
        "Niger",
        "Nigeria",
        "North Korea",
        "North Macedonia",
        "Norway",
        "Oman",
        "Pakistan",
        "Palau",
        "Palestine",
        "Panama",
        "Papua New Guinea",
        "Paraguay",
        "Peru",
        "Philippines",
        "Poland",
        "Portugal",
        "Qatar",
        "Romania",
        "Russia",
        "Rwanda",
        "Saint Kitts and Nevis",
        "Saint Lucia",
        "Saint Vincent and the Grenadines",
        "Samoa",
        "San Marino",
        "Sao Tome and Principe",
        "Saudi Arabia",
        "Senegal",
        "Serbia",
        "Seychelles",
        "Sierra Leone",
        "Singapore",
        "Slovakia",
        "Slovenia",
        "Solomon Islands",
        "Somalia",
        "South Africa",
        "South Korea",
        "South Sudan",
        "Spain",
        "Sri Lanka",
        "Sudan",
        "Suriname",
        "Sweden",
        "Switzerland",
        "Syria",
        "Taiwan",
        "Tajikistan",
        "Tanzania",
        "Thailand",
        "Togo",
        "Tonga",
        "Trinidad and Tobago",
        "Tunisia",
        "Turkey",
        "Turkmenistan",
        "Tuvalu",
        "Uganda",
        "Ukraine",
        "United Arab Emirates",
        "United Kingdom",
        "United States",
        "Uruguay",
        "Uzbekistan",
        "Vanuatu",
        "Vatican City",
        "Venezuela",
        "Vietnam",
        "Yemen",
        "Zambia",
        "Zimbabwe",
        "Democratic Republic of Congo",
      ],
      course_status: ["completed", "in_progress", "planned", "dropped"],
      degree: [
        "No Degree",
        "High School",
        "Associate",
        "Bachelor",
        "Master",
        "PhD",
        "MD",
      ],
      dichotomies: [
        "Introversion (I)",
        "Extraversion (E)",
        "Sensing (S)",
        "Intuition (N)",
        "Thinking (T)",
        "Feeling (F)",
        "Judging (J)",
        "Perceiving (P)",
      ],
      document_type: ["pdf", "word", "powerpoint", "excel", "other"],
      email_content_section: ["header", "intro", "cta", "footer"],
      essay_prompt_category: [
        "college_application",
        "scholarship",
        "personal_statement",
        "supplemental",
        "creative_writing",
        "academic_reflection",
      ],
      event_types: ["Coffee Time", "Hackathon", "Panel", "Webinar", "Workshop"],
      feedback_type: ["mentor_feedback", "mentee_feedback"],
      hub_member_role: ["admin", "moderator", "member", "faculty", "student"],
      hub_type: ["University", "NGO", "Organization", "High School"],
      interaction_type: [
        "page_view",
        "click",
        "search",
        "bookmark",
        "content_view",
      ],
      interest_category: [
        "career",
        "academic",
        "extracurricular",
        "hobby",
        "industry",
        "skill",
      ],
      language: [
        "English",
        "Spanish",
        "French",
        "Chinese",
        "Hindi",
        "Arabic",
        "Bengali",
        "Portuguese",
        "Russian",
        "German",
        "Japanese",
        "Nigerian Pidgin",
        "Turkish",
        "Hausa",
        "Swahili",
        "Vietnamese",
        "Korean",
        "Italian",
        "Thai",
        "Marathi",
        "Yoruba",
        "Polish",
        "Malayalam",
        "Ukrainian",
        "Zulu",
        "Igbo",
        "Afrikaans",
        "Ewe",
        "Twi",
        "Anufo",
      ],
      meeting_platform: ["Google Meet", "WhatsApp", "Telegram", "Phone Call"],
      notification_category: [
        "all",
        "unread",
        "session",
        "system",
        "mentorship",
        "general",
        "major_update",
      ],
      notification_type: [
        "session_booked",
        "session_cancelled",
        "session_reminder",
        "mentor_request",
        "system_update",
        "profile_update",
        "major_update",
        "hub_invitation_sent",
        "availability_request",
        "hub_invite",
        "hub_membership",
        "session_update",
        "reward",
        "refund",
      ],
      onboarding_status: [
        "Pending",
        "Under Review",
        "Consent Signed",
        "Approved",
        "Rejected",
      ],
      opportunity_status: [
        "Active",
        "Pending",
        "Closed",
        "Expired",
        "Draft",
        "Rejected",
      ],
      opportunity_type: [
        "job",
        "internship",
        "scholarship",
        "fellowship",
        "grant",
        "competition",
        "event",
        "other",
        "volunteer",
      ],
      personality_question_type: [
        "multiple_choice",
        "likert_scale",
        "open_ended",
      ],
      profile_type_enum: [
        "middle_school",
        "high_school",
        "college",
        "career_professional",
      ],
      project_status: ["completed", "in_progress", "planned", "on_hold"],
      question_type: ["multiple_choice", "multiple_select", "scale", "text"],
      recommendation_type: ["career", "major", "trait"],
      resource_access_level: ["public", "members", "faculty", "admin"],
      resource_type: ["document", "image", "video", "audio", "external_link"],
      school_type: ["High School", "College", "University", "Other"],
      session_type: [
        "Know About my Career",
        "Resume/CV Review",
        "Campus France",
        "Undergrad Application",
        "Grad Application",
        "TOEFL Exam Prep Advice",
        "IELTS Exam Prep Advice",
        "Duolingo Exam Prep Advice",
        "SAT Exam Prep Advice",
        "ACT Exam Prep Advice",
        "GRE Exam Prep Advice",
        "GMAT Exam Prep Advice",
        "MCAT Exam Prep Advice",
        "LSAT Exam Prep Advice",
        "DAT Exam Prep Advice",
        "Advice for PhD Students",
        "How to Find Grants/Fellowships",
        "Grant Writing Guidance",
        "Interview Prep",
        "How to Succeed as a College Student",
        "Investment Strategies",
        "Study Abroad Programs",
        "Tips for F-1 Students",
        "College Application Last Review",
        "Application Essays Review",
        "I need someone to practice my presentation with",
        "Study Tips",
        "Volunteer Opportunities",
        "Know About my Academic Major",
        "Custom",
      ],
      setting_type: [
        "timezone",
        "notifications",
        "language",
        "theme",
        "notification_preferences",
        "language_preference",
        "session_settings",
        "privacy_settings",
        "display_settings",
        "accessibility_settings",
      ],
      states: [
        "Alabama - AL",
        "Alaska - AK",
        "Arizona - AZ",
        "Arkansas - AR",
        "California - CA",
        "Colorado - CO",
        "Connecticut - CT",
        "Delaware - DE",
        "Florida - FL",
        "Georgia - GA",
        "Hawaii - HI",
        "Idaho - ID",
        "Illinois - IL",
        "Indiana - IN",
        "Iowa - IA",
        "Kansas - KS",
        "Kentucky - KY",
        "Louisiana - LA",
        "Maine - ME",
        "Maryland - MD",
        "Massachusetts - MA",
        "Michigan - MI",
        "Minnesota - MN",
        "Mississippi - MS",
        "Missouri - MO",
        "Montana - MT",
        "Nebraska - NE",
        "Nevada - NV",
        "New Hampshire - NH",
        "New Jersey - NJ",
        "New Mexico - NM",
        "New York - NY",
        "North Carolina - NC",
        "North Dakota - ND",
        "Ohio - OH",
        "Oklahoma - OK",
        "Oregon - OR",
        "Pennsylvania - PA",
        "Rhode Island - RI",
        "South Carolina - SC",
        "South Dakota - SD",
        "Tennessee - TN",
        "Texas - TX",
        "Utah - UT",
        "Vermont - VT",
        "Virginia - VA",
        "Washington - WA",
        "West Virginia - WV",
        "Wisconsin - WI",
        "Wyoming - WY",
        "Washington DC - DC",
        "Guam - GU",
        "U.S. Virgin Islands - VI",
        "Puerto Rico - PR",
      ],
      status: ["Approved", "Pending", "Rejected"],
      student_nonstudent: ["Student", "Non-Student"],
      subcategories: [
        "Industry-Specific Career Insights",
        "Choosing the Right Career Path",
        "Transitioning Between Careers",
        "Work-Life Balance Tips",
        "Career Advancement Strategies",
        "Crafting a Winning Personal Statement",
        "Navigating the Application Process",
        "Preparing for Entrance Exams",
        "Choosing the Right University",
        "Scholarship and Financial Aid Advice",
        "Soft Skills for Professional Success",
        "Technical Skill Mastery",
        "Communication Skills Development",
        "Problem-Solving and Critical Thinking",
        "Time Management Techniques",
        "Building Meaningful Connections",
        "Leveraging LinkedIn and Other Platforms",
        "Networking for Introverts",
        "Finding a Mentor",
        "Professional Event Etiquette",
        "Crafting an Effective Resume",
        "Acing Job Interviews",
        "Finding Internship Opportunities",
        "Gaining Work Experience in High School",
        "Navigating Job Portals and Applications",
        "Creating a Strong Online Presence",
        "Building a Professional Portfolio",
        "Social Media for Career Growth",
        "Establishing Expertise in Your Field",
        "Branding for Aspiring Entrepreneurs",
        "Researching International Programs",
        "Visa Application Guidance",
        "Adjusting to New Cultures",
        "Managing Finances Abroad",
        "Safety Tips for International Students",
        "Adapting to University Life",
        "Choosing a Major",
        "Navigating Academic Expectations",
        "Developing Independence",
        "Building New Friendships",
        "Managing Stress and Anxiety",
        "Overcoming Imposter Syndrome",
        "Balancing Academic and Personal Life",
        "Self-Care Strategies for Students",
        "Seeking Support When Needed",
        "Cultivating Emotional Intelligence",
        "Becoming a Campus Leader",
        "Decision-Making Skills",
        "Managing Teams Effectively",
        "Conflict Resolution Strategies",
        "Starting a Business in College",
        "Writing a Business Plan",
        "Finding Funding for Startups",
        "Marketing Your Ideas",
        "Overcoming Entrepreneurial Challenges",
        "Top Study Tools and Apps",
        "Online Learning Platforms",
        "Using Libraries Effectively",
        "Exam Preparation Guides",
        "Developing Effective Study Habits",
        "Addressing Bias in Academia and Workplaces",
        "Supporting Underrepresented Groups",
        "Building Inclusive Communities",
        "Overcoming Barriers to Opportunity",
        "Celebrating Cultural Differences",
        "Encouraging STEM in Schools",
        "Exploring Careers in Technology",
        "Women in STEM",
        "Robotics and Coding for Beginners",
        "Research Opportunities in STEM Fields",
        "Exploring Creative Career Paths",
        "Building a Career in Writing",
        "Career Options for History Majors",
        "Monetizing Artistic Talents",
        "Pursuing Higher Education in the Arts",
        "Budgeting for Students",
        "Managing Student Loans",
        "Saving for the Future",
        "Understanding Credit and Debt",
        "Finding Part-Time Jobs as a Student",
        "Finding Volunteer Opportunities",
        "Benefits of Community Involvement",
        "Organizing Campus Charity Events",
        "Highlighting Volunteer Work in Applications",
        "Making a Difference Locally and Globally",
        "Essential Tech Skills for the Workplace",
        "Leveraging AI in Career Planning",
        "Artificial Intelligence",
        "Machine Learning",
        "Best Apps for Productivity",
        "Using Technology for Collaboration",
        "Staying Updated on Industry Trends",
        "Alumni Career Journeys",
        "Inspirational Mentor-Student Relationships",
        "Overcoming Academic and Career Challenges",
        "Students Who Made a Difference",
        "First-Generation College Graduates",
        "Benefits of Joining Clubs and Societies",
        "Sports and Physical Wellbeing",
        "Exploring Creative Hobbies",
        "How Extracurriculars Boost Applications",
        "Starting Your Own Club or Organization",
      ],
      transaction_category: [
        "purchase",
        "session",
        "content",
        "refund",
        "adjustment",
        "bonus",
      ],
      transaction_status: ["pending", "completed", "failed", "cancelled"],
      transaction_type: ["credit", "debit", "refund", "adjustment", "bonus"],
      user_type: [
        "mentor",
        "mentee",
        "admin",
        "editor",
        "organization_admin",
        "organization_developer",
        "organization_viewer",
      ],
      webinar_platform: ["Google Meet", "Zoom"],
      "where did you hear about us": [
        "Instagram",
        "Facebook",
        "TikTok",
        "LinkedIn",
        "X (Twitter)",
        "WhatsApp",
        "YouTube",
        "Search Engine (Google, Bing...)",
        "RedNote",
        "Friend/Family",
        "Other",
        "Career Fair",
        "Professional Network/Association",
        "Alumni Network",
        "Google Search",
        "Other Search Engine",
        "Email Newsletter",
        "Blog/Article",
        "Podcast",
        "Online Advertisement",
        "Website",
        "Mobile App",
        "QR Code",
        "Snapchat",
        "Reddit",
        "Discord",
      ],
    },
  },
} as const
