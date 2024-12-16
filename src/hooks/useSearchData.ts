import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SearchResult } from "@/types/search";

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

      const careers = (careersResponse.data || []).map((career) => ({
        ...career,
        type: "career" as const,
        title: career.title,
        description: career.description,
      }));

      const majors = (majorsResponse.data || []).map((major) => ({
        ...major,
        type: "major" as const,
        title: major.title,
        description: major.description,
      }));

      const mentors = (mentorsResponse.data || []).map((mentor) => ({
        ...mentor,
        type: "mentor" as const,
        title: mentor.full_name || "Unknown",
        description: mentor.position || "Mentor",
        image_url: mentor.avatar_url,
      }));

      return [...careers, ...majors, ...mentors] as SearchResult[];
    },
    enabled: !!query,
    staleTime: 1000 * 60, // Cache for 1 minute to help prevent rate limiting
    retry: false, // Don't retry failed requests to help prevent rate limiting
  });
}