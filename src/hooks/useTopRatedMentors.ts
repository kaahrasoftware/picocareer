import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        .limit(6);

      if (error) {
        console.error('Error fetching mentors:', error);
        throw error;
      }
      
      console.log('Fetched mentors:', data);
      
      return data.map(mentor => ({
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
        sessionsHeld: "0",
        position: mentor.position
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
};