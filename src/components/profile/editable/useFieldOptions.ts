import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FieldName, TableName, TitleField, QueryResult } from "./types";

const tableMap: Record<FieldName, TableName> = {
  academic_major_id: 'majors',
  school_id: 'schools',
  position: 'careers',
  company_id: 'companies'
};

export function useFieldOptions(fieldName: string) {
  return useQuery({
    queryKey: ['field-options', fieldName],
    queryFn: async () => {
      if (!['academic_major_id', 'school_id', 'position', 'company_id'].includes(fieldName)) {
        return null;
      }

      const table = tableMap[fieldName as FieldName];
      const titleField: TitleField = table === 'schools' || table === 'companies' ? 'name' : 'title';

      const { data, error } = await supabase
        .from(table)
        .select(`id, ${titleField}`)
        .eq('status', 'Approved')
        .order(titleField);
      
      if (error) {
        console.error('Error fetching options:', error);
        return [];
      }

      // Type assertion to ensure the data matches QueryResult type
      return (data as unknown as QueryResult[]) || [];
    },
    enabled: ['academic_major_id', 'school_id', 'position', 'company_id'].includes(fieldName)
  });
}