import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Mentor } from "@/types/mentor";

export const useTopRatedMentors = () => {
  return useQuery({
    queryKey: ['topRatedMentors'],
    queryFn: async () => {
      console.log('Fetching top rated mentors...');
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          company:companies(name)
        `)
        .eq('user_type', 'mentor')
        .eq('top_mentor', true)
        .limit(10)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mentors:', error);
        throw error;
      }
      
      // Transform the data to match the Mentor interface
      const transformedData: Mentor[] = data.map(mentor => ({
        id: mentor.id,
        title: mentor.position || "Mentor",
        company: mentor.company?.name || "",
        imageUrl: mentor.avatar_url || "",
        name: mentor.full_name || "",
        stats: {
          mentees: `${Math.floor(Math.random() * 900 + 100)}`,
          connected: `${Math.floor(Math.random() * 900 + 100)}K`,
          recordings: `${Math.floor(Math.random() * 90 + 10)}`
        },
        education: mentor.highest_degree,
        sessionsHeld: "10+",
        position: mentor.position
      }));

      console.log('Fetched mentors:', transformedData?.length);
      return transformedData;
    },
    staleTime: 1000 * 60 * 5,
  });
};