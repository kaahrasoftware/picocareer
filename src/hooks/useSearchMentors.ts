
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSearchMentors = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchMentors = async (query: string) => {
    if (!query || query.length < 3) {
      return [];
    }

    setIsLoading(true);
    console.log('Searching mentors with query:', query);

    try {
      // Ensure query is a string before using string methods
      const safeQuery = String(query).toLowerCase();
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          position,
          location,
          bio,
          keywords,
          skills,
          tools_used,
          fields_of_interest,
          languages,
          highest_degree,
          top_mentor,
          company:companies(name),
          school:schools(name)
        `)
        .eq('user_type', 'mentor')
        .or(
          `first_name.ilike.%${safeQuery}%,` +
          `last_name.ilike.%${safeQuery}%,` +
          `bio.ilike.%${safeQuery}%,` +
          `location.ilike.%${safeQuery}%,` +
          `keywords.cs.{${safeQuery}},` +
          `skills.cs.{${safeQuery}},` +
          `tools_used.cs.{${safeQuery}},` +
          `fields_of_interest.cs.{${safeQuery}},` +
          `languages.cs.{${safeQuery}}`
        )
        .limit(20);

      if (error) throw error;

      console.log('Search results:', data);
      return data.map(mentor => ({
        ...mentor,
        type: 'mentor' as const,
        title: `${mentor.first_name} ${mentor.last_name}`,
        description: mentor.bio || mentor.position
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

  return { searchMentors, isLoading };
};
