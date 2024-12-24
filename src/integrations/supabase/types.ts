import { Profile } from '@/types/database/profiles';
import { Career } from '@/types/database/careers';
import { RelationsTables } from '@/types/database/relations';

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
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      careers: {
        Row: Career;
        Insert: Omit<Career, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Career, 'id'>>;
      };
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
          subcategories?: Database["public"]["Enums"]["subcategories"][] | null
          summary?: string
          title?: string
          updated_at?: string
        }
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
      }
      companies: {
        Row: {
          created_at: string
          id: string
          industry: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          industry?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          industry?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
      }
      majors: {
        Row: {
          affiliated_programs: string[] | null
          career_opportunities: string[] | null
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
          stress_level: string | null
          title: string
          tools_knowledge: string[] | null
          transferable_skills: string[] | null
          updated_at: string
        }
        Insert: {
          affiliated_programs?: string[] | null
          career_opportunities?: string[] | null
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
          stress_level?: string | null
          title: string
          tools_knowledge?: string[] | null
          transferable_skills?: string[] | null
          updated_at?: string
        }
        Update: {
          affiliated_programs?: string[] | null
          career_opportunities?: string[] | null
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
          stress_level?: string | null
          title?: string
          tools_knowledge?: string[] | null
          transferable_skills?: string[] | null
          updated_at?: string
        }
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
      }
      schools: {
        Row: {
          created_at: string
          id: string
          location: Database["public"]["Enums"]["states"] | null
          name: string
          type: Database["public"]["Enums"]["school_type"] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          location?: Database["public"]["Enums"]["states"] | null
          name: string
          type?: Database["public"]["Enums"]["school_type"] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          location?: Database["public"]["Enums"]["states"] | null
          name?: string
          type?: Database["public"]["Enums"]["school_type"] | null
          updated_at?: string
          website?: string | null
        }
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
      }
      videos: {
        Row: {
          author_id: string
          created_at: string
          description: string | null
          duration: number
          id: string
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
          tags?: string[]
          thumbnail_url?: string | null
          title?: string
          total_views?: number
          total_watch_time?: number
          updated_at?: string
          video_url?: string
        }
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
      match_careers_with_majors: {
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
      user_type: "mentor" | "mentee"
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