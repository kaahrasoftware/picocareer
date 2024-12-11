import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTopRatedMentors = () => {
  return useQuery({
    queryKey: ['topRatedMentors'],
    queryFn: async () => {
      console.log('Fetching top rated mentors...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'mentor')
        .eq('featured', true)
        .limit(6);

      if (error) {
        console.error('Error fetching mentors:', error);
        throw error;
      }
      
      console.log('Fetched mentors:', data);
      
      // Transform the data to match the expected Mentor type
      return data.map(mentor => ({
        id: mentor.id, // Add the ID to the transformed data
        title: mentor.position || "Mentor",
        company: mentor.company_name || "",
        imageUrl: mentor.avatar_url || "",
        name: mentor.full_name || "",
        stats: {
          mentees: `${Math.floor(Math.random() * 900 + 100)}`,
          connected: `${Math.floor(Math.random() * 900 + 100)}K`,
          recordings: `${Math.floor(Math.random() * 90 + 10)}`
        },
        username: mentor.username || "",
        education: mentor.highest_degree,
        sessionsHeld: "0",
        position: mentor.position
      }));
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};