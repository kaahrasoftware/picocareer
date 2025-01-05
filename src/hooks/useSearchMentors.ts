import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSearchMentors = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchMentors = async (query: string) => {
    if (query.length < 3) {
      return [];
    }

    setIsLoading(true);
    console.log('Searching mentors with query:', query);

    try {
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
          highest_degree,
          top_mentor,
          company:companies(name),
          school:schools(name),
          academic_major:majors(title),
          career:careers!position(title)
        `)
        .eq('user_type', 'mentor')
        .or(
          `first_name.ilike.%${query}%,` +
          `last_name.ilike.%${query}%,` +
          `bio.ilike.%${query}%,` +
          `location.ilike.%${query}%,` +
          `companies.name.ilike.%${query}%,` +
          `schools.name.ilike.%${query}%,` +
          `majors.title.ilike.%${query}%,` +
          `careers.title.ilike.%${query}%,` +
          `keywords.cs.{${query.toLowerCase()}}`
        )
        .limit(5);

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