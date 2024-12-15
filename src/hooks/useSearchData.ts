import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Major } from "@/types/database/majors";
import type { Career } from "@/types/database/careers";
import type { Profile } from "@/types/database/profiles";

export type SearchResult = (
  | (Career & { type: "career" })
  | (Major & { type: "major" })
  | (Profile & { type: "mentor" })
);

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
      }));

      const majors = (majorsResponse.data || []).map((major) => ({
        ...major,
        type: "major" as const,
      }));

      const mentors = (mentorsResponse.data || []).map((mentor) => ({
        ...mentor,
        type: "mentor" as const,
        title: mentor.full_name,
        description: mentor.position,
      }));

      return [...careers, ...majors, ...mentors] as SearchResult[];
    },
    enabled: !!query,
  });
}