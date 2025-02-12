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
      event_registrations: {
        Row: {
          country: Database["public"]["Enums"]["country"] | null
          created_at: string
          "current academic field/position": string
          "current school/company": string
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
          "current school/company": string
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
          "current school/company"?: string
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
      hub_announcements: {
        Row: {
          category: Database["public"]["Enums"]["announcement_category"] | null
          content: string
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
      hub_member_invites: {
        Row: {
          created_at: string
          expires_at: string
          hub_id: string
          id: string
          invited_by: string
          invited_email: string
          role: Database["public"]["Enums"]["hub_member_role"]
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          hub_id: string
          id?: string
          invited_by: string
          invited_email: string
          role?: Database["public"]["Enums"]["hub_member_role"]
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          hub_id?: string
          id?: string
          invited_by?: string
          invited_email?: string
          role?: Database["public"]["Enums"]["hub_member_role"]
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hub_member_invites_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_member_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_members: {
        Row: {
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
      hub_resources: {
        Row: {
          access_level:
            | Database["public"]["Enums"]["resource_access_level"]
            | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          file_url: string
          hub_id: string | null
          id: string
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          access_level?:
            | Database["public"]["Enums"]["resource_access_level"]
            | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url: string
          hub_id?: string | null
          id?: string
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          access_level?:
            | Database["public"]["Enums"]["resource_access_level"]
            | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url?: string
          hub_id?: string | null
          id?: string
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
      hubs: {
        Row: {
          apply_now_URL: string | null
          banner_url: string | null
          brand_colors: Json | null
          contact_info: Json | null
          created_at: string | null
          description: string | null
          id: string
          important_links: Json | null
          logo_url: string | null
          name: string
          social_links: Json | null
          status: Database["public"]["Enums"]["status"] | null
          type: Database["public"]["Enums"]["hub_type"]
          updated_at: string | null
          website: string | null
        }
        Insert: {
          apply_now_URL?: string | null
          banner_url?: string | null
          brand_colors?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          important_links?: Json | null
          logo_url?: string | null
          name: string
          social_links?: Json | null
          status?: Database["public"]["Enums"]["status"] | null
          type: Database["public"]["Enums"]["hub_type"]
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          apply_now_URL?: string | null
          banner_url?: string | null
          brand_colors?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          important_links?: Json | null
          logo_url?: string | null
          name?: string
          social_links?: Json | null
          status?: Database["public"]["Enums"]["status"] | null
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
      mentor_availability: {
        Row: {
          created_at: string
          day_of_week: number | null
          end_date_time: string | null
          id: string
          is_available: boolean | null
          profile_id: string
          recurring: boolean | null
          start_date_time: string | null
          timezone_offset: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          end_date_time?: string | null
          id?: string
          is_available?: boolean | null
          profile_id: string
          recurring?: boolean | null
          start_date_time?: string | null
          timezone_offset: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          end_date_time?: string | null
          id?: string
          is_available?: boolean | null
          profile_id?: string
          recurring?: boolean | null
          start_date_time?: string | null
          timezone_offset?: number
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
          attendance_confirmed: boolean | null
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
          attendance_confirmed?: boolean | null
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
          attendance_confirmed?: boolean | null
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
          {
            foreignKeyName: "personality_dimension_scores_test_result_id_fkey"
            columns: ["test_result_id"]
            isOneToOne: false
            referencedRelation: "personality_test_results"
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
      personality_test_responses: {
        Row: {
          answer: string
          created_at: string
          id: string
          profile_id: string
          question_id: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          profile_id: string
          question_id: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          profile_id?: string
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "personality_test_responses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personality_test_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "personality_test_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      personality_test_results: {
        Row: {
          career_matches: Json
          created_at: string
          id: string
          major_matches: Json
          personality_traits: Json
          profile_id: string
          raw_analysis: string | null
          skill_development: Json | null
          updated_at: string
        }
        Insert: {
          career_matches: Json
          created_at?: string
          id?: string
          major_matches: Json
          personality_traits: Json
          profile_id: string
          raw_analysis?: string | null
          skill_development?: Json | null
          updated_at?: string
        }
        Update: {
          career_matches?: Json
          created_at?: string
          id?: string
          major_matches?: Json
          personality_traits?: Json
          profile_id?: string
          raw_analysis?: string | null
          skill_development?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "personality_test_results_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          avatar_url: string | null
          bio: string | null
          company_id: string | null
          created_at: string
          email: string
          facebook_url: string | null
          fields_of_interest: string[] | null
          first_name: string | null
          full_name: string | null
          github_url: string | null
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
          tiktok_url: string | null
          tools_used: string[] | null
          top_mentor: boolean | null
          total_booked_sessions: number | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"] | null
          website_url: string | null
          X_url: string | null
          years_of_experience: number | null
          youtube_url: string | null
        }
        Insert: {
          academic_major_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_id?: string | null
          created_at?: string
          email: string
          facebook_url?: string | null
          fields_of_interest?: string[] | null
          first_name?: string | null
          full_name?: string | null
          github_url?: string | null
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
          tiktok_url?: string | null
          tools_used?: string[] | null
          top_mentor?: boolean | null
          total_booked_sessions?: number | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          website_url?: string | null
          X_url?: string | null
          years_of_experience?: number | null
          youtube_url?: string | null
        }
        Update: {
          academic_major_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_id?: string | null
          created_at?: string
          email?: string
          facebook_url?: string | null
          fields_of_interest?: string[] | null
          first_name?: string | null
          full_name?: string | null
          github_url?: string | null
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
          tiktok_url?: string | null
          tools_used?: string[] | null
          top_mentor?: boolean | null
          total_booked_sessions?: number | null
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
      scholarships: {
        Row: {
          created_at: string
          id: number
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      schools: {
        Row: {
          acceptance_rate: number | null
          country: Database["public"]["Enums"]["country"] | null
          created_at: string
          id: string
          location: string | null
          name: string
          state: Database["public"]["Enums"]["states"] | null
          status: Database["public"]["Enums"]["status"] | null
          type: Database["public"]["Enums"]["school_type"] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          acceptance_rate?: number | null
          country?: Database["public"]["Enums"]["country"] | null
          created_at?: string
          id?: string
          location?: string | null
          name: string
          state?: Database["public"]["Enums"]["states"] | null
          status?: Database["public"]["Enums"]["status"] | null
          type?: Database["public"]["Enums"]["school_type"] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          acceptance_rate?: number | null
          country?: Database["public"]["Enums"]["country"] | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          state?: Database["public"]["Enums"]["states"] | null
          status?: Database["public"]["Enums"]["status"] | null
          type?: Database["public"]["Enums"]["school_type"] | null
          updated_at?: string
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
          feedback_type: Database["public"]["Enums"]["feedback_type"]
          from_profile_id: string
          id: string
          notes: string | null
          rating: number
          recommend: boolean | null
          session_id: string
          to_profile_id: string
        }
        Insert: {
          created_at?: string
          feedback_type: Database["public"]["Enums"]["feedback_type"]
          from_profile_id: string
          id?: string
          notes?: string | null
          rating: number
          recommend?: boolean | null
          session_id: string
          to_profile_id: string
        }
        Update: {
          created_at?: string
          feedback_type?: Database["public"]["Enums"]["feedback_type"]
          from_profile_id?: string
          id?: string
          notes?: string | null
          rating?: number
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
          created_at: string
          description: string | null
          id: string
          related_entity_id: string | null
          related_entity_type: string | null
          transaction_type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          transaction_type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
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
      [_ in never]: never
    }
    Functions: {
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
      generate_personality_test_mappings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      is_hub_member: {
        Args: {
          hub_id: string
        }
        Returns: boolean
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
      refresh_personality_test_mappings: {
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
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
      update_careers_profiles_count: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      announcement_category: "event" | "news" | "alert" | "general"
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
      onboarding_status:
        | "Pending"
        | "Under Review"
        | "Consent Signed"
        | "Approved"
        | "Rejected"
      personality_question_type:
        | "multiple_choice"
        | "likert_scale"
        | "open_ended"
      recommendation_type: "career" | "major" | "trait"
      resource_access_level: "public" | "members" | "faculty" | "admin"
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
      setting_type:
        | "timezone"
        | "notifications"
        | "language"
        | "theme"
        | "notification_preferences"
        | "language_preference"
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
      user_type: "mentor" | "mentee" | "admin" | "editor"
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
