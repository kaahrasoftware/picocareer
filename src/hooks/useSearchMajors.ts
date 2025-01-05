import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSearchMajors = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchMajors = async (query: string) => {
    if (query.length < 3) {
      return [];
    }

    setIsLoading(true);
    console.log('Searching majors with query:', query);

    try {
      const { data, error } = await supabase
        .from('majors')
        .select(`
          id,
          title,
          description,
          learning_objectives,
          degree_levels,
          potential_salary,
          profiles_count
        `)
        .or(
          `title.ilike.%${query}%,` +
          `description.ilike.%${query}%,` +
          `learning_objectives.cs.{${query.toLowerCase()}}`
        )
        .limit(20);

      if (error) throw error;

      console.log('Major search results:', data);
      return data.map(major => ({
        ...major,
        type: 'major' as const,
      }));
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to fetch search results. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { searchMajors, isLoading };
};