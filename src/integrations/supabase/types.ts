```typescript
import type { Database as DatabaseGenerated } from './types.generated';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database extends DatabaseGenerated {
  public: {
    Tables: {
      blogs: {
        Row: {
          id: string;
          title: string;
          content: string;
          summary: string | null;
          author_id: string | null;
          categories: string[] | null;
          subcategories: string[] | null;
          published: boolean | null;
          featured: boolean | null;
          is_recent: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          summary?: string | null;
          author_id?: string | null;
          categories?: string[] | null;
          subcategories?: string[] | null;
          published?: boolean | null;
          featured?: boolean | null;
          is_recent?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          summary?: string | null;
          author_id?: string | null;
          categories?: string[] | null;
          subcategories?: string[] | null;
          published?: boolean | null;
          featured?: boolean | null;
          is_recent?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "blogs_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ];
      };
      careers: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          industry: string | null;
          salary_range: string | null;
          average_salary: number | null;
          potential_salary: number | null;
          tuition_and_fees: number | null;
          intensity: number | null;
          stress_levels: number | null;
          dropout_rates: number | null;
          required_education: string[] | null;
          degree_levels: string[] | null;
          learning_objectives: string[] | null;
          common_courses: string[] | null;
          required_skills: string[] | null;
          required_tools: string[] | null;
          tools_knowledge: string[] | null;
          transferable_skills: string[] | null;
          skill_match: string[] | null;
          professional_associations: string[] | null;
          common_difficulties: string[] | null;
          certifications_to_consider: string[] | null;
          affiliated_programs: string[] | null;
          majors_to_consider_switching_to: string[] | null;
          job_prospects: string | null;
          work_environment: string | null;
          growth_potential: string | null;
          passion_for_subject: string | null;
          global_applicability: string | null;
          image_url: string | null;
          featured: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          industry?: string | null;
          salary_range?: string | null;
          average_salary?: number | null;
          potential_salary?: number | null;
          tuition_and_fees?: number | null;
          intensity?: number | null;
          stress_levels?: number | null;
          dropout_rates?: number | null;
          required_education?: string[] | null;
          degree_levels?: string[] | null;
          learning_objectives?: string[] | null;
          common_courses?: string[] | null;
          required_skills?: string[] | null;
          required_tools?: string[] | null;
          tools_knowledge?: string[] | null;
          transferable_skills?: string[] | null;
          skill_match?: string[] | null;
          professional_associations?: string[] | null;
          common_difficulties?: string[] | null;
          certifications_to_consider?: string[] | null;
          affiliated_programs?: string[] | null;
          majors_to_consider_switching_to?: string[] | null;
          job_prospects?: string | null;
          work_environment?: string | null;
          growth_potential?: string | null;
          passion_for_subject?: string | null;
          global_applicability?: string | null;
          image_url?: string | null;
          featured?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          industry?: string | null;
          salary_range?: string | null;
          average_salary?: number | null;
          potential_salary?: number | null;
          tuition_and_fees?: number | null;
          intensity?: number | null;
          stress_levels?: number | null;
          dropout_rates?: number | null;
          required_education?: string[] | null;
          degree_levels?: string[] | null;
          learning_objectives?: string[] | null;
          common_courses?: string[] | null;
          required_skills?: string[] | null;
          required_tools?: string[] | null;
          tools_knowledge?: string[] | null;
          transferable_skills?: string[] | null;
          skill_match?: string[] | null;
          professional_associations?: string[] | null;
          common_difficulties?: string[] | null;
          certifications_to_consider?: string[] | null;
          affiliated_programs?: string[] | null;
          majors_to_consider_switching_to?: string[] | null;
          job_prospects?: string | null;
          work_environment?: string | null;
          growth_potential?: string | null;
          passion_for_subject?: string | null;
          global_applicability?: string | null;
          image_url?: string | null;
          featured?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      majors: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          featured: boolean | null;
          learning_objectives: string[] | null;
          common_courses: string[] | null;
          interdisciplinary_connections: string[] | null;
          job_prospects: string | null;
          certifications_to_consider: string[] | null;
          degree_levels: string[] | null;
          affiliated_programs: string[] | null;
          gpa_expectations: number | null;
          transferable_skills: string[] | null;
          tools_knowledge: string[] | null;
          potential_salary: string | null;
          passion_for_subject: string | null;
          skill_match: string[] | null;
          professional_associations: string[] | null;
          global_applicability: string | null;
          common_difficulties: string[] | null;
          career_opportunities: string[] | null;
          intensity: string | null;
          stress_level: string | null;
          dropout_rates: string | null;
          majors_to_consider_switching_to: string[] | null;
          profiles_count: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          featured?: boolean | null;
          learning_objectives?: string[] | null;
          common_courses?: string[] | null;
          interdisciplinary_connections?: string[] | null;
          job_prospects?: string | null;
          certifications_to_consider?: string[] | null;
          degree_levels?: string[] | null;
          affiliated_programs?: string[] | null;
          gpa_expectations?: number | null;
          transferable_skills?: string[] | null;
          tools_knowledge?: string[] | null;
          potential_salary?: string | null;
          passion_for_subject?: string | null;
          skill_match?: string[] | null;
          professional_associations?: string[] | null;
          global_applicability?: string | null;
          common_difficulties?: string[] | null;
          career_opportunities?: string[] | null;
          intensity?: string | null;
          stress_level?: string | null;
          dropout_rates?: string | null;
          majors_to_consider_switching_to?: string[] | null;
          profiles_count?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          featured?: boolean | null;
          learning_objectives?: string[] | null;
          common_courses?: string[] | null;
          interdisciplinary_connections?: string[] | null;
          job_prospects?: string | null;
          certifications_to_consider?: string[] | null;
          degree_levels?: string[] | null;
          affiliated_programs?: string[] | null;
          gpa_expectations?: number | null;
          transferable_skills?: string[] | null;
          tools_knowledge?: string[] | null;
          potential_salary?: string | null;
          passion_for_subject?: string | null;
          skill_match?: string[] | null;
          professional_associations?: string[] | null;
          global_applicability?: string | null;
          common_difficulties?: string[] | null;
          career_opportunities?: string[] | null;
          intensity?: string | null;
          stress_level?: string | null;
          dropout_rates?: string | null;
          majors_to_consider_switching_to?: string[] | null;
          profiles_count?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          name: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      schools: {
        Row: {
          id: string;
          name: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      career_major_relations: {
        Row: {
          id: string;
          career_id: string;
          major_id: string;
          relevance_score: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          career_id: string;
          major_id: string;
          relevance_score?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          career_id?: string;
          major_id?: string;
          relevance_score?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
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
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
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
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
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
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
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
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;
```