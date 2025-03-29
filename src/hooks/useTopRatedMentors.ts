
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
          company:companies(name),
          career:careers!profiles_position_fkey(title),
          avg_rating:session_feedback!session_feedback_to_profile_id_fkey(rating)
        `)
        .eq('user_type', 'mentor')
        .eq('top_mentor', true)
        .limit(10)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mentors:', error);
        throw error;
      }
      
      // Process the results to calculate average rating
      const processedData = data.map(mentor => {
        // Calculate real average rating if available
        let avgRating = 0;
        let totalRatings = 0;
        
        if (mentor.avg_rating && mentor.avg_rating.length > 0) {
          // Filter out null ratings
          const validRatings = mentor.avg_rating.filter(r => r.rating !== null);
          totalRatings = validRatings.length;
          
          if (totalRatings > 0) {
            const sum = validRatings.reduce((acc, curr) => acc + curr.rating, 0);
            avgRating = parseFloat((sum / totalRatings).toFixed(1));
          }
        }
        
        return {
          id: mentor.id,
          name: mentor.full_name || "",
          company: mentor.company?.name || "",
          imageUrl: mentor.avatar_url || "",
          position: mentor.position,
          career_title: mentor.career?.title || "No position set",
          location: mentor.location,
          bio: mentor.bio,
          skills: mentor.skills || [],
          keywords: mentor.keywords || [],
          rating: avgRating || 0,
          totalRatings: totalRatings || 0,
          top_mentor: mentor.top_mentor
        };
      });

      console.log('Fetched top mentors:', processedData?.length);
      return processedData;
    },
    staleTime: 1000 * 60 * 5,
  });
};
