import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserSettings } from "@/hooks/useUserSettings";

interface ProfileHeaderProps {
  profile: {
    id: string;
    avatar_url: string | null;
    full_name: string | null;
    position?: string | null;
    company_id?: string | null;
    school_id?: string | null;
    academic_major_id?: string | null;
    location?: string | null;
    top_mentor?: boolean | null;
    user_type?: string | null;
  } | null;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { toast } = useToast();
  const { getSetting } = useUserSettings(profile?.id);

  // Only fetch additional details if we have a profile
  const { data: profileDetails } = useQuery({
    queryKey: ['profileDetails', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          career:careers!profiles_position_fkey(title),
          company:companies!profiles_company_id_fkey(name),
          school:schools!profiles_school_id_fkey(name),
          academic_major:majors!profiles_academic_major_id_fkey(title)
        `)
        .eq('id', profile?.id)
        .single();

      if (error) {
        console.error('Error fetching profile details:', error);
        toast({
          title: "Error",
          description: "Failed to load profile details",
          variant: "destructive",
        });
        return null;
      }

      // Check if user has set their timezone
      const userTimezone = getSetting('timezone');
      if (!userTimezone) {
        toast({
          title: "Timezone Not Set",
          description: "Please set your timezone in settings for better scheduling experience",
          variant: "warning",
        });
      }

      return data;
    },
    enabled: !!profile?.id,
  });
  
  if (!profile || !profileDetails) return null;

  const isMentee = profile.user_type === 'mentee';

  return (
    <div className="flex items-center space-x-4">
      {profile.avatar_url && (
        <img src={profile.avatar_url} alt={profile.full_name || "Profile Avatar"} className="w-12 h-12 rounded-full" />
      )}
      <div>
        <h2 className="text-lg font-semibold">{profile.full_name}</h2>
        {isMentee && profile.position && (
          <p className="text-sm text-muted-foreground">{profile.position}</p>
        )}
        {profile.company_id && (
          <p className="text-sm text-muted-foreground">{profile.company_id}</p>
        )}
        {profile.school_id && (
          <p className="text-sm text-muted-foreground">{profile.school_id}</p>
        )}
        {profile.academic_major_id && (
          <p className="text-sm text-muted-foreground">{profile.academic_major_id}</p>
        )}
        {profile.location && (
          <p className="text-sm text-muted-foreground">{profile.location}</p>
        )}
      </div>
    </div>
  );
}
