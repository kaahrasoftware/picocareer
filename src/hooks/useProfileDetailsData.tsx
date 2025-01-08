import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProfileDetailsData(userId: string, open: boolean, session: any) {
  // Current user data query
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        console.log('Fetching current user data...');
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error fetching user:', error);
          throw error;
        }
        
        console.log('Current user data fetched successfully');
        return user;
      } catch (error: any) {
        console.error('Detailed user fetch error:', error);
        throw error;
      }
    },
    retry: false,
    enabled: !!session,
  });

  // Profile data query
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      try {
        console.log('Fetching profile for user:', userId);
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            company:companies(name),
            school:schools(name),
            academic_major:majors!profiles_academic_major_id_fkey(title),
            career:careers!profiles_position_fkey(title, id)
          `)
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          throw error;
        }

        console.log('Profile data fetched successfully:', data);
        
        return {
          ...data,
          company_name: data.company?.name,
          school_name: data.school?.name,
          academic_major: data.academic_major?.title,
          career_title: data.career?.title,
          career_id: data.career?.id
        };
      } catch (error: any) {
        console.error('Detailed profile fetch error:', error);
        throw error;
      }
    },
    enabled: !!userId && open && !!session,
    retry: 1,
  });

  return { currentUser, profile, isLoading };
}