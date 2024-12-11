import { Career } from './career.types';
import { Major } from './major.types';
import { User } from './user.types';
import { Story } from './story.types';

export type Database = {
  public: {
    Tables: {
      careers: {
        Row: Career;
        Insert: Partial<Career>;
        Update: Partial<Career>;
        Relationships: [];
      };
      majors: {
        Row: Major;
        Insert: Partial<Major>;
        Update: Partial<Major>;
        Relationships: [];
      };
      users: {
        Row: User;
        Insert: Partial<User>;
        Update: Partial<User>;
        Relationships: [];
      };
      stories: {
        Row: Story;
        Insert: Partial<Story>;
        Update: Partial<Story>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;