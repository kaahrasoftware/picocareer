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
          category: string | null
          created_at: string | null
          description: string
          featured: boolean | null
          id: number
          image_url: string
          level_of_study: string | null
          related_careers: string[]
          related_majors: string[]
          salary: string
          skills: string[]
          title: string
          users: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          featured?: boolean | null
          id?: number
          image_url: string
          level_of_study?: string | null
          related_careers?: string[]
          related_majors?: string[]
          salary: string
          skills?: string[]
          title: string
          users: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          featured?: boolean | null
          id?: number
          image_url?: string
          level_of_study?: string | null
          related_careers?: string[]
          related_majors?: string[]
          salary?: string
          skills?: string[]
          title?: string
          users?: string
        }
        Relationships: []
      }
      majors: {
        Row: {
          average_gpa: string
          category: string | null
          created_at: string | null
          description: string
          featured: boolean | null
          id: number
          image_url: string
          level_of_study: string | null
          related_careers: string[]
          required_courses: string[]
          title: string
          users: string
        }
        Insert: {
          average_gpa: string
          category?: string | null
          created_at?: string | null
          description: string
          featured?: boolean | null
          id?: number
          image_url: string
          level_of_study?: string | null
          related_careers?: string[]
          required_courses?: string[]
          title: string
          users: string
        }
        Update: {
          average_gpa?: string
          category?: string | null
          created_at?: string | null
          description?: string
          featured?: boolean | null
          id?: number
          image_url?: string
          level_of_study?: string | null
          related_careers?: string[]
          required_courses?: string[]
          title?: string
          users?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          content: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          mentor_id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          mentor_id: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          mentor_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          bio: string | null
          company: string
          created_at: string | null
          education: string | null
          email: string | null
          id: string
          image_url: string
          keywords: string[] | null
          name: string
          password: string
          position: string | null
          sessions_held: string | null
          skills: string[] | null
          stats: Json
          title: string
          tools: string[] | null
          top_rated: boolean | null
          user_type: string | null
          username: string
        }
        Insert: {
          bio?: string | null
          company: string
          created_at?: string | null
          education?: string | null
          email?: string | null
          id?: string
          image_url: string
          keywords?: string[] | null
          name: string
          password?: string
          position?: string | null
          sessions_held?: string | null
          skills?: string[] | null
          stats?: Json
          title: string
          tools?: string[] | null
          top_rated?: boolean | null
          user_type?: string | null
          username: string
        }
        Update: {
          bio?: string | null
          company?: string
          created_at?: string | null
          education?: string | null
          email?: string | null
          id?: string
          image_url?: string
          keywords?: string[] | null
          name?: string
          password?: string
          position?: string | null
          sessions_held?: string | null
          skills?: string[] | null
          stats?: Json
          title?: string
          tools?: string[] | null
          top_rated?: boolean | null
          user_type?: string | null
          username?: string
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
