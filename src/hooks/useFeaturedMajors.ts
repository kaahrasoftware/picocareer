import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Major } from "@/types/database/majors";

export function useFeaturedMajors() {
  return useQuery({
    queryKey: ["featured-majors"],
    queryFn: async (): Promise<Major[]> => {
      const { data, error } = await supabase
        .from("majors")
        .select(`
          id,
          title,
          description,
          created_at,
          updated_at,
          featured,
          learning_objectives,
          common_courses,
          interdisciplinary_connections,
          job_prospects,
          certifications_to_consider,
          degree_levels,
          affiliated_programs,
          gpa_expectations,
          transferable_skills,
          tools_knowledge,
          potential_salary,
          passion_for_subject,
          skill_match,
          professional_associations,
          global_applicability,
          common_difficulties,
          career_opportunities,
          intensity,
          stress_level,
          dropout_rates,
          majors_to_consider_switching_to,
          profiles_count
        `)
        .eq("featured", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching featured majors:", error);
        throw error;
      }

      return data;
    },
  });
}