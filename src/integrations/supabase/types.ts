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
          careers_to_consider_switching_to: string[] | null
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
          transferable_skills: string[] | null
          updated_at: string
          work_environment: string | null
        }
        Insert: {
          academic_majors?: string[] | null
          careers_to_consider_switching_to?: string[] | null
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
          transferable_skills?: string[] | null
          updated_at?: string
          work_environment?: string | null
        }
        Update: {
          academic_majors?: string[] | null
          careers_to_consider_switching_to?: string[] | null
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
          transferable_skills?: string[] | null
          updated_at?: string
          work_environment?: string | null
        }
        Relationships: []
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
      majors: {
        Row: {
          affiliated_programs: string[] | null
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
          tools_knowledge: string[] | null
          transferable_skills: string[] | null
          updated_at: string
        }
        Insert: {
          affiliated_programs?: string[] | null
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
          tools_knowledge?: string[] | null
          transferable_skills?: string[] | null
          updated_at?: string
        }
        Update: {
          affiliated_programs?: string[] | null
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
          tools_knowledge?: string[] | null
          transferable_skills?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      mentor_availability: {
        Row: {
          created_at: string
          date_available: string
          day_of_week: number | null
          end_time: string
          id: string
          is_available: boolean | null
          profile_id: string
          recurring: boolean | null
          start_time: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_available: string
          day_of_week?: number | null
          end_time: string
          id?: string
          is_available?: boolean | null
          profile_id: string
          recurring?: boolean | null
          start_time: string
          timezone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_available?: string
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_available?: boolean | null
          profile_id?: string
          recurring?: boolean | null
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
      notifications: {
        Row: {
          action_url: string | null
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
      profiles: {
        Row: {
          academic_major_id: string | null
          avatar_url: string | null
          bio: string | null
          company_id: string | null
          created_at: string
          email: string
          fields_of_interest: string[] | null
          first_name: string | null
          full_name: string | null
          github_url: string | null
          highest_degree: Database["public"]["Enums"]["degree"] | null
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
          total_booked_sessions: number | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"] | null
          website_url: string | null
          years_of_experience: number | null
        }
        Insert: {
          academic_major_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_id?: string | null
          created_at?: string
          email: string
          fields_of_interest?: string[] | null
          first_name?: string | null
          full_name?: string | null
          github_url?: string | null
          highest_degree?: Database["public"]["Enums"]["degree"] | null
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
          total_booked_sessions?: number | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          website_url?: string | null
          years_of_experience?: number | null
        }
        Update: {
          academic_major_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_id?: string | null
          created_at?: string
          email?: string
          fields_of_interest?: string[] | null
          first_name?: string | null
          full_name?: string | null
          github_url?: string | null
          highest_degree?: Database["public"]["Enums"]["degree"] | null
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
          total_booked_sessions?: number | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          website_url?: string | null
          years_of_experience?: number | null
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
          created_at: string
          id: string
          location: Database["public"]["Enums"]["states"] | null
          name: string
          status: Database["public"]["Enums"]["status"] | null
          type: Database["public"]["Enums"]["school_type"] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          location?: Database["public"]["Enums"]["states"] | null
          name: string
          status?: Database["public"]["Enums"]["status"] | null
          type?: Database["public"]["Enums"]["school_type"] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          location?: Database["public"]["Enums"]["states"] | null
          name?: string
          status?: Database["public"]["Enums"]["status"] | null
          type?: Database["public"]["Enums"]["school_type"] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_old_notifications: {
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
      degree:
        | "No Degree"
        | "High School"
        | "Associate"
        | "Bachelor"
        | "Master"
        | "MD"
        | "PhD"
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
      notification_type:
        | "session_booked"
        | "session_cancelled"
        | "session_reminder"
        | "profile_update"
        | "mentor_request"
        | "blog_posted"
      school_type: "High School" | "Community College" | "University" | "Other"
      session_type:
        | "Introduction"
        | "Quick-Advice"
        | "Walkthrough"
        | "Group (2-3 Mentees)"
        | "Group (4-6 Mentees)"
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
