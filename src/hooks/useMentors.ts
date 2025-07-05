
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
          user_type
        `)
        .eq("user_type", "mentor");

      if (error) {
        console.error("Error fetching mentors:", error);
        throw error;
      }

      // Transform the data to match the expected Mentor interface
      return (data || []).map((mentor) => ({
        id: mentor.id,
        first_name: mentor.first_name || "",
        last_name: mentor.last_name || "",
        position: mentor.position,
        career_title: mentor.position,
        company_name: mentor.company_id, // This might need to be joined with companies table later
        location: mentor.location,
        skills: mentor.skills || [],
        keywords: mentor.keywords || [],
        rating: 0, // Default rating since we don't have this data yet
        totalRatings: 0, // Default total ratings
        avatar_url: mentor.avatar_url,
        education: undefined, // Not available in the current schema
        top_mentor: false, // Default value
        bio: mentor.bio,
      }));
    },
  });
};
