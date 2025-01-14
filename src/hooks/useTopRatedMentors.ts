import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Mentor } from "@/types/mentor";

export function useTopRatedMentors() {
  return useQuery({
    queryKey: ["top-rated-mentors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          avatar_url,
          bio,
          location,
          company:companies(name),
          career:careers!profiles_position_fkey(title),
          skills,
          fields_of_interest,
          keywords,
          top_mentor,
          position,
          career_title:career:careers!profiles_position_fkey(title)
        `)
        .eq("user_type", "mentor")
        .eq("onboarding_status", "Approved")
        .eq("top_mentor", true)
        .limit(10);

      if (error) {
        console.error("Error fetching top rated mentors:", error);
        throw error;
      }

      const mentors = data.map((profile): Mentor => ({
        id: profile.id,
        name: profile.full_name,
        imageUrl: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        company: profile.company?.name,
        title: profile.career?.title,
        stats: {
          mentees: "50+",
          connected: "100+",
          recordings: "10+"
        },
        top_mentor: profile.top_mentor,
        position: profile.position,
        career_title: profile.career_title,
        skills: profile.skills,
        fields_of_interest: profile.fields_of_interest,
        keywords: profile.keywords
      }));

      return mentors;
    }
  });
}