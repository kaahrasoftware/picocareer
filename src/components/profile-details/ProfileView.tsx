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
  return (
    <div className="space-y-6 pb-6">
      {/* Bio Section */}
      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-semibold mb-2">About</h4>
        <p className="text-muted-foreground">{profile.bio || "No bio provided"}</p>
      </div>

      {/* Keywords Section */}
      {profile.keywords && profile.keywords.length > 0 && (
        <div className="bg-muted rounded-lg p-4">
          <h4 className="font-semibold mb-2">Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {profile.keywords.map((keyword, index) => (
              <Badge 
                key={index}
                className="bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Fields of Interest */}
      {profile.fields_of_interest && profile.fields_of_interest.length > 0 && (
        <div className="bg-muted rounded-lg p-4">
          <h4 className="font-semibold mb-2">Fields of Interest</h4>
          <div className="flex flex-wrap gap-2">
            {profile.fields_of_interest.map((field, index) => (
              <Badge 
                key={index}
                className="bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
              >
                {field}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Skills and Tools */}
      <div className="bg-muted rounded-lg p-4 space-y-4">
        {profile.skills && profile.skills.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Skills</h4>
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
            <h4 className="font-semibold mb-2">Tools</h4>
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