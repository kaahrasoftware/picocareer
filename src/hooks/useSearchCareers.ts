import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export function useSearchCareers() {
  const [isLoading, setIsLoading] = useState(false);

  const searchCareers = async (searchQuery: string) => {
    try {
      setIsLoading(true);
      
      if (!searchQuery || searchQuery.length < 3) {
        return [];
      }

      console.log("Searching careers with query:", searchQuery);

      const { data: careers, error } = await supabase
        .from("careers")
        .select(`
          id,
          title,
          description,
          salary_range,
          complete_career
        `)
        .eq('complete_career', true)
        .or(
          `title.ilike.%${searchQuery}%,` +
          `description.ilike.%${searchQuery}%,` +
          `academic_majors.cs.{${searchQuery}}`
        )
        .limit(20);

      if (error) {
        console.error("Error searching careers:", error);
        return [];
      }

      console.log("Career search results:", careers);
      return careers;
    } catch (error) {
      console.error("Error in searchCareers:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchCareers,
    isLoading,
  };
}