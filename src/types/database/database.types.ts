

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
      assessment_questions: {
        Row: {
          id: string
          title: string
          description: string | null
          type: 'multiple_choice' | 'multiple_select' | 'scale' | 'text'
          options: Json | null
          order_index: number
          is_required: boolean
          is_active: boolean
          profile_type: string[] | null
          target_audience: string[] | null
          prerequisites: Json | null
          conditional_logic: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: 'multiple_choice' | 'multiple_select' | 'scale' | 'text'
          options?: Json | null
          order_index: number
          is_required?: boolean
          is_active?: boolean
          profile_type?: string[] | null
          target_audience?: string[] | null
          prerequisites?: Json | null
          conditional_logic?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: 'multiple_choice' | 'multiple_select' | 'scale' | 'text'
          options?: Json | null
          order_index?: number
          is_required?: boolean
          is_active?: boolean
          profile_type?: string[] | null
          target_audience?: string[] | null
          prerequisites?: Json | null
          conditional_logic?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      career_assessments: {
        Row: {
          id: string
          user_id: string
          status: 'in_progress' | 'completed'
          started_at: string
          completed_at: string | null
          detected_profile_type: 'middle_school' | 'high_school' | 'college' | 'career_professional' | null
          profile_detection_completed: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'in_progress' | 'completed'
          started_at?: string
          completed_at?: string | null
          detected_profile_type?: 'middle_school' | 'high_school' | 'college' | 'career_professional' | null
          profile_detection_completed?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'in_progress' | 'completed'
          started_at?: string
          completed_at?: string | null
          detected_profile_type?: 'middle_school' | 'high_school' | 'college' | 'career_professional' | null
          profile_detection_completed?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
  }
}

