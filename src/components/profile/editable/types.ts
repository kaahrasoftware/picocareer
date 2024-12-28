import type { Database } from "@/integrations/supabase/types";

export type TableName = 'majors' | 'schools' | 'companies' | 'careers';
export type FieldName = 'academic_major_id' | 'school_id' | 'company_id' | 'position';
export type TitleField = 'title' | 'name';

export type TableRecord = {
  id: string;
  title?: string;
  name?: string;
};

export type InsertData = {
  majors: {
    title: string;
    description: string;
    status: Database["public"]["Enums"]["status"];
  };
  schools: {
    name: string;
    status: Database["public"]["Enums"]["status"];
  };
  companies: {
    name: string;
    status: Database["public"]["Enums"]["status"];
  };
  careers: {
    title: string;
    description: string;
    status: Database["public"]["Enums"]["status"];
  };
}