
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileLinks } from "./ProfileLinks";
import { PersonalSection } from "./sections/PersonalSection";
import { ProfessionalSection } from "./sections/ProfessionalSection";
import { EducationSection } from "./sections/EducationSection";
import { SkillsSection } from "./sections/SkillsSection";
import type { Profile } from "@/types/database/profiles";

interface ProfileViewProps {
  profile: Profile & {
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
  };
}

export function ProfileView({ profile }: ProfileViewProps) {
  const { data: careerDetails } = useQuery({
    queryKey: ['career', profile.position],
    queryFn: async () => {
      if (!profile.position) return null;
      
      const { data, error } = await supabase
        .from('careers')
        .select('title')
        .eq('id', profile.position)
        .single();

      if (error) {
        console.error('Error fetching career details:', error);
        return null;
      }

      return data;
    },
    enabled: !!profile.position
  });

  return (
    <div className="space-y-4 sm:space-y-6 py-2">
      <PersonalSection profile={profile} />
      <ProfessionalSection profile={profile} careerTitle={careerDetails?.title} />
      <SkillsSection profile={profile} />
      <EducationSection profile={profile} />
      <ProfileLinks
        linkedinUrl={profile.linkedin_url}
        githubUrl={profile.github_url}
        websiteUrl={profile.website_url}
        xUrl={profile.X_url}
        instagramUrl={profile.instagram_url}
        facebookUrl={profile.facebook_url}
        youtubeUrl={profile.youtube_url}
        tiktokUrl={profile.tiktok_url}
        profileId={profile.id}
      />
    </div>
  );
}
