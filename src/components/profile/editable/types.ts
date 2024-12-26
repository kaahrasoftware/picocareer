import { Database } from "@/integrations/supabase/types";

export type TableName = 'majors' | 'schools' | 'companies' | 'careers';
export type FieldName = 'academic_major_id' | 'school_id' | 'company_id' | 'position';
export type TitleField = 'title' | 'name';

export interface TableRecord {
  id: string;
  title?: string;
  name?: string;
}

export interface EditableFieldProps {
  label: string;
  value: string | null;
  fieldName: string;
  profileId: string;
  onUpdate?: (newValue: string) => void;
}

export type Status = Database["public"]["Enums"]["status"];