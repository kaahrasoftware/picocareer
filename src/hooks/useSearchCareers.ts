import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Career } from "@/types/database/careers";

export function useSearchCareers() {
  const searchCareers = useCallback(async (query: string): Promise<Career[]> => {
    if (!query || query.length < 3) return [];

    try {
      const { data, error } = await supabase
        .from("careers")
        .select(`
          id,
          title,
          description,
          academic_majors,
          required_skills,
          salary_range,
          image_url,
          industry,
          work_environment,
          required_tools,
          job_outlook,
          growth_potential,
          keywords,
          transferable_skills,
          careers_to_consider_switching_to,
          required_education,
          stress_levels,
          rare,
          popular,
          new_career,
          profiles_count,
          important_note,
          complete_career,
          created_at,
          updated_at,
          featured
        `)
        .or(
          `title.ilike.%${query}%,` +
          `description.ilike.%${query}%,` +
          `academic_majors.cs.{${query}},` +
          `required_skills.cs.{${query}}`
        )
        .eq('status', 'Approved')
        .limit(20);

      if (error) {
        console.error("Error searching careers:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in searchCareers:", error);
      return [];
    }
  }, []);

  return {
    searchCareers,
    isLoading: false // We'll handle loading state in the component
  };
}