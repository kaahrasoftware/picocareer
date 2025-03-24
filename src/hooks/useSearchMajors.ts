
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSearchMajors = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchMajors = async (query: string) => {
    if (!query || query.length < 3) {
      return [];
    }

    setIsLoading(true);
    console.log('Searching majors with query:', query);

    try {
      // Ensure query is a string before using string methods
      const safeQuery = String(query).toLowerCase();
      
      const { data, error } = await supabase
        .from('majors')
        .select(`
          id,
          title,
          description,
          learning_objectives,
          degree_levels,
          common_courses,
          interdisciplinary_connections,
          job_prospects,
          certifications_to_consider,
          affiliated_programs,
          transferable_skills,
          tools_knowledge,
          passion_for_subject,
          skill_match,
          professional_associations,
          global_applicability,
          majors_to_consider_switching_to,
          career_opportunities,
          intensity,
          stress_level,
          category,
          potential_salary,
          profiles_count
        `)
        .or(
          `title.ilike.%${safeQuery}%,` +
          `description.ilike.%${safeQuery}%,` +
          `common_courses.cs.{${safeQuery}},` +
          `interdisciplinary_connections.cs.{${safeQuery}},` +
          `job_prospects.ilike.%${safeQuery}%,` +
          `certifications_to_consider.cs.{${safeQuery}},` +
          `affiliated_programs.cs.{${safeQuery}},` +
          `transferable_skills.cs.{${safeQuery}},` +
          `tools_knowledge.cs.{${safeQuery}},` +
          `passion_for_subject.ilike.%${safeQuery}%,` +
          `skill_match.cs.{${safeQuery}},` +
          `professional_associations.cs.{${safeQuery}},` +
          `global_applicability.ilike.%${safeQuery}%,` +
          `majors_to_consider_switching_to.cs.{${safeQuery}},` +
          `career_opportunities.cs.{${safeQuery}},` +
          `intensity.ilike.%${safeQuery}%,` +
          `stress_level.ilike.%${safeQuery}%,` +
          `category.cs.{${safeQuery}}`
        )
        .limit(20);

      if (error) throw error;

      console.log('Major search results:', data);
      return data.map(major => ({
        ...major,
        type: 'major' as const,
      }));
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to fetch search results. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { searchMajors, isLoading };
};
