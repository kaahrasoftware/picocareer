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
        .limit(10)        // Increased to 10 mentors
        .order('created_at', { ascending: false }); // Order by most recent first

      if (error) {
        console.error('Error fetching mentors:', error);
        throw error;
      }
      
      // Shuffle the results in JavaScript instead of using random() in SQL
      const shuffledData = data
        .sort(() => Math.random() - 0.5)
        .map(mentor => ({
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
          top_mentor: mentor.top_mentor,
          position: mentor.position,
          location: mentor.location,
          bio: mentor.bio,
          skills: mentor.skills
        }));

      console.log('Fetched mentors:', shuffledData?.length);
      return shuffledData;
    },
    staleTime: 1000 * 60 * 5,
  });
};