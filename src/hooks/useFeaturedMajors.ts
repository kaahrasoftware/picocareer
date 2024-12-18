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
        .eq("featured", true);

      if (error) throw error;

      return data as Major[];
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}