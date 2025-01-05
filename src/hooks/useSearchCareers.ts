import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export function useSearchCareers() {
  const [isLoading, setIsLoading] = useState(false);

  const searchCareers = async (searchQuery: string) => {
    try {
      setIsLoading(true);
      
      if (!searchQuery || searchQuery.length < 3) {
        return [];
      }

      const { data: careers, error } = await supabase
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
          featured
        `)
        .or(
          `title.ilike.%${searchQuery}%,` +
          `description.ilike.%${searchQuery}%,` +
          `academic_majors.cs.{${searchQuery}}`
        )
        .limit(20);

      if (error) {
        console.error("Error searching careers:", error);
        return [];
      }

      return careers;
    } catch (error) {
      console.error("Error in searchCareers:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchCareers,
    isLoading,
  };
}