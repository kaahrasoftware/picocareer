import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSearchMajors = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchMajors = async (query: string) => {
    if (query.length < 3) {
      return [];
    }

    setIsLoading(true);
    console.log('Searching majors with query:', query);

    try {
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
          `title.ilike.%${query}%,` +
          `description.ilike.%${query}%,` +
          `common_courses.cs.{${query}},` +
          `interdisciplinary_connections.cs.{${query}},` +
          `job_prospects.ilike.%${query}%,` +
          `certifications_to_consider.cs.{${query}},` +
          `affiliated_programs.cs.{${query}},` +
          `transferable_skills.cs.{${query}},` +
          `tools_knowledge.cs.{${query}},` +
          `passion_for_subject.ilike.%${query}%,` +
          `skill_match.cs.{${query}},` +
          `professional_associations.cs.{${query}},` +
          `global_applicability.ilike.%${query}%,` +
          `majors_to_consider_switching_to.cs.{${query}},` +
          `career_opportunities.cs.{${query}},` +
          `intensity.ilike.%${query}%,` +
          `stress_level.ilike.%${query}%,` +
          `category.cs.{${query}}`
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