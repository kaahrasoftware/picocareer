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

export interface CustomSelectProps {
  value: string;
  options: Array<{ id: string; title?: string; name?: string }>;
  placeholder: string;
  tableName: TableName;
  fieldName: FieldName;
  titleField: TitleField;
  onSave: (value: string) => void;
  onCancel: () => void;
}

export type Status = Database["public"]["Enums"]["status"];