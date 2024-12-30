import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/types/database/profiles";
import { BadgeSection } from "@/components/career/BadgeSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileViewProps {
  profile: Profile & {
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
    career_title?: string | null;
  };
}

export function ProfileView({ profile }: ProfileViewProps) {
  // Fetch career details if position is set
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
    <div className="space-y-6 pb-6">
      {/* Bio Section */}
      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-semibold mb-2">About</h4>
        <p className="text-muted-foreground">{profile.bio || "No bio provided"}</p>
      </div>

      {/* Professional Info */}
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <h4 className="font-semibold mb-2">Professional Information</h4>
        <p className="text-muted-foreground">
          Position: {profile.career_title || careerDetails?.title || "None"}
        </p>
        {profile.company_name && (
          <p className="text-muted-foreground">Company: {profile.company_name}</p>
        )}
        {profile.years_of_experience !== undefined && (
          <p className="text-muted-foreground">
            Years of Experience: {profile.years_of_experience}
          </p>
        )}
        {profile.location && (
          <p className="text-muted-foreground">Location: {profile.location}</p>
        )}
      </div>

      {/* Skills and Tools Section */}
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <BadgeSection
          title="Skills"
          items={profile.skills}
          badgeClassName="bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
        />

        <BadgeSection
          title="Tools"
          items={profile.tools_used}
          badgeClassName="bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
        />

        <BadgeSection
          title="Keywords"
          items={profile.keywords}
          badgeClassName="bg-[#FDE2E2] text-[#4B5563] hover:bg-[#FACACA] transition-colors border border-[#FAD4D4]"
        />

        <BadgeSection
          title="Fields of Interest"
          items={profile.fields_of_interest}
          badgeClassName="bg-[#E2D4F0] text-[#4B5563] hover:bg-[#D4C4E3] transition-colors border border-[#D4C4E3]"
        />
      </div>

      {/* Education */}
      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-semibold mb-2">Education</h4>
        <div className="space-y-2">
          {profile.academic_major && (
            <p className="text-muted-foreground">Major: {profile.academic_major}</p>
          )}
          {profile.highest_degree && (
            <p className="text-muted-foreground">Degree: {profile.highest_degree}</p>
          )}
          {profile.school_name && (
            <p className="text-muted-foreground">School: {profile.school_name}</p>
          )}
        </div>
      </div>

      {/* Links */}
      <div className="bg-muted rounded-lg p-4 space-y-3">
        <h4 className="font-semibold">Links</h4>
        {profile.linkedin_url && (
          <p className="text-muted-foreground">LinkedIn: {profile.linkedin_url}</p>
        )}
        {profile.github_url && (
          <p className="text-muted-foreground">GitHub: {profile.github_url}</p>
        )}
        {profile.website_url && (
          <p className="text-muted-foreground">Website: {profile.website_url}</p>
        )}
      </div>
    </div>
  );
}