
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
      try {
        // Handle different table structures based on table name
        if (tableName === 'careers' || tableName === 'majors') {
          const { data, error } = await supabase
            .from(tableName as any)
            .select('id, title, status')
            .eq('status', 'Approved');
          
          if (error) throw error;
          
          return (data || []).map(item => ({
            id: item.id,
            title: item.title,
            name: item.title,
            status: item.status
          }));
        } else if (tableName === 'companies' || tableName === 'schools') {
          const { data, error } = await supabase
            .from(tableName as any)
            .select('id, name, status')
            .eq('status', 'Approved');
          
          if (error) throw error;
          
          return (data || []).map(item => ({
            id: item.id,
            title: item.name,
            name: item.name,
            status: item.status
          }));
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching field options:', error);
        return [];
      }
    },
    enabled: !!fieldName && !!tableName,
  });
}
