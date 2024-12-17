import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Major } from "@/types/database/majors";

export function useFeaturedMajors() {
  return useQuery({
    queryKey: ["featured-majors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("majors")
        .select("*")
        .eq("featured", true)
        .limit(6);

      if (error) {
        throw error;
      }

      // Transform the data to include all required fields
      const transformedData: Major[] = data.map(major => ({
        ...major,
        image_url: null,
        field_of_study: null,
        required_courses: [],
        degree_level: major.degree_levels?.[0] || null
      }));

      return transformedData;
    },
  });
}