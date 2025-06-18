
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
      // Skip database query for highest_degree as it uses predefined options
      if (fieldName === 'highest_degree') {
        return null;
      }

      if (!['academic_major_id', 'school_id', 'position', 'company_id'].includes(fieldName)) {
        return null;
      }

      const table = tableMap[fieldName as FieldName];
      const titleField: TitleField = table === 'schools' ? 'name' : 
                                    table === 'companies' ? 'name' : 'title';

      try {
        const { data, error } = await supabase
          .from(table)
          .select(`id, ${titleField}`)
          .eq('status', 'Approved')
          .order(titleField);
        
        if (error) {
          console.error('Error fetching options:', error);
          return [];
        }

        return (data || []).map(item => ({
          id: item.id,
          name: item[titleField] // Always use 'name' for consistency in the component
        })) as Array<{ id: string; name: string }>;
      } catch (error) {
        console.error('Error in useFieldOptions:', error);
        return [];
      }
    },
    enabled: ['academic_major_id', 'school_id', 'position', 'company_id'].includes(fieldName)
  });
}
