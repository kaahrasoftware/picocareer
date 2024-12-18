import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SearchResult } from "@/types/search";

export type { SearchResult };

export function useSearchData(searchTerm: string) {
  return useQuery({
    queryKey: ["search", searchTerm],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!searchTerm) return [];

      const { data: majors, error: majorsError } = await supabase
        .from("majors")
        .select("*")
        .textSearch("title", searchTerm)
        .limit(10);

      if (majorsError) {
        console.error("Error searching majors:", majorsError);
        throw majorsError;
      }

      // Transform majors data to match SearchResult type
      return (majors || []).map(major => ({
        id: major.id,
        type: "major" as const,
        title: major.title,
        description: major.description,
        degree_levels: major.degree_levels,
        career_opportunities: major.career_opportunities,
        common_courses: major.common_courses
      }));
    },
    enabled: searchTerm.length > 0,
  });
}