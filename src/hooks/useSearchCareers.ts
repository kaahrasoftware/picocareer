
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export function useSearchCareers() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchCareers = async (searchQuery: string) => {
    try {
      setIsLoading(true);
      
      if (!searchQuery || searchQuery.length < 3) {
        return [];
      }

      console.log("Searching careers with query:", searchQuery);
      
      // Ensure searchQuery is a string before using string methods
      const safeQuery = String(searchQuery).toLowerCase();

      // First, get exact matches (higher relevance)
      const { data: exactMatches, error: exactError } = await supabase
        .from("careers")
        .select(`
          id,
          title,
          description,
          salary_range,
          complete_career
        `)
        .eq('complete_career', true)
        .ilike('title', `%${safeQuery}%`)
        .limit(10);

      if (exactError) {
        console.error("Error searching exact career matches:", exactError);
        throw exactError;
      }

      // Then get partial matches in description and other fields
      const { data: partialMatches, error: partialError } = await supabase
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
          `description.ilike.%${safeQuery}%,` +
          `academic_majors.cs.{${safeQuery}}`
        )
        .not('title', 'ilike', `%${safeQuery}%`) // Exclude titles we already got in exactMatches
        .limit(15);

      if (partialError) {
        console.error("Error searching partial career matches:", partialError);
        throw partialError;
      }

      // Combine results with exact matches first
      const careers = [
        ...(exactMatches || []),
        ...(partialMatches || [])
      ];

      console.log("Career search results:", careers);
      return careers;
    } catch (error) {
      console.error("Error in searchCareers:", error);
      toast({
        title: "Search Error",
        description: "Failed to fetch career results. Please try again.",
        variant: "destructive",
      });
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
