import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Career } from "@/types/database/careers";
import type { Major } from "@/types/database/majors";
import type { Profile } from "@/types/database/profiles";
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
        image_url: career.image_url,
        salary_range: career.salary_range,
        average_salary: career.average_salary,
      }));

      const majors: MajorSearchResult[] = (majorsResponse.data || []).map((major) => ({
        id: major.id,
        type: "major",
        title: major.title,
        description: major.description,
        image_url: major.image_url,
        field_of_study: major.field_of_study,
        degree_level: major.degree_level,
        career_opportunities: major.career_opportunities || [],
        required_courses: major.common_courses || [],
      }));

      const mentors: MentorSearchResult[] = (mentorsResponse.data || []).map((mentor) => ({
        id: mentor.id,
        type: "mentor",
        title: mentor.full_name || "Unknown",
        description: mentor.position || "Mentor",
        image_url: mentor.avatar_url,
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