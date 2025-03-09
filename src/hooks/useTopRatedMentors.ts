
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileWithDetails } from "@/types/database/profiles";

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
          school:schools(name),
          academic_major:academic_majors(name)
        `)
        .eq('user_type', 'mentor')
        .eq('top_mentor', true)
        .limit(10)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mentors:', error);
        throw error;
      }
      
      // Transform the data to match ProfileWithDetails format
      const formattedMentors = data.map(mentor => ({
        id: mentor.id,
        email: mentor.email || '',
        first_name: mentor.first_name,
        last_name: mentor.last_name,
        full_name: mentor.full_name || `${mentor.first_name || ''} ${mentor.last_name || ''}`.trim(),
        avatar_url: mentor.avatar_url,
        bio: mentor.bio,
        location: mentor.location,
        user_type: mentor.user_type as 'mentee' | 'mentor' | 'admin',
        highest_degree: mentor.highest_degree,
        skills: mentor.skills || [],
        tools_used: mentor.tools_used || [],
        keywords: mentor.keywords || [],
        fields_of_interest: mentor.fields_of_interest || [],
        years_of_experience: mentor.years_of_experience || 0,
        linkedin_url: mentor.linkedin_url,
        github_url: mentor.github_url,
        website_url: mentor.website_url,
        school_id: mentor.school_id,
        company_id: mentor.company_id,
        academic_major_id: mentor.academic_major_id,
        position: mentor.position,
        onboarding_status: mentor.onboarding_status as 'Pending' | 'Completed',
        total_booked_sessions: mentor.total_booked_sessions || 0,
        top_mentor: mentor.top_mentor || false,
        created_at: mentor.created_at,
        updated_at: mentor.updated_at,
        company_name: mentor.company?.name || null,
        school_name: mentor.school?.name || null,
        academic_major: mentor.academic_major?.name || null,
        career_title: mentor.career?.title || null
      })) as ProfileWithDetails[];

      console.log('Fetched mentors:', formattedMentors?.length);
      return formattedMentors;
    },
    staleTime: 1000 * 60 * 5,
  });
};
