import type { Database } from "@/integrations/supabase/types";

export type TableName = 'majors' | 'schools' | 'companies' | 'careers';
export type FieldName = 'academic_major_id' | 'school_id' | 'company_id' | 'position';
export type TitleField = 'title' | 'name';

export type Status = Database["public"]["Enums"]["status"];

export type TableRecord = {
  id: string;
  title?: string;
  name?: string;
};

export type InsertData = {
  majors: {
    title: string;
    description: string;
    status: Status;
  };
  schools: {
    name: string;
    status: Status;
  };
  companies: {
    name: string;
    status: Status;
  };
  careers: {
    title: string;
    description: string;
    status: Status;
  };
}

export type QueryResult = {
  id: string;
  title?: string;
  name?: string;
  status?: Status;
}