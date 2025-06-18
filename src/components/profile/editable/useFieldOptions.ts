
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type FieldName = 'academic_major_id' | 'school_id' | 'position' | 'company_id';

const fieldToTableMap: Record<FieldName, { table: string; titleField: string }> = {
  academic_major_id: { table: 'majors', titleField: 'title' },
  school_id: { table: 'schools', titleField: 'name' },
  position: { table: 'careers', titleField: 'title' },
  company_id: { table: 'companies', titleField: 'name' }
};

export function useFieldOptions(fieldName: string) {
  return useQuery({
    queryKey: ['field-options', fieldName],
    queryFn: async () => {
      // Skip database query for highest_degree as it uses predefined options
      if (fieldName === 'highest_degree') {
        return null;
      }

      if (!(['academic_major_id', 'school_id', 'position', 'company_id'] as string[]).includes(fieldName)) {
        return null;
      }

      const fieldConfig = fieldToTableMap[fieldName as FieldName];
      
      try {
        const { data, error } = await supabase
          .from(fieldConfig.table as any)
          .select(`id, ${fieldConfig.titleField}`)
          .eq('status', 'Approved')
          .order(fieldConfig.titleField);
        
        if (error) {
          console.error('Error fetching options:', error);
          return [];
        }

        if (!data || !Array.isArray(data)) {
          return [];
        }

        return data
          .filter((item): item is Record<string, any> => item !== null && typeof item === 'object')
          .map(item => {
            if (!item || !item.id) {
              return null;
            }
            
            const titleValue = item[fieldConfig.titleField];
            return {
              id: item.id,
              name: typeof titleValue === 'string' ? titleValue : ''
            };
          })
          .filter((item): item is { id: string; name: string } => item !== null);
      } catch (error) {
        console.error('Error in useFieldOptions:', error);
        return [];
      }
    },
    enabled: (['academic_major_id', 'school_id', 'position', 'company_id'] as string[]).includes(fieldName)
  });
}
