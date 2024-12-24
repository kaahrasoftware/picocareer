import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Major } from "@/types/database/majors";
import { useToast } from "@/hooks/use-toast";

export function useFeaturedMajors() {
  const { toast } = useToast();

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
          toast({
            title: "Error",
            description: "Failed to load featured majors. Please try again later.",
            variant: "destructive",
          });
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error("Error fetching featured majors:", error);
        toast({
          title: "Error",
          description: "Failed to load featured majors. Please try again later.",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}