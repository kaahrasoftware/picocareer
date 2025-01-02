import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/types/database/profiles";
import { BadgeSection } from "@/components/career/BadgeSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileLinks } from "./ProfileLinks";
import { Briefcase, GraduationCap, MapPin, User2, Wrench, Tags, BookOpen, Lightbulb } from "lucide-react";

interface ProfileViewProps {
  profile: Profile & {
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
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
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Personal Information */}
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User2 className="h-4 w-4" />
          <h4 className="font-semibold">Personal Information</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">First Name</p>
            <p>{profile.first_name || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Name</p>
            <p>{profile.last_name || "Not set"}</p>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <User2 className="h-4 w-4" />
          <h4 className="font-semibold">About</h4>
        </div>
        <p className="text-muted-foreground">{profile.bio || "No bio provided"}</p>
      </div>

      {/* Professional Info */}
      {profile.user_type === 'mentor' && (
        <div className="bg-muted rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-4 w-4" />
            <h4 className="font-semibold">Professional Information</h4>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Position</p>
              <p>{careerDetails?.title || "None"}</p>
            </div>
            {profile.company_name && (
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p>{profile.company_name}</p>
              </div>
            )}
            {profile.years_of_experience !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Years of Experience</p>
                <p>{profile.years_of_experience}</p>
              </div>
            )}
            {profile.location && (
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p>{profile.location}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skills and Tools Section */}
      {profile.user_type === 'mentor' && (
        <div className="bg-muted rounded-lg p-4 space-y-4">
          <BadgeSection
            title="Skills"
            icon={<Wrench className="h-4 w-4" />}
            items={profile.skills}
            badgeClassName="bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
          />

          <BadgeSection
            title="Tools"
            icon={<Wrench className="h-4 w-4" />}
            items={profile.tools_used}
            badgeClassName="bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
          />

          <BadgeSection
            title="Keywords"
            icon={<Tags className="h-4 w-4" />}
            items={profile.keywords}
            badgeClassName="bg-[#FDE2E2] text-[#4B5563] hover:bg-[#FACACA] transition-colors border border-[#FAD4D4]"
          />

          <BadgeSection
            title="Fields of Interest"
            icon={<Lightbulb className="h-4 w-4" />}
            items={profile.fields_of_interest}
            badgeClassName="bg-[#E2D4F0] text-[#4B5563] hover:bg-[#D4C4E3] transition-colors border border-[#D4C4E3]"
          />
        </div>
      )}

      {/* Education */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="h-4 w-4" />
          <h4 className="font-semibold">Education</h4>
        </div>
        <div className="space-y-2">
          {profile.academic_major && (
            <div>
              <p className="text-sm text-muted-foreground">Major</p>
              <p className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {profile.academic_major}
              </p>
            </div>
          )}
          {profile.highest_degree && (
            <div>
              <p className="text-sm text-muted-foreground">Degree</p>
              <p className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                {profile.highest_degree}
              </p>
            </div>
          )}
          {profile.school_name && (
            <div>
              <p className="text-sm text-muted-foreground">School</p>
              <p className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                {profile.school_name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Links */}
      <ProfileLinks
        linkedinUrl={profile.linkedin_url}
        githubUrl={profile.github_url}
        websiteUrl={profile.website_url}
        profileId={profile.id}
      />
    </div>
  );
}