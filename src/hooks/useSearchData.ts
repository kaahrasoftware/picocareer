import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SearchResult, CareerSearchResult, MajorSearchResult, MentorSearchResult } from "@/types/search";

export { type SearchResult };

export function useSearchData(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!query.trim()) {
        return [] as SearchResult[];
      }

      const searchQuery = `%${query.toLowerCase()}%`;

      const [careersResponse, majorsResponse, mentorsResponse] = await Promise.all([
        supabase
          .from("careers")
          .select("*")
          .or(`title.ilike.${searchQuery},description.ilike.${searchQuery}`)
          .limit(5),
        supabase
          .from("majors")
          .select("*")
          .or(`title.ilike.${searchQuery},description.ilike.${searchQuery}`)
          .limit(5),
        supabase
          .from("profiles")
          .select("*, company:companies(name)")
          .eq("user_type", "mentor")
          .or(`full_name.ilike.${searchQuery},position.ilike.${searchQuery}`)
          .limit(5),
      ]);

      if (careersResponse.error) throw careersResponse.error;
      if (majorsResponse.error) throw majorsResponse.error;
      if (mentorsResponse.error) throw mentorsResponse.error;

      const careers: CareerSearchResult[] = (careersResponse.data || []).map((career) => ({
        id: career.id,
        type: "career",
        title: career.title,
        description: career.description,
        salary_range: career.salary_range,
      }));

      const majors: MajorSearchResult[] = (majorsResponse.data || []).map((major) => ({
        id: major.id,
        type: "major",
        title: major.title,
        description: major.description,
        field_of_study: null,
        degree_levels: major.degree_levels || [],
        career_opportunities: major.career_opportunities || [],
        required_courses: major.common_courses || [],
      }));

      const mentors: MentorSearchResult[] = (mentorsResponse.data || []).map((mentor) => ({
        id: mentor.id,
        type: "mentor",
        title: mentor.full_name || "Unknown",
        description: mentor.position || "Mentor",
        avatar_url: mentor.avatar_url,
        position: mentor.position,
      }));

      return [...careers, ...majors, ...mentors];
    },
    enabled: !!query,
    staleTime: 1000 * 60,
    retry: false,
    refetchOnWindowFocus: false,
  });
}