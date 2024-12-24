import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Major } from "@/types/database/majors";

export function useFeaturedMajors() {
  return useQuery({
    queryKey: ["featured-majors"],
    queryFn: async (): Promise<Major[]> => {
      try {
        const { data, error } = await supabase
          .from("majors")
          .select("*")
          .eq("featured", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching featured majors:", error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error("Error fetching featured majors:", error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5,
  });
}