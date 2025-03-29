
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileLinks } from "./ProfileLinks";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-6 py-2">
      {/* Personal Section */}
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <h4 className="font-semibold">Personal Information</h4>
        
        {profile.bio && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-muted-foreground">About</h5>
            <p className="text-sm">{profile.bio}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          {profile.years_of_experience !== null && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground">Years of Experience</h5>
              <p className="text-sm">{profile.years_of_experience}</p>
            </div>
          )}
          
          {profile.location && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground">Location</h5>
              <p className="text-sm">{profile.location}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Professional Section */}
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <h4 className="font-semibold">Professional Information</h4>
        
        <div className="grid grid-cols-2 gap-4">
          {(careerDetails?.title || profile.career_title) && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground">Position</h5>
              <p className="text-sm">{careerDetails?.title || profile.career_title}</p>
            </div>
          )}
          
          {profile.company_name && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground">Company</h5>
              <p className="text-sm">{profile.company_name}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Skills Section */}
      {(profile.skills?.length > 0 || profile.tools_used?.length > 0) && (
        <div className="bg-muted rounded-lg p-4 space-y-4">
          <h4 className="font-semibold">Skills & Tools</h4>
          
          {profile.skills && profile.skills.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2">Skills</h5>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    className="bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {profile.tools_used && profile.tools_used.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2">Tools</h5>
              <div className="flex flex-wrap gap-2">
                {profile.tools_used.map((tool, index) => (
                  <Badge 
                    key={index} 
                    className="bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
                  >
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Education Section */}
      {(profile.school_name || profile.highest_degree || profile.academic_major) && (
        <div className="bg-muted rounded-lg p-4 space-y-4">
          <h4 className="font-semibold">Education</h4>
          
          <div className="grid grid-cols-2 gap-4">
            {profile.school_name && (
              <div>
                <h5 className="text-sm font-medium text-muted-foreground">School</h5>
                <p className="text-sm">{profile.school_name}</p>
              </div>
            )}
            
            {profile.highest_degree && (
              <div>
                <h5 className="text-sm font-medium text-muted-foreground">Highest Degree</h5>
                <p className="text-sm">{profile.highest_degree}</p>
              </div>
            )}
            
            {profile.academic_major && (
              <div>
                <h5 className="text-sm font-medium text-muted-foreground">Academic Major</h5>
                <p className="text-sm">{profile.academic_major}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Profile Links */}
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
