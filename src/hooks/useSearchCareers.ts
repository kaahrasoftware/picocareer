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
          salary_range,
          image_url,
          created_at,
          updated_at,
          featured,
          complete_career,
          academic_majors,
          required_skills,
          required_tools,
          job_outlook,
          industry,
          work_environment,
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
          important_note
        `)
        .or(
          `title.ilike.%${query}%,` +
          `description.ilike.%${query}%,` +
          `academic_majors.cs.{${query}},` +
          `required_skills.cs.{${query}}`
        )
        .eq('complete_career', true)
        .limit(20);

      if (error) {
        console.error("Error searching careers:", error);
        throw error;
      }

      return data as Career[];
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