
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
        return [];
      }

      if (!(['academic_major_id', 'school_id', 'position', 'company_id'] as string[]).includes(fieldName)) {
        return [];
      }

      const fieldConfig = fieldToTableMap[fieldName as FieldName];
      
      try {
        let query;
        if (fieldConfig.table === 'schools') {
          query = supabase
            .from(fieldConfig.table as any)
            .select(`id, ${fieldConfig.titleField}`)
            .eq('status', 'Approved')
            .order(fieldConfig.titleField)
            .limit(100);
        } else {
          query = supabase
            .from(fieldConfig.table as any)
            .select(`id, ${fieldConfig.titleField}`)
            .eq('status', 'Approved')
            .order(fieldConfig.titleField)
            .limit(100);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching options:', error);
          return [];
        }

        return (data || []).map(item => ({
          id: item.id,
          name: item[fieldConfig.titleField] || 'Unknown'
        })) as Array<{ id: string; name: string }>;
      } catch (error) {
        console.error('Error in useFieldOptions:', error);
        return [];
      }
    },
    enabled: (['academic_major_id', 'school_id', 'position', 'company_id'] as string[]).includes(fieldName),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
