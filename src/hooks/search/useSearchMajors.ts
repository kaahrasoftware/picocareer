import { supabase } from "@/integrations/supabase/client";
import type { MajorSearchResult } from "@/types/search/types";

export const searchMajors = async (searchTerm: string): Promise<MajorSearchResult[]> => {
  const searchTermLower = searchTerm.toLowerCase();
  
  const { data: majors, error } = await supabase
    .from("majors")
    .select(`
      id,
      title,
      description,
      degree_levels,
      career_opportunities,
      common_courses
    `)
    .or(`title.ilike.%${searchTermLower}%,description.ilike.%${searchTermLower}%`)
    .limit(5);

  if (error) throw error;

  return (majors || []).map(major => ({
    id: major.id,
    type: "major" as const,
    title: major.title,
    description: major.description,
    degree_levels: major.degree_levels || [],
    career_opportunities: major.career_opportunities || [],
    common_courses: major.common_courses || []
  }));
};