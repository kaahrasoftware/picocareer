
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Mentor {
  id: string;
  first_name: string;
  last_name: string;
  position?: string;
  career_title?: string;
  company_name?: string;
  location?: string;
  skills?: string[];
  keywords?: string[];
  rating?: number;
  totalRatings?: number;
  avatar_url?: string;
  education?: string;
  top_mentor?: boolean;
  bio?: string;
  availability_status?: 'available_now' | 'has_availability' | 'booked';
  session_count?: number;
}

export const useMentors = () => {
  return useQuery({
    queryKey: ["mentors"],
    queryFn: async (): Promise<Mentor[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name,
          position,
          company_id,
          location,
          skills,
          keywords,
          avatar_url,
          bio,
          user_type,
          companies!inner(name)
        `)
        .eq("user_type", "mentor");

      if (error) {
        console.error("Error fetching mentors:", error);
        throw error;
      }

      // Get all mentor IDs for subsequent queries
      const mentorIds = data?.map(m => m.id) || [];
      
      // Get availability data
      const { data: availabilityData } = await supabase
        .from("mentor_availability")
        .select("profile_id, start_date_time, end_date_time, is_available")
        .in("profile_id", mentorIds)
        .eq("is_available", true)
        .gte("start_date_time", new Date().toISOString());

      // Get session counts - using profile_id as the mentor identifier
      const { data: sessionData } = await supabase
        .from("mentor_sessions")
        .select("mentor_id")
        .in("mentor_id", mentorIds)
        .eq("status", "completed");

      // Process availability status
      const availabilityMap = new Map<string, 'available_now' | 'has_availability' | 'booked'>();
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      mentorIds.forEach(mentorId => {
        const mentorAvailability = availabilityData?.filter(a => a.profile_id === mentorId) || [];
        
        if (mentorAvailability.length === 0) {
          availabilityMap.set(mentorId, 'booked');
        } else {
          const hasNearTermAvailability = mentorAvailability.some(slot => 
            new Date(slot.start_date_time) <= thirtyDaysFromNow
          );
          availabilityMap.set(mentorId, hasNearTermAvailability ? 'available_now' : 'has_availability');
        }
      });

      // Process session counts
      const sessionCountMap = new Map<string, number>();
      sessionData?.forEach(session => {
        const count = sessionCountMap.get(session.mentor_id) || 0;
        sessionCountMap.set(session.mentor_id, count + 1);
      });

      // For now, set default rating values since we need to check the correct table structure
      // We'll update this once we confirm the correct column names
      const defaultRating = 0;
      const defaultTotalRatings = 0;

      // Transform the data to match the expected Mentor interface
      return (data || []).map((mentor) => ({
        id: mentor.id,
        first_name: mentor.first_name || "",
        last_name: mentor.last_name || "",
        position: mentor.position,
        career_title: mentor.position,
        company_name: mentor.companies?.name || undefined,
        location: mentor.location,
        skills: mentor.skills || [],
        keywords: mentor.keywords || [],
        rating: defaultRating,
        totalRatings: defaultTotalRatings,
        avatar_url: mentor.avatar_url,
        education: undefined,
        top_mentor: false,
        bio: mentor.bio,
        availability_status: availabilityMap.get(mentor.id) || 'booked',
        session_count: sessionCountMap.get(mentor.id) || 0,
      }));
    },
  });
};
