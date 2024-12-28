import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTopRatedMentors = () => {
  return useQuery({
    queryKey: ['topRatedMentors'],
    queryFn: async () => {
      try {
        console.log('Fetching top rated mentors...');
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            company:companies(name),
            career:careers!profiles_position_fkey(title)
          `)
          .eq('user_type', 'mentor')
          .eq('top_mentor', true)
          .limit(10)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching mentors:', error);
          throw error;
        }

        if (!data) {
          console.log('No mentor data found');
          return [];
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
            career_title: mentor.career?.title || "No position set",
            location: mentor.location,
            bio: mentor.bio,
            skills: mentor.skills
          }));

        console.log('Fetched mentors:', shuffledData?.length);
        return shuffledData;
      } catch (error) {
        console.error('Error in useTopRatedMentors:', error);
        throw error;
      }
    },
    retry: 3, // Add retry logic
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
};