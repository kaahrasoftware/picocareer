import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FieldName, TableName, TitleField, TableRecord } from "./types";

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
      const titleField: TitleField = fieldName === 'school_id' || fieldName === 'company_id' ? 'name' : 'title';

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

        if (!data) return [];

        // Type guard to ensure data has the correct shape
        const isValidRecord = (item: any): item is { id: string; [key: string]: any } => {
          return typeof item.id === 'string' && (
            typeof item.title === 'string' || 
            typeof item.name === 'string'
          );
        };

        // Filter and map the data to ensure it matches our TableRecord interface
        return data
          .filter(isValidRecord)
          .map(item => ({
            id: item.id,
            ...(titleField === 'name' ? { name: item[titleField] } : { title: item[titleField] })
          }));

      } catch (error) {
        console.error('Error in query:', error);
        return [];
      }
    },
    enabled: ['academic_major_id', 'school_id', 'position', 'company_id'].includes(fieldName)
  });
}