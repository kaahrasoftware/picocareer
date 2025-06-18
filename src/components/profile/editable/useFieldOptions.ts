
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FieldName, TableName, QueryResult } from "./types";

const fieldToTableMap: Record<FieldName, TableName> = {
  career_id: 'careers',
  company_id: 'companies',
  school_id: 'schools',
  academic_major_id: 'majors',
  industry: 'careers',
  department: 'careers',
  position: 'careers'
};

export function useFieldOptions(fieldName: FieldName) {
  const tableName = fieldToTableMap[fieldName];
  
  return useQuery({
    queryKey: ['field-options', fieldName, tableName],
    queryFn: async (): Promise<QueryResult[]> => {
      let query = supabase.from(tableName).select('id, title, name, status');
      
      // Apply filters based on table
      if (tableName === 'careers' || tableName === 'majors') {
        query = query.select('id, title, status').eq('status', 'Approved');
      } else if (tableName === 'companies' || tableName === 'schools') {
        query = query.select('id, name, status').eq('status', 'Approved');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        title: item.title || item.name,
        name: item.name || item.title,
        status: item.status
      }));
    },
    enabled: !!fieldName && !!tableName,
  });
}
