
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { School } from "@/types/database/schools";

export function useAllSchools() {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async (): Promise<School[]> => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching schools:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSchoolById(id: string | undefined) {
  return useQuery({
    queryKey: ['school', id],
    queryFn: async (): Promise<School | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching school:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSchoolMajors(schoolId: string | undefined) {
  return useQuery({
    queryKey: ['school-majors', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('school_majors')
        .select(`
          id,
          program_details,
          program_url,
          majors (
            id,
            title,
            description,
            degree_levels
          )
        `)
        .eq('school_id', schoolId);
      
      if (error) {
        console.error('Error fetching school majors:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!schoolId,
  });
}
